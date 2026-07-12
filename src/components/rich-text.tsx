import React from 'react';

/**
 * Renders a string containing **bold** markers as <strong> elements.
 * Everything outside the markers renders as plain text. No HTML injection.
 * Supports multiple bold spans in a single string.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}
