import { supabase } from '@/lib/supabaseClient';

export const ensureUserProfileExists = async (userId) => {
  if (!userId) {
    console.error("ensureUserProfileExists: userId is null or undefined");
    return null;
  }

  let profileComplete = true;

  const { data: levelData, error: levelError } = await supabase
    .from('user_levels')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (levelError && levelError.code !== 'PGRST116') {
    console.error('Error fetching user level:', levelError.message);
    profileComplete = false;
  } else if (!levelData) {
    const { error: insertLevelError } = await supabase
      .from('user_levels')
      .insert({ user_id: userId, level: 0, experience_points: 0, next_level_xp: 100, updated_at: new Date().toISOString() });
    if (insertLevelError) {
      console.error('Error creating initial user level:', insertLevelError.message);
      profileComplete = false;
    }
  }

  const { data: pointsData, error: pointsError } = await supabase
    .from('user_points')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (pointsError && pointsError.code !== 'PGRST116') {
    console.error('Error fetching user points:', pointsError.message);
    profileComplete = false;
  } else if (!pointsData) {
    const { error: insertPointsError } = await supabase
      .from('user_points')
      .insert({ user_id: userId, points: 0, last_updated_at: new Date().toISOString() });
    if (insertPointsError) {
      console.error('Error creating initial user points:', insertPointsError.message);
      profileComplete = false;
    }
  }

  const { data: streakData, error: streakError } = await supabase
    .from('user_streaks')
    .select('user_id, last_streak_bonus_day, longest_study_hours_streak, current_total_study_hours_in_streak')
    .eq('user_id', userId)
    .maybeSingle();

  if (streakError && streakError.code !== 'PGRST116') {
    console.error('Error fetching user streak:', streakError.message);
    profileComplete = false;
  } else if (!streakData) {
    const { error: insertStreakError } = await supabase
      .from('user_streaks')
      .insert({ 
        user_id: userId, 
        current_streak: 0, 
        longest_streak: 0, 
        updated_at: new Date().toISOString(), 
        last_activity_date: null,
        last_streak_bonus_day: 0,
        longest_study_hours_streak: 0,
        current_total_study_hours_in_streak: 0
      });
    if (insertStreakError) {
      console.error('Error creating initial user streak:', insertStreakError.message);
      profileComplete = false;
    }
  } else {
    const updates = {};
    if (streakData.last_streak_bonus_day === undefined || streakData.last_streak_bonus_day === null) {
      updates.last_streak_bonus_day = 0;
    }
    if (streakData.longest_study_hours_streak === undefined || streakData.longest_study_hours_streak === null) {
      updates.longest_study_hours_streak = 0;
    }
    if (streakData.current_total_study_hours_in_streak === undefined || streakData.current_total_study_hours_in_streak === null) {
      updates.current_total_study_hours_in_streak = 0;
    }
    if (Object.keys(updates).length > 0) {
      const { error: updateMissingFieldsError } = await supabase
        .from('user_streaks')
        .update(updates)
        .eq('user_id', userId);
      if (updateMissingFieldsError) {
        console.error('Error updating missing streak fields:', updateMissingFieldsError.message);
      }
    }
  }
  return profileComplete;
};

export const resetUserGamificationStats = async (userId) => {
  if (!userId) {
      console.error("resetUserGamificationStats: userId is null or undefined");
      return { error: { message: "User ID not provided for reset." } };
  }

  const { error: pointsError } = await supabase
      .from('user_points')
      .update({ points: 0, last_updated_at: new Date().toISOString() })
      .eq('user_id', userId);

  if (pointsError) {
      console.error('Error resetting user points:', pointsError.message);
      return { error: pointsError };
  }

  const { error: levelsError } = await supabase
      .from('user_levels')
      .update({ 
          level: 0, 
          experience_points: 0, 
          next_level_xp: 100, 
          updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

  if (levelsError) {
      console.error('Error resetting user level and XP:', levelsError.message);
      return { error: levelsError };
  }

  const { error: streaksError } = await supabase
      .from('user_streaks')
      .update({
          current_streak: 0,
          longest_streak: 0, 
          last_activity_date: null,
          last_streak_bonus_day: 0,
          longest_study_hours_streak: 0,
          current_total_study_hours_in_streak: 0,
          updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

  if (streaksError) {
      console.error('Error resetting user streaks:', streaksError.message);
      return { error: streaksError };
  }

  console.log(`Gamification stats (points, level, XP, streaks) reset for user ${userId}`);
  return { success: true };
};