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
  const [typeSelectionOpen, setTypeSelectionOpen] = React.useState(false);

  const achievements = getAchievementsForDate(selectedDate);

  const handleTypeSelect = (type: AchievementType) => {
    setSelectedType(type);
    setTypeSelectionOpen(false);
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
    setSelectedType(null);
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
        maxWidth: 800, 
        mx: 'auto', 
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        color: '#c9d1d9',
      }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            flexGrow: 1, 
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
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

        {/* Type Selection Grid */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#8b949e' }}>
            Select Type
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(groupedTypes).map(([category, types]) => (
              <React.Fragment key={category}>
                <Grid item xs={12}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#8b949e',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      pl: 1,
                    }}
                  >
                    {category}
                  </Typography>
                </Grid>
                {types.map((type) => (
                  <Grid item xs={6} sm={4} md={3} key={type.id}>
                    <Paper
                      onClick={() => handleTypeSelect(type)}
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        bgcolor: selectedType?.id === type.id ? `${type.color}22` : '#161b22',
                        border: '1px solid',
                        borderColor: selectedType?.id === type.id ? type.color : '#30363d',
                        '&:hover': {
                          borderColor: type.color,
                          bgcolor: `${type.color}11`,
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
                          variant="body2"
                          sx={{ 
                            color: '#c9d1d9',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {type.label}
                        </Typography>
                        <AchievementBadges type={type} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        {/* Input Field */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            size="small"
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
                <Box sx={{ color: selectedType.color, mr: 1 }}>
                  {selectedType.icon}
                </Box>
              ),
              endAdornment: input.trim() && (
                <IconButton
                  size="small"
                  onClick={handleSubmit}
                  sx={{ 
                    color: selectedType?.color || '#8b949e',
                    '&:hover': {
                      bgcolor: `${selectedType?.color}22`,
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#c9d1d9',
                backgroundColor: '#161b22',
                '& fieldset': { borderColor: '#30363d' },
                '&:hover fieldset': { borderColor: selectedType?.color || '#30363d' },
                '&.Mui-focused fieldset': { borderColor: selectedType?.color || '#30363d' },
              },
            }}
          />
        </Box>

        {/* Achievement List */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: '#8b949e',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {format(selectedDate, 'MMMM d, yyyy')} Contributions
        </Typography>
        
        {Object.keys(groupedAchievements).length === 0 ? (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              color: '#8b949e',
              bgcolor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">
              No contributions for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2,
                  textTransform: 'capitalize',
                  color: '#8b949e',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {category}
              </Typography>
              
              <List sx={{ 
                bgcolor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: 1,
              }}>
                {categoryAchievements.map((achievement: Achievement, index: number) => (
                  <Fade in key={achievement.id}>
                    <ListItem 
                      sx={{ 
                        borderBottom: index < categoryAchievements.length - 1 ? '1px solid #21262d' : 'none',
                        py: 1.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: achievement.type.color }}>
                        {achievement.type.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={achievement.text}
                        primaryTypographyProps={{
                          sx: { color: '#c9d1d9' }
                        }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title={achievement.timeOfDay}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTimeIcon(achievement.timeOfDay)}
                          </Box>
                        </Tooltip>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => removeAchievement(achievement.id)}
                          sx={{ color: '#8b949e' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </Box>
          ))
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default DailyInput; 