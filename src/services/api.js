const SYMBOLS = {
  oz: "gold-ounce",
  usd: "usd",
  gold18: "gold-18k",
  mazaneh: "gold-miskal",
  coin: "coin-emami",
};

const CACHE_KEY = "gold_prices_cache";
const CACHE_TTL = 15 * 60 * 1000; // ۱۵ دقیقه (به میلی‌ثانیه)

export async function fetchLivePrices(forceRefresh = false) {
  // ۱. بررسی کش (اگر رفرش اجباری نباشد)
  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const now = Date.now();
      // اگر از زمان کش شدن کمتر از ۱۵ دقیقه گذشته باشد
      if (now - parsed.timestamp < CACHE_TTL) {
        console.log("استفاده از داده‌های کش شده");
        return parsed.prices;
      }
    }
  }

  // ۲. درخواست به API
  const prices = {};
  await Promise.all(
    Object.entries(SYMBOLS).map(async ([key, symbol]) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const baseCurrency = symbol === "gold-ounce" ? "usd" : "irr";
        const url = `https://api.priceto.day/v1/latest/${baseCurrency}/${symbol}`;

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.success && data.price) {
          prices[key] = data.price;
        } else {
          throw new Error("داده نامعتبر");
        }
      } catch (error) {
        console.warn(`خطا در دریافت ${symbol}:`, error.message);
        prices[key] = null;
      }
    }),
  );

  // ۳. اگر همه داده‌ها null بودند، از کش قبلی استفاده کن (اگر وجود دارد)
  if (Object.values(prices).every((v) => v === null)) {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      console.warn("API قطع است، استفاده از داده‌های کش قبلی");
      return JSON.parse(cachedData).prices;
    }
    return null;
  }

  // ۴. ذخیره در کش با زمان فعلی
  sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      prices: prices,
    }),
  );

  return prices;
}

// تابع برای دریافت زمان آخرین آپدیت
export function getLastUpdateTime() {
  const cachedData = sessionStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    const date = new Date(parsed.timestamp);
    return date.toLocaleTimeString("fa-IR");
  }
  return null;
}
