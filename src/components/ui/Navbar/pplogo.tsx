'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function PPLogo() {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // #region agent log
  useEffect(() => {
    const logData = {
      location: 'pplogo.tsx:13',
      message: 'PPLogo component mounted - checking image path',
      data: {
        requestedPath: '/assets/icons/fish logo.svg',
        actualFile: 'Fish Logo.svg',
        caseMatch: '/assets/icons/fish logo.svg' === '/assets/icons/Fish Logo.svg',
        environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
        isVercel: typeof window !== 'undefined' ? window.location.hostname.includes('vercel') : false,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    };
    fetch('http://127.0.0.1:7242/ingest/211f35f0-b7c4-4493-a3d1-13dbeecaabb1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    }).catch(() => {});
  }, []);
  // #endregion

  // #region agent log
  useEffect(() => {
    // Check the actual rendered img element after Next.js processes it
    const checkImage = () => {
      const img = containerRef.current?.querySelector('img');
      if (img) {
        const logData = {
          location: 'pplogo.tsx:35',
          message: 'Found rendered img element - checking actual src',
          data: {
            requestedPath: '/assets/icons/fish logo.svg',
            actualSrc: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            hasError: !img.complete || img.naturalWidth === 0,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A',
        };
        fetch('http://127.0.0.1:7242/ingest/211f35f0-b7c4-4493-a3d1-13dbeecaabb1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData),
        }).catch(() => {});

        // Also test if the file exists by trying to fetch it
        fetch('/assets/icons/fish logo.svg', { method: 'HEAD' })
          .then((res) => {
            const logData2 = {
              location: 'pplogo.tsx:52',
              message: 'File existence check - lowercase path',
              data: {
                path: '/assets/icons/fish logo.svg',
                exists: res.ok,
                status: res.status,
                statusText: res.statusText,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            };
            fetch('http://127.0.0.1:7242/ingest/211f35f0-b7c4-4493-a3d1-13dbeecaabb1', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(logData2),
            }).catch(() => {});
          })
          .catch((err) => {
            const logData3 = {
              location: 'pplogo.tsx:66',
              message: 'File existence check failed - lowercase path',
              data: {
                path: '/assets/icons/fish logo.svg',
                error: err.message,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            };
            fetch('http://127.0.0.1:7242/ingest/211f35f0-b7c4-4493-a3d1-13dbeecaabb1', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(logData3),
            }).catch(() => {});
          });

        // Test the correct case path
        fetch('/assets/icons/Fish Logo.svg', { method: 'HEAD' })
          .then((res) => {
            const logData4 = {
              location: 'pplogo.tsx:80',
              message: 'File existence check - correct case path',
              data: {
                path: '/assets/icons/Fish Logo.svg',
                exists: res.ok,
                status: res.status,
                statusText: res.statusText,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            };
            fetch('http://127.0.0.1:7242/ingest/211f35f0-b7c4-4493-a3d1-13dbeecaabb1', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(logData4),
            }).catch(() => {});
          })
          .catch(() => {});
      }
    };

    // Check immediately and after a short delay to catch Next.js processing
    checkImage();
    const timeout = setTimeout(checkImage, 100);
    return () => clearTimeout(timeout);
  }, []);
  // #endregion

  return (
    <div ref={containerRef} className="w-14 h-14 flex items-center justify-center">
      <Image
        src="/assets/icons/fish logo.svg"
        alt="Parse and Plate Logo"
        width={56}
        height={56}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
