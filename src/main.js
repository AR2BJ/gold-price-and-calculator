import "./assets/css/style.css";

import { renderConverter } from "./ui/converter.js";
import { renderDashboard } from "./ui/dashboard.js";

const app = document.querySelector("#app");

// ساخت اسکلت اصلی برنامه (هدر و کانتینر)
app.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-3 flex gap-4">
        <button id="nav-dashboard" class="text-blue-600 font-bold px-4 py-2 rounded-lg bg-blue-50 cursor-pointer">داشبورد</button>
        <button id="nav-converter" class="text-gray-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">تبدیل واحد</button>
      </div>
    </nav>
    <main id="page-content" class="py-6"></main>
  </div>
`;

const content = document.querySelector("#page-content");
const btnDash = document.querySelector("#nav-dashboard");
const btnConv = document.querySelector("#nav-converter");

// تابع برای تغییر حالت منو
function setActiveTab(tab) {
  if (tab === "dashboard") {
    btnDash.className =
      "text-blue-600 font-bold px-4 py-2 rounded-lg bg-blue-50 cursor-pointer";
    btnConv.className =
      "text-gray-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer";
    renderDashboard(content);
  } else {
    btnConv.className =
      "text-blue-600 font-bold px-4 py-2 rounded-lg bg-blue-50 cursor-pointer";
    btnDash.className =
      "text-gray-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer";
    renderConverter(content);
  }
}

// اتصال رویدادها
btnDash.addEventListener("click", () => setActiveTab("dashboard"));
btnConv.addEventListener("click", () => setActiveTab("converter"));

// بارگذاری اولیه (داشبورد)
setActiveTab("dashboard");
