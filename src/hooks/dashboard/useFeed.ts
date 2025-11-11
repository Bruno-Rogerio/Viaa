// src/hooks/dashboard/useFeed.ts
// ✅ HOOK PARA PROFISSIONAIS - Com curtidas

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Post,
  CreatePostData,
  FeedFilters,
  FeedPagination,
} from "@/types/feed";

interface UseFeedReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: FeedPagination;
  createPost: (data: CreatePostData) => Promise<boolean>;
  togglePostLike: (postId: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
}

export const useFeed = (
  initialFilters: FeedFilters = { type: "all" }
): UseFeedReturn => {
  const { getProfileId, isProfessional } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FeedFilters>(initialFilters);
  const [pagination, setPagination] = useState<FeedPagination>({
    page: 1,
    limit: 10,
    total: 0,
    has_more: true,
  });

  const profileId = getProfileId();

  const buildPostsQuery = useCallback(
    (page: number = 1, limit: number = 10) => {
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          author:perfis_profissionais!posts_profissional_id_fkey (
            id,
            nome,
            sobrenome,
            especialidades,
            foto_perfil_url,
            verificado
          )
        `,
          { count: "exact" }
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (filters.author_id) {
        query = query.eq("profissional_id", filters.author_id);
      }

      if (filters.search) {
        query = query.textSearch("content", filters.search);
      }

      return query;
    },
    [filters]
  );

  const loadUserLikes = useCallback(
    async (postIds: string[]): Promise<Set<string>> => {
      if (!profileId || !isProfessional() || postIds.length === 0) {
        return new Set();
      }

      try {
        const { data, error } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("profissional_id", profileId)
          .in("post_id", postIds);

        if (error) throw error;
        return new Set(data?.map((like) => like.post_id) || []);
      } catch (err) {
        console.error("Erro ao carregar curtidas:", err);
        return new Set();
      }
    },
    [profileId, isProfessional]
  );

  const validateAndTransformPost = useCallback((post: any): Post | null => {
    if (!post?.id || !post?.author?.id || !post?.author?.nome) {
      return null;
    }

    return {
      id: post.id,
      profissional_id: post.profissional_id,
      content: post.content || "",
      image_url: post.image_url,
      video_url: post.video_url,
      type: post.type || "text",
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_active: post.is_active ?? true,
      author: {
        id: post.author.id,
        nome: post.author.nome,
        sobrenome: post.author.sobrenome || "",
        especialidades: post.author.especialidades || "",
        foto_perfil_url: post.author.foto_perfil_url,
        verificado: post.author.verificado || false,
      },
      is_liked: false,
      user_like_id: undefined,
    };
  }, []);

  const loadPosts = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const {
          data,
          error: queryError,
          count,
        } = await buildPostsQuery(page, pagination.limit);

        if (queryError) throw queryError;
        if (!data) {
          setPosts([]);
          return;
        }

        const transformedPosts: Post[] = data
          .map(validateAndTransformPost)
          .filter((post): post is Post => post !== null);

        const postIds = transformedPosts.map((p) => p.id);
        const userLikes = await loadUserLikes(postIds);

        const postsWithLikes = transformedPosts.map((post) => ({
          ...post,
          is_liked: userLikes.has(post.id),
        }));

        if (reset) {
          setPosts(postsWithLikes);
        } else {
          setPosts((prev) => [...prev, ...postsWithLikes]);
        }

        setPagination((prev) => ({
          ...prev,
          page,
          total: count || 0,
          has_more: transformedPosts.length === pagination.limit,
        }));
      } catch (err: any) {
        console.error("❌ Erro ao carregar posts:", err);
        setError(err.message || "Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [buildPostsQuery, pagination.limit, validateAndTransformPost, loadUserLikes]
  );

  const createPost = useCallback(
    async (data: CreatePostData): Promise<boolean> => {
      if (!profileId || !isProfessional()) {
        setError("Apenas profissionais podem criar posts");
        return false;
      }

      try {
        const { error } = await supabase.from("posts").insert([
          {
            profissional_id: profileId,
            content: data.content,
            type: data.type || "text",
            image_url: data.image_url,
            video_url: data.video_url,
            is_active: true,
          },
        ]);

        if (error) throw error;
        await loadPosts(1, true);
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar post:", err);
        setError(err.message || "Erro ao criar post");
        return false;
      }
    },
    [profileId, isProfessional, loadPosts]
  );

  const togglePostLike = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!profileId || !isProfessional()) {
        setError("Apenas profissionais podem curtir posts");
        return false;
      }

      try {
        const currentPost = posts.find((p) => p.id === postId);
        if (!currentPost) return false;

        const isCurrentlyLiked = currentPost.is_liked;

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: !isCurrentlyLiked,
                  likes_count: post.likes_count + (isCurrentlyLiked ? -1 : 1),
                }
              : post
          )
        );

        if (isCurrentlyLiked) {
          const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("profissional_id", profileId);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("post_likes").insert([
            {
              post_id: postId,
              profissional_id: profileId,
            },
          ]);

          if (error) throw error;
        }

        return true;
      } catch (err: any) {
        console.error("❌ Erro ao curtir post:", err);

        const currentPost = posts.find((p) => p.id === postId);
        if (currentPost) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: currentPost.is_liked,
                    likes_count: currentPost.likes_count,
                  }
                : post
            )
          );
        }

        setError(err.message || "Erro ao curtir post");
        return false;
      }
    },
    [profileId, isProfessional, posts]
  );

  const loadMore = useCallback(async () => {
    if (!pagination.has_more || loading) return;
    await loadPosts(pagination.page + 1, false);
  }, [pagination.has_more, pagination.page, loading, loadPosts]);

  const refresh = useCallback(async () => {
    await loadPosts(1, true);
  }, [loadPosts]);

  const setFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    loadPosts(1, true);
  }, [filters]);

  return {
    posts,
    loading,
    error,
    pagination,
    createPost,
    togglePostLike,
    loadMore,
    refresh,
    setFilters,
  };
};
