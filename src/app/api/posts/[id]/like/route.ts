// src/app/api/posts/[id]/like/route.ts
// 🎯 API para curtir/descurtir posts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📊 API de Like: Iniciando processamento POST (curtir)");

    const postId = params.id;
    console.log("📊 API de Like: Post ID", postId);

    // Obter usuário autenticado
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "📊 API de Like: Status da sessão",
      session ? "Autenticado" : "Não autenticado"
    );

    if (!session?.user) {
      console.error(
        "❌ API de Like: Erro de autenticação - Usuário não encontrado"
      );
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("📊 API de Like: Usuário", userId);

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("❌ API de Like: Post não encontrado", postError);
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      console.log("📊 API de Like: Já curtiu este post, nada a fazer");
      return NextResponse.json({
        success: true,
        message: "Post já curtido anteriormente",
      });
    }

    // Adicionar curtida
    const { error: likeError } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
    });

    if (likeError) {
      console.error("❌ API de Like: Erro ao curtir post", likeError);
      return NextResponse.json(
        { error: "Erro ao curtir post", details: likeError.message },
        { status: 500 }
      );
    }

    // Atualizar contador de likes do post
    const { error: updateError } = await supabase.rpc("increment_post_likes", {
      post_id: postId,
    });

    if (updateError) {
      console.error("❌ API de Like: Erro ao atualizar contador", updateError);
      // Não falhar a requisição por isso, apenas logar
    }

    console.log("📊 API de Like: Post curtido com sucesso");

    return NextResponse.json({
      success: true,
      message: "Post curtido com sucesso",
    });
  } catch (error: any) {
    console.error("❌ API de Like: Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📊 API de Like: Iniciando processamento DELETE (descurtir)");

    const postId = params.id;
    console.log("📊 API de Like: Post ID", postId);

    // Obter usuário autenticado
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "📊 API de Like: Status da sessão",
      session ? "Autenticado" : "Não autenticado"
    );

    if (!session?.user) {
      console.error(
        "❌ API de Like: Erro de autenticação - Usuário não encontrado"
      );
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("📊 API de Like: Usuário", userId);

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("❌ API de Like: Post não encontrado", postError);
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Remover curtida
    const { error: unlikeError } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (unlikeError) {
      console.error("❌ API de Like: Erro ao descurtir post", unlikeError);
      return NextResponse.json(
        { error: "Erro ao descurtir post", details: unlikeError.message },
        { status: 500 }
      );
    }

    // Atualizar contador de likes do post
    const { error: updateError } = await supabase.rpc("decrement_post_likes", {
      post_id: postId,
    });

    if (updateError) {
      console.error("❌ API de Like: Erro ao atualizar contador", updateError);
      // Não falhar a requisição por isso, apenas logar
    }

    console.log("📊 API de Like: Post descurtido com sucesso");

    return NextResponse.json({
      success: true,
      message: "Post descurtido com sucesso",
    });
  } catch (error: any) {
    console.error("❌ API de Like: Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
