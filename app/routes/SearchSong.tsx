import { useEffect, useState } from "react";
const YOUTUBE_API_KEY = "AIzaSyBrAr6dxzLvW8t8apB3hw_-Fucn1nzcOvk";
const USER_NAME = "30기 고동재";
import { supabase } from "../supabaseClient";

type VideoItem = {
  title: string;
  url: string;
  thumbnail: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (video: VideoItem) => Promise<void> | void;
  initialQuery?: string;
};

function useDebounced(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

async function insert(item: { title: string; url: string }) {
  try {
    const date = new Date().toISOString(); // timestamptz format
    const { error } = await supabase.from("items").insert([
      {
        title: USER_NAME, // or item.title if you want video title
        url: item.url,
        date: date,
      },
    ]);
    if (error) {
      console.error("Insert failed:", error.message);
      alert("저장 중 오류가 발생했습니다.");
    } else {
      console.log("Inserted:", item);
      alert("신청이 완료되었습니다!");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

export default function SearchSong({
  open,
  onClose,
  onPick,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounced(query);

  async function searchYoutube(q: string) {
    try {
      setLoading(true);
      setError(null);

      const url =
        "https://www.googleapis.com/youtube/v3/search" +
        `?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(q)}` +
        `&key=${YOUTUBE_API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
      const data = await res.json();

      const list: VideoItem[] = (data.items || []).map((it: any) => ({
        title: it?.snippet?.title ?? "(제목 없음)",
        url: `https://www.youtube.com/watch?v=${it?.id?.videoId ?? ""}`,
        thumbnail: it?.snippet?.thumbnails?.medium?.url ?? "",
      }));

      setResults(list);
    } catch (e: any) {
      setResults([]);
      setError(e?.message || "검색 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && debouncedQuery.trim()) {
      searchYoutube(debouncedQuery);
    }
  }, [open, debouncedQuery]);

  if (!open) return null;

  return (
    <div className="searchsong__overlay" onClick={onClose}>
      <div className="searchsong__modal" onClick={(e) => e.stopPropagation()}>
        <div className="searchsong__header">
          <h2 className="searchsong__title">신청하기</h2>
          <p className="searchsong__subtitle">
            기상송으로 부적합한 노래는 삭제될 수 있습니다!
          </p>
        </div>

        <div className="searchsong__inputbar">
          <img src="/searchIcon.png" alt="검색" className="searchsong__icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ex) Bruno Mars - Die With A Smile"
            className="searchsong__input"
          />
        </div>

        {loading && <div className="searchsong__status">불러오는 중...</div>}
        {error && (
          <div className="searchsong__status searchsong__error">{error}</div>
        )}

        <div className="searchsong__results">
          {results.map((v, i) => (
            <button
              key={i}
              className="searchsong__resultGrid"
              onClick={async () => {
                await insert(v);
                await onPick(v);
                setQuery("");
                setResults([]);
                setError(null);
                onClose();
              }}
            >
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="searchsong__thumbWrap"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={v.thumbnail}
                  alt=""
                  className="searchsong__thumbLarge"
                />
              </a>
              <div className="searchsong__titleWrap">
                <span className="searchsong__videotitleLineClamp">
                  {v.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
