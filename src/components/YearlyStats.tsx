import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  startOfYear,
  differenceInDays,
  isSameDay,
  parseISO,
} from 'date-fns';
import { useAchievements } from '../contexts/AchievementContext';
import { ACHIEVEMENT_TYPES } from '../constants/achievementTypes';

export default function YearlyStats() {
  const { achievements } = useAchievements();
  const today = new Date();
  const yearStart = startOfYear(today);
  const daysPassed = differenceInDays(today, yearStart) + 1; // +1 to include today

  // Calculate activity days for each type
  const yearlyStats = Object.entries(ACHIEVEMENT_TYPES).map(([id, type]) => {
    const thisYearAchievements = achievements.filter(a => {
      const date = parseISO(a.date);
      return date >= yearStart && date <= today && a.type.id === id;
    });

    // Count unique days with this activity
    const uniqueDays = new Set(
      thisYearAchievements.map(a => a.date)
    ).size;

    const percentage = (uniqueDays / daysPassed) * 100;
    const daysPerWeek = (percentage / 100) * 7;

    return {
      type,
      uniqueDays,
      percentage,
      daysPerWeek,
    };
  }).sort((a, b) => b.uniqueDays - a.uniqueDays); // Sort by most active

  return (
    <Paper 
      sx={{ 
        p: 3,
        bgcolor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, color: '#c9d1d9' }}>
        Year Progress ({Math.round((daysPassed / 365) * 100)}% complete)
      </Typography>

      <Stack spacing={3}>
        {yearlyStats.map(({ type, uniqueDays, percentage, daysPerWeek }) => (
          <Box key={type.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Box sx={{ color: type.color }}>{type.icon}</Box>
              <Typography sx={{ color: '#c9d1d9', flexGrow: 1 }}>
                {type.label}
              </Typography>
              <Tooltip title={`${daysPerWeek.toFixed(1)} days per week average`}>
                <Typography sx={{ color: '#8b949e', fontSize: '0.875rem' }}>
                  {uniqueDays} days
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    bgcolor: '#21262d',
                    height: 8,
                    borderRadius: 1,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: type.color,
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
              <Typography 
                sx={{ 
                  color: type.color,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minWidth: 45,
                }}
              >
                {percentage.toFixed(1)}%
              </Typography>
            </Box>

            <Typography 
              variant="caption" 
              sx={{ 
                color: '#8b949e',
                display: 'block',
                mt: 0.5,
              }}
            >
              {uniqueDays} out of {daysPassed} days this year
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
} 