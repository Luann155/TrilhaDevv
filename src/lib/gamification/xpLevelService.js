import { supabase } from '@/lib/supabaseClient';
import { ensureUserProfileExists } from '@/lib/gamification/userProfileService';
import { checkAndAwardBadges } from '@/lib/gamification/badgeService';

export const addXP = async (userId, xpToAdd, reason = "") => {
  if (!userId || typeof xpToAdd !== 'number' || xpToAdd === 0) return { error: { message: "Invalid parameters for adding XP." } };
  await ensureUserProfileExists(userId);

  let { data: levelData, error: fetchError } = await supabase
    .from('user_levels')
    .select('level, experience_points, next_level_xp')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code === 'PGRST116') { 
    await ensureUserProfileExists(userId); 
    const { data: newLevelData, error: newFetchError } = await supabase
      .from('user_levels')
      .select('level, experience_points, next_level_xp')
      .eq('user_id', userId)
      .single();
    if(newFetchError) {
         console.error('Error fetching user level after ensuring profile:', newFetchError.message);
         return { error: newFetchError };
    }
    levelData = newLevelData;
  } else if (fetchError) {
    console.error('Error fetching user level:', fetchError.message);
    return { error: fetchError };
  }
  
  if (!levelData) {
    console.error('Critical error: User level data not found or created for user:', userId);
    return { error: { message: 'User level data could not be initialized.'} };
  }

  let { level, experience_points: currentXp, next_level_xp: nextLevelXpTarget } = levelData;
  currentXp += xpToAdd;

  let leveledUp = false;
  while (currentXp >= nextLevelXpTarget) {
    currentXp -= nextLevelXpTarget;
    level++;
    nextLevelXpTarget += 100; 
    leveledUp = true;
  }

  const { error: updateError } = await supabase
    .from('user_levels')
    .update({ level, experience_points: currentXp, next_level_xp: nextLevelXpTarget, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating XP and level:', updateError.message);
    return { error: updateError };
  }
  
  await checkAndAwardBadges(userId, { event: 'xp_added', value: xpToAdd, current_level: level, reason: reason });
  return { level, xp: currentXp, nextLevelXp: nextLevelXpTarget, leveledUp };
};