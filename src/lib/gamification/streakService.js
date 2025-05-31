import { supabase } from '@/lib/supabaseClient';
import { ensureUserProfileExists } from '@/lib/gamification/userProfileService';
import { addPoints } from '@/lib/gamification/pointsService';
import { checkAndAwardBadges } from '@/lib/gamification/badgeService';

export const updateStreak = async (userId, studiedToday = true, studyDurationMinutes = 0) => {
  if (!userId) return { error: { message: "User ID not provided for streak update." } };
  await ensureUserProfileExists(userId);

  const today = new Date().toISOString().split('T')[0];
  let { data: streakData, error: fetchError } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_activity_date, last_streak_bonus_day, longest_study_hours_streak, current_total_study_hours_in_streak')
    .eq('user_id', userId)
    .maybeSingle(); 

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching streak data:', fetchError.message);
    return { error: fetchError };
  }
  
  if (!streakData) {
    streakData = { 
      current_streak: 0, 
      longest_streak: 0, 
      last_activity_date: null, 
      last_streak_bonus_day: 0,
      longest_study_hours_streak: 0,
      current_total_study_hours_in_streak: 0
    };
  }

  let { 
    current_streak, 
    longest_streak, 
    last_activity_date, 
    last_streak_bonus_day,
    longest_study_hours_streak,
    current_total_study_hours_in_streak 
  } = streakData;
  
  last_streak_bonus_day = last_streak_bonus_day || 0;
  longest_study_hours_streak = longest_study_hours_streak || 0;
  current_total_study_hours_in_streak = current_total_study_hours_in_streak || 0;
  const studyDurationHours = studyDurationMinutes > 0 ? studyDurationMinutes / 60 : 0;

  if (studiedToday) {
    if (last_activity_date !== today) { 
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (last_activity_date === yesterdayStr) {
        current_streak++;
        current_total_study_hours_in_streak += studyDurationHours;
      } else { 
        current_streak = 1;
        current_total_study_hours_in_streak = studyDurationHours;
      }
      last_activity_date = today;
    } else { 
       current_total_study_hours_in_streak += studyDurationHours;
    }

    if (current_streak > longest_streak) {
      longest_streak = current_streak;
    }
    if (current_total_study_hours_in_streak > longest_study_hours_streak) {
      longest_study_hours_streak = current_total_study_hours_in_streak;
    }

    let pointsForStreak = 0;
    let streakReason = "";

    if (current_streak === 5 && last_streak_bonus_day < 5) {
      pointsForStreak = 5;
      streakReason = "Streak de 5 dias";
      last_streak_bonus_day = 5;
    } else if (current_streak === 7 && last_streak_bonus_day < 7) {
      pointsForStreak = 7;
      streakReason = "Streak de 7 dias";
      last_streak_bonus_day = 7;
    } else if (current_streak < 5) {
      last_streak_bonus_day = 0; 
    }
    
    if (pointsForStreak > 0) {
      await addPoints(userId, pointsForStreak, streakReason);
    }

    const { error: updateError } = await supabase
      .from('user_streaks')
      .upsert({ 
        user_id: userId, 
        current_streak, 
        longest_streak, 
        last_activity_date, 
        last_streak_bonus_day, 
        longest_study_hours_streak,
        current_total_study_hours_in_streak,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating streak:', updateError.message);
      return { error: updateError };
    }
  } else { 
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (last_activity_date && last_activity_date !== today && last_activity_date !== yesterdayStr) {
      current_streak = 0;
      last_streak_bonus_day = 0;
      current_total_study_hours_in_streak = 0; 
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({ current_streak, last_streak_bonus_day, current_total_study_hours_in_streak, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (updateError) console.error('Error resetting streak:', updateError.message);
    }
  }
  await checkAndAwardBadges(userId, { event: 'streak_updated', current_streak });
  return { current_streak, longest_streak, longest_study_hours_streak };
};