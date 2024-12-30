import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  startOfWeek, 
  startOfMonth,
  startOfYear,
  differenceInDays,
  isToday,
  isSameDay,
  parseISO,
  format,
  isWithinInterval,
  subDays,
} from 'date-fns';
import {
  Achievement,
  AchievementType,
  AchievementTemplate,
  AchievementGoal,
  AchievementStats
} from '../types/achievements';
import { ACHIEVEMENT_TYPES } from '../constants/achievementTypes';
import { BADGES, Badge } from '../constants/badges';

interface AchievementContextType {
  achievements: Achievement[];
  templates: AchievementTemplate[];
  goals: AchievementGoal[];
  stats: Record<string, AchievementStats>;
  badges: Record<string, Badge[]>;
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  removeAchievement: (id: string) => void;
  addTemplate: (template: Omit<AchievementTemplate, 'id' | 'lastUsed'>) => void;
  removeTemplate: (id: string) => void;
  setGoal: (goal: Omit<AchievementGoal, 'id'>) => void;
  removeGoal: (id: string) => void;
  getAchievementsForDate: (date: Date) => Achievement[];
  getSuggestedTemplates: (type: AchievementType['id'], input: string) => AchievementTemplate[];
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    if (!saved) return [];
    
    // Rehydrate achievement types with proper icon components
    const parsedAchievements = JSON.parse(saved);
    return parsedAchievements.map((achievement: Achievement) => ({
      ...achievement,
      type: ACHIEVEMENT_TYPES[achievement.type.id]
    }));
  });

  const [templates, setTemplates] = useState<AchievementTemplate[]>(() => {
    const saved = localStorage.getItem('achievementTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<AchievementGoal[]>(() => {
    const saved = localStorage.getItem('achievementGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<Record<string, AchievementStats>>({});
  const [badges, setBadges] = useState<Record<string, Badge[]>>({});

  // Update stats and badges whenever achievements change
  useEffect(() => {
    const newStats: Record<string, AchievementStats> = {};
    const newBadges: Record<string, Badge[]> = {};
    const today = new Date();
    
    // Initialize stats for each type
    Object.keys(ACHIEVEMENT_TYPES).forEach(typeId => {
      newStats[typeId] = {
        type: typeId,
        currentStreak: 0,
        longestStreak: 0,
        thisWeekCount: 0,
        thisMonthCount: 0,
      };
      newBadges[typeId] = [];
    });

    // Process achievements to update stats
    achievements.forEach(achievement => {
      const typeId = achievement.type.id;
      const stat = newStats[typeId];
      const achievementDate = parseISO(achievement.date);
      
      // Update streaks
      if (isToday(achievementDate)) {
        stat.currentStreak++;
        stat.longestStreak = Math.max(stat.longestStreak, stat.currentStreak);
        stat.lastAchieved = achievementDate;
      } else if (stat.lastAchieved && differenceInDays(achievementDate, stat.lastAchieved) > 1) {
        stat.currentStreak = 0;
      }

      // Update period counts
      const startWeek = startOfWeek(today);
      const startMonth = startOfMonth(today);
      const startYear = startOfYear(today);
      
      if (achievementDate >= startWeek) {
        stat.thisWeekCount++;
      }
      if (achievementDate >= startMonth) {
        stat.thisMonthCount++;
      }
    });

    // Check for badges
    Object.values(BADGES).forEach(badge => {
      const typeStats = newStats[badge.requirement.type];
      if (!typeStats) return;

      let earned = false;

      if (badge.requirement.streak) {
        earned = typeStats.currentStreak >= badge.requirement.streak;
      } else if (badge.requirement.period) {
        let count = 0;
        const periodStart = {
          'week': startOfWeek(today),
          'month': startOfMonth(today),
          'year': startOfYear(today),
        }[badge.requirement.period];

        if (periodStart) {
          count = achievements.filter(a => 
            a.type.id === badge.requirement.type &&
            parseISO(a.date) >= periodStart
          ).length;
          earned = count >= badge.requirement.count;
        }
      }

      if (earned && !newBadges[badge.requirement.type].some(b => b.id === badge.id)) {
        newBadges[badge.requirement.type].push(badge);
      }
    });

    setStats(newStats);
    setBadges(newBadges);
  }, [achievements]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('achievementTemplates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('achievementGoals', JSON.stringify(goals));
  }, [goals]);

  const addAchievement = (achievement: Omit<Achievement, 'id'>) => {
    const newAchievement = {
      ...achievement,
      id: Date.now().toString(),
    };
    setAchievements(prev => [...prev, newAchievement]);

    // Update templates
    const similarTemplate = templates.find(t => 
      t.type === achievement.type.id && 
      t.text.toLowerCase() === achievement.text.toLowerCase()
    );

    if (!similarTemplate) {
      addTemplate({
        type: achievement.type.id,
        text: achievement.text,
        tags: achievement.tags,
        duration: achievement.duration,
      });
    } else {
      // Update lastUsed date of existing template
      setTemplates(prev => prev.map(t => 
        t.id === similarTemplate.id 
          ? { ...t, lastUsed: new Date() }
          : t
      ));
    }
  };

  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const addTemplate = (template: Omit<AchievementTemplate, 'id' | 'lastUsed'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      lastUsed: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const setGoal = (goal: Omit<AchievementGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const getAchievementsForDate = (date: Date) => {
    return achievements.filter(a => 
      isSameDay(parseISO(a.date), date)
    );
  };

  const getSuggestedTemplates = (type: AchievementType['id'], input: string) => {
    const typeTemplates = templates.filter(t => t.type === type);
    if (!input.trim()) {
      return typeTemplates.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()).slice(0, 5);
    }
    return typeTemplates
      .filter(t => t.text.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 5);
  };

  return (
    <AchievementContext.Provider value={{
      achievements,
      templates,
      goals,
      stats,
      badges,
      addAchievement,
      removeAchievement,
      addTemplate,
      removeTemplate,
      setGoal,
      removeGoal,
      getAchievementsForDate,
      getSuggestedTemplates,
    }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
} 