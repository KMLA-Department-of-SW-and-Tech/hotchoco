import React, { MouseEventHandler } from "react";
import type { PostRecord } from "../types/posts";

interface PostCardProps {
  post: PostRecord;
  imageUrl?: string | null;
  onClick?: MouseEventHandler<HTMLElement>;
}

export function PostCard({ post, imageUrl, onClick }: PostCardProps) {
  const body = (post.content as string | null) ?? (post.body as string | null) ?? "";
  const likeIcon = "/icons/like.png";
  const commentIcon = "/icons/comment.png";
  const hasMeta =
    Boolean(post.timeLabel) ||
    typeof post.likes === "number" ||
    typeof post.comments === "number";

  return (
    <article className="post-card" onClick={onClick} role="button">
      <div className="post-card__main">
        <h3 className="post-card__title">{post.title}</h3>
        {body ? <p className="post-card__body">{body}</p> : null}
        {hasMeta ? (
          <div className="post-meta">
            {post.timeLabel ? (
              <span className="post-meta__time">{post.timeLabel}</span>
            ) : null}
            <span className="post-meta__pill post-meta__pill--likes">
              <img
                aria-hidden="true"
                className="post-meta__icon"
                src={likeIcon}
                alt=""
              />
              {(post.likes as number | undefined) ?? 0}
            </span>
            <span className="post-meta__pill post-meta__pill--comments">
              <img
                aria-hidden="true"
                className="post-meta__icon"
                src={commentIcon}
                alt=""
              />
              {(post.comments as number | undefined) ?? 0}
            </span>
          </div>
        ) : null}
      </div>
      {imageUrl ? (
        <div className="post-card__thumb">
          <img src={imageUrl} alt="thumbnail" loading="lazy" />
        </div>
      ) : null}
    </article>
  );
}
