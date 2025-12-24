import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
function formatUnknownError(error) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`;
    }
    try {
        return JSON.stringify(error, null, 2);
    }
    catch {
        return String(error);
    }
}
function renderFatalError(error) {
    const rootEl = document.getElementById("root");
    const message = formatUnknownError(error);
    if (rootEl) {
        rootEl.innerHTML = "";
    }
    const container = document.createElement("div");
    container.setAttribute("data-fatal-error", "true");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.padding = "16px";
    container.style.background = "#0b1220";
    container.style.color = "#e5e7eb";
    container.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    container.style.fontSize = "12px";
    container.style.zIndex = "2147483647";
    container.style.overflow = "auto";
    const title = document.createElement("div");
    title.textContent = "App failed to start (see error below)";
    title.style.fontSize = "14px";
    title.style.fontWeight = "700";
    title.style.marginBottom = "12px";
    const pre = document.createElement("pre");
    pre.textContent = message;
    pre.style.whiteSpace = "pre-wrap";
    container.appendChild(title);
    container.appendChild(pre);
    document.body.appendChild(container);
}
window.addEventListener("error", (event) => {
    renderFatalError(event.error ?? event.message);
});
window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason && typeof reason === "object") {
        const maybeAny = reason;
        if (maybeAny.name === "ApiError") {
            console.error("Unhandled ApiError", reason);
            event.preventDefault();
            return;
        }
    }
    renderFatalError(reason);
});
async function bootstrap() {
    try {
        const rootEl = document.getElementById("root");
        if (!rootEl) {
            throw new Error('Missing root element: <div id="root" />');
        }
        const mod = await import("./App");
        const App = mod.default;
        createRoot(rootEl).render(<App />);
    }
    catch (error) {
        renderFatalError(error);
    }
}
void bootstrap();
