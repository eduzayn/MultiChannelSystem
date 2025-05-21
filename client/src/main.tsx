import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document title
document.title = "Sistema Omnichannel - Dashboard";

createRoot(document.getElementById("root")!).render(<App />);
