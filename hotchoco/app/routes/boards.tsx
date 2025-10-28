import { Link } from "react-router";
import type { ReactNode } from "react";
import type { Route } from "./+types/boards";
import { BoardsStyles } from "./boards-styles";

// Styles are inlined via <BoardsStyles />
export const links: Route.LinksFunction = () => [];

export function meta() {
  return [
    { title: "게시판" },
    { name: "description", content: "게시판 카테고리" },
  ];
}

export default function BoardsPage() {
  const noticesLeft = [
    "전체공지",
    "입법위원회",
    "사법위원회",
    "행정위원회",
    "방탈게시판",
  ];
  const noticesRight = ["먹사팔", "떨줍", "모집공고", "28기 재학생"];

  const favorites = ["자유게시판", "익명게시판", "질문게시판", "자료공유게시판"];

  return (
    <div className="boards">
      <BoardsStyles />
      <header className="boards-header">
        <div className="container header-row">
          <Link to="/" aria-label="뒤로" className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="title">게시판</h1>
        </div>
        <div className="container filters-row">
          <div className="chips">
            <button className="chip chip--primary">메뉴</button>
            <button className="chip chip--outline">최신순</button>
          </div>
          <Link to="/boards/request" className="request-link">게시판 개설요청 &gt;</Link>
        </div>
      </header>

      <main className="container main">
        <section className="section">
          <h2 className="section-title">학생 공지</h2>
          <div className="columns">
            <ul className="col col--left">
              {noticesLeft.map((name) => (
                <li key={name}>
                  <Link className="item" to={`/boards/${encodeURIComponent(name)}`}>{name}</Link>
                </li>
              ))}
            </ul>
            <ul className="col col--right">
              {noticesRight.map((name) => (
                <li key={name}>
                  <Link className="item" to={`/boards/${encodeURIComponent(name)}`}>{name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">즐겨찾는 게시판</h2>
            <Link to="#" className="more">더보기 ▸</Link>
          </div>
          <ul className="fav-list">
            {favorites.map((name) => (
              <li key={name}>
                <Link className="item" to={`/boards/${encodeURIComponent(name)}`}>{name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <nav className="tabbar">
        <div className="container tabbar-row">
          <Tab icon={<HomeIcon />} to="/" />
          <Tab icon={<CapIcon />} to="#" />
          <Tab icon={<ListIcon active />} to="/boards" active />
          <Tab icon={<ChatIcon />} to="#" badge={2} />
          <Tab icon={<UserIcon />} to="#" />
        </div>
      </nav>
    </div>
  );
}

function Tab({
  icon,
  to,
  active,
  badge,
}: { icon: ReactNode; to: string; active?: boolean; badge?: number }) {
  return (
    <Link to={to} className={`tab ${active ? "tab--active" : ""}`}>
      <div className="icon" style={{ position: "relative" }}>
        {icon}
        {typeof badge === "number" && badge > 0 && <span className="badge">{badge}</span>}
      </div>
      {active && <span className="tab--underline" />}
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current">
      <path d="M3 10L12 3L21 10V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current">
      <path d="M12 3L2 8L12 13L22 8L12 3Z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5 10V15C5 17 9 19 12 19C15 19 19 17 19 15V10" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} className="stroke-current">
      <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="1.8" />
      <path d="M7 9H17M7 12H17M7 15H13" strokeWidth="1.8" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current">
      <path d="M21 12C21 16 17.5 19 13 19H8L4 21V16C3 14.5 3 13 3 12C3 7.5 7 5 12 5C17 5 21 8 21 12Z" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-current">
      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.8" />
      <path d="M4 22C4 18.6863 6.68629 16 10 16H14C17.3137 16 20 18.6863 20 22" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
