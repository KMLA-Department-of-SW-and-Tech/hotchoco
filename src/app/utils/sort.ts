import type { PostRecord } from "../types/posts";

export function activityTimestamp(post: Partial<PostRecord> | null | undefined) {
  const candidates = [
    post?.last_activity_at,
    post?.comments_updated_at,
    post?.likes_updated_at,
    post?.updated_at,
    post?.created_at,
  ]
    .filter(Boolean)
    .map((value) => new Date(value as string | number | Date).getTime())
    .filter((value) => Number.isFinite(value));

  return candidates.length ? Math.max(...candidates) : 0;
}

export function sortPosts(posts: PostRecord[], sortOption: string = "newest") {
  if (!Array.isArray(posts)) return [];
  const copy = posts.slice();

  if (sortOption === "recent_activity") {
    copy.sort((a, b) => activityTimestamp(b) - activityTimestamp(a));
  } else {
    copy.sort((a, b) => {
      const bCreated = new Date(b?.created_at ?? 0).getTime();
      const aCreated = new Date(a?.created_at ?? 0).getTime();
      return bCreated - aCreated;
    });
  }

  return copy;
}
