import { format as formatImpl } from "date-fns";

function withFallback(f: (d: Date) => string): (d: Date) => string {
  return function (d) {
    try {
      return f(d);
    } catch {
      try {
        return d.toISOString();
      } catch {
        return "Invalid date";
      }
    }
  };
}

export const formatLongDate = withFallback(date =>
  formatImpl(date, "MMM d, yyyy"),
);

export const formatRFC822 = withFallback(date => {
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
});
