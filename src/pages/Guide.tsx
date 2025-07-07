import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GuidePage: React.FC = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fetch('/TRAINING_MANUAL.md')
      .then(response => response.text())
      .then(text => setMarkdown(text));
  }, []);

  // Custom components to override default markdown rendering
  const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    h2: ({ node, ...props }) => (
      <h2 className="text-3xl font-bold mt-12 mb-6 pb-3 border-b border-gray-200" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-2xl font-semibold mt-8 mb-4" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-8 space-y-3 my-6" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-8 space-y-3 my-6" {...props} />
    ),
    img: ({ node, ...props }) => (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <img
        className="max-w-full md:max-w-[70%] block mx-auto rounded-lg shadow-lg my-8 border"
        {...(props as any)}
      />
    ),
    hr: ({ node, ...props }) => <hr className="my-12 border-t" {...props} />,
    p: ({ node, ...props }) => <p className="text-base leading-relaxed" {...props} />,
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
