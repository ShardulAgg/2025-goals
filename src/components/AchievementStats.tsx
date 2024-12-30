import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as StreakIcon,
  EmojiEvents as TrophyIcon,
  Today as TodayIcon,
  DateRange as WeekIcon,
  CalendarMonth as MonthIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAchievements } from '../contexts/AchievementContext';
import { AchievementType } from '../types/achievements';

interface AchievementStatsProps {
  type: AchievementType;
}

export default function AchievementStats({ type }: AchievementStatsProps) {
  const { stats, goals } = useAchievements();
  const achievementStats = stats[type.id];
  const typeGoals = goals.filter(g => g.type === type.id);

  if (!achievementStats) {
    return null;
  }

  const getGoalProgress = (goal: typeof typeGoals[0]) => {
    if (!goal) return 0;
    const count = goal.period === 'week' ? achievementStats.thisWeekCount : achievementStats.thisMonthCount;
    return Math.min((count / goal.target) * 100, 100);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Tooltip title="Current Streak">
          <Chip
            size="small"
            icon={<StreakIcon sx={{ color: type.color }} />}
            label={`${achievementStats.currentStreak} day streak`}
            sx={{
              bgcolor: '#161b22',
              color: '#c9d1d9',
              border: `1px solid ${type.color}33`,
            }}
          />
        </Tooltip>
        
        <Tooltip title="Longest Streak">
          <Chip
            size="small"
            icon={<TrophyIcon sx={{ color: type.color }} />}
            label={`${achievementStats.longestStreak} best`}
            sx={{
              bgcolor: '#161b22',
              color: '#c9d1d9',
              border: `1px solid ${type.color}33`,
            }}
          />
        </Tooltip>

        <Tooltip title="This Week">
          <Chip
            size="small"
            icon={<WeekIcon sx={{ color: type.color }} />}
            label={achievementStats.thisWeekCount}
            sx={{
              bgcolor: '#161b22',
              color: '#c9d1d9',
              border: `1px solid ${type.color}33`,
            }}
          />
        </Tooltip>

        <Tooltip title="This Month">
          <Chip
            size="small"
            icon={<MonthIcon sx={{ color: type.color }} />}
            label={achievementStats.thisMonthCount}
            sx={{
              bgcolor: '#161b22',
              color: '#c9d1d9',
              border: `1px solid ${type.color}33`,
            }}
          />
        </Tooltip>
      </Stack>

      {typeGoals.map((goal) => (
        <Box key={goal.id} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#8b949e', flexGrow: 1 }}>
              Goal: {goal.target} {goal.period === 'week' ? 'this week' : 'this month'}
            </Typography>
            <Typography variant="caption" sx={{ color: type.color }}>
              {goal.period === 'week' ? achievementStats.thisWeekCount : achievementStats.thisMonthCount}
              /{goal.target}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getGoalProgress(goal)}
            sx={{
              bgcolor: '#21262d',
              '& .MuiLinearProgress-bar': {
                bgcolor: type.color,
              },
              borderRadius: 1,
              height: 6,
            }}
          />
        </Box>
      ))}

      {typeGoals.length === 0 && (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1,
            color: '#8b949e',
            border: '1px dashed #30363d',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              borderColor: type.color,
              color: type.color,
            }
          }}
        >
          <AddIcon fontSize="small" />
          <Typography variant="caption">Set a goal</Typography>
        </Box>
      )}
    </Box>
  );
} 