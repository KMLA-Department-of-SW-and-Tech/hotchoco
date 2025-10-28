import { Link, useParams } from "react-router";
import type { Route } from "./+types/board";
import { BoardsStyles } from "./boards-styles";

export const links: Route.LinksFunction = () => [];

export function meta() {
  return [
    { title: "게시판" },
    { name: "description", content: "게시판 보기" },
  ];
}

export default function BoardDetailPage() {
  const params = useParams();
  const title = params.name ?? "게시판";

  return (
    <div className="boards" style={{ background: "#fff" }}>
      <BoardsStyles />
      <header className="boards-header">
        <div className="container header-row">
          <Link to="/boards" aria-label="뒤로" className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="title">{title}</h1>
        </div>
      </header>

      <main className="container main">
        {/* 흰색 페이지 유지. 내용 없음 */}
      </main>
    </div>
  );
}
