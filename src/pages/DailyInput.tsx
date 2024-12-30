import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip,
  Fade,
  Grid,
  Paper,
  Radio,
  Divider,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
  Add as AddIcon,
  AccessTime as TimeIcon,
  LocalOffer as TagIcon,
  Delete as DeleteIcon,
  WbSunny as MorningIcon,
  WbTwilight as AfternoonIcon,
  DarkMode as EveningIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAchievements } from '../contexts/AchievementContext';
import { ACHIEVEMENT_TYPES } from '../constants/achievementTypes';
import { Achievement, AchievementType } from '../types/achievements';
import AchievementBadges from '../components/AchievementBadges';

function DailyInput() {
  const { addAchievement, removeAchievement, getAchievementsForDate } = useAchievements();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [input, setInput] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<AchievementType | null>(null);

  const achievements = getAchievementsForDate(selectedDate);

  const handleTypeSelect = (type: AchievementType) => {
    setSelectedType(type);
    // Focus the input field when a type is selected
    const inputField = document.getElementById('achievement-input');
    if (inputField) {
      inputField.focus();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || !selectedType) return;

    addAchievement({
      type: selectedType,
      date: format(selectedDate, 'yyyy-MM-dd'),
      text: input,
      timeOfDay: getTimeOfDay(),
    });
    setInput('');
    // Keep the type selected for multiple entries
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.type.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  // Group achievement types by category
  const groupedTypes = Object.values(ACHIEVEMENT_TYPES).reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, AchievementType[]>);

  const getTimeIcon = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning':
        return <MorningIcon fontSize="small" sx={{ color: '#ffd700' }} />;
      case 'afternoon':
        return <AfternoonIcon fontSize="small" sx={{ color: '#ff9800' }} />;
      case 'evening':
        return <EveningIcon fontSize="small" sx={{ color: '#5c6bc0' }} />;
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        color: '#c9d1d9',
      }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            flexGrow: 1, 
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 600,
          }}>
            Daily Log
          </Typography>
          <DatePicker
            value={selectedDate}
            onChange={(newDate: Date | null) => newDate && setSelectedDate(newDate)}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: '#c9d1d9',
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#6e7681' },
                  },
                }
              }
            }}
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column - Type Selection */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: '#161b22',
              border: '1px solid #30363d',
              height: '100%',
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#c9d1d9', fontWeight: 600 }}>
                Achievement Type
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#8b949e' }}>
                Select the type of achievement you want to log
              </Typography>
              
              <Stack spacing={2}>
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <Box key={category}>
                    <Typography 
                      variant="overline" 
                      sx={{ 
                        color: '#8b949e',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {category}
                    </Typography>
                    <Stack spacing={1}>
                      {types.map((type) => (
                        <Paper
                          key={type.id}
                          onClick={() => handleTypeSelect(type)}
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            bgcolor: selectedType?.id === type.id ? `${type.color}22` : '#0d1117',
                            border: '1px solid',
                            borderColor: selectedType?.id === type.id ? type.color : '#30363d',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: type.color,
                              bgcolor: `${type.color}11`,
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          <Radio 
                            checked={selectedType?.id === type.id}
                            sx={{
                              color: '#30363d',
                              '&.Mui-checked': {
                                color: type.color,
                              },
                            }}
                          />
                          <Box sx={{ color: type.color }}>
                            {type.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="subtitle2"
                              sx={{ 
                                color: '#c9d1d9',
                                fontWeight: 600,
                              }}
                            >
                              {type.label}
                            </Typography>
                            <AchievementBadges type={type} />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column - Input and List */}
          <Grid item xs={12} md={8}>
            {/* Input Section */}
            <Paper sx={{ 
              p: 3, 
              mb: 3,
              bgcolor: '#161b22',
              border: '1px solid #30363d',
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#c9d1d9', fontWeight: 600 }}>
                Log Achievement
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#8b949e' }}>
                {selectedType 
                  ? `What ${selectedType.label.toLowerCase()} did you accomplish?`
                  : 'Select an achievement type to start logging'
                }
              </Typography>

              <TextField
                id="achievement-input"
                fullWidth
                size="medium"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedType?.placeholder || "Select a type to start logging..."}
                disabled={!selectedType}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                InputProps={{
                  startAdornment: selectedType && (
                    <Box sx={{ color: selectedType.color, mr: 1, display: 'flex' }}>
                      {selectedType.icon}
                    </Box>
                  ),
                  endAdornment: input.trim() && (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      startIcon={<AddIcon />}
                      sx={{ 
                        bgcolor: selectedType?.color,
                        '&:hover': {
                          bgcolor: `${selectedType?.color}dd`,
                        },
                      }}
                    >
                      Add
                    </Button>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#c9d1d9',
                    backgroundColor: '#0d1117',
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: selectedType?.color || '#30363d' },
                    '&.Mui-focused fieldset': { borderColor: selectedType?.color || '#30363d' },
                  },
                }}
              />
            </Paper>

            {/* Today's Achievements */}
            <Paper sx={{ 
              p: 3,
              bgcolor: '#161b22',
              border: '1px solid #30363d',
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: '#c9d1d9',
                fontWeight: 600,
              }}>
                {format(selectedDate, "MMMM d, yyyy")} Achievements
              </Typography>
              
              {Object.keys(groupedAchievements).length === 0 ? (
                <Box 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    color: '#8b949e',
                    bgcolor: '#0d1117',
                    border: '1px dashed #30363d',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No achievements logged yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Select an achievement type above to start logging
                  </Typography>
                </Box>
              ) : (
                Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                  <Box key={category} sx={{ mb: 4, '&:last-child': { mb: 0 } }}>
                    <Typography 
                      variant="overline" 
                      sx={{ 
                        mb: 2,
                        display: 'block',
                        color: '#8b949e',
                        fontWeight: 600,
                      }}
                    >
                      {category}
                    </Typography>
                    
                    <List sx={{ 
                      bgcolor: '#0d1117',
                      border: '1px solid #21262d',
                      borderRadius: 1,
                    }}>
                      {categoryAchievements.map((achievement: Achievement, index: number) => (
                        <Fade in key={achievement.id}>
                          <ListItem 
                            sx={{ 
                              borderBottom: index < categoryAchievements.length - 1 ? '1px solid #21262d' : 'none',
                              py: 2,
                              px: 3,
                              '&:hover': {
                                bgcolor: '#161b22',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ 
                              minWidth: 40,
                              color: achievement.type.color,
                              '& svg': { fontSize: 24 },
                            }}>
                              {achievement.type.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={achievement.text}
                              primaryTypographyProps={{
                                sx: { color: '#c9d1d9', fontWeight: 500 }
                              }}
                            />
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Tooltip title={`Logged in the ${achievement.timeOfDay}`}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getTimeIcon(achievement.timeOfDay)}
                                </Box>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setSelectedType(achievement.type);
                                    setInput(achievement.text);
                                    removeAchievement(achievement.id);
                                  }}
                                  sx={{ 
                                    color: '#8b949e',
                                    '&:hover': {
                                      color: achievement.type.color,
                                      bgcolor: `${achievement.type.color}22`,
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small"
                                  onClick={() => removeAchievement(achievement.id)}
                                  sx={{ 
                                    color: '#8b949e',
                                    '&:hover': {
                                      color: '#f85149',
                                      bgcolor: '#f8514922',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </ListItem>
                        </Fade>
                      ))}
                    </List>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

export default DailyInput; 