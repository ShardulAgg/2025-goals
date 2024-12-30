import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import { useAchievements } from '../contexts/AchievementContext';
import { ACHIEVEMENT_TYPES } from '../constants/achievementTypes';
import { BADGES } from '../constants/badges';
import { Lock as LockIcon } from '@mui/icons-material';

export default function Badges() {
  const { badges } = useAchievements();

  // Group badges by category using achievement types
  const groupedBadges = Object.values(BADGES).reduce((acc, badge) => {
    const achievementType = ACHIEVEMENT_TYPES[badge.requirement.type];
    const category = achievementType.category;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    const isEarned = badges[badge.requirement.type]?.some(
      earnedBadge => earnedBadge.id === badge.id
    );
    
    acc[category].push({ ...badge, isEarned });
    return acc;
  }, {} as Record<string, Array<typeof BADGES[keyof typeof BADGES] & { isEarned: boolean }>>);

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      px: { xs: 2, sm: 3 },
      py: { xs: 3, sm: 4 },
    }}>
      <Typography variant="h4" sx={{ 
        mb: 4,
        color: '#c9d1d9',
        fontSize: { xs: '1.75rem', sm: '2.125rem' },
      }}>
        Achievement Badges
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <Grid item xs={12} key={category}>
            <Paper sx={{ 
              p: 3,
              bgcolor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 1,
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  color: '#c9d1d9',
                  textTransform: 'capitalize',
                }}
              >
                {category}
              </Typography>

              <Grid container spacing={2}>
                {categoryBadges.map((badge) => (
                  <Grid item xs={12} sm={6} md={4} key={badge.id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: badge.isEarned ? `${badge.color}11` : '#161b22',
                        border: '1px solid',
                        borderColor: badge.isEarned ? `${badge.color}44` : '#30363d',
                        opacity: badge.isEarned ? 1 : 0.7,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          opacity: 1,
                          borderColor: badge.color,
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ 
                            color: badge.isEarned ? badge.color : '#8b949e',
                            display: 'flex',
                          }}>
                            {badge.isEarned ? badge.icon : <LockIcon />}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ 
                              color: badge.isEarned ? badge.color : '#8b949e',
                              fontWeight: 600,
                            }}>
                              {badge.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#8b949e' }}>
                              {badge.description}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#8b949e',
                            display: 'block',
                            mb: 1,
                          }}>
                            Requirements:
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {badge.requirement.streak && (
                              <Chip
                                size="small"
                                label={`${badge.requirement.streak} day streak`}
                                sx={{
                                  bgcolor: '#21262d',
                                  color: '#8b949e',
                                  border: '1px solid #30363d',
                                }}
                              />
                            )}
                            {badge.requirement.period && (
                              <Chip
                                size="small"
                                label={`${badge.requirement.count} in a ${badge.requirement.period}`}
                                sx={{
                                  bgcolor: '#21262d',
                                  color: '#8b949e',
                                  border: '1px solid #30363d',
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 