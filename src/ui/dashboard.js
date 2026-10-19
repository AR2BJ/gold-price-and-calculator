import {
  bubblePercent,
  mazaneh,
  theoreticalGram18,
} from "../core/calculators.js";

import ApexCharts from "apexcharts";
import { faNum } from "./format.js";

// داده‌های شبیه‌سازی شده (بعداً با API جایگزین می‌شود)
const mockData = {
  oz: 2350.5,
  usd: 61500,
  marketGold18: 3250000, // قیمت بازار (برای محاسبه حباب)
  marketCoin: 34500000, // قیمت بازار سکه
  history: [
    { date: "۱۴۰۳/۰۱/۰۱", price: 3100000 },
    { date: "۱۴۰۳/۰۱/۰۲", price: 3150000 },
    { date: "۱۴۰۳/۰۱/۰۳", price: 3120000 },
    { date: "۱۴۰۳/۰۱/۰۴", price: 3200000 },
    { date: "۱۴۰۳/۰۱/۰۵", price: 3250000 },
  ],
};

export function renderDashboard(root) {
  // محاسبات
  const fairGold18 = theoreticalGram18(mockData.oz, mockData.usd);
  const mazanehPrice = mazaneh(mockData.oz, mockData.usd);
  const goldBubble = bubblePercent(mockData.marketGold18, fairGold18);

  root.innerHTML = `
    <section class="max-w-6xl mx-auto p-4 space-y-6">
      <header class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">داشبورد بازار طلا</h2>
        <span class="text-sm text-gray-500">آخرین به‌روزرسانی: همین الان</span>
      </header>

      <!-- کارت‌های شاخص -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-blue-500">
          <div class="text-sm text-gray-500">انس جهانی (USD)</div>
          <div class="text-xl font-bold text-gray-800">${faNum(mockData.oz, 2)}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-green-500">
          <div class="text-sm text-gray-500">دلار (تومان)</div>
          <div class="text-xl font-bold text-gray-800">${faNum(mockData.usd, 0)}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-amber-500">
          <div class="text-sm text-gray-500">گرم ۱۸ عیار (نظری)</div>
          <div class="text-xl font-bold text-gray-800">${faNum(fairGold18, 0)}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 border-r-4 border-r-purple-500">
          <div class="text-sm text-gray-500">مظنه</div>
          <div class="text-xl font-bold text-gray-800">${faNum(mazanehPrice, 0)}</div>
        </div>
      </div>

      <!-- بخش نمودارها -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- نمودار روند (2/3 عرض) -->
        <div class="bg-white rounded-xl shadow-sm border p-4 lg:col-span-2">
          <h3 class="text-lg font-bold mb-4">روند قیمت گرم ۱۸ عیار</h3>
          <div id="trend-chart"></div>
        </div>

        <!-- نمودار حباب (1/3 عرض) -->
        <div class="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center">
          <h3 class="text-lg font-bold mb-4 text-center">درصد حباب طلا</h3>
          <div id="bubble-chart" class="w-full flex justify-center"></div>
          <p class="mt-4 text-sm text-center text-gray-600">
            قیمت بازار: <span class="font-bold">${faNum(mockData.marketGold18, 0)}</span><br>
            ارزش ذاتی: <span class="font-bold text-green-600">${faNum(fairGold18, 0)}</span>
          </p>
        </div>
      </div>
    </section>
  `;

  // رندر نمودارها پس از تزریق HTML به DOM
  renderCharts();
}

function renderCharts() {
  // ۱. نمودار روند (Area Chart)
  const trendOptions = {
    series: [
      {
        name: "قیمت گرم ۱۸",
        data: mockData.history.map((h) => h.price),
      },
    ],
    chart: {
      type: "area",
      height: 300,
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#f59e0b"], // amber-500
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
      categories: mockData.history.map((h) => h.date),
      labels: { style: { fontFamily: "inherit" } },
    },
    yaxis: {
      labels: {
        formatter: (val) => faNum(val, 0),
        style: { fontFamily: "inherit" },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${faNum(val, 0)} تومان` },
    },
  };

  const trendChart = new ApexCharts(
    document.querySelector("#trend-chart"),
    trendOptions,
  );
  trendChart.render();

  // ۲. نمودار حباب (Radial Bar)
  const bubbleValue = Math.abs(goldBubble).toFixed(1); // قدر مطلق درصد حباب
  const bubbleOptions = {
    series: [Number(bubbleValue)],
    chart: {
      type: "radialBar",
      height: 250,
      fontFamily: "inherit",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "24px",
            fontWeight: "bold",
            formatter: (val) => `${faNum(val, 1)}٪`,
            color: goldBubble > 0 ? "#ef4444" : "#10b981", // قرمز اگر مثبت، سبز اگر منفی
          },
        },
      },
    },
    colors: [goldBubble > 0 ? "#ef4444" : "#10b981"], // قرمز برای حباب مثبت، سبز برای منفی
    labels: ["حباب"],
  };

  const bubbleChart = new ApexCharts(
    document.querySelector("#bubble-chart"),
    bubbleOptions,
  );
  bubbleChart.render();
}
