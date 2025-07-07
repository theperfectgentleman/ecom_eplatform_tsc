import React, { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define a type for the props that will be passed to custom components
interface CustomComponentProps {
    children: ReactNode;
    node?: any; // The node from the markdown AST, if you need it
}

const GuidePage: React.FC = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fetch('/TRAINING_MANUAL.md')
      .then(response => response.text())
      .then(text => setMarkdown(text));
  }, []);

  // Custom components to override default markdown rendering
  const markdownComponents: Components = {
    h2: ({ node, ...props }: CustomComponentProps) => (
      <h2 className="text-3xl font-bold mt-12 mb-6 pb-3 border-b border-gray-200" {...props} />
    ),
    h3: ({ node, ...props }: CustomComponentProps) => (
      <h3 className="text-2xl font-semibold mt-8 mb-4" {...props} />
    ),
    ul: ({ node, ...props }: CustomComponentProps) => (
      <ul className="list-disc pl-8 space-y-3 my-6" {...props} />
    ),
    ol: ({ node, ...props }: CustomComponentProps) => (
      <ol className="list-decimal pl-8 space-y-3 my-6" {...props} />
    ),
    img: ({ node, ...props }) => (
      <img
        className="max-w-full md:max-w-[70%] block mx-auto rounded-lg shadow-lg my-8 border"
        {...props}
      />
    ),
    hr: ({ node, ...props }) => <hr className="my-12 border-t" {...props} />,
    p: ({ node, ...props }: CustomComponentProps) => <p className="text-base leading-relaxed" {...props} />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl">User Guide</CardTitle>
      </CardHeader>
      <CardContent className="prose-lg max-w-none">
        <ReactMarkdown components={markdownComponents}>
            {markdown}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};

export default GuidePage;
