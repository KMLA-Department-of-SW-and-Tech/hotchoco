/* @refresh reload */
import React, { useMemo, useState } from "react";
import { data as json } from "react-router";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router";
import { timeAgo } from "../utils/time";
import { resolveBoard } from "../boards/config";
import { SortSheet } from "../components/SortSheet";
import type { SortOption } from "../components/SortSheet";
import { sortPosts } from "../utils/sort";
import type { PostRecord } from "../types/posts";
import { createClient } from "~/lib/supabase/server";

const BOARD_ID = "tteoljup";
const boardMeta = resolveBoard(BOARD_ID);
const bucket = boardMeta?.bucket ?? "posts";

type LoaderData = {
  posts: (PostRecord & { imageUrl?: string | null })[];
  error: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createClient(request);
  const { data: rows, error } = await supabase
    .from(BOARD_ID)
    .select("*")
    .order("created_at", { ascending: false });

  const posts =
    rows?.map((post) => {
      let imageUrl: string | null = null;
      if (post.image_path) {
        const { data: publicUrl } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(String(post.image_path));
        imageUrl = publicUrl?.publicUrl ?? null;
      }
      return { ...post, imageUrl };
    }) ?? [];

  return json<LoaderData>(
    {
      posts,
      error: error?.message ?? null,
    },
    { headers },
  );
}

export default function TteoljupBoard() {
  const { posts, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const categories = boardMeta?.categories ?? [];
  const [activeCategory, setActiveCategory] = useState<string | null>(
    () => categories[0]?.value ?? null,
  );
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const fabBottom = 24 + sheetHeight;
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  const sortedPosts = useMemo<PostRecord[]>(
    () => (sortPosts(posts, sortOption) as PostRecord[]),
    [posts, sortOption],
  );

  const cards = useMemo(
    () =>
      sortedPosts.map((post, index) => {
        const key =
          post.id ??
          post.created_at ??
          `${BOARD_ID}-${post.title ?? "post"}-${index}`;
        return {
          ...post,
          key,
          category: post.category ?? post.category_name ?? null,
          content: post.content ?? post.body ?? "",
          timeLabel: post.created_at ? timeAgo(post.created_at) : "",
          likes: post.likes_count ?? post.likes ?? 0,
          comments: post.comments_count ?? post.comments ?? 0,
        };
      }),
    [sortedPosts],
  );

  const visibleCards = useMemo(() => {
    if (!activeCategory) return cards;
    return cards.filter((card) => card.category === activeCategory);
  }, [cards, activeCategory]);

  const handleOpenSort = () => setSortSheetOpen(true);

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-inner">
          <div className="page__title-group">
            <button
              type="button"
              className="page__backbutton"
              onClick={() => navigate("/boards")}
              aria-label="뒤로가기"
            >
              <img src="/icons/chevron-back.png" alt="" />
            </button>
            <h1 className="page__title">{boardMeta?.title ?? "게시판"}</h1>
          </div>
          <div className="page__actions">
            <button
              type="button"
              className="page__iconbutton"
              onClick={() => navigate(`/boards/${BOARD_ID}/search`)}
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
                  className={`category-filter__button${
                    isActive ? " category-filter__button--active" : ""
                  }`}
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
          <button type="button" className="sort-trigger" onClick={handleOpenSort} aria-label="정렬 기준 선택">
            <img src="/icons/Sort.png" alt="" />
          </button>
        </div>
      ) : (
        <div className="sort-bar">
          <button type="button" className="sort-trigger" onClick={handleOpenSort} aria-label="정렬 기준 선택">
            <img src="/icons/Sort.png" alt="" />
          </button>
        </div>
      )}

      {loading ? (
        <ul className="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="skeleton" />
          ))}
        </ul>
      ) : error ? (
        <div className="error">{error}</div>
      ) : visibleCards.length ? (
        <ul className="list">
          {visibleCards.map((post) => (
            <li key={post.key} className="list__item">
              <article className="post-card">
                <div className="post-card__main">
                  <h3 className="post-card__title">{post.title}</h3>
                  {post.content ? <p className="post-card__body">{post.content}</p> : null}
                  <div className="post-meta">
                    <span className="post-meta__time">{post.timeLabel}</span>
                    <span className="post-meta__pill post-meta__pill--likes">
                      <img aria-hidden="true" className="post-meta__icon" src="/icons/like.png" alt="" />
                      {post.likes}
                    </span>
                <span className="post-meta__pill post-meta__pill--comments">
                  <img aria-hidden="true" className="post-meta__icon" src="/icons/comment.png" alt="" />
                  {post.comments}
                </span>
              </div>
            </div>
            {post.image_path ? (
              <div className="post-card__thumb">
                <img
                  src={post.imageUrl ?? undefined}
                  alt="thumbnail"
                  loading="lazy"
                />
              </div>
            ) : null}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">게시물이 없습니다.</div>
      )}

      <button
        className="fab"
        aria-label="새 게시물 작성"
        style={{ bottom: `${fabBottom}px` }}
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
