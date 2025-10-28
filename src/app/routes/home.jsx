// src/app/routes/home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <h1>Welcome</h1>
      <p>Go to <Link to="/boards/executive-council">행정위원회 게시판</Link></p>
      <p>or open <Link to="/boards">모든 게시판</Link></p>
    </div>
  );
}
