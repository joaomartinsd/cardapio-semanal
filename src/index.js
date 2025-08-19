import React from "react";
import { createRoot } from "react-dom/client";
import WeeklyMenuPlanner from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <WeeklyMenuPlanner />
  </React.StrictMode>
);
