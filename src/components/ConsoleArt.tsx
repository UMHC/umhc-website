'use client';

import { useEffect } from 'react';

export default function ConsoleArt() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const asciiArt = [
      '',
      '        /\\    /\\',
      '  /\\  /  \\  /  \\    /\\      /\\',
      ' /  \\/    \\/    \\  /  \\    /  \\',
      '/           \\     \\/    \\  /    \\',
      '----------------------------------',
      '   Built by Will Hayes - 2025',
      '----------------------------------',
      '',
    ].join('\n');

    // Safely log to console with proper styling
    console.log(
      '%c' + asciiArt,
      'white-space: pre; font-family: monospace; display: inline-block;'
    );
  }, []);

  // This component renders nothing visually
  return null;
}