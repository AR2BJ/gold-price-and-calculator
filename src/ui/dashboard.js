import { bubblePercent, theoreticalGram18 } from "../core/calculators.js";
import { fetchLivePrices, getLastUpdateTime } from "../services/api.js";

import ApexCharts from "apexcharts";
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
            ? `
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>`
            : ""
        }
      </div>
    </section>
  `;

  root.querySelector("#btn-refresh").addEventListener("click", () => {
    renderDashboard(root, true);
  });

  const prices = await fetchLivePrices(forceRefresh);

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
        <div class="text-xl font-bold text-primary mt-1">
          ${displayPrice(prices.oz, 2)}
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-green-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">دلار (تومان)</div>
        <div class="text-xl font-bold text-primary mt-1">
          ${displayPrice(prices.usd, 0)}
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-amber-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">گرم ۱۸ عیار</div>
        <div class="text-xl font-bold text-primary mt-1">
          ${displayPrice(prices.gold18, 0)}
        </div>
      </div>
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 border-r-4 border-r-red-500 transition-all hover:shadow-md"
      >
        <div class="text-sm text-secondary">مظنه</div>
        <div class="text-xl font-bold text-primary mt-1">
          ${displayPrice(prices.mazaneh, 0)}
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
        '<p class="text-center text-secondary py-10">داده کافی برای نمایش نمودار وجود ندارد</p>';
    if (bubbleEl)
      bubbleEl.innerHTML =
        '<p class="text-center text-secondary py-10">داده کافی برای نمایش وجود ندارد</p>';
  }
}

function renderCharts(marketPrice, theoreticalPrice, bubbleValue) {
  if (trendChartInstance) trendChartInstance.destroy();
  if (bubbleChartInstance) bubbleChartInstance.destroy();

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
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
    },
    tooltip: { y: { formatter: (val) => `${faNum(val, 0)} تومان` } },
    legend: { show: false },
    theme: {
      mode: document.body.classList.contains("dark") ? "dark" : "light",
    },
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
        track: {
          background: borderColor,
          strokeWidth: "100%",
        },
      },
    },
    colors: [bubbleValue > 0 ? "#ef4444" : "#10b981"],
    labels: ["حباب"],
    theme: {
      mode: document.body.classList.contains("dark") ? "dark" : "light",
    },
  };

  bubbleChartInstance = new ApexCharts(
    document.querySelector("#bubble-chart"),
    bubbleOptions,
  );
  bubbleChartInstance.render();
}
