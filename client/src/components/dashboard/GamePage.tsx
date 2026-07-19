import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestDefinition, QuestStep } from '@shared/types';
import { useAuth } from '../../hooks/useAuth';
import { getWorldById } from '../../game/data/worldDefinitions';
import { getQuestById, getStepChoices, getWorldQuests, type QuestChoice } from '../../game/data/questCatalog';
import { WORLD_MAPS, type CozyWorldId } from '../../game/data/worldMaps';
import { buildQuestRuntime, npcMatchesTarget } from '../../game/systems/QuestRuntimeBuilder';
import type { QuestInteractionEvent } from '../../game/types/questRuntime';
import { XpSystem } from '../../game/systems/XpSystem';
import PhaserGame from '../../game/PhaserGame';
import { EventBus } from '../../game/EventBus';
import { acceptQuest, progressQuest, type QuestMutationResult, type QuestProgressAction } from '../../services/questService';
import { joinRealtimeRoom, leaveRealtimeRoom, watchRoomPlayers } from '../../services/realtimeService';

type QuestModal =
  | { kind: 'offer'; quest: QuestDefinition }
  | { kind: 'challenge'; quest: QuestDefinition; step: QuestStep; choices: QuestChoice[]; feedback?: { correct: boolean; text: string } }
  | { kind: 'complete'; quest: QuestDefinition; result: QuestMutationResult }
  | null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Quest progress could not be saved. Please try again.';
}

export default function GamePage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [questModal, setQuestModal] = useState<QuestModal>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [questBusy, setQuestBusy] = useState(false);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');

  const world = worldId ? getWorldById(worldId) : undefined;
  const map = worldId && worldId in WORLD_MAPS ? WORLD_MAPS[worldId as CozyWorldId] : undefined;
  const worldQuests = useMemo(() => worldId ? getWorldQuests(worldId) : [], [worldId]);
  const activeRecord = profile?.activeQuests.find(active => active.worldId === worldId);
  const activeQuest = activeRecord ? getQuestById(activeRecord.questId) : undefined;
  const currentStep = activeQuest && activeRecord ? activeQuest.steps[activeRecord.progress.currentStep] : undefined;
  const completedIds = useMemo(() => new Set(profile?.completedQuests.map(completed => completed.questId) ?? []), [profile]);
  const profileUid = profile?.uid;
  const profileDisplayName = profile?.displayName;
  const profileLevel = profile?.level;
  const completedCount = world?.quests.filter(questId => completedIds.has(questId)).length ?? 0;
  const questRuntime = useMemo(
    () => profile && map ? buildQuestRuntime(map, profile, worldQuests) : undefined,
    [map, profile, worldQuests],
  );

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(current => current === message ? null : current), 3600);
  }, []);

  const saveProgress = useCallback(async (action: QuestProgressAction) => {
    if (!profile || !activeQuest || !activeRecord || !currentStep || questBusy) return;
    setQuestBusy(true);
    try {
      const result = await progressQuest(profile.uid, activeQuest, activeRecord.progress.currentStep, action);
      await refreshProfile();
      if (result.completed) setQuestModal({ kind: 'complete', quest: activeQuest, result });
      else if (action.kind === 'collect') {
        showNotice(`${result.collectedCount ?? 0}/${result.requiredCount ?? 3} items collected`);
      } else {
        showNotice('Objective complete — your journal has been updated.');
      }
      return result;
    } catch (error) {
      showNotice(errorMessage(error));
    } finally {
      setQuestBusy(false);
    }
  }, [activeQuest, activeRecord, currentStep, profile, questBusy, refreshProfile, showNotice]);

  useEffect(() => {
    const blocked = showQuestLog || showControls || Boolean(questModal) || questBusy;
    EventBus.emit('ui-overlay-changed', blocked);
    return () => {
      if (blocked) EventBus.emit('ui-overlay-changed', false);
    };
  }, [questBusy, questModal, showControls, showQuestLog]);

  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || questBusy) return;
      setShowQuestLog(false);
      setShowControls(false);
      setQuestModal(null);
    };
    window.addEventListener('keydown', closeOverlay);
    return () => window.removeEventListener('keydown', closeOverlay);
  }, [questBusy]);

  useEffect(() => {
    const handleInteraction = (interaction: QuestInteractionEvent) => {
      if (!profile || !map || questBusy) return;

      if (interaction.kind === 'npc') {
        const npc = map.npcs.find(candidate => candidate.id === interaction.npcId);
        if (!npc) return;
        if (activeQuest && activeRecord && currentStep) {
          if (currentStep.type === 'talk' && npcMatchesTarget(npc, currentStep.target)) void saveProgress({ kind: 'advance' });
          else showNotice(`Current objective: ${currentStep.description}`);
          return;
        }
        const offeredQuest = npc.questIds
          .map(getQuestById)
          .find(quest => quest && !completedIds.has(quest.id) && profile.level >= quest.requiredLevel);
        if (offeredQuest) setQuestModal({ kind: 'offer', quest: offeredQuest });
        else showNotice(npc.dialog);
        return;
      }

      if (!activeQuest || !activeRecord || !currentStep) return;
      if (interaction.kind === 'collectible' && currentStep.type === 'collect') {
        void saveProgress({ kind: 'collect', itemId: interaction.itemId, requiredCount: 3 });
        return;
      }
      if (interaction.kind === 'objective') {
        if (currentStep.type === 'solve' || currentStep.type === 'decide') {
          setQuestModal({ kind: 'challenge', quest: activeQuest, step: currentStep, choices: getStepChoices(currentStep) });
        } else if (currentStep.type === 'explore') {
          void saveProgress({ kind: 'advance' });
        }
      }
    };
    EventBus.on('quest-interaction', handleInteraction);
    return () => {
      EventBus.off('quest-interaction', handleInteraction);
    };
  }, [activeQuest, activeRecord, completedIds, currentStep, map, profile, questBusy, saveProgress, showNotice]);

  useEffect(() => {
    if (!profileUid || !profileDisplayName || profileLevel === undefined || !worldId) return;
    const roomId = worldId;
    let unsubscribe: () => void = () => undefined;
    const startRealtimeRoom = async () => {
      try {
        await joinRealtimeRoom(roomId, {
          uid: profileUid,
          displayName: profileDisplayName,
          level: profileLevel,
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
      void leaveRealtimeRoom(roomId, profileUid);
    };
  }, [profileDisplayName, profileLevel, profileUid, worldId]);

  const acceptOfferedQuest = async (quest: QuestDefinition) => {
    if (!profile || questBusy) return;
    setQuestBusy(true);
    try {
      await acceptQuest(profile.uid, quest);
      await refreshProfile();
      setQuestModal(null);
      showNotice(`Quest accepted: ${quest.name}`);
    } catch (error) {
      showNotice(errorMessage(error));
    } finally {
      setQuestBusy(false);
    }
  };

  const answerChallenge = async (choice: QuestChoice) => {
    if (!questModal || questModal.kind !== 'challenge' || questBusy) return;
    const result = await saveProgress({ kind: 'answer', choiceId: choice.id, isCorrect: choice.isCorrect, bonusXp: choice.xpReward });
    if (!result) return;
    if (result.completed) return;
    setQuestModal(choice.isCorrect ? null : {
      ...questModal,
      feedback: { correct: false, text: choice.explanation },
    });
    if (choice.isCorrect) showNotice(choice.explanation);
  };

  if (!world || !map) {
    return (
      <div className="page-container game-missing-world">
        <p>World not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const collected = activeRecord && currentStep
    ? ((activeRecord.progress.data as { collected?: Record<string, string[]> })?.collected?.[currentStep.id]?.length ?? 0)
    : 0;

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
              <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${XpSystem.getXpProgress(profile.xp, profile.level) * 100}%` }} /></div>
              <span className="game-xp-label">{profile.xp} XP</span>
            </div>
          )}
          <button className="game-hud-icon-button game-hud-action" onClick={() => { setShowQuestLog(!showQuestLog); setShowControls(false); }} aria-label={`Quest journal, ${completedCount} of ${world.quests.length} complete`} aria-expanded={showQuestLog} title="Quest journal">
            <img src="/assets/cozy/ui-quests.png" alt="" /><span>{completedCount}/{world.quests.length}</span>
          </button>
          <button className="game-hud-icon-button game-hud-action" onClick={() => { setShowControls(!showControls); setShowQuestLog(false); }} aria-label="Show controls" aria-expanded={showControls} title="Controls">
            <img src="/assets/cozy/ui-controls.png" alt="" />
          </button>
        </div>
      </div>

      {activeQuest && currentStep && activeRecord && (
        <section className="quest-tracker" aria-live="polite">
          <span>Current Quest</span>
          <strong>{activeQuest.name}</strong>
          <p>{currentStep.description}</p>
          <div className="quest-step-progress">
            <i style={{ width: `${(activeRecord.progress.currentStep / activeQuest.steps.length) * 100}%` }} />
          </div>
          <small>Step {activeRecord.progress.currentStep + 1}/{activeQuest.steps.length}{currentStep.type === 'collect' ? ` · ${collected}/3 gathered` : ''}</small>
        </section>
      )}

      <div className="game-stage">
        <PhaserGame worldId={worldId!} questRuntime={questRuntime} />

        {notice && <div className="quest-notice" role="status">{notice}</div>}

        {showQuestLog && (
          <aside className="quest-drawer" aria-label="Quest journal">
            <div className="game-panel-heading">
              <div><span>Adventure Journal</span><h3>Quest Log</h3></div>
              <button onClick={() => setShowQuestLog(false)} aria-label="Close quest journal">×</button>
            </div>
            {activeQuest && activeRecord && currentStep ? (
              <div className="quest-entry quest-entry-active">
                <span className="quest-entry-label">Active</span>
                <h4>{activeQuest.name}</h4>
                <p className="quest-current-objective">{currentStep.description}</p>
                <div className="quest-step-progress"><i style={{ width: `${(activeRecord.progress.currentStep / activeQuest.steps.length) * 100}%` }} /></div>
                <p>Step {activeRecord.progress.currentStep + 1} of {activeQuest.steps.length}{currentStep.type === 'collect' ? ` · ${collected}/3 collected` : ''}</p>
                <div className="quest-badges">{activeQuest.sdgNumbers.map(sdg => <span key={sdg} className="badge badge-sdg">SDG {sdg}</span>)}</div>
              </div>
            ) : (
              <p className="quest-empty">No active quest here. Find a villager with a golden <strong>!</strong> and press E.</p>
            )}

            <h3 className="quest-section-title">Available Quests</h3>
            {worldQuests.filter(quest => !completedIds.has(quest.id) && quest.id !== activeQuest?.id).map(quest => (
              <div key={quest.id} className={`quest-entry ${profile && profile.level < quest.requiredLevel ? 'quest-entry-locked' : ''}`}>
                <h4>{quest.name}</h4>
                <p>{profile && profile.level < quest.requiredLevel ? `Locked · Reach level ${quest.requiredLevel}` : `${quest.steps.length} objectives · ${quest.rewards.xp} XP`}</p>
              </div>
            ))}

            {completedCount > 0 && <h3 className="quest-section-title">Completed</h3>}
            {worldQuests.filter(quest => completedIds.has(quest.id)).map(quest => (
              <div key={quest.id} className="quest-entry quest-entry-complete"><h4>✓ {quest.name}</h4><p>Quest complete</p></div>
            ))}
          </aside>
        )}

        {showControls && (
          <div className="game-overlay-scrim" role="presentation" onMouseDown={() => setShowControls(false)}>
            <section className="controls-drawer" role="dialog" aria-modal="true" aria-labelledby="controls-title" onMouseDown={event => event.stopPropagation()}>
              <div className="game-panel-heading"><div><span>Field Notes</span><h3 id="controls-title">How to Play</h3></div><button onClick={() => setShowControls(false)} aria-label="Close controls">×</button></div>
              <div className="control-list">
                <div><kbd>WASD</kbd><span>Walk around the world</span></div>
                <div><kbd>↑ ↓ ← →</kbd><span>Alternative movement keys</span></div>
                <div><kbd>E</kbd><span>Accept quests, inspect objectives, collect items, and talk</span></div>
                <div><kbd>ESC</kbd><span>Close an open panel</span></div>
              </div>
              <p className="controls-tip"><strong>!</strong> offers a quest, a glowing marker shows your objective, and <strong>?</strong> advances a talk objective.</p>
              <button className="controls-guide-link" onClick={() => navigate('/how-to-play')}>Open full game guide</button>
            </section>
          </div>
        )}

        {questModal?.kind === 'offer' && (
          <div className="game-overlay-scrim quest-modal-scrim">
            <section className="quest-card" role="dialog" aria-modal="true" aria-labelledby="quest-offer-title">
              <span className="quest-card-ribbon">New Quest</span>
              <h2 id="quest-offer-title">{questModal.quest.name}</h2>
              <p className="quest-card-description">{questModal.quest.description}</p>
              <div className="quest-card-meta">
                <span>{questModal.quest.steps.length} objectives</span><span>{questModal.quest.rewards.xp} XP reward</span>
              </div>
              <ol className="quest-objective-preview">{questModal.quest.steps.map(step => <li key={step.id}>{step.description}</li>)}</ol>
              <div className="quest-badges">{questModal.quest.sdgNumbers.map(sdg => <span key={sdg} className="badge badge-sdg">SDG {sdg}</span>)}</div>
              <div className="quest-card-actions">
                <button className="quest-secondary-button" onClick={() => setQuestModal(null)} disabled={questBusy}>Maybe Later</button>
                <button className="quest-primary-button" onClick={() => void acceptOfferedQuest(questModal.quest)} disabled={questBusy}>{questBusy ? 'Saving…' : 'Accept Quest'}</button>
              </div>
            </section>
          </div>
        )}

        {questModal?.kind === 'challenge' && (
          <div className="game-overlay-scrim quest-modal-scrim">
            <section className="quest-card challenge-card" role="dialog" aria-modal="true" aria-labelledby="challenge-title">
              <span className="quest-card-ribbon">Quest Challenge</span>
              <h2 id="challenge-title">{questModal.step.description}</h2>
              <p className="quest-card-description">Choose the strongest answer. A wrong choice gives feedback and you can try again.</p>
              {questModal.feedback && <div className="quest-feedback quest-feedback-wrong"><strong>Try again.</strong> {questModal.feedback.text}</div>}
              <div className="quest-choices">
                {questModal.choices.map(choice => <button key={choice.id} onClick={() => void answerChallenge(choice)} disabled={questBusy}>{choice.text}</button>)}
              </div>
              <button className="quest-secondary-button quest-cancel-challenge" onClick={() => setQuestModal(null)} disabled={questBusy}>Return to World</button>
            </section>
          </div>
        )}

        {questModal?.kind === 'complete' && (
          <div className="game-overlay-scrim quest-modal-scrim">
            <section className="quest-card quest-complete-card" role="dialog" aria-modal="true" aria-labelledby="complete-title">
              <div className="quest-complete-seal">★</div>
              <span className="quest-card-ribbon">Quest Complete</span>
              <h2 id="complete-title">{questModal.quest.name}</h2>
              <p>You made a lasting difference in {world.name}.</p>
              <div className="quest-reward-grid">
                <div><strong>+{questModal.result.xpEarned ?? questModal.quest.rewards.xp}</strong><span>Experience</span></div>
                <div><strong>{questModal.quest.rewards.items.length || '—'}</strong><span>Reward items</span></div>
                <div><strong>{questModal.result.leveledUp ? `Lv. ${profile?.level ?? ''}` : 'Saved'}</strong><span>{questModal.result.leveledUp ? 'Level up' : 'Progress'}</span></div>
              </div>
              {questModal.quest.rewards.items.length > 0 && <p className="quest-item-list">Received: {questModal.quest.rewards.items.map(item => `${item.quantity}× ${item.name}`).join(', ')}</p>}
              <button className="quest-primary-button" onClick={() => setQuestModal(null)}>Continue Exploring</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
