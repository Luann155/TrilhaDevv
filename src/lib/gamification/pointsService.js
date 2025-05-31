import { supabase } from '@/lib/supabaseClient';
import { ensureUserProfileExists } from '@/lib/gamification/userProfileService';
import { addXP } from '@/lib/gamification/xpLevelService';
import { checkAndAwardBadges } from '@/lib/gamification/badgeService';

export const addPoints = async (userId, pointsToAdd, reason = "") => {
  if (!userId || typeof pointsToAdd !== 'number' || pointsToAdd === 0) return { error: { message: "Invalid parameters for adding points." } };
  await ensureUserProfileExists(userId);

  const { data: currentPointsData, error: fetchError } = await supabase
    .from('user_points')
    .select('points')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching current points:', fetchError.message);
    return { error: fetchError };
  }
  
  const currentPoints = currentPointsData?.points || 0;
  const newTotalPoints = currentPoints + pointsToAdd;

  const { error: updateError } = await supabase
    .from('user_points')
    .update({ points: newTotalPoints, last_updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating points:', updateError.message);
    return { error: updateError };
  }
  
  const oldTens = Math.floor(currentPoints / 10);
  const newTens = Math.floor(newTotalPoints / 10);
  
  const xpGainedFromPoints = (newTens - oldTens) * 20;

  if (xpGainedFromPoints > 0) {
     await addXP(userId, xpGainedFromPoints, `Gained from ${pointsToAdd} points for ${reason}`);
  }
  await checkAndAwardBadges(userId, { event: 'points_added', value: pointsToAdd, reason: reason });
  return { points: newTotalPoints };
};