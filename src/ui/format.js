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
    gram: "g",
    oz_troy: "ozt",
    oz_avoir: "oz",
    mesghal: "mes",
    mazaneh: "maz",
    soot: "s",
    carat_weight: "car",
  };

  let digits = 4;
  if (unit === "gram") digits = 4;
  if (unit === "oz_troy" || unit === "oz_avoir") digits = 5;
  if (unit === "soot") digits = 0;

  return `${faNum(value, digits)} ${map[unit] ?? unit}`;
}

export function toEnDigits(str) {
  if (!str) return "";
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

export function formatNumberField(value) {
  if (!value) return "";
  let str = String(value).replace(/,/g, "").trim();

  const parts = str.split(/[.٫]/);

  let integerPart = "";
  if (parts[0]) {
    const num = Number(parts[0]);
    integerPart = isNaN(num) ? "" : num.toLocaleString("en-US");
  }

  let decimalPart = parts.length > 1 ? "٫" + parts[1] : "";

  return integerPart + decimalPart;
}
