const SYMBOLS = {
  oz: "gold-ounce",
  usd: "usd",
  gold18: "gold-18k",
  mazaneh: "gold-miskal",
  coin: "coin-emami",
};

const CACHE_KEY = "gold_prices_cache";
const CACHE_TTL = 15 * 60 * 1000;

export async function fetchLivePrices(forceRefresh = false) {
  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_TTL) {
        console.log("استفاده از داده‌های کش شده");
        return parsed.prices;
      }
    }
  }

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

  if (Object.values(prices).every((v) => v === null)) {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      console.warn("API قطع است، استفاده از داده‌های کش قبلی");
      return JSON.parse(cachedData).prices;
    }
    return null;
  }

  sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      prices: prices,
    }),
  );

  return prices;
}

const HISTORY_CACHE_KEY = "gold_history_cache";
const HISTORY_CACHE_TTL = 15 * 60 * 1000;

export async function fetchPriceHistory(
  symbolKey,
  fromDate,
  limit = 100,
  forceRefresh = false,
) {
  const cacheId = `${symbolKey}_${fromDate}_${limit}`;

  if (!forceRefresh) {
    const cachedRaw = sessionStorage.getItem(HISTORY_CACHE_KEY);
    if (cachedRaw) {
      const cachedObj = JSON.parse(cachedRaw);
      if (
        cachedObj.id === cacheId &&
        Date.now() - cachedObj.timestamp < HISTORY_CACHE_TTL
      ) {
        return cachedObj.data;
      }
    }
  }

  const symbolMap = {
    gold18: "gold-18k",
    usd: "usd",
    oz: "gold-ounce",
  };
  const symbol = symbolMap[symbolKey] || symbolKey;

  try {
    const res = await fetch(
      `https://api.priceto.day/v1/history/irr/${symbol}?from=${fromDate}&limit=${limit}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const historyArray = data.result || data;

    if (!Array.isArray(historyArray)) {
      throw new Error("داده‌های دریافتی آرایه نیستند");
    }

    const normalizedData = historyArray
      .map((item) => ({
        timestamp: item.time || item.timestamp || item.date,
        price: item.price || item.value,
      }))
      .filter((item) => item.timestamp && item.price);

    sessionStorage.setItem(
      HISTORY_CACHE_KEY,
      JSON.stringify({
        id: cacheId,
        timestamp: Date.now(),
        data: normalizedData,
      }),
    );

    return normalizedData;
  } catch (error) {
    console.warn("خطا در دریافت تاریخچه:", error.message);

    const cachedRaw = sessionStorage.getItem(HISTORY_CACHE_KEY);
    if (cachedRaw) {
      const cachedObj = JSON.parse(cachedRaw);
      if (cachedObj.id === cacheId) return cachedObj.data;
    }
    return null;
  }
}

export function getLastUpdateTime() {
  const cachedData = sessionStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    const date = new Date(parsed.timestamp);
    return date.toLocaleTimeString("fa-IR");
  }
  return null;
}
