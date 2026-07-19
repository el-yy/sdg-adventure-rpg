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
import { EventBus } from '../../game/EventBus';
import { joinRealtimeRoom, leaveRealtimeRoom, watchRoomPlayers } from '../../services/realtimeService';

function getAllQuests(): QuestDefinition[] {
  return [...forestQuests, ...healthQuests, ...educationQuests, ...cityQuests];
}

export default function GamePage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showControls, setShowControls] = useState(false);
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
    const blocked = showQuestLog || showControls;
    EventBus.emit('ui-overlay-changed', blocked);
    return () => {
      if (blocked) EventBus.emit('ui-overlay-changed', false);
    };
  }, [showQuestLog, showControls]);

  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setShowQuestLog(false);
      setShowControls(false);
    };
    window.addEventListener('keydown', closeOverlay);
    return () => window.removeEventListener('keydown', closeOverlay);
  }, []);

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
          <button className="game-hud-icon-button" onClick={() => navigate('/')} aria-label="Back to dashboard" title="Back to dashboard">
            <img src="/assets/cozy/ui-back.png" alt="" />
          </button>
          <span className="game-world-icon">{world.icon}</span>
          <div><span className="game-hud-kicker">Now exploring</span><h2>{world.name}</h2></div>
        </div>

        <div className="game-hud-actions">
          <div className="game-status-chip">
            <img src="/assets/cozy/ui-online.png" alt="" />
            <span className={`server-status server-status-${serverStatus}`}>
              {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Connecting'}
            </span>
          </div>
          {profile && (
            <div className="game-player-progress">
              <img src="/assets/cozy/ui-level.png" alt="" />
              <span className="game-level-label">Lv. {profile.level}</span>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${XpSystem.getXpProgress(profile.xp, profile.level) * 100}%` }} />
              </div>
              <span className="game-xp-label">{profile.xp} XP</span>
            </div>
          )}

          <button
            className="game-hud-icon-button game-hud-action"
            onClick={() => { setShowQuestLog(!showQuestLog); setShowControls(false); }}
            aria-label={`Quest journal, ${completedCount} of ${world.quests.length} complete`}
            aria-expanded={showQuestLog}
            title="Quest journal"
          >
            <img src="/assets/cozy/ui-quests.png" alt="" />
            <span>{completedCount}/{world.quests.length}</span>
          </button>

          <button
            className="game-hud-icon-button game-hud-action"
            onClick={() => { setShowControls(!showControls); setShowQuestLog(false); }}
            aria-label="Show controls"
            aria-expanded={showControls}
            title="Controls"
          >
            <img src="/assets/cozy/ui-controls.png" alt="" />
          </button>
        </div>
      </div>

      <div className="game-stage">
        <PhaserGame worldId={worldId!} />

        {showQuestLog && (
          <aside className="quest-drawer" aria-label="Quest journal">
            <div className="game-panel-heading">
              <div><span>Adventure Journal</span><h3>Quest Log</h3></div>
              <button onClick={() => setShowQuestLog(false)} aria-label="Close quest journal">×</button>
            </div>
            {activeQuests.length === 0 ? (
              <p className="quest-empty">
                No active quests yet. Follow a golden marker or speak with a villager.
              </p>
            ) : (
              activeQuests.map(quest => (
                <div key={quest.id} className="quest-entry quest-entry-active">
                  <h4>{quest.name}</h4>
                  <p>{quest.description}</p>
                  <div className="quest-badges">
                    {quest.sdgNumbers.map(sdg => (
                      <span key={sdg} className="badge badge-sdg">SDG {sdg}</span>
                    ))}
                  </div>
                </div>
              ))
            )}

            <h3 className="quest-section-title">Available Quests</h3>
            {getAllQuests().filter(q => q.worldId === worldId).map(quest => (
              <div key={quest.id} className="quest-entry">
                <h4>{quest.name}</h4>
                <p>
                  {quest.steps.length} steps - {quest.rewards.xp} XP
                </p>
              </div>
            ))}
          </aside>
        )}

        {showControls && (
          <div className="game-overlay-scrim" role="presentation" onMouseDown={() => setShowControls(false)}>
            <section className="controls-drawer" role="dialog" aria-modal="true" aria-labelledby="controls-title" onMouseDown={event => event.stopPropagation()}>
              <div className="game-panel-heading">
                <div><span>Field Notes</span><h3 id="controls-title">How to Play</h3></div>
                <button onClick={() => setShowControls(false)} aria-label="Close controls">×</button>
              </div>
              <div className="control-list">
                <div><kbd>WASD</kbd><span>Walk around the world</span></div>
                <div><kbd>↑ ↓ ← →</kbd><span>Alternative movement keys</span></div>
                <div><kbd>E</kbd><span>Talk, inspect, or continue dialogue</span></div>
                <div><kbd>ESC</kbd><span>Close an open panel</span></div>
              </div>
              <p className="controls-tip">Walk near villagers to reveal an interaction bubble. Golden markers identify quest locations.</p>
              <button className="controls-guide-link" onClick={() => navigate('/how-to-play')}>Open full game guide</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
