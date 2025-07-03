import React, { useEffect, useRef, useState } from 'react';

const creditKeywords = [
  'produced by', 'written by', '©', 'all rights reserved',
  'lyrics by', 'music by', 'arranged by', 'engineered by',
  'published by', 'copyright', 'publisher', 'administered by',
  'rights reserved', 'remastered', 'recorded by', 'mixed by',
  'contributors', 'translations', 'originally', 'released',
  'vocals', 'language',
  'dansk', 'español', 'português', 'français', 'ελληνικά',
  'cymraeg', 'italiano', 'deutsch', 'українська', 'translation',
  'romanization', ' lyrics'
];

const isCreditLine = (line, index) => {
  const lower = line.toLowerCase().trim();

  if (/^\[(verse|chorus|intro|bridge|outro|interlude|hook|drop).*?\]$/i.test(lower)) return false;

  const matches = creditKeywords.filter(keyword => lower.includes(keyword)).length;

  if (index < 5) {
    if (matches >= 2) return true;
  } else {
    if (matches >= 1) return true;
  }

  if (/^[\s\d\p{P}\p{S}]+$/u.test(line)) return true;

  return false;
};

const LyricsWithAutoScroll = ({ rawLyrics, progressMs, durationMs }) => {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const containerRef = useRef(null);

  const allLines = rawLyrics
    ? rawLyrics.split('\n').map(line => line.trim()).filter(l => l.length > 0)
    : [];

  // Map of filtered lines with their original indices
  const filteredLines = allLines
    .map((text, originalIndex) => ({ text, originalIndex }))
    .filter(({ text, originalIndex }) => !isCreditLine(text, originalIndex));

  useEffect(() => {
    if (!durationMs || filteredLines.length === 0) return;

    const timePerLine = durationMs / allLines.length;
    const currentIndex = Math.min(Math.floor(progressMs / timePerLine), allLines.length - 1);

    // Find the closest filtered line with originalIndex <= currentIndex
    const matchedFilteredIndex = filteredLines.findIndex(
      ({ originalIndex }) => originalIndex >= currentIndex
    );

    setActiveLineIndex(
      matchedFilteredIndex === -1 ? filteredLines.length - 1 : matchedFilteredIndex
    );
  }, [progressMs, durationMs, rawLyrics]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const activeLineElement = container.querySelector('.active-line');
    if (!activeLineElement) return;

    const containerRect = container.getBoundingClientRect();
    const lineRect = activeLineElement.getBoundingClientRect();

    const distanceFromCenter = Math.abs(
      lineRect.top + lineRect.height / 2 - (containerRect.top + containerRect.height / 2)
    );

    if (distanceFromCenter > 50) {
      container.scrollTo({
        top:
          activeLineElement.offsetTop -
          container.clientHeight / 2 +
          activeLineElement.offsetHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex]);

  return (
    <div
      ref={containerRef}
      style={{
  maxHeight: 320,
  overflowY: 'auto',
  padding: '1rem 1.25rem',
  borderRadius: '16px',
  background: 'linear-gradient(to bottom right, #1e2124, #2c2f33)',
  color: '#e4e6eb',
  fontFamily: "'Inter', 'Segoe UI', Tahoma, sans-serif",
  fontSize: '1rem',
  lineHeight: 1.6,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(6px)',
  transition: 'all 0.3s ease',
}}


    >
      <h3
        style={{
  marginBottom: '1rem',
  fontWeight: 800,
  fontSize: '1.2rem',
  color: '#1DB954',
  textShadow: '0 0 6px rgba(29, 185, 84, 0.6)',
  letterSpacing: '0.03em',
  userSelect: 'none',
}}

      >
        📃 Lyrics
      </h3>

      {filteredLines.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No lyrics to display.</p>
      ) : (
        filteredLines.map((lineObj, idx) => (
          <p
            key={idx}
            className={idx === activeLineIndex ? 'active-line' : ''}
            style={{
  margin: '8px 0',
  padding: '4px 8px',
  borderRadius: '6px',
  fontWeight: idx === activeLineIndex ? '700' : '400',
  fontSize: idx === activeLineIndex ? '1.05rem' : '1rem',
  color: idx === activeLineIndex ? '#1DB954' : '#ccc',
  backgroundColor: idx === activeLineIndex ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
  borderLeft: idx === activeLineIndex ? '4px solid #1DB954' : '4px solid transparent',
  transition: 'all 0.3s ease',
}}

          >
            {lineObj.text}
          </p>
        ))
      )}
    </div>
  );
};

export default LyricsWithAutoScroll;
