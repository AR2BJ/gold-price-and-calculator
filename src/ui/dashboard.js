import { bubblePercent, theoreticalGram18 } from "../core/calculators.js";
import {
  fetchLivePrices,
  fetchPriceHistory,
  getLastUpdateTime,
} from "../services/api.js";

import ApexCharts from "apexcharts";
import { faNum } from "./format.js";

let trendChartInstance = null;
let bubbleChartInstance = null;
let historyChartInstance = null;
let currentRenderController = null;
let currentHistoryRange = "weekly"; // 'hourly' | 'weekly' | 'monthly' | 'yearly'

let cachedPrices = null;
let cachedHistoryData = null;

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
  if (historyChartInstance) {
    historyChartInstance.destroy();
    historyChartInstance = null;
  }

  const isInitialLoad = !root.querySelector("#dashboard-content");

  root.innerHTML = `
    <section
      class="max-w-6xl mx-auto p-4 space-y-6 text-color"
      dir="rtl"
    >
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-primary">داشبورد بازار طلا</h2>
          <button
            id="btn-refresh"
            class="text-sm bg-brand/10 text-brand px-3 py-1.5 rounded-lg hover:bg-brand/20 transition flex items-center gap-2 cursor-pointer"
          >
            <i class="ti ti-refresh text-lg"></i>
            به‌روزرسانی
          </button>
        </div>
        <div class="text-sm text-secondary flex flex-col items-end">
          <span id="last-update-text">در حال دریافت...</span>
          <span class="text-xs text-tertiary mt-1"
            >(کش خودکار هر ۱۵ دقیقه)</span
          >
        </div>
      </header>

      <div id="dashboard-content">
        ${
          isInitialLoad
            ? `<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>`
            : ""
        }
      </div>

      <div
        id="history-section"
        class="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-8 hidden"
      >
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <h3 class="text-lg font-bold text-primary">روند قیمت طلای ۱۸ عیار</h3>
          <div
            class="flex gap-1 bg-surface-2 p-1 rounded-xl"
            id="history-range-buttons"
          >
            <button
              data-range="hourly"
              class="px-3 py-1 text-sm rounded-lg text-secondary hover:text-primary transition cursor-pointer"
            >
              ساعتی
            </button>
            <button
              data-range="weekly"
              class="px-3 py-1 text-sm rounded-lg bg-brand text-white shadow-sm font-bold transition cursor-pointer"
            >
              هفتگی
            </button>
            <button
              data-range="monthly"
              class="px-3 py-1 text-sm rounded-lg text-secondary hover:text-primary transition cursor-pointer"
            >
              ماهانه
            </button>
            <button
              data-range="yearly"
              class="px-3 py-1 text-sm rounded-lg text-secondary hover:text-primary transition cursor-pointer"
            >
              سالانه
            </button>
          </div>
        </div>
        <div
          id="history-chart"
          class="w-full"
        ></div>
      </div>
    </section>
  `;

  if (forceRefresh) cachedHistoryData = null;

  root.querySelector("#btn-refresh").addEventListener("click", () => {
    renderDashboard(root, true);
  });

  root.querySelectorAll("#history-range-buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll("#history-range-buttons button").forEach((b) => {
        b.className =
          "px-3 py-1 text-sm rounded-lg text-secondary hover:text-primary transition cursor-pointer";
      });
      btn.className =
        "px-3 py-1 text-sm rounded-lg bg-brand text-white shadow-sm font-bold transition cursor-pointer";
      currentHistoryRange = btn.dataset.range;
      cachedHistoryData = null;
      loadHistoryChart(false);
    });
  });

  let prices = cachedPrices;
  if (!prices || forceRefresh) {
    prices = await fetchLivePrices(forceRefresh);
    if (prices) cachedPrices = prices;
  }

  if (signal.aborted) return;

  const content = root.querySelector("#dashboard-content");
  const updateSpan = root.querySelector("#last-update-text");

  if (!content || !updateSpan) return;

  if (!prices) {
    content.innerHTML = `
      <div
        class="bg-error-light text-error p-4 rounded-xl border border-error/30 text-center"
      >
        خطا در دریافت قیمت‌ها. لطفاً اتصال اینترنت یا وضعیت API را بررسی کنید.
        <button
          onclick="location.reload()"
          class="block mx-auto mt-2 text-sm underline hover:text-error/80"
        >
          تلاش مجدد
        </button>
      </div>
    `;
    updateSpan.textContent = "ناموفق";
    return;
  }

  const lastUpdate = getLastUpdateTime();
  updateSpan.textContent = lastUpdate
    ? `آخرین به‌روزرسانی: ${lastUpdate}`
    : "لحظه‌ای";

  let goldBubble = null;
  let theoreticalGold18 = null;

  if (prices.oz && prices.usd) {
    theoreticalGold18 = theoreticalGram18(prices.oz, prices.usd);
    if (prices.gold18) {
      goldBubble = bubblePercent(prices.gold18, theoreticalGold18);
    }
  }

  const displayPrice = (val, digits) => (val ? faNum(val, digits) : "—");

  content.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-blue-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">انس جهانی (USD)</div>
        <div
          class="text-xl font-bold text-primary mt-1 flex items-center gap-1"
        >
          ${displayPrice(prices.oz, 2)}<span class="text-sm text-secondary"
            >دلار</span
          >
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-green-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">دلار</div>
        <div
          class="text-xl font-bold text-primary mt-1 flex items-center gap-1"
        >
          ${displayPrice(prices.usd, 0)}<span class="text-sm text-secondary"
            >ریال</span
          >
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-amber-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">گرم ۱۸ عیار</div>
        <div
          class="text-xl font-bold text-primary mt-1 flex items-center gap-1"
        >
          ${displayPrice(prices.gold18, 0)}<span class="text-sm text-secondary"
            >ریال</span
          >
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-red-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">مظنه (۱ مثقال طلای ۱۷ عیار)</div>
        <div
          class="text-xl font-bold text-primary mt-1 flex items-center gap-1"
        >
          ${displayPrice(prices.mazaneh, 0)}<span class="text-sm text-secondary"
            >ریال</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 lg:col-span-2"
      >
        <h3 class="text-lg font-bold text-primary mb-4">
          مقایسه قیمت بازار و ارزش ذاتی
        </h3>
        <div id="trend-chart"></div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 flex flex-col items-center justify-center"
      >
        <h3 class="text-lg font-bold text-primary mb-4 text-center">
          درصد حباب طلا
        </h3>
        <div
          id="bubble-chart"
          class="w-full flex justify-center"
        ></div>
        <p class="mt-4 text-sm text-center text-secondary">
          بازار:
          <span class="font-bold text-primary"
            >${displayPrice(prices.gold18, 0)}</span
          ><br />
          ارزش ذاتی:
          <span class="font-bold text-success"
            >${displayPrice(theoreticalGold18, 0)}</span
          >
        </p>
      </div>
    </div>
  `;

  const historySection = root.querySelector("#history-section");
  if (historySection) historySection.classList.remove("hidden");

  if (prices.gold18 && theoreticalGold18 && goldBubble !== null) {
    setTimeout(() => {
      if (
        document.querySelector("#trend-chart") &&
        document.querySelector("#bubble-chart")
      ) {
        renderCharts(prices.gold18, theoreticalGold18, goldBubble);
      }
    }, 50);
  }

  if (cachedHistoryData && !forceRefresh) {
    renderHistoryChart(cachedHistoryData);
  } else {
    loadHistoryChart(forceRefresh);
  }
}

function renderCharts(marketPrice, theoreticalPrice, bubbleValue) {
  if (trendChartInstance) trendChartInstance.destroy();
  if (bubbleChartInstance) bubbleChartInstance.destroy();

  const isDark = document.documentElement.classList.contains("dark");
  const style = getComputedStyle(document.body);
  const textColor =
    style.getPropertyValue("--color-secondary").trim() || "#94a3b8";
  const borderColor =
    style.getPropertyValue("--color-border").trim() || "#374151";

  const trendOptions = {
    series: [{ name: "قیمت", data: [marketPrice, theoreticalPrice] }],
    chart: {
      type: "bar",
      height: 300,
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: ["#f59e0b", "#10b981"],
    plotOptions: {
      bar: { columnWidth: "50%", distributed: true, borderRadius: 6 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["قیمت بازار", "ارزش ذاتی"],
      labels: { style: { fontFamily: "inherit", colors: textColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => faNum(val, 0),
        style: { fontFamily: "inherit", colors: textColor },
      },
      title: {
        text: "ریال",
        style: {
          fontFamily: "inherit",
          color: textColor,
          fontSize: "12px",
          fontWeight: 400,
        },
      },
    },
    grid: { borderColor: borderColor, strokeDashArray: 4 },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const val = series[seriesIndex][dataPointIndex];
        const category = w.globals.labels[dataPointIndex];
        const color = dataPointIndex === 0 ? "#f59e0b" : "#10b981";

        return `
          <div
            class="rounded-lg shadow-lg p-3 text-sm"
            dir="rtl"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-2 text-secondary font-medium">
                <span
                  class="w-2.5 h-2.5 rounded-full"
                  style="background-color: ${color}"
                ></span>
                ${category}:
              </span>
              <div class="flex flex-row justify-center items-center gap-1">
                <span class="font-bold text-primary">
                  ${faNum(val, 0)}
                </span>
                <span class="text-secondary text-xs">ریال</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: { show: false },
    theme: { mode: isDark ? "dark" : "light" },
  };

  trendChartInstance = new ApexCharts(
    document.querySelector("#trend-chart"),
    trendOptions,
  );
  trendChartInstance.render();

  const absBubble = Math.abs(bubbleValue).toFixed(1);
  const bubbleOptions = {
    series: [Number(absBubble)],
    chart: {
      type: "radialBar",
      height: 250,
      fontFamily: "inherit",
      background: "transparent",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "inherit",
            formatter: (val) => `${faNum(val, 1)}٪`,
            color: bubbleValue > 0 ? "#ef4444" : "#10b981",
          },
        },
        track: { background: borderColor, strokeWidth: "100%" },
      },
    },
    colors: [bubbleValue > 0 ? "#ef4444" : "#10b981"],
    labels: ["حباب"],
    theme: { mode: isDark ? "dark" : "light" },
  };

  bubbleChartInstance = new ApexCharts(
    document.querySelector("#bubble-chart"),
    bubbleOptions,
  );
  bubbleChartInstance.render();
}

async function loadHistoryChart(forceRefresh = false) {
  const chartEl = document.querySelector("#history-chart");
  if (!chartEl) return;

  chartEl.innerHTML = `<div class="flex justify-center items-center h-64">
    <div
      class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"
    ></div>
  </div>`;

  let fromDate = new Date();
  let limit = 100;

  switch (currentHistoryRange) {
    case "hourly":
      fromDate.setDate(fromDate.getDate() - 1);
      limit = 24;
      break;
    case "weekly":
      fromDate.setDate(fromDate.getDate() - 7);
      limit = 168;
      break;
    case "monthly":
      fromDate.setMonth(fromDate.getMonth() - 1);
      limit = 720;
      break;
    case "yearly":
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      limit = 365;
      break;
  }

  const history = await fetchPriceHistory(
    "gold18",
    fromDate.toISOString().split("T")[0],
    limit,
    forceRefresh,
  );

  if (!history || history.length === 0) {
    chartEl.innerHTML = `<p class="text-center text-secondary py-10">
      داده‌ای برای این بازه زمانی یافت نشد.
    </p>`;
    return;
  }

  cachedHistoryData = history;
  renderHistoryChart(history);
}

function renderHistoryChart(history) {
  const chartEl = document.querySelector("#history-chart");
  if (!chartEl) return;

  chartEl.innerHTML = "";

  const seriesData = history.map((item) => ({
    x: new Date(item.timestamp).getTime(),
    y: item.price,
  }));

  const isDark = document.documentElement.classList.contains("dark");
  const style = getComputedStyle(document.body);
  const textColor =
    style.getPropertyValue("--color-secondary").trim() || "#94a3b8";
  const borderColor =
    style.getPropertyValue("--color-border").trim() || "#374151";

  const options = {
    series: [{ name: "قیمت طلا", data: seriesData }],
    chart: {
      type: "area",
      height: 350,
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
      zoom: { enabled: false },
    },
    colors: ["#f59e0b"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      type: "datetime",
      labels: {
        style: { fontFamily: "inherit", colors: textColor },
        datetimeUTC: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => faNum(val, 0),
        style: { fontFamily: "inherit", colors: textColor },
      },
      title: {
        text: "ریال",
        style: {
          fontFamily: "inherit",
          color: textColor,
          fontSize: "12px",
          fontWeight: 400,
        },
      },
    },
    grid: { borderColor: borderColor, strokeDashArray: 4 },
    tooltip: {
      custom: function ({ _, seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const dateObj = new Date(data.x);
        const dateStr = dateObj.toLocaleDateString("fa-IR");
        const timeStr = dateObj.toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
          <div
            class="rounded-lg shadow-lg p-3 text-sm"
            dir="rtl"
          >
            <div class="text-secondary mb-2 pb-2 border-b border-border">
              ${dateStr} - ${timeStr}
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-2 text-primary font-medium">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                قیمت طلا:
              </span>
              <div class="flex flex-row justify-center items-center gap-1">
                <span class="font-bold text-primary">
                  ${faNum(data.y, 0)}
                </span>
                <span class="text-secondary text-xs">ریال</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    theme: { mode: isDark ? "dark" : "light" },
  };

  if (historyChartInstance) historyChartInstance.destroy();
  historyChartInstance = new ApexCharts(chartEl, options);
  historyChartInstance.render();
}
