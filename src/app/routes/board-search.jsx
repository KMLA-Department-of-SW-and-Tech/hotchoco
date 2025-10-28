import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { resolveBoard } from "../boards/config";
import { supabase } from "../lib/supabase";
import { publicImageUrl } from "../lib/storage-url";
import { timeAgo } from "../utils/time";
import { PostCard } from "../components/PostCard";

export default function BoardSearchPage({ slug: slugOverride }) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const navigate = useNavigate();
  const board = resolveBoard(slug);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const placeholder = board ? `${board.title}에서 검색하기` : "";
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!board) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(board.table)
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setPosts([]);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [board]);

  const cards = useMemo(() => {
    if (!board || !normalizedQuery) return [];
    const results = posts.filter((post) => {
      const title = (post.title ?? "").toLowerCase();
      const body = (post.content ?? post.body ?? "").toLowerCase();
      return title.includes(normalizedQuery) || body.includes(normalizedQuery);
    });
    return results.map((post, index) => ({
      ...post,
      key: post.id ?? `${board.table}-search-${index}`,
      timeLabel: post.created_at ? timeAgo(post.created_at) : "",
      likes: post.likes_count ?? post.likes ?? 0,
      comments: post.comments_count ?? post.comments ?? 0,
      imageUrl: post.image_path ? publicImageUrl(board.bucket, post.image_path) : null,
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
                    onClick={() => navigate(`/boards/${slug}/${card.id}`)}
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
