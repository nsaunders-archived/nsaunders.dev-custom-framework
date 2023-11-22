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

export function formatRFC822(date: Date) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const day =
    date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours =
    date.getUTCHours() < 10 ? "0" + date.getUTCHours() : date.getUTCHours();
  const minutes =
    date.getUTCMinutes() < 10
      ? "0" + date.getUTCMinutes()
      : date.getUTCMinutes();
  const seconds =
    date.getUTCSeconds() < 10
      ? "0" + date.getUTCSeconds()
      : date.getUTCSeconds();

  return `${dayOfWeek}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}
