/**
 * User Data Migration Utility
 * 
 * This utility helps migrate old user data format to the new format
 * after the frontend-backend synchronization update.
 */

import type { User } from '../data/mockUsers';

/**
 * Migrate old user data format to new format
 */
export function migrateUserData(oldData: any): User {
  // If data already has new fields, return as is
  if (oldData.fullName && oldData.phoneNumber !== undefined && oldData.targetGoals !== undefined) {
    return oldData as User;
  }

  // Map old fields to new fields
  const newData: User = {
    userId: oldData.userId || oldData.id,
    email: oldData.email,
    fullName: oldData.name || oldData.fullName || '', // OLD: name → NEW: fullName
    age: oldData.age || 0,
    phoneNumber: oldData.phone || oldData.phoneNumber, // OLD: phone → NEW: phoneNumber
    targetGoals: oldData.speechDescription || oldData.targetGoals, // OLD: speechDescription → NEW: targetGoals
    createdAt: oldData.createdAt || new Date().toISOString(),
    lastLoginAt: oldData.lastLoginAt || new Date().toISOString(),
    isActive: oldData.isActive !== undefined ? oldData.isActive : true,
    verifiedEmail: oldData.verifiedEmail !== undefined ? oldData.verifiedEmail : false,
    assessmentCompleted: oldData.assessmentCompleted || false,
    currentPathwayId: oldData.currentPathwayId,
    totalRecordings: oldData.totalRecordings || 0,
    totalPracticeTime: oldData.totalPracticeTime || 0,
    currentStreak: oldData.currentStreak || 0,
    longestStreak: oldData.longestStreak || 0,
  };

  return newData;
}

/**
 * Check if localStorage has old user data format
 */
export function hasOldUserData(): boolean {
  try {
    const userData = localStorage.getItem('goodviet_user');
    if (!userData) return false;

    const parsed = JSON.parse(userData);
    // Check if it has old fields and not new fields
    return (parsed.name && !parsed.fullName) || 
           (parsed.phone !== undefined && parsed.phoneNumber === undefined) ||
           (parsed.speechDescription && !parsed.targetGoals);
  } catch {
    return false;
  }
}

/**
 * Migrate localStorage user data
 */
export function migrateLocalStorage(): boolean {
  try {
    const userData = localStorage.getItem('goodviet_user');
    if (!userData) return false;

    const oldData = JSON.parse(userData);
    const newData = migrateUserData(oldData);

    // Save migrated data
    localStorage.setItem('goodviet_user', JSON.stringify(newData));
    console.log('✅ User data migrated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to migrate user data:', error);
    return false;
  }
}

/**
 * Auto-migrate on app load
 */
export function autoMigrateOnLoad(): void {
  if (hasOldUserData()) {
    console.log('📦 Detecting old user data format, migrating...');
    migrateLocalStorage();
  }
}
