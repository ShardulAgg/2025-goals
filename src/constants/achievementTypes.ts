import React from 'react';
import {
  DirectionsRun as CardioIcon,
  GitHub as GithubIcon,
  FitnessCenter as StrengthIcon,
  AttachMoney as CustomerIcon,
  Rocket as ReleaseIcon,
} from '@mui/icons-material';
import { AchievementType } from '../types/achievements';

export const ACHIEVEMENT_TYPES: Record<string, AchievementType> = {
  cardio: {
    id: 'cardio',
    label: 'Cardio Workout',
    category: 'fitness',
    icon: React.createElement(CardioIcon),
    color: '#ff4d4d',
    placeholder: 'e.g., "30 min run" or "1 hour cycling"',
    defaultTags: ['cardio', 'exercise'],
  },
  strength: {
    id: 'strength',
    label: 'Strength Training',
    category: 'fitness',
    icon: React.createElement(StrengthIcon),
    color: '#ffd700',
    placeholder: 'e.g., "Full body workout" or "Leg day"',
    defaultTags: ['strength', 'exercise'],
  },
//   github: {
//     id: 'github',
//     label: 'Github Commit',
//     category: 'work',
//     icon: React.createElement(GithubIcon),
//     color: '#6e5494',
//     placeholder: 'e.g., "Implemented feature X"',
//     defaultTags: ['development', 'coding'],
//   },
  customer: {
    id: 'customer',
    label: 'Closed Customer',
    category: 'work',
    icon: React.createElement(CustomerIcon),
    color: '#2ecc71',
    placeholder: 'e.g., "Closed deal with Company X"',
    defaultTags: ['sales', 'business'],
  },
  release: {
    id: 'release',
    label: 'Released Feature',
    category: 'work',
    icon: React.createElement(ReleaseIcon),
    color: '#3498db',
    placeholder: 'e.g., "Released v2.0 of product"',
    defaultTags: ['product', 'deployment'],
  },
} as const; 