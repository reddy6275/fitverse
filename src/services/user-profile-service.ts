import { db } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { UserProfile } from '@/types/user-profile';
import { calculateNutritionTargets } from '@/lib/fitness-calculations';

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as UserProfile;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Create or update user profile
 */
export async function updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const existingProfile = await getUserProfile(userId);

        // Calculate nutrition targets if profile is complete
        const updatedData = { ...existingProfile, ...profileData };
        const targets = calculateNutritionTargets(updatedData);

        const dataToSave = {
            ...profileData,
            ...(targets || {}),
            userId,
            updatedAt: serverTimestamp(),
        };

        if (existingProfile) {
            // Update existing profile
            await updateDoc(docRef, dataToSave);
        } else {
            // Create new profile
            await setDoc(docRef, {
                ...dataToSave,
                createdAt: serverTimestamp(),
            });
        }

        // Fetch and return updated profile
        return await getUserProfile(userId);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return null;
    }
}

/**
 * Initialize empty profile for new user
 */
export async function initializeUserProfile(userId: string): Promise<UserProfile> {
    const docRef = doc(db, 'userProfiles', userId);

    const initialProfile: Partial<UserProfile> = {
        userId,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
    };

    await setDoc(docRef, initialProfile);

    return (await getUserProfile(userId))!;
}
