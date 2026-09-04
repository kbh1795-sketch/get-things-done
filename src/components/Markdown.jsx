import ReactMarkdown from 'react-markdown';

const components = {
  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-5 mb-3" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />,
  h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-2 mb-1" {...props} />,
  p: ({ node, ...props }) => <p className="text-sm leading-relaxed mb-3" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 text-sm space-y-1" {...props} />,
  li: ({ node, ...props }) => <li {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground my-3" {...props} />,
  code: ({ node, ...props }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />,
  pre: ({ node, ...props }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-3 text-xs" {...props} />,
  a: ({ node, ...props }) => <a className="text-primary underline underline-offset-2" {...props} />,
  hr: ({ node, ...props }) => <hr className="my-4 border-border" {...props} />,
};

export default function Markdown({ children }) {
  return <div className="markdown-body"><ReactMarkdown components={components}>{children}</ReactMarkdown></div>;
}