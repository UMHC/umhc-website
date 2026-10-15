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
      '   Maintained by Will Hayes - 2026/27',
      '   Built by Will Hayes - 2025/26',
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