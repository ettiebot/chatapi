export default function beautifyRequestText(text: string): string {
  return text
    .replace(/&#\d+;/g, '')
    .replace(/&/g, '')
    .replace(/^(.)/, (s) => s.toUpperCase())
    .trim();
}
