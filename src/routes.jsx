// src/routes.jsx
import React from "react";
import Root from "./app/root";
import Home from "./app/routes/home";
import BoardsIndex from "./app/routes/boards-list";
import BoardListPage from "./app/routes/board-list";
import ExecutiveCouncilBoard from "./app/routes/executive-council";
import MeoksapalBoard from "./app/routes/meoksapal";
import RecruitBoard from "./app/routes/recruit";
import TteoljupBoard from "./app/routes/tteoljup";
import BoardSearchPage from "./app/routes/board-search";

export const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "boards", element: <BoardsIndex /> },
      { path: "boards/:slug/search", element: <BoardSearchPage /> },
      { path: "boards/meoksapal", element: <MeoksapalBoard /> },
      { path: "boards/recruit", element: <RecruitBoard /> },
      { path: "boards/tteoljup", element: <TteoljupBoard /> },
      { path: "boards/:slug", element: <BoardListPage /> },
      { path: "boards/executive-council", element: <ExecutiveCouncilBoard /> },
    ],
  },
];
