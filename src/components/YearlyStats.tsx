import React, { useMemo } from 'react';
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

interface YearlyStatsProps {
  selectedYear: number;
}

function YearlyStats({ selectedYear }: YearlyStatsProps) {
  const { achievements } = useAchievements();

  const yearlyStats = useMemo(() => {
    const stats = Object.entries(ACHIEVEMENT_TYPES).map(([id, type]) => {
      const count = achievements.filter(a => {
        const achievementDate = new Date(a.date);
        return a.type.id === id && achievementDate.getFullYear() === selectedYear;
      }).length;
      return { id, type, count };
    });
    return stats; // Sort by most achievements
  }, [achievements, selectedYear]);

  return (
    <Box>
      <Typography variant="h5" sx={{ 
        color: '#c9d1d9',
        mb: 3,
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
      }}>
        Yearly Overview
      </Typography>
      <Stack spacing={2}>
        {yearlyStats.map(({ id, type, count }) => (
          <Box
            key={id}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: type.color }}>{type.icon}</Box>
              <Typography sx={{ color: '#c9d1d9', fontWeight: 500 }}>
                {type.label}
              </Typography>
            </Box>
            <Typography sx={{ color: '#8b949e' }}>
              {count} achievement{count !== 1 ? 's' : ''} in {selectedYear}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default YearlyStats; 