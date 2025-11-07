// src/app/api/posts/[postId]/like/route.ts
// ❤️ API de Curtidas - Like/Unlike em posts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Curtir post
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  console.log("❤️ POST /api/posts/[postId]/like");

  try {
    const postId = params.postId;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      return NextResponse.json({ error: "Post já curtido" }, { status: 400 });
    }

    // Criar curtida
    const { error: likeError } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (likeError) {
      console.error("❌ Erro ao curtir:", likeError);
      return NextResponse.json(
        { error: "Erro ao curtir post" },
        { status: 500 }
      );
    }

    // Atualizar contador
    const { error: updateError } = await supabase.rpc("increment_post_likes", {
      post_id: postId,
    });

    if (updateError) {
      console.error("⚠️ Erro ao atualizar contador:", updateError);
    }

    console.log("✅ Post curtido:", postId);

    return NextResponse.json({
      success: true,
      liked: true,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Descurtir post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  console.log("💔 DELETE /api/posts/[postId]/like");

  try {
    const postId = params.postId;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Remover curtida
    const { error: deleteError } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("❌ Erro ao descurtir:", deleteError);
      return NextResponse.json(
        { error: "Erro ao descurtir post" },
        { status: 500 }
      );
    }

    // Atualizar contador
    const { error: updateError } = await supabase.rpc("decrement_post_likes", {
      post_id: postId,
    });

    if (updateError) {
      console.error("⚠️ Erro ao atualizar contador:", updateError);
    }

    console.log("✅ Post descurtido:", postId);

    return NextResponse.json({
      success: true,
      liked: false,
    });
  } catch (error: any) {
    console.error("💥 Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
