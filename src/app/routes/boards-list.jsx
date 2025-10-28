import React from "react";
import { Link } from "react-router";
import { BOARDS } from "../boards/config";


export default function BoardsIndex() {
return (
<div className="page">
<header className="page__header">
<h1 className="page__title">게시판</h1>
</header>
<ul className="list">
{Object.entries(BOARDS).map(([slug, meta]) => (
<li key={slug} className="list__item">
<Link to={`/boards/${slug}`} className="post-card" style={{textDecoration:"none"}}>
<div className="post-card__main">
<h3 className="post-card__title">{meta.title}</h3>
<p className="post-card__body">해당 게시판으로 이동</p>
</div>
</Link>
</li>
))}
</ul>
</div>
);
}