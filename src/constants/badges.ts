import {
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Whatshot as HotstreakIcon,
  WorkspacePremium as PremiumIcon,
  Psychology as MasteryIcon,
} from '@mui/icons-material';
import React from 'react';
import { AchievementType } from '../types/achievements';

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: {
    type: string;
    count: number;
    period?: 'day' | 'week' | 'month' | 'year' | 'total';
    streak?: number;
  };
}

export const BADGES: Record<string, Badge> = {
  cardioStreak7: {
    id: 'cardioStreak7',
    label: 'Cardio Warrior',
    description: '7-day cardio streak',
    icon: React.createElement(FireIcon),
    color: '#ff4d4d',
    requirement: {
      type: 'cardio',
      count: 1,
      streak: 7,
    },
  },
  cardioStreak30: {
    id: 'cardioStreak30',
    label: 'Cardio Master',
    description: '30-day cardio streak',
    icon: React.createElement(HotstreakIcon),
    color: '#ff4d4d',
    requirement: {
      type: 'cardio',
      count: 1,
      streak: 30,
    },
  },
  strengthStreak7: {
    id: 'strengthStreak7',
    label: 'Strength Warrior',
    description: '7-day strength training streak',
    icon: React.createElement(FireIcon),
    color: '#ffd700',
    requirement: {
      type: 'strength',
      count: 1,
      streak: 7,
    },
  },
  strengthStreak30: {
    id: 'strengthStreak30',
    label: 'Strength Master',
    description: '30-day strength training streak',
    icon: React.createElement(HotstreakIcon),
    color: '#ffd700',
    requirement: {
      type: 'strength',
      count: 1,
      streak: 30,
    },
  },
  customerMaster: {
    id: 'customerMaster',
    label: 'Sales Master',
    description: 'Close 10 customers in a month',
    icon: React.createElement(PremiumIcon),
    color: '#2ecc71',
    requirement: {
      type: 'customer',
      count: 10,
      period: 'month',
    },
  },
  releaseMaster: {
    id: 'releaseMaster',
    label: 'Release Master',
    description: 'Release 5 features in a week',
    icon: React.createElement(MasteryIcon),
    color: '#3498db',
    requirement: {
      type: 'release',
      count: 5,
      period: 'week',
    },
  },
}; 