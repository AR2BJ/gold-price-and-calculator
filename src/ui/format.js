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
