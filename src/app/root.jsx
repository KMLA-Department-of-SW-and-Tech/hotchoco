// src/app/root.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./app.css";

export default function Root() {
  return (
    <div className="shell">
      <Outlet />
    </div>
  );
}
