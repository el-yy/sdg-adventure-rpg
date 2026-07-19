import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, updateUserProfile } from '../services/authService';
import type { UserProfile } from '@shared/types';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile');
    }
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, data);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, [user, refreshProfile]);

  return { user, profile, loading, error, refreshProfile, updateProfile };
}
