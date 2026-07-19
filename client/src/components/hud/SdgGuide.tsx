import { useState, useEffect } from 'react';
import { getRandomFact, getRandomTip } from '../../game/data/sdgFacts';

interface SdgGuideProps {
  worldId: string;
  questId?: string;
}

export default function SdgGuide({ worldId, questId }: SdgGuideProps) {
  const [fact, setFact] = useState('');
  const [tip, setTip] = useState('');
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setFact(getRandomFact(worldId));
    setTip(getRandomTip(worldId));
  }, [worldId, questId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFact(getRandomFact(worldId));
      setTip(getRandomTip(worldId));
    }, 30000);
    return () => clearInterval(interval);
  }, [worldId]);

  if (!visible) return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed', bottom: 20, right: 20, width: 48, height: 48,
          borderRadius: '50%', background: 'var(--color-primary)', border: 'none',
          cursor: 'pointer', fontSize: 24, zIndex: 200,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        🌍
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 300,
      background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-primary)', zIndex: 200,
      boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: 'var(--color-primary)', color: 'white',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>🌍 SDG Guide</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setMinimized(true)} style={{
            background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14,
          }}>_</button>
          <button onClick={() => setVisible(false)} style={{
            background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14,
          }}>×</button>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 4 }}>
          Did you know?
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
          {fact}
        </p>

        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>
          💡 Tip
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {tip}
        </p>
      </div>
    </div>
  );
}
