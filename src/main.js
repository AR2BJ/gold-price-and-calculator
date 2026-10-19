import "./assets/css/style.css";

import { renderConverter } from "./ui/converter.js";
import { renderDashboard } from "./ui/dashboard.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="min-h-screen bg-bg text-primary transition-colors duration-300">
    <nav
      class="bg-surface shadow-sm border-b border-border transition-colors duration-300"
    >
      <div class="max-w-6xl mx-auto px-4 py-3 flex gap-4">
        <div class="w-full flex flex-row justify-between items-center gap-2">
          <div class="flex flex-row justify-center items-center gap-2">
            <button
              id="nav-dashboard"
              class="font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center"
            >
              داشبورد
            </button>
            <button
              id="nav-converter"
              class="font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center"
            >
              تبدیل واحد
            </button>
          </div>
          <button
            id="theme-toggle"
            class="flex h-9 w-9 flex-row items-center justify-center rounded-xl border border-border bg-surface-2 text-primary transition cursor-pointer hover:bg-surface-3 sm:h-10 sm:w-10 shadow-sm overflow-hidden group"
            title="تغییر تم"
          >
            <i
              id="btn-icon"
              class="ti ti-moon text-secondary text-lg lg:text-xl transition-transform duration-300 ease-in-out"
            ></i>
          </button>
        </div>
      </div>
    </nav>
    <main
      id="page-content"
      class="py-6"
    ></main>
  </div>
`;

const content = document.querySelector("#page-content");
const btnDash = document.querySelector("#nav-dashboard");
const btnConv = document.querySelector("#nav-converter");
const themeToggle = document.querySelector("#theme-toggle");
const btnIcon = document.querySelector("#btn-icon");

const THEME_KEY = "gold_calculator_theme";
let activeTab = "dashboard";

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    btnIcon.className =
      "ti ti-sun text-yellow-500 text-lg lg:text-xl transition-transform duration-300";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    btnIcon.className =
      "ti ti-moon text-secondary text-lg lg:text-xl transition-transform duration-300";
  }

  if (activeTab === "dashboard") {
    renderDashboard(content);
  }
}

const savedTheme = sessionStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";

  applyTheme(newTheme);
  sessionStorage.setItem(THEME_KEY, newTheme);
});

function setActiveTab(tab) {
  activeTab = tab;
  const activeClass =
    "text-brand bg-brand/10 font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center";
  const inactiveClass =
    "text-secondary bg-secondary/10 hover:text-primary hover:bg-surface-2 font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center";

  if (tab === "dashboard") {
    btnDash.className = activeClass;
    btnConv.className = inactiveClass;
    renderDashboard(content);
  } else {
    btnConv.className = activeClass;
    btnDash.className = inactiveClass;
    renderConverter(content);
  }
}

btnDash.addEventListener("click", () => setActiveTab("dashboard"));
btnConv.addEventListener("click", () => setActiveTab("converter"));

setActiveTab("dashboard");
