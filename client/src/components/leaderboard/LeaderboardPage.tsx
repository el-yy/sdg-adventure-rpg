import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/firestoreService';
import { useAuth } from '../../hooks/useAuth';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  xp: number;
  level: number;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard('global');
        setEntries(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const rankIcons = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>← Back</button>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>📊 Leaderboard</h1>
        </div>
      </header>

      <div className="page-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="loading-spinner" />
          </div>
        ) : entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🏆</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No Entries Yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Be the first Guardian on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="card">
            {entries.map((entry, index) => (
              <div key={entry.uid} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: index < entries.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: entry.uid === user?.uid ? 'rgba(76,175,80,0.1)' : 'transparent',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>
                    {index < 3 ? rankIcons[index] : `#${index + 1}`}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>
                      {entry.displayName}
                      {entry.uid === user?.uid && <span style={{ fontSize: 11, color: 'var(--color-primary)', marginLeft: 8 }}>(You)</span>}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level {entry.level}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)' }}>{entry.xp.toLocaleString()}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
