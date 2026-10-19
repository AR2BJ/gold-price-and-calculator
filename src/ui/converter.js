import { faNum, faUnit } from "./format.js";
import {
  fromGram,
  mazaneh,
  theoreticalGram24,
  toGram,
} from "../core/calculators.js";

import { PURITY_MAP } from "../core/constants.js";

const UNITS = [
  "gram",
  "oz_troy",
  "oz_avoir",
  "mesghal",
  "mazaneh",
  "soot",
  "carat_weight",
];

// وضعیت داخلی صفحه
const state = {
  purityMode: "karat", // 'karat' | 'fineness'
  karat: 18,
  value: 1,
  unit: "gram",
  oz: null,
  usd: null,
};

export function renderConverter(root) {
  root.innerHTML = `
    <section class="max-w-5xl mx-auto p-4 space-y-6">
      <header class="flex items-center justify-between">
        <h2 class="text-xl font-bold">تبدیل واحد طلا</h2>
        <div class="inline-flex rounded-lg border overflow-hidden" id="purity-mode-switch">
          <button data-mode="karat" class="px-4 py-1.5 bg-blue-600 text-white">عیار</button>
          <button data-mode="fineness" class="px-4 py-1.5">خلوص</button>
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-sm border p-4 grid gap-4 md:grid-cols-2">
        <label class="block">
          <span class="text-sm text-gray-600">مقدار</span>
          <input id="conv-value" type="number" value="1" min="0" step="any"
                 class="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label class="block">
          <span class="text-sm text-gray-600">واحد مبدأ</span>
          <select id="conv-unit" class="mt-1 w-full border rounded-lg p-2">
            <option value="gram">گرم</option>
            <option value="oz_troy">اونس تروآ</option>
            <option value="oz_avoir">اونس معمولی</option>
            <option value="mesghal">مثقال صیرفی</option>
            <option value="mazaneh">مظنه</option>
            <option value="soot">سوت</option>
            <option value="carat_weight">قیراط (وزن)</option>
          </select>
        </label>
        <p id="conv-hint" class="md:col-span-2 text-xs text-gray-500"></p>
      </div>

      <div id="conv-output" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>

      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">عیار</span>
          <span id="purity-label" class="font-bold text-amber-600">۱۸K</span>
        </div>
        <input id="purity-range" type="range" min="8" max="24" step="1" value="18"
               class="w-full accent-amber-600" />
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-4 grid gap-4 md:grid-cols-2">
        <label class="block">
          <span class="text-sm text-gray-600">قیمت اونس (USD)</span>
          <input id="oz-price" type="number" step="any" placeholder="مثلاً 2000"
                 class="mt-1 w-full border rounded-lg p-2" />
        </label>
        <label class="block">
          <span class="text-sm text-gray-600">نرخ دلار (تومان)</span>
          <input id="usd-rate" type="number" step="any" placeholder="مثلاً 60000"
                 class="mt-1 w-full border rounded-lg p-2" />
        </label>
        
        <!-- بخش نمایش نتایج ارزش‌گذاری -->
        <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p class="text-sm text-gray-600">قیمت نظری هر گرم با عیار انتخابی:</p>
            <p id="valuation-gram" class="text-2xl font-bold text-amber-700">—</p>
          </div>
          <div class="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p class="text-sm text-gray-600">قیمت مظنه (مثقال ۱۷ عیار):</p>
            <p id="valuation-mazaneh" class="text-2xl font-bold text-amber-700">—</p>
          </div>
        </div>
      </div>
    </section>
  `;

  bindEvents(root);
  updateAll(root);
}

function bindEvents(root) {
  const $ = (sel) => root.querySelector(sel);

  $("#conv-value").addEventListener("input", (e) => {
    state.value = parseFloat(e.target.value) || 0;
    updateAll(root);
  });

  $("#conv-unit").addEventListener("change", (e) => {
    state.unit = e.target.value;
    updateAll(root);
  });

  $("#purity-range").addEventListener("input", (e) => {
    state.karat = parseInt(e.target.value, 10);
    updateAll(root);
  });

  $("#oz-price").addEventListener("input", (e) => {
    state.oz = parseFloat(e.target.value) || null;
    updateAll(root);
  });

  $("#usd-rate").addEventListener("input", (e) => {
    state.usd = parseFloat(e.target.value) || null;
    updateAll(root);
  });

  root.querySelectorAll("#purity-mode-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.purityMode = btn.dataset.mode;
      root.querySelectorAll("#purity-mode-switch button").forEach((b) => {
        const active = b.dataset.mode === state.purityMode;
        b.classList.toggle("bg-blue-600", active);
        b.classList.toggle("text-white", active);
      });
      updateAll(root);
    });
  });
}

function updateAll(root) {
  const $ = (sel) => root.querySelector(sel);

  // تبدیل از واحد مبدأ به گرم (یک بار)
  const gram = toGram(state.value, state.unit);
  $("#conv-hint").textContent =
    `${faNum(state.value, 4)} ${state.unit} = ${faNum(gram, 6)} گرم`;

  // خروجی‌ها: از گرم به هر واحد (جلوگیری از انباشت خطا)
  const out = $("#conv-output");
  out.innerHTML = UNITS.map(
    (u) => `
    <div class="bg-white rounded-xl shadow-sm border p-3">
      <div class="text-xs text-gray-500">${labelOf(u)}</div>
      <div class="text-lg font-bold text-gray-800">${faUnit(fromGram(gram, u), u)}</div>
    </div>
  `,
  ).join("");

  // برچسب عیار
  const fineness = PURITY_MAP[state.karat];
  $("#purity-label").textContent =
    state.purityMode === "karat" ? `${state.karat}K` : `${faNum(fineness, 2)}‰`;

  // ارزش‌گذاری (گرم و مظنه)
  if (state.oz && state.usd) {
    const fair24 = theoreticalGram24(state.oz, state.usd);
    const fairSelected = fair24 * (state.karat / 24);
    $("#valuation-gram").textContent = `${faNum(fairSelected, 0)} تومان`;

    const mazanehPrice = mazaneh(state.oz, state.usd);
    $("#valuation-mazaneh").textContent = `${faNum(mazanehPrice, 0)} تومان`;
  } else {
    $("#valuation-gram").textContent = "—";
    $("#valuation-mazaneh").textContent = "—";
  }
}

function labelOf(unit) {
  return (
    {
      gram: "گرم",
      oz_troy: "اونس تروآ",
      oz_avoir: "اونس معمولی",
      mesghal: "مثقال صیرفی",
      mazaneh: "مظنه",
      soot: "سوت",
      carat_weight: "قیراط (وزن)",
    }[unit] ?? unit
  );
}
