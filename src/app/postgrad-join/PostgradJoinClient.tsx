'use client';

import { useEffect, useState } from 'react';

export default function PostgradJoinClient() {
  const [message, setMessage] = useState('Verifying your access...');
  useEffect(() => {
    const token = window.location.hash.slice(1);
    if (!token) { setMessage('This access link is missing its token.'); return; }
    fetch('/api/postgrad-join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); window.location.replace(data.whatsappLink); })
      .catch((error) => setMessage(error.message || 'This access link is invalid or expired.'));
  }, []);
  return <div className="max-w-md text-center font-sans"><h1 className="text-3xl font-semibold text-deep-black">Postgraduate WhatsApp Access</h1><p className="mt-4 text-slate-grey" aria-live="polite">{message}</p></div>;
}