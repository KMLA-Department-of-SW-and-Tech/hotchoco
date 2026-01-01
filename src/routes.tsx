import React from "react";
import type { RouteObject } from "react-router-dom";
import Root from "./app/root";
import Home from "./app/routes/home";
import BoardsIndex from "./app/routes/boards-list";
import BoardListPage, { loader as boardListLoader } from "./app/routes/board-list";
import ExecutiveCouncilBoard, { loader as executiveCouncilLoader } from "./app/routes/executive-council";
import MeoksapalBoard, { loader as meoksapalLoader } from "./app/routes/meoksapal";
import RecruitBoard, { loader as recruitLoader } from "./app/routes/recruit";
import TteoljupBoard, { loader as tteoljupLoader } from "./app/routes/tteoljup";
import BoardSearchPage, { loader as boardSearchLoader } from "./app/routes/board-search";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "boards", element: <BoardsIndex /> },
      { path: "boards/:slug/search", element: <BoardSearchPage />, loader: boardSearchLoader },
      { path: "boards/meoksapal", element: <MeoksapalBoard />, loader: meoksapalLoader },
      { path: "boards/recruit", element: <RecruitBoard />, loader: recruitLoader },
      { path: "boards/tteoljup", element: <TteoljupBoard />, loader: tteoljupLoader },
      { path: "boards/:slug", element: <BoardListPage />, loader: boardListLoader },
      { path: "boards/executive-council", element: <ExecutiveCouncilBoard />, loader: executiveCouncilLoader },
    ],
  },
];
