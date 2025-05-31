import { addPoints as addPointsExternal } from './gamification/pointsService';
import { addXP as addXPExternal } from './gamification/xpLevelService';
import { updateStreak as updateStreakExternal } from './gamification/streakService';
import { checkAndAwardBadges as checkAndAwardBadgesExternal } from './gamification/badgeService';
import { ensureUserProfileExists as ensureUserProfileExistsExternal, resetUserGamificationStats as resetUserGamificationStatsExternal } from './gamification/userProfileService';

const recordGenericEventInternal = async (userId, eventName, eventValue, reason = "") => {
    console.log(`Event recorded for user ${userId}: ${eventName}, value: ${eventValue}, reason: ${reason}`);
    await checkAndAwardBadgesExternal(userId, { event: eventName, value: eventValue, reason: reason });
};

export const gamificationService = {
    addPoints: addPointsExternal,
    addXP: addXPExternal,
    updateStreak: updateStreakExternal,
    checkAndAwardBadges: checkAndAwardBadgesExternal,
    ensureUserProfileExists: ensureUserProfileExistsExternal,
    recordGenericEvent: recordGenericEventInternal,
    resetUserGamificationStats: resetUserGamificationStatsExternal,
};
