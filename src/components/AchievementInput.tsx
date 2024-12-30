import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Collapse,
  Typography,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  AccessTime as TimeIcon,
  LocalOffer as TagIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAchievements } from '../contexts/AchievementContext';
import { AchievementType, AchievementTemplate } from '../types/achievements';

interface AchievementInputProps {
  type: AchievementType;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (achievement: { text: string; tags?: string[]; duration?: number }) => void;
}

export default function AchievementInput({ type, value, onChange, onSubmit }: AchievementInputProps) {
  const { getSuggestedTemplates, stats } = useAchievements();
  const [suggestions, setSuggestions] = useState<AchievementTemplate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duration, setDuration] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>(type.defaultTags || []);

  useEffect(() => {
    const newSuggestions = getSuggestedTemplates(type.id, value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  }, [value, type.id, getSuggestedTemplates]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit({
      text: value,
      tags,
      duration,
    });
    setDuration(undefined);
    setTags(type.defaultTags || []);
  };

  const handleSuggestionClick = (template: AchievementTemplate) => {
    onChange(template.text);
    setDuration(template.duration);
    setTags(template.tags || type.defaultTags || []);
    setShowSuggestions(false);
  };

  const achievementStats = stats[type.id];

  return (
    <Stack spacing={1}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type.placeholder}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              backgroundColor: '#161b22',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: type.color },
              '&.Mui-focused fieldset': { borderColor: type.color },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          InputProps={{
            startAdornment: achievementStats?.currentStreak > 0 && (
              <InputAdornment position="start">
                <Tooltip title={`${achievementStats.currentStreak} day streak`}>
                  <Chip 
                    size="small"
                    label={`${achievementStats.currentStreak}🔥`}
                    sx={{ 
                      bgcolor: type.color + '22',
                      color: type.color,
                      border: `1px solid ${type.color}44`,
                      height: 24,
                    }}
                  />
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={1} alignItems="center">
                  {duration && (
                    <Chip
                      size="small"
                      icon={<TimeIcon sx={{ fontSize: 16 }} />}
                      label={`${duration}min`}
                      onDelete={() => setDuration(undefined)}
                      sx={{ 
                        bgcolor: '#21262d',
                        color: '#c9d1d9',
                        '& .MuiChip-deleteIcon': {
                          color: '#8b949e',
                          '&:hover': { color: '#c9d1d9' },
                        }
                      }}
                    />
                  )}
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      size="small"
                      icon={<TagIcon sx={{ fontSize: 16 }} />}
                      label={tag}
                      onDelete={() => setTags(tags.filter(t => t !== tag))}
                      sx={{ 
                        bgcolor: '#21262d',
                        color: '#c9d1d9',
                        '& .MuiChip-deleteIcon': {
                          color: '#8b949e',
                          '&:hover': { color: '#c9d1d9' },
                        }
                      }}
                    />
                  ))}
                  <Tooltip title="Add Achievement">
                    <IconButton
                      onClick={handleSubmit}
                      disabled={!value.trim()}
                      size="small"
                      sx={{ 
                        color: type.color,
                        '&.Mui-disabled': {
                          color: '#30363d',
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
            ),
          }}
        />

        <Collapse in={showSuggestions}>
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              bgcolor: '#161b22',
              border: '1px solid #30363d',
              zIndex: 1000,
            }}
          >
            <List dense>
              {suggestions.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  onClick={() => handleSuggestionClick(template)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#21262d',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HistoryIcon sx={{ color: type.color, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={template.text}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {template.duration && (
                          <Typography variant="caption" sx={{ color: '#8b949e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 14 }} />
                            {template.duration}min
                          </Typography>
                        )}
                        {template.tags?.map(tag => (
                          <Typography key={tag} variant="caption" sx={{ color: '#8b949e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TagIcon sx={{ fontSize: 14 }} />
                            {tag}
                          </Typography>
                        ))}
                      </Stack>
                    }
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#c9d1d9',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Collapse>
      </Box>
    </Stack>
  );
} 