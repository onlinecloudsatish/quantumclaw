const DANGEROUS_TAGS = ["script", "iframe", "object", "embed", "link", "style"];
const DANGEROUS_ATTRS = [/^on/, "javascript:", "data:", "vbscript:"];

export function sanitizeHtml(input: string): string {
  let output = input;
  
  // Remove dangerous tags
  for (const tag of DANGEROUS_TAGS) {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gi");
    output = output.replace(regex, "");
  }
  
  // Remove dangerous attributes
  for (const attr of DANGEROUS_ATTRS) {
    const regex = attr instanceof RegExp ? attr : new RegExp(`${attr}`, "gi");
    output = output.replace(regex, "");
  }
  
  return output;
}

export function sanitizeForMarkdown(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
