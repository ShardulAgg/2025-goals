export type AchievementCategory = 'fitness' | 'work' | 'learning' | 'personal';

export interface Achievement {
  id: string;
  date: string;
  type: AchievementType;
  text: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  duration?: number;  // in minutes
  tags?: string[];
}

export interface AchievementType {
  id: string;
  label: string;
  category: AchievementCategory;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  defaultTags?: string[];
}

export interface AchievementTemplate {
  id: string;
  type: AchievementType['id'];
  text: string;
  lastUsed: Date;
  tags?: string[];
  duration?: number;
}

export interface AchievementGoal {
  id: string;
  type: AchievementType['id'];
  target: number;
  period: 'week' | 'month';
  startDate: Date;
}

export interface AchievementStats {
  type: AchievementType['id'];
  currentStreak: number;
  longestStreak: number;
  thisWeekCount: number;
  thisMonthCount: number;
  lastAchieved?: Date;
}

export type AlertType = 'success' | 'info' | 'warning' | 'error'; 