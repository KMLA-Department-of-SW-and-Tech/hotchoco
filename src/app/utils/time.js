// 아주 가벼운 상대시간 formatter (dayjs 없이 사용)
export function timeAgo(dateInput) {
  const d = new Date(dateInput);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const dday = Math.floor(h / 24);
  if (dday < 7) return `${dday}일 전`;
  const w = Math.floor(dday / 7);
  if (w < 5) return `${w}주 전`;
  const mon = Math.floor(dday / 30);
  if (mon < 12) return `${mon}개월 전`;
  const y = Math.floor(dday / 365);
  return `${y}년 전`;
}
