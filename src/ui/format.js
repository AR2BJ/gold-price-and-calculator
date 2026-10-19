const FA = "fa-IR";

export function faNum(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString(FA, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function faUnit(value, unit) {
  const map = {
    gram: "گرم",
    oz_troy: "اونس تروآ",
    oz_avoir: "اونس معمولی",
    mesghal: "مثقال",
    mazaneh: "مظنه",
    soot: "سوت",
    carat_weight: "قیراط",
  };

  // تعیین تعداد اعشار بر اساس واحد برای دقت بالاتر
  let digits = 4; // پیش‌فرض
  if (unit === "gram") digits = 4;
  if (unit === "oz_troy" || unit === "oz_avoir") digits = 5;
  if (unit === "soot") digits = 0;

  return `${faNum(value, digits)} ${map[unit] ?? unit}`;
}
