import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AchievementSystem, ACHIEVEMENT_DEFINITIONS } from '../../game/systems/AchievementSystem';

export default function AchievementPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const earned = profile?.achievements || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>← Back</button>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>🏆 Achievements</h1>
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {earned.length}/{ACHIEVEMENT_DEFINITIONS.length} earned
        </span>
      </header>

      <div className="page-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {ACHIEVEMENT_DEFINITIONS.map(badge => {
            const isEarned = AchievementSystem.isEarned(earned, badge.id);
            return (
              <div key={badge.id} className="card" style={{
                opacity: isEarned ? 1 : 0.4,
                border: isEarned ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>{badge.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{badge.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{badge.description}</p>
                  </div>
                </div>
                {isEarned ? (
                  <p style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 8, fontWeight: 600 }}>
                    ✓ Earned
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    🔒 Locked
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
