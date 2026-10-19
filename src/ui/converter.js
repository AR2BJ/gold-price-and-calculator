import { faNum, faUnit } from "./format.js";
import {
  fromGram,
  karatToFineness,
  mazaneh,
  theoreticalGram24,
  toGram,
} from "../core/calculators.js";

import { AutocompleteComponent } from "../components/autocomplete.component.js";
import { fetchLivePrices } from "../services/api.js";

const UNIT_ITEMS = [
  { title: "گرم (Gram)", value: "gram", icon: "ti ti-weight" },
  { title: "اونس تروآ (Troy Oz)", value: "oz_troy", icon: "ti ti-scale" },
  {
    title: "اونس معمولی (Avoir Oz)",
    value: "oz_avoir",
    icon: "ti ti-scale-outline",
  },
  {
    title: "مثقال صیرفی (Mesghal)",
    value: "mesghal",
    icon: "ti ti-building-bank",
  },
  { title: "مظنه (Mazaneh)", value: "mazaneh", icon: "ti ti-chart-bar" },
  { title: "سوت (Soot)", value: "soot", icon: "ti ti-dots" },
  { title: "قیراط (Carat)", value: "carat_weight", icon: "ti ti-diamond" },
];

const state = {
  purityMode: "karat",
  karat: 18,
  value: 1,
  unit: "gram",
  oz: null,
  usd: null,
};

export async function renderConverter(root) {
  const prices = await fetchLivePrices();

  root.innerHTML = `
    <section
      class="max-w-6xl mx-auto p-4 space-y-6"
      dir="rtl"
    >
      <header
        class="flex items-center justify-between bg-surface p-5 rounded-2xl shadow-sm border border-border"
      >
        <div class="flex items-center gap-3">
          <div class="bg-brand/10 text-brand p-2.5 rounded-xl flex items-center">
            <i class="ti ti-arrows-exchange text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-primary">تبدیل واحد طلا</h2>
        </div>
        <div
          class="inline-flex rounded-xl border border-border bg-surface-2 p-1"
          id="purity-mode-switch"
        >
          <button
            data-mode="karat"
            class="px-4 py-1.5 rounded-lg bg-surface shadow-sm text-brand font-bold text-sm cursor-pointer transition-all flex items-center"
          >
            عیار
          </button>
          <button
            data-mode="fineness"
            class="px-4 py-1.5 rounded-lg text-secondary font-medium text-sm cursor-pointer hover:text-primary transition-all flex items-center"
          >
            خلوص
          </button>
        </div>
      </header>

      <div
        class="bg-surface rounded-2xl shadow-sm border border-border p-6 grid gap-6 md:grid-cols-2"
      >
        <label class="block">
          <span class="mb-1.5 ps-3 flex flex-row text-xs font-semibold text-secondary"
            >مقدار</span
          >
          <div class="relative">
            <input
              id="conv-value"
              type="number"
              value="1"
              min="0"
              step="any"
              class="h-11 w-full border border-border rounded-xl p-1.75 ps-10 bg-surface-2 focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all outline-none text-primary font-medium"
            />
            <i
              class="ti ti-math-function absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-lg"
            ></i>
          </div>
        </label>

        <div class="block">
          <div id="unit-autocomplete-container"></div>
        </div>

        <div
          class="md:col-span-2 bg-brand-light text-brand p-3 rounded-xl text-sm flex items-center gap-2 border border-brand/20"
        >
          <i class="ti ti-info-circle text-lg"></i>
          <p id="conv-hint"></p>
        </div>
      </div>

      <div
        id="conv-output"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      ></div>

      <div class="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div class="flex items-center justify-between mb-4">
          <span
            id="range-title"
            class="text-sm font-semibold text-secondary"
            >عیار</span
          >
          <span
            id="purity-label"
            class="font-bold text-brand text-lg font-['IranYekanRegular']"
            >۱۸K</span
          >
        </div>
        <input
          id="purity-range"
          type="range"
          min="8"
          max="24"
          step="1"
          value="18"
          class="w-full custom-range"
        />
      </div>

      <div
        class="bg-surface rounded-2xl shadow-sm border border-border p-6 grid gap-6 md:grid-cols-2"
      >
        <div class="block">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-secondary"
              >قیمت اونس (USD)</span
            >
            <button
              type="button"
              id="reset-oz"
              class="text-xs text-brand bg-brand/10 px-2 py-1 rounded-md hover:bg-brand/20 transition cursor-pointer flex items-center gap-1"
            >
              <i class="ti ti-refresh text-sm"></i> بازنشانی
            </button>
          </div>
          <input
            id="oz-price"
            type="number"
            step="any"
            placeholder="مثلاً 2000"
            value="${prices?.oz ?? ""}"
            class="w-full border border-border rounded-xl p-3 bg-surface-2 focus:bg-surface focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all outline-none text-primary font-medium"
          />
        </div>

        <div class="block">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-secondary"
              >نرخ دلار (تومان)</span
            >
            <button
              type="button"
              id="reset-usd"
              class="text-xs text-brand bg-brand/10 px-2 py-1 rounded-md hover:bg-brand/20 transition cursor-pointer flex items-center gap-1"
            >
              <i class="ti ti-refresh text-sm"></i> بازنشانی
            </button>
          </div>
          <input
            id="usd-rate"
            type="number"
            step="any"
            placeholder="مثلاً 60000"
            value="${prices?.usd ?? ""}"
            class="w-full border border-border rounded-xl p-3 bg-surface-2 focus:bg-surface focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all outline-none text-primary font-medium"
          />
        </div>

        <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div
            class="rounded-xl bg-surface-2 border border-border p-5 shadow-sm relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
            <p class="text-sm font-medium text-secondary mb-1">
              قیمت نظری هر گرم با عیار انتخابی:
            </p>
            <p
              id="valuation-gram"
              class="text-2xl font-bold text-primary"
            >
              —
            </p>
          </div>
          <div
            class="rounded-xl bg-surface-2 border border-border p-5 shadow-sm relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 w-1 h-full bg-purple-500"></div>
            <p class="text-sm font-medium text-secondary mb-1">
              قیمت مظنه (۱ مثقال طلای ۱۷ عیار):
            </p>
            <p
              id="valuation-mazaneh"
              class="text-2xl font-bold text-primary"
            >
              —
            </p>
          </div>
        </div>

        <div
          class="md:col-span-2 text-center text-sm text-secondary mt-2 bg-surface-2 p-3 rounded-xl border border-border"
        >
          <i class="ti ti-info-circle text-brand"></i>
          برای مشاهده درصد حباب و مقایسه با قیمت‌های بازار، به صفحه
          <a
            href="#"
            id="link-to-dashboard"
            class="text-brand font-bold hover:underline"
            >داشبورد</a
          >
          مراجعه کنید.
        </div>
      </div>
    </section>
  `;

  if (prices?.oz) state.oz = prices.oz;
  if (prices?.usd) state.usd = prices.usd;

  const unitAutocomplete = new AutocompleteComponent(
    "unit-autocomplete-container",
    UNIT_ITEMS,
    {
      placeholder: "جستجوی واحد...",
      itemTitle: "title",
      itemValue: "value",
      label: "واحد مبدأ",
      itemIcon: "icon",
      clearable: false,
      containerClass:
        "border border-border rounded-xl bg-surface-2 text-primary font-medium focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand transition-all",
      inputClass: "text-primary bg-transparent",
    },
  );

  unitAutocomplete.setValue(state.unit);

  unitAutocomplete.onChange((value) => {
    state.unit = value;
    updateAll(root);
  });

  bindEvents(root, prices, unitAutocomplete);
  updateAll(root);
}

function bindEvents(root, prices, unitAutocomplete) {
  const $ = (sel) => root.querySelector(sel);

  $("#conv-value").addEventListener("input", (e) => {
    state.value = parseFloat(e.target.value) || 0;
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

  $("#reset-oz")?.addEventListener("click", () => {
    if (prices?.oz) {
      state.oz = prices.oz;
      $("#oz-price").value = prices.oz;
      updateAll(root);
    }
  });

  $("#reset-usd")?.addEventListener("click", () => {
    if (prices?.usd) {
      state.usd = prices.usd;
      $("#usd-rate").value = prices.usd;
      updateAll(root);
    }
  });

  $("#link-to-dashboard")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#nav-dashboard").click();
  });

  root.querySelectorAll("#purity-mode-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.purityMode = btn.dataset.mode;

      root.querySelectorAll("#purity-mode-switch button").forEach((b) => {
        const active = b.dataset.mode === state.purityMode;
        b.className = active
          ? "px-4 py-1.5 rounded-lg bg-surface shadow-sm text-brand font-bold text-sm cursor-pointer transition-all flex items-center"
          : "px-4 py-1.5 rounded-lg text-secondary font-medium text-sm cursor-pointer hover:text-primary transition-all flex items-center";
      });

      const rangeTitle = $("#range-title");
      if (rangeTitle) {
        rangeTitle.textContent =
          state.purityMode === "karat" ? "عیار" : "خلوص (در هزار)";
      }
      updateAll(root);
    });
  });
}

function updateAll(root) {
  const $ = (sel) => root.querySelector(sel);

  const gram = toGram(state.value, state.unit);

  const selectedUnit = UNIT_ITEMS.find((u) => u.value === state.unit);
  const unitName = selectedUnit ? selectedUnit.title : state.unit;

  $("#conv-hint").textContent =
    `${faNum(state.value, 4)} ${unitName} = ${faNum(gram, 6)} گرم`;

  const out = $("#conv-output");
  out.innerHTML = UNIT_ITEMS.map((item) => {
    if (item.value === state.unit) return "";

    return `
      <div
        class="bg-surface rounded-xl shadow-sm border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
      >
        <div
          class="bg-surface-2 text-secondary p-3 rounded-lg group-hover:bg-brand/10 group-hover:text-brand transition-colors flex items-center"
        >
          <i class="${item.icon} text-xl"></i>
        </div>
        <div>
          <div class="text-xs font-medium text-secondary mb-0.5">
            ${item.title}
          </div>
          <div dir="ltr" class="text-lg text-right font-bold text-color">
            ${faUnit(fromGram(gram, item.value), item.value)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const fineness = karatToFineness(state.karat);
  const purityLabel = $("#purity-label");
  const purityRange = $("#purity-range");

  if (purityLabel) {
    purityLabel.textContent =
      state.purityMode === "karat"
        ? `${state.karat}K`
        : `${faNum(fineness, 2)}‰`;
  }

  if (purityRange) {
    const min = 8;
    const max = 24;
    const value = state.karat;
    const percentage = ((value - min) / (max - min)) * 100;

    const fillColor = "#4f46e5";

    purityRange.style.background = `linear-gradient(to left, ${fillColor}
    ${percentage}%, var(--color-surface-3) ${percentage}%)`;
    purityRange.style.setProperty("--tw-ring-color", fillColor);
  }

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
