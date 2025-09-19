// SimpleSearch.jsx — GET + loader 전용 + 5줄 클램프 + 더보기/접기
import { supabase } from "../supabaseClient.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useLoaderData,
  useNavigate,
  useSearchParams,
  useNavigation,
  Form,
} from "react-router-dom"; // ← react-router-dom 사용

/* ============== loader: DB 읽기만 ============== */
export async function loader({ request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const sort = url.searchParams.get("sort") || "latest";

  const base = supabase
    .from("group")
    .select("id, title, description, writer, created_at");

  let data, error;
  if (!q || q.length < 2) {
    ({ data, error } = await base.order("created_at", {
      ascending: false,
      nullsFirst: false,
    }));
  } else {
    ({ data, error } = await base
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,writer.ilike.%${q}%`)
      .order("created_at", { ascending: false, nullsFirst: false }));
  }
  if (error) throw new Response(error.message, { status: 500 });

  const rows = (data || []).map((r) => ({
    ...r,
    _ts: r?.created_at ? Date.parse(r.created_at) : -Infinity,
  }));

  return { q, sort, rows };
}

/* (선택) 쿼리 바뀔 때만 재검증 */
export function shouldRevalidate({ currentUrl, nextUrl }) {
  return (
    currentUrl.searchParams.get("q") !== nextUrl.searchParams.get("q") ||
    currentUrl.searchParams.get("sort") !== nextUrl.searchParams.get("sort")
  );
}

/* ============== Component ============== */
export default function SimpleSearch() {
  const { q: initialQ, sort: initialSort, rows } = useLoaderData();
  const [query, setQuery] = useState(initialQ || "");
  const [sortMode, setSortMode] = useState(initialSort || "latest");
  const [recent, setRecent] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const debounceRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // ▼ 스크롤 위치 감지 (400px 이상이면 표시)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(y > 400);
    };
    // 최초 1회 판단 + 리스너 등록
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ▼ 맨 위로 스크롤 (접근성: 모션 감소 선호 시 즉시 이동)
  const scrollToTop = () => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  // ▼ 더보기/접기 상태: 펼쳐진 카드 id 집합
  const [expandedSet, setExpandedSet] = useState(() => new Set());
  const toggleExpand = (id) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 길이 기준으로 “더보기” 버튼 노출 여부(간단 휴리스틱)
  const shouldShowMore = (text = "") => (text || "").length > 120;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecent(saved);
  }, []);

  useEffect(() => {
    setExpandedSet(new Set());
  }, [initialQ]);

  // 관련도 점수
  const relevanceScore = (item, q) => {
    const needle = (q || "").toLowerCase();
    const t = String(item.title || "").toLowerCase();
    const d = String(item.description || "").toLowerCase();
    const w = String(item.writer || "").toLowerCase();
    const posScore = (s) =>
      s.indexOf(needle) < 0 ? 0 : 100 - Math.min(s.indexOf(needle), 99);
    const freq = (s) =>
      (
        s.match(
          new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
        ) || []
      ).length;
    return (
      3 * (posScore(t) + 10 * freq(t)) +
      2 * (posScore(d) + 5 * freq(d)) +
      1 * (posScore(w) + 5 * freq(w))
    );
  };

  const results = useMemo(() => {
    if (!rows?.length) return [];
    if (sortMode === "latest") return [...rows].sort((a, b) => b._ts - a._ts);
    return [...rows].sort(
      (a, b) => relevanceScore(b, query) - relevanceScore(a, query)
    );
  }, [rows, sortMode, query]);

  // 디바운스: URL 쿼리 갱신 (GET, submitting 없음)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = (query || "").trim();
      const nextQ = trimmed.length >= 2 ? trimmed : "";
      const nextSort = sortMode;

      const params = new URLSearchParams();
      if (nextQ) params.set("q", nextQ);
      if (nextSort) params.set("sort", nextSort);

      if (params.toString() === searchParams.toString()) return;
      navigate(`?${params.toString()}`, { replace: true });
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortMode]);

  // 수동 제출(GET): URL 쿼리 그대로 반영
  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = (query || "").trim();
    const params = new URLSearchParams();
    if (trimmed.length >= 2) params.set("q", trimmed);
    if (sortMode) params.set("sort", sortMode);
    if (params.toString() !== searchParams.toString()) {
      navigate(`?${params.toString()}`);
    }
    if (trimmed) {
      const next = [trimmed, ...recent.filter((x) => x !== trimmed)].slice(
        0,
        7
      );
      setRecent(next);
      localStorage.setItem("recentSearches", JSON.stringify(next));
    }
  };

  const handleSelectRecent = (word) => {
    const trimmed = (word || "").trim();
    if (!trimmed) return;
    setQuery(trimmed);
    const params = new URLSearchParams();
    params.set("q", trimmed);
    params.set("sort", sortMode);
    navigate(`?${params.toString()}`);
    const next = [trimmed, ...recent.filter((x) => x !== trimmed)].slice(0, 7);
    setRecent(next);
    localStorage.setItem("recentSearches", JSON.stringify(next));
  };

  const onChangeSort = (value) => {
    setSortMode(value);
    const trimmed = (query || "").trim();
    const params = new URLSearchParams();
    if (trimmed.length >= 2) params.set("q", trimmed);
    params.set("sort", value);
    if (params.toString() !== searchParams.toString()) {
      navigate(`?${params.toString()}`, { replace: true });
    }
  };

  return (
    <div
      className="max-w-sm mx-auto min-h-screen select-none"
      style={{ backgroundColor: "#F8F8FA" }}
    >
      {/* Search Header */}
      <div className="flex items-center p-4">
        <div className="w-[25px] h-[25px] text-black mr-3">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.0156 5.46875L8.98438 12.5L16.0156 19.5312"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* GET Form: action 제거, URL만 반영 */}
        <Form
          method="get"
          onSubmit={onSubmit}
          replace={false}
          className="flex-1 rounded-full px-4 py-2 flex items-center gap-2"
          style={{ backgroundColor: "#ECECEC" }}
        >
          <div className="w-4 h-4 text-gray-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.7954 3.125C9.27835 3.125 7.79535 3.57486 6.53396 4.4177C5.27257 5.26053 4.28943 6.45849 3.70888 7.86007C3.12832 9.26166 2.97642 10.8039 3.27239 12.2918C3.56835 13.7797 4.29889 15.1465 5.37161 16.2192C6.44434 17.2919 7.81108 18.0225 9.29899 18.3184C10.7869 18.6144 12.3292 18.4625 13.7308 17.8819C15.1323 17.3014 16.3303 16.3183 17.1731 15.0569C18.016 13.7955 18.4658 12.3125 18.4658 10.7954C18.4657 8.76113 17.6575 6.81021 16.2191 5.37175C14.7806 3.9333 12.8297 3.12513 10.7954 3.125Z"
                stroke="black"
                strokeWidth="2"
                strokeMiterlimit="10"
              />
              <path
                d="M16.5181 16.5181L21.875 21.875"
                stroke="black"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <input
            type="text"
            name="q"
            placeholder="행정위원회에서 검색하기"
            className="flex-1 bg-transparent outline-none text-gray-600 placeholder-gray-500 text-[14px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          <input type="hidden" name="sort" value={sortMode} />

          <button type="submit" className="text-sm font-medium text-gray-600">
            검색
          </button>
        </Form>
      </div>

      {/* 최근 검색어 */}
      {recent.length === 0 ? (
        <NoRecentMessage />
      ) : (
        <RecentMessage items={recent} onSelect={handleSelectRecent} />
      )}

      {/* 검색 결과 */}
      <div className="px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-black text-[16px]">검색 결과</h2>
          <select
            value={sortMode}
            onChange={(e) => onChangeSort(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-black"
            title="정렬 기준"
          >
            <option value="latest">최신순</option>
            <option value="relevance">관련도순</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : !results.length ? (
          <div className="text-sm text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {results.map((item) => {
              const isExpanded = expandedSet.has(item.id);

              return (
                <li
                  key={item.id ?? `${item.title}-${item.description}`}
                  className="bg-white border border-gray-200 rounded p-3"
                >
                  {/* 카드 레이아웃: [본문 1fr | 날짜 auto] */}
                  <div className="grid grid-cols-[1fr_auto] gap-x-2">
                    {/* 제목 */}
                    <div className="col-[1/2] min-w-0">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {item.title ?? "제목 없음"}
                      </div>
                    </div>

                    {/* 날짜(오른쪽 상단 고정) — YYYY. M. D. */}
                    <div className="col-[2/3] text-xs text-black whitespace-nowrap ml-2 self-start">
                      {formatYMD(item.created_at)}
                    </div>

                    {/* 설명: 날짜 아래로 전개되도록 전체 열 차지 */}
                    <div className="col-[1/-1] mt-1 min-w-0">
                      <div
                        className={`text-xs text-gray-600 break-words ${
                          isExpanded ? "" : "clamp-5"
                        }`}
                      >
                        {item.description ?? "설명 없음"}
                      </div>

                      {shouldShowMore(item.description) && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="mt-1 text-xs text-gray-500 underline decoration-gray-300 hover:text-gray-700"
                          aria-label={isExpanded ? "접기" : "더보기"}
                        >
                          {isExpanded ? "접기" : "더보기"}
                        </button>
                      )}
                    </div>

                    {/* 작성자 */}
                    {item.writer && (
                      <div className="col-[1/-1] mt-2 text-[11px] text-gray-400 break-words">
                        작성자: {item.writer}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
          className="
          fixed left-1/2 -translate-x-1/2 bottom-6
          z-40 rounded-full
          bg-white/90 backdrop-blur
          shadow-lg border border-gray-200
          w-11 h-11 flex items-center justify-center
          active:scale-95 transition
        "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 15l6-6 6 6"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/* 보조 컴포넌트 */
function NoRecentMessage() {
  return (
    <div className="flex-1 px-6 py-8">
      <h2 className="font-semibold text-black mb-8 text-[16px]">최근 검색어</h2>
      <div className="font-normal text-center text-gray-500 mt-20 text-[14px]">
        최근 검색어가 없습니다.
      </div>
    </div>
  );
}

function RecentMessage({ items, onSelect }) {
  return (
    <div className="flex-1 px-6 py-8">
      <h2 className="font-semibold text-black mb-8 text-[16px]">최근 검색어</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((q, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect?.(q)}
              className="px-3 py-1 rounded-full bg-white text-[13px] text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition"
              aria-label={`최근 검색어 ${q}로 검색`}
              title={`${q}로 검색`}
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 날짜: YYYY. M. D. */
function formatYMD(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
