import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Options from "./options";

const container = document.getElementById("app-container");
const root = createRoot(container);

root.render(<Options />);
