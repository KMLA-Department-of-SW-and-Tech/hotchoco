import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { publicImageUrl } from "../lib/storage-url";
import { resolveBoard } from "../boards/config";
import { PostCard } from "../components/PostCard";
import { timeAgo } from "../utils/time";
import { SortSheet } from "../components/SortSheet";
import { sortPosts } from "../utils/sort";

export default function BoardListPage({ slug: slugOverride }) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const board = resolveBoard(slug);
  const navigate = useNavigate();
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const categories = board?.categories ?? [];

  useEffect(() => {
    if (board?.categories?.length) {
      setActiveCategory(board.categories[0].value);
    } else {
      setActiveCategory(null);
    }
  }, [board]);

  useEffect(() => {
    if (!board) return; // 보드가 없으면 로딩 안 함
    if (board.categories?.length && !activeCategory) return; // 카테고리 초기화 대기
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      let query = supabase
        .from(board.table)
        .select("*")
        .order("created_at", { ascending: false });

      if (activeCategory) {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setPosts(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, board, activeCategory]);

  const sortedPosts = useMemo(() => sortPosts(posts, sortOption), [posts, sortOption]);

  const cards = useMemo(() => {
    if (!sortedPosts) return [];
    return sortedPosts.map((post) => ({
      ...post,
      timeLabel: timeAgo(post.created_at),
      likes: post.likes_count ?? 0,
      comments: post.comments_count ?? 0,
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
      ) : cards && cards.length ? (
        <ul className="list">
          {cards.map((p) => (
            <li key={p.id} className="list__item">
              <PostCard
                post={p}
                imageUrl={publicImageUrl(board.bucket, p.image_path)}
                onClick={() => navigate(`/boards/${slug}/${p.id}`)}
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
