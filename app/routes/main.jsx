import React from "react";
import { useLoaderData } from "react-router";
import { supabase } from "./mainsupabase-client.js";

export async function loader() {
  const { data, error } = await supabase.from("profile").select("*").limit(1);
  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data?.[0] ?? null, error: null };
}

export default function ProfileWithHeart() {
  const { profile, error } = useLoaderData();
  const [activeButton, setActiveButton] = React.useState("info");
  const [isEditing, setIsEditing] = React.useState(false);
  const fallbackProfile = React.useMemo(
    () => ({
      name: "이름 정보가 없습니다.",
      introduce: "소개 정보가 아직 없습니다.",
      phone_number: "전화번호 정보가 없습니다.",
      email: "이메일 정보가 없습니다.",
    }),
    []
  );
  const displayProfile = profile ?? fallbackProfile;

  const baseButtonStyle = {
    height: "26px",
    borderRadius: "999px",
    paddingTop: "8px",
    paddingRight: "16px",
    paddingBottom: "8px",
    paddingLeft: "16px",
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "100%",
    letterSpacing: "-0.5px",
    textAlign: "center",
    textTransform: "capitalize",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  const handleButtonClick = (key) => {
    setActiveButton(key);
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className="relative w-[430px] h-[932px]">
      {/* 상단 배경 이미지와 프로필 */}
      <div className="relative w-[430px] h-[346px] bg-cover bg-center">
        <img
          src="https://i.postimg.cc/d0Xhc4Cn/e2fd43b2df5bd56f65016a92488c888ae24addf0.png"
          alt="배경"
          className="w-full h-full object-cover"
        />

        {/* 프로필 이미지 */}
        <div
          className="absolute z-10"
          style={{
            top: "220px",
            left: "130px",
            width: "169px",
            height: "169px",
            opacity: 1,
          }}
        >
          <div className="relative w-full h-full">
            <div className="w-full h-full bg-gray-300 rounded-full border-4 border-white overflow-hidden">
              <img
                src="https://i.postimg.cc/VsJ3N4Cn/ad61a9f2f7759b4360b81233726767c2224215c6.png"
                alt="프로필"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 하트 이모지 - 5시 방향에 겹치게 배치 */}
            <div
              className="absolute z-20 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
              style={{
                width: "36.64px",
                height: "36px",
                bottom: "10px",
                right: "10px",
              }}
            >
              <span className="text-lg">❤️</span>
            </div>
          </div>
        </div>
      </div>

      {/* 큰 흰색 배경 */}
      <div
        className="absolute bg-white shadow-md"
        style={{
          width: "430px",
          height: "612px",
          top: "320px",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
      >
        <div className="px-6 pt-20 pb-6">
          {/* 이름 + 나이 영역 */}
          <div className="text-center mb-6">
            <div
              className="absolute flex items-center justify-center gap-2"
              style={{
                width: "253.45px",
                height: "28px",
                top: "81px",
                left: "88px",
              }}
            >
              <h1
                className="text-gray-800 text-center"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  fontStyle: "semi-bold",
                  fontSize: "20px",
                  lineHeight: "28px",
                  letterSpacing: "-2.5%",
                  textAlign: "center",
                }}
              >
                {displayProfile.name}
              </h1>
              {/* 편집 아이콘 */}
              <button
                type="button"
                onClick={handleEditClick}
                aria-label="프로필 편집"
                className={`p-1 rounded-full transition-all duration-200 ${
                  isEditing ? "bg-emerald-50 text-emerald-600" : "text-gray-500"
                } hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                style={{ lineHeight: 0 }}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
              </button>
            </div>

            {/* 버튼 3개 */}
            <div
              className="absolute flex gap-2"
              style={{
                width: "195px",
                height: "26px",
                top: "121px", // 441px - 320px
                left: "118px",
                gap: "8px",
              }}
            >
              {/* 정보 버튼 (왼쪽) */}
              <button
                type="button"
                onClick={() => handleButtonClick("info")}
                className="flex items-center justify-center hover:scale-[1.02] active:scale-95"
                style={{
                  width: "50px",
                  ...baseButtonStyle,
                  borderWidth: "1px",
                  borderColor:
                    activeButton === "info" ? "#3BBE95" : "#0f0f10ff",
                  backgroundColor:
                    activeButton === "info" ? "#3BBE95" : "#ffffff",
                  color: activeButton === "info" ? "#ffffff" : "#374151",
                  boxShadow:
                    activeButton === "info"
                      ? "0 4px 12px rgba(59, 190, 149, 0.25)"
                      : "0 2px 6px rgba(15, 15, 16, 0.12)",
                }}
              >
                정보
              </button>

              {/* 대화하기 버튼 (중간) */}
              <button
                type="button"
                onClick={() => handleButtonClick("chat")}
                className="flex items-center justify-center hover:scale-[1.02] active:scale-95"
                style={{
                  width: "68px",
                  ...baseButtonStyle,
                  borderWidth: "1px",
                  borderColor:
                    activeButton === "chat" ? "#3BBE95" : "#0f0f10ff",
                  backgroundColor:
                    activeButton === "chat" ? "#3BBE95" : "#ffffff",
                  color: activeButton === "chat" ? "#ffffff" : "#374151",
                  boxShadow:
                    activeButton === "chat"
                      ? "0 4px 12px rgba(59, 190, 149, 0.25)"
                      : "0 2px 6px rgba(15, 15, 16, 0.12)",
                }}
              >
                대화하기
              </button>

              {/* 글 목록 버튼 (오른쪽) */}
              <button
                type="button"
                onClick={() => handleButtonClick("list")}
                className="flex items-center justify-center hover:scale-[1.02] active:scale-95"
                style={{
                  width: "61px",
                  ...baseButtonStyle,
                  borderWidth: "1px",
                  borderColor:
                    activeButton === "list" ? "#3BBE95" : "#0f0f10ff",
                  backgroundColor:
                    activeButton === "list" ? "#3BBE95" : "#ffffff",
                  color: activeButton === "list" ? "#ffffff" : "#374151",
                  boxShadow:
                    activeButton === "list"
                      ? "0 4px 12px rgba(59, 190, 149, 0.25)"
                      : "0 2px 6px rgba(15, 15, 16, 0.12)",
                }}
              >
                글 목록
              </button>
            </div>
          </div>
          <div
            className="absolute flex flex-col gap-6 w-[360px] left-[24px]"
            style={{ top: "182px" }}
          >
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
                <p className="text-xs font-medium text-rose-600">
                  프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
              </div>
            )}
            <div>
              <h3
                className="text-gray-800"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "28px",
                  letterSpacing: "-2.5%",
                }}
              >
                소개
              </h3>
              <p
                className="text-gray-500"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "15px",
                  lineHeight: "24px",
                  letterSpacing: "-2.5%",
                }}
              >
                {displayProfile.introduce}
              </p>
            </div>

            <div>
              <h3
                className="text-gray-800"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "28px",
                  letterSpacing: "-2.5%",
                }}
              >
                전화번호
              </h3>
              <p
                className="text-gray-500"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "15px",
                  lineHeight: "24px",
                  letterSpacing: "-2.5%",
                }}
              >
                {displayProfile.phone_number}
              </p>
            </div>

            <div>
              <h3
                className="text-gray-800"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "28px",
                  letterSpacing: "-2.5%",
                }}
              >
                이메일
              </h3>
              <p
                className="text-gray-500"
                style={{
                  fontFamily:
                    "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "15px",
                  lineHeight: "24px",
                  letterSpacing: "-2.5%",
                }}
              >
                {displayProfile.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
