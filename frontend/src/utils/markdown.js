// Simple markdown formatter for AI responses
export function formatMarkdown(text) {
  if (!text) return '';
  
  return text
    // Bold text: **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text: *text* -> <em>text</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code: `text` -> <code>text</code>
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br />');
}
