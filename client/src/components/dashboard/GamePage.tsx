import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EventBus } from '../../game/EventBus';
import { getWorldById } from '../../game/data/worldDefinitions';
import { forestQuests } from '../../game/data/forestQuests';
import { healthQuests } from '../../game/data/healthQuests';
import { educationQuests } from '../../game/data/educationQuests';
import { cityQuests } from '../../game/data/cityQuests';
import type { QuestDefinition } from '@shared/types';
import { XpSystem } from '../../game/systems/XpSystem';
import PhaserGame from '../../game/PhaserGame';

function getAllQuests(): QuestDefinition[] {
  return [...forestQuests, ...healthQuests, ...educationQuests, ...cityQuests];
}

export default function GamePage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [activeQuests, setActiveQuests] = useState<QuestDefinition[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const world = worldId ? getWorldById(worldId) : undefined;

  useEffect(() => {
    if (profile) {
      const allQuests = getAllQuests();
      const worldQuests = allQuests.filter(q => q.worldId === worldId);
      setActiveQuests(worldQuests.filter(q =>
        profile.activeQuests.some(aq => aq.questId === q.id)
      ));
      setCompletedCount(profile.completedQuests.filter(q => q.questId.includes(worldId || '')).length);
    }
  }, [profile, worldId]);

  if (!world) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p>World not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  function loadWorldScene() {
    EventBus.emit('load-world', worldId);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>
            ← Back
          </button>
          <span style={{ fontSize: 20 }}>{world.icon}</span>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{world.name}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Level {profile.level}</span>
              <div className="xp-bar" style={{ width: 100 }}>
                <div className="xp-bar-fill" style={{ width: `${XpSystem.getXpProgress(profile.xp, profile.level) * 100}%` }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile.xp} XP</span>
            </div>
          )}

          <button className="btn btn-secondary" onClick={() => setShowQuestLog(!showQuestLog)} style={{ padding: '4px 12px' }}>
            Quest Log ({completedCount}/{world.quests.length})
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/how-to-play')} style={{ padding: '4px 12px' }}>
            Controls
          </button>

          <button className="btn btn-primary" onClick={loadWorldScene} style={{ padding: '4px 12px' }}>
            Enter World
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <PhaserGame />

        {showQuestLog && (
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 320, height: '100%',
            background: 'var(--bg-overlay)', padding: 16, overflowY: 'auto', zIndex: 50,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quest Log</h3>
            {activeQuests.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                No active quests. Talk to NPCs to start quests!
              </p>
            ) : (
              activeQuests.map(quest => (
                <div key={quest.id} className="card" style={{ marginBottom: 8, padding: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600 }}>{quest.name}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{quest.description}</p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {quest.sdgNumbers.map(sdg => (
                      <span key={sdg} className="badge badge-sdg">SDG {sdg}</span>
                    ))}
                  </div>
                </div>
              ))
            )}

            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Available Quests</h3>
            {getAllQuests().filter(q => q.worldId === worldId).map(quest => (
              <div key={quest.id} className="card" style={{ marginBottom: 8, padding: 12, opacity: 0.7 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600 }}>{quest.name}</h4>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {quest.steps.length} steps - {quest.rewards.xp} XP
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
