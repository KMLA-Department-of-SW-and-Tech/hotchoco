import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";

// 🔹 폰트 및 전역 스타일 링크
export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  },
];

// 🔹 메타 정보
export const meta = () => [
  { title: "공강신청 시스템" },
  { name: "description", content: "Supabase 기반 예약 관리 시스템" },
];

// 🔹 레이아웃 (HTML 구조 포함)
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-inter bg-gray-50 text-gray-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 🔹 루트 앱 (라우트 페이지 출력)
export default function App() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

// 🔹 에러 경계 처리
export function ErrorBoundary({ error }: any) {
  let message = "오류 발생!";
  let details = "예기치 못한 문제가 발생했습니다.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - 페이지를 찾을 수 없음" : "Error";
    details =
      error.status === 404
        ? "요청하신 페이지를 찾을 수 없습니다."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-6 container mx-auto">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="text-gray-600 mt-2">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-gray-100 rounded mt-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
