export function format(seconds: number) {
  return `${Math.ceil(seconds / 60000)} min read`;
}
