import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Achievement, InventoryItem, CompletedQuest } from '@shared/types';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
}

export async function updateXp(uid: string, newXp: number, newLevel: number): Promise<void> {
  await setDoc(doc(db, 'users', uid), { xp: newXp, level: newLevel }, { merge: true });
}

export async function addAchievement(uid: string, achievement: Achievement): Promise<void> {
  const profile = await loadUserProfile(uid);
  if (!profile) return;

  const exists = profile.achievements.some(a => a.badgeId === achievement.badgeId);
  if (exists) return;

  await setDoc(doc(db, 'users', uid), {
    achievements: [...profile.achievements, achievement],
  }, { merge: true });
}

export async function addInventoryItem(uid: string, item: InventoryItem): Promise<void> {
  const profile = await loadUserProfile(uid);
  if (!profile) return;

  const existing = profile.inventory.find(i => i.itemId === item.itemId);
  let newInventory;

  if (existing) {
    newInventory = profile.inventory.map(i =>
      i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
    );
  } else {
    newInventory = [...profile.inventory, item];
  }

  await setDoc(doc(db, 'users', uid), { inventory: newInventory }, { merge: true });
}

export async function unlockWorld(uid: string, worldId: string): Promise<void> {
  const profile = await loadUserProfile(uid);
  if (!profile) return;

  if (profile.unlockedWorlds.includes(worldId)) return;

  await setDoc(doc(db, 'users', uid), {
    unlockedWorlds: [...profile.unlockedWorlds, worldId],
  }, { merge: true });
}

export async function completeQuest(uid: string, questId: string, score: number): Promise<void> {
  const profile = await loadUserProfile(uid);
  if (!profile) return;

  const alreadyCompleted = profile.completedQuests.some(q => q.questId === questId);
  if (alreadyCompleted) return;

  const completedQuest: CompletedQuest = {
    questId,
    completedAt: new Date().toISOString(),
    score,
  };

  const activeQuests = profile.activeQuests.filter(q => q.questId !== questId);

  await setDoc(doc(db, 'users', uid), {
    completedQuests: [...profile.completedQuests, completedQuest],
    activeQuests,
  }, { merge: true });
}

export async function getLeaderboard(_worldId: string, maxResults: number = 50): Promise<{ uid: string; displayName: string; xp: number; level: number }[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('xp', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data() as UserProfile;
    return {
      uid: data.uid,
      displayName: data.displayName,
      xp: data.xp,
      level: data.level,
    };
  });
}
