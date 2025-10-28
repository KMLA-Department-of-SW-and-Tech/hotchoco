// app/boards/config.js

// 공통 전략:
// - 테이블명은 슬러그와 동일 (예: meoksapal)
// - 스토리지 버킷: posts
// - image_path 예: `${slug}/filename.jpg`

export const BOARDS = {
  "executive-council": {
    title: "행정위원회",
    table: "executive-council",
    bucket: "executive-council",
  },
  "meoksapal": {
    title: "먹사팔",        // 음식/거래 게시판
    table: "meoksapal",
    bucket: "posts",
    categories: [
      { value: "팝니다", label: "팝니다" },
      { value: "삽니다", label: "삽니다" },
    ],
  },
  "recruit": {
    title: "모집공고",      // 동아리/행사/채용 등 모집 공지
    table: "recruit",
    bucket: "posts",
    categories: [
      { value: "동아리공고", label: "동아리공고" },
      { value: "MPT 신청", label: "MPT 신청" },
      { value: "스터디그룹", label: "스터디그룹" },
    ],
  },
  "tteoljup": {
    title: "떨줍",          // 떨이/무료나눔/득템(가칭)
    table: "tteoljup",
    bucket: "posts",
    categories: [
      { value: "떨궜다", label: "떨궜다" },
      { value: "찾았다", label: "찾았다" },
    ],
  },
};

// slug로 메타데이터 찾기
export function resolveBoard(slug) {
  return BOARDS[slug] ?? null;
}
