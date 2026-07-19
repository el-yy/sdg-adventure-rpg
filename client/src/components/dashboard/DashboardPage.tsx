import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import { worldDefinitions } from '../../game/data/worldDefinitions';
import { XpSystem } from '../../game/systems/XpSystem';

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  if (!profile) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const level = profile.level;
  const xpProgress = XpSystem.getXpProgress(profile.xp, level);
  const levelTitle = XpSystem.getLevelTitle(level);
  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function handlePlay(worldId: string) {
    navigate(`/play/${worldId}`);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🌍</span>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>SDG Adventure RPG</h1>
        </div>
        <nav className="nav">
          <button className="nav-link" onClick={() => navigate('/how-to-play')}>How to Play</button>
          <button className="nav-link" onClick={() => navigate('/achievements')}>Achievements</button>
          <button className="nav-link" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
          <button className="nav-link" onClick={() => navigate('/inventory')}>Inventory</button>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <div className="page-container">
        <section className="dashboard-intro">
          <div>
            <span className="eyebrow">Guardian field journal</span>
            <h2>Welcome back, {profile.displayName}.</h2>
            <p>Choose a world, follow the local clues, and turn SDG knowledge into action.</p>
          </div>
          <img src="/assets/characters/player.png" alt="Your pixel-art Guardian" />
        </section>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile.displayName}</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginTop: 4 }}>
                Level {level} - {levelTitle}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {profile.completedQuests.length} quests completed
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {profile.achievements.length} achievements
              </p>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Experience Points</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{profile.xp} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpProgress * 100}%` }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {Object.entries(profile.stats).map(([stat, value]) => (
              <div key={stat} style={{ textAlign: 'center', padding: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {stat.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>SDG Worlds</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {worldDefinitions.map((world) => {
            const isUnlocked = world.requiredLevel <= level;
            const completedCount = profile.completedQuests.filter(q => world.quests.includes(q.questId)).length;

            return (
              <div
                key={world.id}
                className="card"
                style={{
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.5,
                  border: selectedWorld === world.id ? `2px solid ${world.color}` : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
                onClick={() => isUnlocked && setSelectedWorld(world.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{world.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{world.name}</h3>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      {world.sdgNumbers.map(sdg => (
                        <span key={sdg} className="badge badge-sdg">SDG {sdg}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                  {world.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {completedCount}/{world.quests.length} quests
                  </span>
                  {isUnlocked ? (
                    <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handlePlay(world.id); }}>
                      Play
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Requires Level {world.requiredLevel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
