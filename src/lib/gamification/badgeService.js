import { supabase } from '@/lib/supabaseClient';
import { ensureUserProfileExists } from '@/lib/gamification/userProfileService';

export const checkAndAwardBadges = async (userId, eventDetails = null) => {
  if (!userId) return;
  await ensureUserProfileExists(userId);

  const { data: userData, error: userError } = await supabase
    .rpc('get_user_progress_for_badges', { p_user_id: userId });

  if (userError || !userData) {
    console.error('Error fetching user progress for badges:', userError?.message);
    return;
  }

  const { total_xp, current_streak_val, flashcards_reviewed_val, checklists_completed_val, first_task_done } = userData;

  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('*');

  if (badgesError) {
    console.error('Error fetching all badges:', badgesError.message);
    return;
  }

  const { data: earnedBadgesData, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (earnedError) {
    console.error('Error fetching earned badges:', earnedError.message);
    return;
  }
  const earnedBadgeIds = new Set(earnedBadgesData.map(b => b.badge_id));

  const badgesToAward = [];
  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let conditionsMet = true; 

    if (badge.xp_required != null && total_xp < badge.xp_required) conditionsMet = false;
    if (badge.streak_required != null && current_streak_val < badge.streak_required) conditionsMet = false;
    if (badge.flashcards_reviewed_required != null && flashcards_reviewed_val < badge.flashcards_reviewed_required) conditionsMet = false;
    if (badge.checklists_completed_required != null && checklists_completed_val < badge.checklists_completed_required) conditionsMet = false;
    
    if (badge.name === 'Primeiro Passo' && !first_task_done) conditionsMet = false;
    if (badge.name === 'Subindo a Montanha' && total_xp < 1000) conditionsMet = false;
    
    if (conditionsMet) {
      badgesToAward.push({ user_id: userId, badge_id: badge.id, earned_at: new Date().toISOString() });
    }
  }

  if (badgesToAward.length > 0) {
    const { error: insertError } = await supabase.from('user_badges').insert(badgesToAward);
    if (insertError) {
      console.error('Error awarding badges:', insertError.message);
    } else {
      console.log(`Awarded ${badgesToAward.length} new badges to user ${userId}: ${badgesToAward.map(b => b.badge_id).join(', ')}`);
    }
  }
};