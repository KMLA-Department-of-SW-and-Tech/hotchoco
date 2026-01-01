/* @refresh reload */
import React, { useMemo, useRef, useState } from "react";
import { data as json } from "react-router";
import {
  Navigate,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router";
import { resolveBoard } from "../boards/config";
import { timeAgo } from "../utils/time";
import { PostCard } from "../components/PostCard";
import type { PostRecord } from "../types/posts";
import { createClient } from "~/lib/supabase/server";

interface BoardSearchPageProps {
  slug?: string;
}

type SearchCard = PostRecord & {
  key: string | number;
  timeLabel: string;
  likes: number;
  comments: number;
  imageUrl: string | null;
};

type LoaderData = {
  slug?: string;
  board: ReturnType<typeof resolveBoard>;
  posts: (PostRecord & { imageUrl?: string | null })[];
  error: string | null;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.slug;
  const board = resolveBoard(slug);

  if (!board) {
    return json<LoaderData>(
      { slug, board: null, posts: [], error: null },
      { status: 404 },
    );
  }

  const { supabase, headers } = createClient(request);
  const { data: rows, error } = await supabase
    .from(board.table)
    .select("*")
    .order("created_at", { ascending: false });

  const posts =
    rows?.map((post) => {
      let imageUrl: string | null = null;
      if (post.image_path) {
        const { data: publicUrl } = supabase
          .storage
          .from(board.bucket)
          .getPublicUrl(String(post.image_path));
        imageUrl = publicUrl?.publicUrl ?? null;
      }
      return { ...post, imageUrl };
    }) ?? [];

  return json<LoaderData>(
    {
      slug,
      board,
      posts,
      error: error?.message ?? null,
    },
    { headers },
  );
}

export default function BoardSearchPage({ slug: slugOverride }: BoardSearchPageProps) {
  const { slug: loaderSlug, board, posts, error } = useLoaderData<typeof loader>();
  const slug = slugOverride ?? loaderSlug;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  const placeholder = board ? `${board.title}에서 검색하기` : "";
  const normalizedQuery = query.trim().toLowerCase();

  const cards = useMemo<SearchCard[]>(() => {
    if (!board || !normalizedQuery) return [];
    const results = posts.filter((post) => {
      const title = ((post.title as string | undefined) ?? "").toLowerCase();
      const body = ((post.content as string | undefined) ?? (post.body as string | undefined) ?? "").toLowerCase();
      return title.includes(normalizedQuery) || body.includes(normalizedQuery);
    });
    return results.map((post, index) => ({
      ...post,
      key: post.id ?? `${board.table}-search-${index}`,
      timeLabel: post.created_at ? timeAgo(post.created_at) : "",
      likes: post.likes_count ?? post.likes ?? 0,
      comments: post.comments_count ?? post.comments ?? 0,
      imageUrl: post.imageUrl ?? null,
    }));
  }, [posts, normalizedQuery, board]);

  if (!board) {
    return <Navigate to="/boards" replace />;
  }

  return (
    <div className="page search-page">
      <header className="search-page__header">
        <button
          type="button"
          className="page__backbutton"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <img src="/icons/chevron-back.png" alt="" />
        </button>
        <div
          className="search-bar"
          role="search"
          onClick={() => inputRef.current?.focus()}
        >
          <img className="search-bar__icon" src="/icons/search-lighter.png" alt="" aria-hidden="true" />
          <input
            ref={inputRef}
            className="search-bar__input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={`${board.title} 검색어`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </header>

      <main className="search-page__body">
        <section className="search-results">
          {normalizedQuery.length === 0 ? (
            <>
              <h2 className="search-history__title">최근 검색어</h2>
              <p className="search-history__empty">최근 검색어가 없습니다.</p>
            </>
          ) : loading ? (
            <ul className="list">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="skeleton" />
              ))}
            </ul>
          ) : error ? (
            <p className="search-results__error">{error}</p>
          ) : cards.length ? (
            <ul className="list">
              {cards.map((card) => (
                <li key={card.key} className="list__item">
                  <PostCard
                    post={card}
                    imageUrl={card.imageUrl}
                    onClick={() => navigate(`/boards/${slug}/${card.id ?? card.key}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-results__empty">검색 결과가 없습니다.</p>
          )}
        </section>
      </main>
    </div>
  );
}
