import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../utils/time";
import { publicImageUrl } from "../lib/storage-url";
import { SortSheet } from "../components/SortSheet";
import { sortPosts } from "../utils/sort";
import { useIsMobile } from "../utils/useMedia";


export default function ExecutiveCouncilBoard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [isSortSheetOpen, setSortSheetOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const isMobile = useIsMobile();
  const fabBottom = isMobile ? 24 + sheetHeight : 24;

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("executive-council")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const sortedPosts = useMemo(() => sortPosts(posts, sortOption), [posts, sortOption]);

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
            <h1 className="page__title">행정위원회</h1>
          </div>
          <div className="page__actions">
            <button
              type="button"
              className="page__iconbutton"
              onClick={() => navigate("/boards/executive-council/search")}
              aria-label="검색"
            >
              <img src="/icons/search-outline.png" alt="" />
            </button>
          </div>
        </div>
      </header>
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

      {loading ? (
        <ul className="list">{Array.from({ length: 4 }).map((_, i) => <li key={i} className="skeleton" />)}</ul>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <ul className="list">
          {sortedPosts.map((p, index) => {
            const key = p.id ?? p.created_at ?? `executive-council-${index}`;
            const timeLabel = p.created_at ? timeAgo(p.created_at) : "";
            return (
              <li key={key} className="list__item">
                <article className="post-card">
                  <div className="post-card__main">
                    <h3 className="post-card__title">{p.title}</h3>
                    {p.content ? <p className="post-card__body">{p.content}</p> : null}
                    <div className="post-meta">
                      <span className="post-meta__time">{timeLabel}</span>
                      <span className="post-meta__pill post-meta__pill--likes">
                        <img aria-hidden="true" className="post-meta__icon" src="/icons/like.png" alt="" />
                        {p.likes_count ?? 0}
                      </span>
                      <span className="post-meta__pill post-meta__pill--comments">
                        <img aria-hidden="true" className="post-meta__icon" src="/icons/comment.png" alt="" />
                        {p.comments_count ?? 0}
                      </span>
                    </div>
                  </div>
                  {p.image_path ? (
                    <div className="post-card__thumb">
                      <img
                        src={publicImageUrl("executive-council", p.image_path)}
                        alt="thumbnail"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
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
