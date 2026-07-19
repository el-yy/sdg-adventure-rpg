import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getWorldById } from '../../game/data/worldDefinitions';
import { forestQuests } from '../../game/data/forestQuests';
import { healthQuests } from '../../game/data/healthQuests';
import { educationQuests } from '../../game/data/educationQuests';
import { cityQuests } from '../../game/data/cityQuests';
import type { QuestDefinition } from '@shared/types';
import { XpSystem } from '../../game/systems/XpSystem';
import PhaserGame from '../../game/PhaserGame';
import { joinRealtimeRoom, leaveRealtimeRoom, watchRoomPlayers } from '../../services/realtimeService';

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
  const [serverStatus, setServerStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');

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

  useEffect(() => {
    if (!profile || !worldId) return;
    const roomId = worldId;
    let unsubscribe: () => void = () => undefined;
    const startRealtimeRoom = async () => {
      try {
        await joinRealtimeRoom(roomId, {
          uid: profile.uid,
          displayName: profile.displayName,
          level: profile.level,
          position: { x: 600, y: 450 },
          joinedAt: Date.now(),
        });
        unsubscribe = watchRoomPlayers(roomId, () => setServerStatus('online'), () => setServerStatus('offline'));
      } catch {
        setServerStatus('offline');
      }
    };
    void startRealtimeRoom();

    return () => {
      unsubscribe();
      void leaveRealtimeRoom(roomId, profile.uid);
    };
  }, [profile, worldId]);

  if (!world) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p>World not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className="game-hud-world">
          <button className="game-hud-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <span className="game-world-icon">{world.icon}</span>
          <div><span className="game-hud-kicker">Now exploring</span><h2>{world.name}</h2></div>
        </div>

        <div className="game-hud-actions">
          <span className={`server-status server-status-${serverStatus}`}>
            {serverStatus === 'online' ? 'Co-op online' : serverStatus === 'offline' ? 'Co-op offline' : 'Connecting'}
          </span>
          {profile && (
            <div className="game-player-progress">
              <span>Lv. {profile.level}</span>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${XpSystem.getXpProgress(profile.xp, profile.level) * 100}%` }} />
              </div>
              <span>{profile.xp} XP</span>
            </div>
          )}

          <button className="game-hud-button" onClick={() => setShowQuestLog(!showQuestLog)}>
            Quests {completedCount}/{world.quests.length}
          </button>

          <button className="game-hud-button" onClick={() => navigate('/how-to-play')}>
            Controls
          </button>
        </div>
      </div>

      <div className="game-stage">
        <PhaserGame worldId={worldId!} />

        {showQuestLog && (
          <div className="quest-drawer">
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
