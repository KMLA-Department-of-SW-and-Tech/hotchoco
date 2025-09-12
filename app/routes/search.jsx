import { supabase } from "../supabaseClient.js";
import { useState, useEffect, useRef, useMemo } from "react";

export default function SimpleSearch() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [rawResults, setRawResults] = useState([]); // ✅ 서버 원본
  const [errorMsg, setErrorMsg] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const debounceRef = useRef(null);

  // ✅ 레이스 가드 + 간단 캐시
  const reqSeq = useRef(0);
  const cacheRef = useRef(new Map()); // key: query, value: rows

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecent(saved);
    fetchLatest();
  }, []);

  // 공통: created_at → _ts 숫자화
  const withTs = (rows) =>
    (rows || []).map((r) => ({
      ...r,
      _ts: r?.created_at ? Date.parse(r.created_at) : -Infinity,
    }));

  const fetchLatest = async () => {
    setErrorMsg("");
    const seq = ++reqSeq.current;
    const { data, error } = await supabase
      .from("group")
      .select("id, title, description, writer, created_at")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(20);
    if (seq !== reqSeq.current) return; // ✅ 늦게 온 응답 무시

    if (error) {
      setErrorMsg(error.message);
      setRawResults([]);
    } else {
      const rows = withTs(data);
      cacheRef.current.set("", rows); // 빈 검색 캐시
      setRawResults(rows);
    }
  };

  // 간이 관련도 점수
  const relevanceScore = (item, q) => {
    const needle = q.toLowerCase();
    const t = String(item.title || "").toLowerCase();
    const d = String(item.description || "").toLowerCase();
    const w = String(item.writer || "").toLowerCase();
    const posScore = (s) => (s.indexOf(needle) < 0 ? 0 : 100 - Math.min(s.indexOf(needle), 99));
    const freq = (s) => (s.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    return 3 * (posScore(t) + 10 * freq(t)) + 2 * (posScore(d) + 5 * freq(d)) + 1 * (posScore(w) + 5 * freq(w));
  };

  // ✅ 화면에 보여줄 최종 배열은 useMemo로 정렬만 수행 (서버 재호출 X)
  const results = useMemo(() => {
    if (!rawResults.length) return [];
    if (sortMode === "latest") {
      return [...rawResults].sort((a, b) => b._ts - a._ts);
    }
    // relevance
    const q = query.trim();
    return [...rawResults].sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q));
  }, [rawResults, sortMode, query]); // 정렬 기준/검색어 바뀌면 클라에서 재정렬

  const fetchSearch = async (q) => {
    // ✅ 최소 길이 조건 (원하면 2 → 3으로 조정)
    if (!q || q.length < 2) {
      await fetchLatest();
      return;
    }

    // 캐시 히트 시 서버 호출 생략
    if (cacheRef.current.has(q)) {
      setRawResults(cacheRef.current.get(q));
      return;
    }

    setErrorMsg("");
    const seq = ++reqSeq.current;
    const { data, error } = await supabase
      .from("group")
      .select("id, title, description, writer, created_at")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,writer.ilike.%${q}%`)
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(50); // ✅ 과도한 결과 방지

    if (seq !== reqSeq.current) return; // ✅ 늦게 온 응답 무시

    if (error) {
      setErrorMsg(error.message);
      setRawResults([]);
    } else {
      const rows = withTs(data);
      cacheRef.current.set(q, rows);
      setRawResults(rows);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    await fetchSearch(trimmed);
    const next = [trimmed, ...recent.filter((q) => q !== trimmed)].slice(0, 7);
    setRecent(next);
    localStorage.setItem("recentSearches", JSON.stringify(next));
  };

  // 입력 디바운스 (정렬만 바뀌면 서버 안 부름)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = query.trim();
      fetchSearch(q);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // ✅ sortMode 제거 → 정렬 변경은 useMemo가 처리

  const handleSelectRecent = (word) => {
    const trimmed = (word || "").trim();
    if (!trimmed) return;
    setQuery(trimmed);          // 입력창 표시
    fetchSearch(trimmed);       // 즉시 검색
    const next = [trimmed, ...recent.filter((q) => q !== trimmed)].slice(0, 7);
    setRecent(next);
    localStorage.setItem("recentSearches", JSON.stringify(next));
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

        <form
          onSubmit={onSubmit}
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
            placeholder="행정위원회에서 검색하기"
            className="flex-1 bg-transparent outline-none text-gray-600 placeholder-gray-500 text-[14px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* 정렬 토글 */}

          <button type="submit" className="text-sm font-medium text-gray-600">
            검색
          </button>
        </form>
      </div>

      {/* 최근 검색어 */}
      {recent.length === 0 ? (
        <NoRecentMessage />
      ) : (
        <RecentMessage items={recent} onSelect={handleSelectRecent} /> // ✅ 콜백 전달
      )}

      {/* 검색 결과 */}
      <div className="px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-black text-[16px]">검색 결과</h2>

          {/* 정렬 토글 → 오른쪽 끝으로 이동 */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-black"
            title="정렬 기준"
          >
            <option value="latest">최신순</option>
            <option value="relevance">관련도순</option>
          </select>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-500 mb-3">에러: {errorMsg}</div>
        )}

        {results.length === 0 ? (
          <div className="text-sm text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {results.map((item) => (
              <li
                key={item.id ?? `${item.title}-${item.description}`}
                className="bg-white border border-gray-200 rounded p-3 flex justify-between items-start"
              >
                {/* 왼쪽: 제목 + 설명 + 작성자 */}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.title ?? "제목 없음"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.description ?? "설명 없음"}
                  </div>
                  {item.writer && (
                    <div className="text-xs text-gray-400 mt-1">
                      작성자: {item.writer}
                    </div>
                  )}
                </div>

                {/* 오른쪽: 작성 시간 */}
                <div className="text-xs text-black whitespace-nowrap ml-2">
                  {formatRelativeTime(item.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

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
              onClick={() => onSelect?.(q)} // ✅ 클릭하면 선택
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

// 상대 시간 포맷 함수
function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const created = new Date(isoString);
  const now = new Date();
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}초 전`;
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  // 일주일 이상이면 YYYY-MM-DD 형식으로
  return created.toLocaleDateString();
}
