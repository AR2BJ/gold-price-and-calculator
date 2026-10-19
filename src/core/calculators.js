import * as C from "./constants.js";

export function toGram(value, unit) {
  switch (unit) {
    case "gram":
      return value;
    case "oz_troy":
      return value * C.OZ_TROY_TO_GRAM;
    case "oz_avoir":
      return value * C.OZ_AVOIR_TO_GRAM;
    case "mesghal":
      return value * C.MESGHAL_SAYRAFI;
    case "mazaneh":
      return value * C.MAZANEH_TO_GRAM18;
    case "soot":
      return value / C.GRAM_TO_SOOT;
    case "carat_weight":
      return value / C.GRAM_TO_CARAT_WEIGHT;
    default:
      throw new Error("unit ناشناخته: " + unit);
  }
}

export function fromGram(gram, unit) {
  switch (unit) {
    case "gram":
      return gram;
    case "oz_troy":
      return gram / C.OZ_TROY_TO_GRAM;
    case "oz_avoir":
      return gram / C.OZ_AVOIR_TO_GRAM;
    case "mesghal":
      return gram / C.MESGHAL_SAYRAFI;
    case "mazaneh":
      return gram / C.MAZANEH_TO_GRAM18;
    case "soot":
      return gram * C.GRAM_TO_SOOT;
    case "carat_weight":
      return gram * C.GRAM_TO_CARAT_WEIGHT;
    default:
      throw new Error("unit ناشناخته: " + unit);
  }
}

export function theoreticalGram24(ozUsd, usdRate) {
  return (ozUsd * usdRate) / C.OZ_TROY_TO_GRAM;
}

export function theoreticalGram18(ozUsd, usdRate) {
  return theoreticalGram24(ozUsd, usdRate) * (18 / 24);
}

export function mazaneh(ozUsd, usdRate) {
  return (ozUsd * usdRate) / C.MAZANEH_DIVISOR;
}

export function bubblePercent(marketPrice, fairPrice) {
  if (fairPrice <= 0) return null;
  return ((marketPrice - fairPrice) / fairPrice) * 100;
}

export function karatToFineness(k) {
  return (k / 24) * 1000;
}
