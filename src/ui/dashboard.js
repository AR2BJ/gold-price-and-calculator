import { fetchLivePrices, getLastUpdateTime } from "../services/api.js";

import ApexCharts from "apexcharts";
import { bubblePercent } from "../core/calculators.js";
import { faNum } from "./format.js";

let trendChartInstance = null;
let bubbleChartInstance = null;
let currentRenderController = null;

export async function renderDashboard(root, forceRefresh = false) {
  if (currentRenderController) currentRenderController.abort();
  currentRenderController = new AbortController();
  const signal = currentRenderController.signal;

  if (trendChartInstance) {
    trendChartInstance.destroy();
    trendChartInstance = null;
  }
  if (bubbleChartInstance) {
    bubbleChartInstance.destroy();
    bubbleChartInstance = null;
  }

  // اگر رفرش اجباری است، یک لودینگ کوچک نشان بدهیم (اختیاری)
  const isInitialLoad = !root.querySelector("#dashboard-content");

  root.innerHTML = `
    <section class="max-w-6xl mx-auto p-4 space-y-6">
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold">داشبورد بازار طلا</h2>
          <button id="btn-refresh" class="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            به‌روزرسانی
          </button>
        </div>
        <div class="text-sm text-gray-500 flex flex-col items-end">
          <span id="last-update-text">در حال دریافت...</span>
          <span class="text-xs text-gray-400 mt-1">(کش خودکار هر ۱۵ دقیقه)</span>
        </div>
      </header>
      
      <div id="dashboard-content">
        ${
          isInitialLoad
            ? `
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>`
            : ""
        }
      </div>
    </section>
  `;

  // اتصال دکمه رفرش
  root.querySelector("#btn-refresh").addEventListener("click", () => {
    renderDashboard(root, true); // true یعنی رفرش اجباری
  });

  // دریافت داده‌ها (با در نظر گرفتن forceRefresh)
  const prices = await fetchLivePrices(forceRefresh);

  if (signal.aborted) return;

  const content = root.querySelector("#dashboard-content");
  const updateSpan = root.querySelector("#last-update-text");

  if (!content || !updateSpan) return;

  if (!prices) {
    content.innerHTML = `
      <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center">
        خطا در دریافت قیمت‌ها. لطفاً اتصال اینترنت یا وضعیت API را بررسی کنید.
        <button onclick="location.reload()" class="block mx-auto mt-2 text-sm underline">تلاش مجدد</button>
      </div>
    `;
    updateSpan.textContent = "ناموفق";
    return;
  }

  // نمایش زمان آپدیت
  const lastUpdate = getLastUpdateTime();
  updateSpan.textContent = lastUpdate
    ? `آخرین به‌روزرسانی: ${lastUpdate}`
    : "لحظه‌ای";

  let goldBubble = null;
  let theoreticalGold18 = null;

  if (prices.oz && prices.usd) {
    theoreticalGold18 = ((prices.oz * prices.usd) / 31.1034768) * (18 / 24);
    if (prices.gold18) {
      goldBubble = bubblePercent(prices.gold18, theoreticalGold18);
    }
  }

  const displayPrice = (val, digits) => (val ? faNum(val, digits) : "—");

  content.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-blue-500">
        <div class="text-sm text-gray-500">انس جهانی (USD)</div>
        <div class="text-xl font-bold text-gray-800">${displayPrice(prices.oz, 2)}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-green-500">
        <div class="text-sm text-gray-500">دلار (تومان)</div>
        <div class="text-xl font-bold text-gray-800">${displayPrice(prices.usd, 0)}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-amber-500">
        <div class="text-sm text-gray-500">گرم ۱۸ عیار</div>
        <div class="text-xl font-bold text-gray-800">${displayPrice(prices.gold18, 0)}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-purple-500">
        <div class="text-sm text-gray-500">مظنه</div>
        <div class="text-xl font-bold text-gray-800">${displayPrice(prices.mazaneh, 0)}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-sm border p-4 lg:col-span-2">
        <h3 class="text-lg font-bold mb-4">مقایسه قیمت بازار و ارزش ذاتی</h3>
        <div id="trend-chart"></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center">
        <h3 class="text-lg font-bold mb-4 text-center">درصد حباب طلا</h3>
        <div id="bubble-chart" class="w-full flex justify-center"></div>
        <p class="mt-4 text-sm text-center text-gray-600">
          بازار: <span class="font-bold">${displayPrice(prices.gold18, 0)}</span><br>
          ارزش ذاتی: <span class="font-bold text-green-600">${displayPrice(theoreticalGold18, 0)}</span>
        </p>
      </div>
    </div>
  `;

  // رندر نمودارها
  if (prices.gold18 && theoreticalGold18 && goldBubble !== null) {
    setTimeout(() => {
      if (
        document.querySelector("#trend-chart") &&
        document.querySelector("#bubble-chart")
      ) {
        renderCharts(prices.gold18, theoreticalGold18, goldBubble);
      }
    }, 50);
  } else {
    const trendEl = document.querySelector("#trend-chart");
    const bubbleEl = document.querySelector("#bubble-chart");
    if (trendEl)
      trendEl.innerHTML =
        '<p class="text-center text-gray-400 py-10">داده کافی برای نمایش نمودار وجود ندارد</p>';
    if (bubbleEl)
      bubbleEl.innerHTML =
        '<p class="text-center text-gray-400 py-10">داده کافی برای نمایش وجود ندارد</p>';
  }
}

function renderCharts(marketPrice, theoreticalPrice, bubbleValue) {
  if (trendChartInstance) trendChartInstance.destroy();
  if (bubbleChartInstance) bubbleChartInstance.destroy();

  const trendOptions = {
    series: [{ name: "قیمت", data: [marketPrice, theoreticalPrice] }],
    chart: {
      type: "bar",
      height: 300,
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#f59e0b", "#10b981"],
    plotOptions: { bar: { columnWidth: "50%", distributed: true } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["قیمت بازار", "ارزش ذاتی"],
      labels: { style: { fontFamily: "inherit" } },
    },
    yaxis: {
      labels: {
        formatter: (val) => faNum(val, 0),
        style: { fontFamily: "inherit" },
      },
    },
    tooltip: { y: { formatter: (val) => `${faNum(val, 0)} تومان` } },
    legend: { show: false },
  };

  trendChartInstance = new ApexCharts(
    document.querySelector("#trend-chart"),
    trendOptions,
  );
  trendChartInstance.render();

  const absBubble = Math.abs(bubbleValue).toFixed(1);
  const bubbleOptions = {
    series: [Number(absBubble)],
    chart: { type: "radialBar", height: 250, fontFamily: "inherit" },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "24px",
            fontWeight: "bold",
            formatter: (val) => `${faNum(val, 1)}٪`,
            color: bubbleValue > 0 ? "#ef4444" : "#10b981",
          },
        },
      },
    },
    colors: [bubbleValue > 0 ? "#ef4444" : "#10b981"],
    labels: ["حباب"],
  };

  bubbleChartInstance = new ApexCharts(
    document.querySelector("#bubble-chart"),
    bubbleOptions,
  );
  bubbleChartInstance.render();
}
