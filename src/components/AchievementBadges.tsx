import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  Chip,
} from '@mui/material';
import { useAchievements } from '../contexts/AchievementContext';
import { AchievementType } from '../types/achievements';

interface AchievementBadgesProps {
  type: AchievementType;
}

export default function AchievementBadges({ type }: AchievementBadgesProps) {
  const { badges } = useAchievements();
  const typeBadges = badges[type.id] || [];

  if (typeBadges.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#8b949e' }}>
        Badges Earned
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {typeBadges.map((badge) => (
          <Tooltip 
            key={badge.id} 
            title={badge.description}
            arrow
          >
            <Chip
              size="small"
              icon={
                <Box sx={{ color: badge.color, display: 'flex', alignItems: 'center' }}>
                  {badge.icon}
                </Box>
              }
              label={badge.label}
              sx={{
                bgcolor: `${badge.color}11`,
                color: badge.color,
                border: `1px solid ${badge.color}44`,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
} 