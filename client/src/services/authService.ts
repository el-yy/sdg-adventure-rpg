import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@shared/types';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export async function register(email: string, password: string, displayName: string): Promise<AuthUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const userProfile: UserProfile = {
    uid: credential.user.uid,
    displayName,
    email,
    avatar: 'default',
    level: 1,
    xp: 0,
    stats: {
      environmentalKnowledge: 10,
      healthAwareness: 10,
      problemSolving: 10,
      communityImpact: 10,
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    unlockedWorlds: ['forest'],
    activeQuests: [],
    completedQuests: [],
    achievements: [],
    inventory: [],
  };

  await setDoc(doc(db, 'users', credential.user.uid), userProfile);
  return credential.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
  if (userDoc.exists()) {
    await setDoc(doc(db, 'users', credential.user.uid), {
      lastLogin: new Date().toISOString(),
    }, { merge: true });
  }

  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export { onAuthStateChanged };
