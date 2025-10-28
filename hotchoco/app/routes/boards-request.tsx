import type { ReactNode } from "react";
import { Link, Form, useActionData } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import type { Route } from "./+types/boards-request";
import { BoardsStyles } from "./boards-styles";

export const links: Route.LinksFunction = () => [];

export function meta() {
  return [
    { title: "게시판 개설요청" },
    { name: "description", content: "새 게시판 개설을 요청합니다" },
  ];
}

export default function BoardRequestPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="boards">
      <BoardsStyles />
      <header className="boards-header">
        <div className="container header-row">
          <Link to="/boards" aria-label="뒤로" className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="title">게시판 개설요청</h1>
        </div>
      </header>

      <main className="container main">
        <section className="section">
          <h2 className="section-title">요청 정보</h2>
          {actionData?.ok && (
            <div style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
              fontSize: 14,
            }}>
              개설 요청이 저장되었습니다. 검토 후 안내드릴게요!
            </div>
          )}
          <Form method="post" style={{ display: "grid", rowGap: 12 }}>
            <div>
              <label htmlFor="name" style={{ display: "block", fontSize: 14, marginBottom: 6, color: "var(--muted)" }}>게시판 이름</label>
              <input id="name" name="name" required placeholder="예: 공강"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </div>

            <div>
              <label htmlFor="category" style={{ display: "block", fontSize: 14, marginBottom: 6, color: "var(--muted)" }}>카테고리</label>
              <input id="category" name="category" placeholder="예: 커뮤니티 / 공지 / 거래"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }} />
            </div>

            <div>
              <label htmlFor="description" style={{ display: "block", fontSize: 14, marginBottom: 6, color: "var(--muted)" }}>설명</label>
              <textarea id="description" name="description" rows={4} placeholder="게시판의 목적과 사용 가이드를 적어주세요"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", resize: "vertical" }} />
            </div>

            <div>
              <label htmlFor="reason" style={{ display: "block", fontSize: 14, marginBottom: 6, color: "var(--muted)" }}>개설 사유</label>
              <textarea id="reason" name="reason" rows={3} placeholder="개설이 필요한 이유를 적어주세요"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="submit" className="chip chip--primary" style={{ padding: "10px 16px" }}>요청 제출</button>
              <Link to="/boards" className="chip chip--outline" style={{ padding: "10px 16px", textDecoration: "none" }}>목록으로</Link>
            </div>
          </Form>
        </section>
      </main>

      <nav className="tabbar">
        <div className="container tabbar-row">
          <Tab icon={<HomeIcon />} to="/" />
          <Tab icon={<CapIcon />} to="#" />
          <Tab icon={<ListIcon active />} to="/boards" />
          <Tab icon={<ChatIcon />} to="#" />
          <Tab icon={<UserIcon />} to="#" />
        </div>
      </nav>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const category = String(form.get("category") || "").trim();
  const description = String(form.get("description") || "").trim();
  const reason = String(form.get("reason") || "").trim();

  if (!name) {
    return { ok: false, error: "name_required" } as const;
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || "https://pknwhzohdspdixdywktn.supabase.co";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbndoem9oZHNwZGl4ZHl3a3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODM3NDgsImV4cCI6MjA3Mzg1OTc0OH0.ZlO3CMGlhih-dZTjFg_sgOdeVDAJhkMCIGGJQJctecM";

    const res = await fetch(`${SUPABASE_URL}/rest/v1/board_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          name,
          category: category || null,
          description: description || null,
          reason: reason || null,
          created_at: new Date().toISOString(),
        },
      ]),
    });

    const data = await res.json().catch(() => undefined);
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      return { ok: false, error: "supabase_insert_failed", message } as const;
    }

    const inserted = Array.isArray(data) && data.length ? data[0] : undefined;
    return { ok: true, id: inserted?.id ?? null } as const;
  } catch (err) {
    console.error("supabase request failed", err);
    return { ok: false, error: "save_failed" } as const;
  }
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
