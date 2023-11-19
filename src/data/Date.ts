import { format as formatImpl } from "date-fns";

export function format(date: Date) {
  try {
    return formatImpl(date, "MMM d, yyyy");
  } catch (e) {
    return `Invalid date: ${
      e &&
      typeof e === "object" &&
      "message" in e &&
      typeof e.message === "string"
        ? e.message
        : "Unknown failure"
    }`;
  }
}
