/* @refresh reload */
import React, { useEffect, useMemo, useState } from "react";
import { data as json } from "react-router";
import {
  Navigate,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router";
import { resolveBoard } from "../boards/config";
import { PostCard } from "../components/PostCard";
import { timeAgo } from "../utils/time";
import { SortSheet } from "../components/SortSheet";
import type { SortOption } from "../components/SortSheet";
import { sortPosts } from "../utils/sort";
import type { PostRecord } from "../types/posts";
import { createClient } from "~/lib/supabase/server";

interface BoardListPageProps {
  slug?: string;
}

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

export default function BoardListPage({ slug: slugOverride }: BoardListPageProps) {
  const { slug: loaderSlug, board, posts, error } = useLoaderData<typeof loader>();
  const slug = slugOverride ?? loaderSlug;
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const categories = board?.categories ?? [];
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  useEffect(() => {
    if (board?.categories?.length) {
      setActiveCategory(board.categories[0].value);
    } else {
      setActiveCategory(null);
    }
  }, [board]);

  const sortedPosts = useMemo<PostRecord[]>(
    () => (sortPosts(posts, sortOption) as PostRecord[]),
    [posts, sortOption],
  );

  const cards = useMemo(() => {
    return sortedPosts.map((post, index) => ({
      ...post,
      key: post.id ?? post.created_at ?? `board-post-${index}`,
      timeLabel: post.created_at ? timeAgo(post.created_at) : "",
      likes: post.likes_count ?? 0,
      comments: post.comments_count ?? 0,
      imageUrl: post.imageUrl ?? null,
    }));
  }, [sortedPosts]);

  // ✅ 여기서 조건부 리턴 (컴포넌트 함수 **안**에서만)
  if (!board) {
    return <Navigate to="/boards" replace />;
  }

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-inner">
          <h1 className="page__title">{board.title}</h1>
          <div className="page__actions">
            <button
              type="button"
              className="page__iconbutton"
              onClick={() => navigate(`/boards/${slug}/search`)}
              aria-label="검색"
            >
              <img src="/icons/search-outline.png" alt="" />
            </button>
          </div>
        </div>
      </header>
      {categories.length ? (
        <div className="category-filter">
          <div className="category-filter__list" role="tablist">
            {categories.map((category) => {
              const isActive = category.value === activeCategory;
              return (
                <button
                  key={category.value}
                  type="button"
                  className={`category-filter__button${isActive ? " category-filter__button--active" : ""}`}
                  onClick={() => {
                    if (!isActive) setActiveCategory(category.value);
                  }}
                  aria-pressed={isActive}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="sort-trigger"
            onClick={() => setSortSheetOpen(true)}
            aria-label="정렬 기준 선택"
          >
            <img src="/icons/Sort.png" alt="" />
          </button>
        </div>
      ) : null}
      {!categories.length ? (
        <div className="sort-bar">
          <button
            type="button"
            className="sort-trigger"
            onClick={() => setSortSheetOpen(true)}
            aria-label="정렬 기준 선택"
          >
            <img src="/icons/Sort.png" alt="" />
          </button>
        </div>
      ) : null}

      {loading ? (
        <ul className="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="skeleton" />
          ))}
        </ul>
      ) : error ? (
        <div className="error">{error}</div>
      ) : cards.length ? (
        <ul className="list">
          {cards.map((p) => (
            <li key={p.key} className="list__item">
              <PostCard
                post={p}
                imageUrl={p.imageUrl ?? null}
                onClick={() => navigate(`/boards/${slug}/${p.id ?? p.key}`)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">게시물이 없습니다.</div>
      )}

      <button
        className="fab"
        aria-label="새 게시물 작성"
        style={{ bottom: `${24 + sheetHeight}px` }}
      >
        <img src="/icons/add-button.png" alt="" aria-hidden="true" />
      </button>
      <SortSheet
        open={isSortSheetOpen}
        value={sortOption}
        onSelect={setSortOption}
        onClose={() => setSortSheetOpen(false)}
        onVisibleHeightChange={setSheetHeight}
      />
    </div>
  );
}
