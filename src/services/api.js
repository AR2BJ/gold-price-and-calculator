// لیست نمادهایی که می‌خواهیم از PriceDB بگیریم
// بر اساس مستندات، نمادها را می‌توان از api.priceto.day/v1/symbols گرفت
const SYMBOLS = {
  oz: "xau", // انس جهانی طلا (به دلار)
  usd: "usd", // دلار آمریکا (به تومان)
  gold18: "gold18k", // طلای ۱۸ عیار (هر گرم به تومان)
  mazaneh: "mazaneh", // مظنه (مثقال ۱۷ عیار)
  coin: "sekke_emami", // سکه امامی
};

export async function fetchLivePrices() {
  try {
    // درخواست موازی برای همه نمادها (سریع‌تر از حلقه)
    const promises = Object.entries(SYMBOLS).map(async ([key, symbol]) => {
      const res = await fetch(
        `https://api.priceto.day/v1/latest/irr/${symbol}`,
      );
      if (!res.ok) throw new Error(`خطا در دریافت ${symbol}`);
      const data = await res.json();
      return [key, data.price];
    });

    const results = await Promise.all(promises);
    const prices = Object.fromEntries(results);

    return prices;
  } catch (error) {
    console.error("خطا در دریافت قیمت‌ها:", error);
    return null;
  }
}
