import { formatMarkdown } from '../../utils/markdown';

// Component to render formatted markdown safely
export function MarkdownRenderer({ content }) {
  const formattedContent = formatMarkdown(content);
  
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}
