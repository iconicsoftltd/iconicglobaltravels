export function extractAltText(url: string): string {
  if (!url) return "";
  const parts = url.split("/");
  const filename = parts[parts.length - 1]; 
  const altText = filename.split(".")[0];   
  return altText;
}
