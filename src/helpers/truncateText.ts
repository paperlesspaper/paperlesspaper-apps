export default function truncateText(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }

  // Truncate to the limit and find the last space within the limit
  let truncated: string = text.slice(0, limit);
  const lastSpaceIndex: number = truncated.lastIndexOf(" ");

  // Ensure we don't cut off in the middle of a word
  if (lastSpaceIndex > 0) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated + "...";
}
