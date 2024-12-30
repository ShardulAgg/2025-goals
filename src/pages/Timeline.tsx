import { useMemo, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Grid,
  Tooltip, 
  Button,
  IconButton,
  Chip,
  Stack,
  Popover,
} from '@mui/material';
import {
  Close as CloseIcon,
  DirectionsRun as CardioIcon,
  GitHub as GithubIcon,
  FitnessCenter as StrengthIcon,
  AttachMoney as CustomerIcon,
  Rocket as ReleaseIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  getDay,
  addWeeks,
  eachWeekOfInterval,
  startOfWeek,
  getDaysInMonth,
  differenceInWeeks,
  parseISO,
} from 'date-fns';
import YearlyStats from '../components/YearlyStats';
import { captureAndShare } from '../utils/screenshot';

// Add achievement type definitions from DailyInput
interface AchievementTypeInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface AchievementType {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  defaultTags: string[];
}

interface Achievement {
  type: AchievementType;
  date: string;
  text: string;
  timeOfDay: string;
  id: string;
}

const ACHIEVEMENT_TYPES: Record<string, AchievementTypeInfo> = {
  cardio: {
    label: 'Cardio Workout',
    icon: <CardioIcon />,
    color: '#ff4d4d',
  },
  github: {
    label: 'Github Commit',
    icon: <GithubIcon />,
    color: '#6e5494',
  },
  strength: {
    label: 'Strength Training',
    icon: <StrengthIcon />,
    color: '#ffd700',
  },
  customer: {
    label: 'Closed Customer',
    icon: <CustomerIcon />,
    color: '#2ecc71',
  },
  release: {
    label: 'Released Feature',
    icon: <ReleaseIcon />,
    color: '#3498db',
  }
};

interface DayInfo {
  date: Date;
  dayOfWeek: number;
  isInYear: boolean;
}

// Constants
const CONTAINER_WIDTH = 720;
const CELL_SIZE = 10;
const GRID_GAP = 2;
const WEEKDAY_WIDTH = 26;
const CONTAINER_PADDING = 16;
const MONTH_LABEL_HEIGHT = 14;
const TOTAL_CELL_SIZE = CELL_SIZE + GRID_GAP;
const VERTICAL_GAP = 4;

// GitHub's contribution colors
const WORKOUT_COLORS = {
  NONE: '#161b22',
  L1: '#3d3600',
  L2: '#675c00',
  L3: '#998a00',
  L4: '#ffd700'
} as const;

const WORK_COLORS = {
  NONE: '#161b22',
  L1: '#0e4429',
  L2: '#006d32',
  L3: '#26a641',
  L4: '#39d353'
} as const;

// Styled Components
const Container = styled(Box)({
  width: '100%',
  maxWidth: CONTAINER_WIDTH,
  margin: '0 auto',
  padding: CONTAINER_PADDING,
  border: '1px solid #30363d',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 6,
});

const MonthLabel = styled(Typography)({
  position: 'absolute',
  color: '#7d8590',
  fontSize: '12px',
  lineHeight: '14px',
  top: CONTAINER_PADDING,
  whiteSpace: 'nowrap',
});

const WeekdayLabel = styled(Typography)({
  position: 'absolute',
  left: CONTAINER_PADDING,
  color: '#7d8590',
  fontSize: '12px',
  lineHeight: TOTAL_CELL_SIZE + 'px',
  height: TOTAL_CELL_SIZE,
  userSelect: 'none',
});

const ContributionCell = styled(Box)({
  width: CELL_SIZE,
  height: CELL_SIZE,
  borderRadius: 2,
  margin: GRID_GAP / 2,
  cursor: 'pointer',
  transition: 'transform 0.1s ease-in-out, background-color 0.1s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const GridWrapper = styled(Box)({
  marginLeft: WEEKDAY_WIDTH + 0,
  marginTop: MONTH_LABEL_HEIGHT + VERTICAL_GAP + 0,
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: `repeat(7, ${TOTAL_CELL_SIZE}px)`,
  gap: 0,
  width: 'fit-content',
});

const AchievementPopover = styled(Box)({
  backgroundColor: '#161b22',
  border: '1px solid #30363d',
  borderRadius: 6,
  width: 300,
  maxHeight: 400,
  overflow: 'auto',
});

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const WORKOUT_TYPES = ['cardio', 'strength'];
const WORK_TYPES = ['github', 'customer', 'release'];

function Timeline() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  
  // Separate states for workout and work popovers
  const [workoutAnchorEl, setWorkoutAnchorEl] = useState<HTMLElement | null>(null);
  const [workAnchorEl, setWorkAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkoutAchievements, setSelectedWorkoutAchievements] = useState<Achievement[]>([]);
  const [selectedWorkAchievements, setSelectedWorkAchievements] = useState<Achievement[]>([]);

  const achievements: Achievement[] = useMemo(() => {
    const saved = localStorage.getItem('achievements');
    const parsedAchievements = saved ? JSON.parse(saved) : [];
    console.log('Loaded achievements:', parsedAchievements); // Debug log
    return parsedAchievements;
  }, []);

  const yearStart = useMemo(() => new Date(selectedYear, 0, 1), [selectedYear]);
  const startDate = useMemo(() => startOfYear(yearStart), [yearStart]);
  const endDate = useMemo(() => endOfYear(yearStart), [yearStart]);
  
  const weeks = useMemo(() => 
    eachWeekOfInterval({
      start: startDate,
      end: endDate,
    }),
  [startDate, endDate]);

  const getContributionColor = (count: number, isWorkout: boolean) => {
    const colors = isWorkout ? WORKOUT_COLORS : WORK_COLORS;
    if (count === 0) return colors.NONE;
    if (count === 1) return colors.L1;
    if (count === 2) return colors.L2;
    if (count <= 4) return colors.L3;
    return colors.L4;
  };

  // Calculate month positions based on actual grid columns
  const monthPositions = useMemo(() => {
    const positions = [];
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    
    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(selectedYear, month, 1);
      const lastDayOfMonth = new Date(selectedYear, month + 1, 0);
      const firstWeek = startOfWeek(firstDayOfMonth);
      const lastWeek = startOfWeek(lastDayOfMonth);
      
      const startOffset = differenceInWeeks(firstWeek, yearStart);
      const endOffset = differenceInWeeks(lastWeek, yearStart);
      const numWeeks = endOffset - startOffset + 1;
      
      positions.push({
        month: months[month],
        offset: startOffset * TOTAL_CELL_SIZE,
        width: numWeeks * TOTAL_CELL_SIZE,
      });
    }
    
    return positions;
  }, [selectedYear]);

  // Calculate weekday positions based on actual calendar
  const weekdayPositions = useMemo(() => {
    return weekdays.map((label, dayOfWeek) => ({
      label,
      dayOfWeek
    }));
  }, []);

  // Generate grid data with proper week handling
  const gridData = useMemo<DayInfo[][]>(() => {
    const data: DayInfo[][] = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const weekStart = startOfWeek(currentDate);
      const days = eachDayOfInterval({
        start: weekStart,
        end: addWeeks(weekStart, 1),
      }).slice(0, 7).map(day => {
        const dayOfWeek = getDay(day);
        return {
          date: day,
          dayOfWeek,
          isInYear: day.getFullYear() === selectedYear,
        };
      });
      
      data.push(days);
      currentDate = addWeeks(currentDate, 1);
    }
    
    return data;
  }, [startDate, endDate, selectedYear]);

  const handleWorkoutDayClick = (event: React.MouseEvent<HTMLElement>, date: Date, achievements: Achievement[]) => {
    setWorkoutAnchorEl(event.currentTarget);
    setSelectedDate(date);
    setSelectedWorkoutAchievements(achievements);
  };

  const handleWorkDayClick = (event: React.MouseEvent<HTMLElement>, date: Date, achievements: Achievement[]) => {
    setWorkAnchorEl(event.currentTarget);
    setSelectedDate(date);
    setSelectedWorkAchievements(achievements);
  };

  const handleWorkoutClose = () => {
    setWorkoutAnchorEl(null);
    setSelectedDate(null);
    setSelectedWorkoutAchievements([]);
  };

  const handleWorkClose = () => {
    setWorkAnchorEl(null);
    setSelectedDate(null);
    setSelectedWorkAchievements([]);
  };

  const filterAchievementsByType = (achievements: Achievement[], types: string[]) => {
    return achievements.filter(a => types.includes(a.type.id));
  };

  const handleShareTimeline = async (platform: 'linkedin' | 'twitter') => {
    await captureAndShare(
      ['workout-timeline', 'work-timeline'],
      'My Achievement Timeline',
      'Check out my progress throughout the year!',
      { platform }
    );
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
        }}>
          <Typography variant="h4" sx={{ 
            color: '#c9d1d9',
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
          }}>
            Activity Timeline
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => handleShareTimeline('twitter')}
              sx={{ 
                color: '#1DA1F2',
                '&:hover': {
                  backgroundColor: 'rgba(29, 161, 242, 0.1)',
                }
              }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              onClick={() => handleShareTimeline('linkedin')}
              sx={{ 
                color: '#0A66C2',
                '&:hover': {
                  backgroundColor: 'rgba(10, 102, 194, 0.1)',
                }
              }}
            >
              <LinkedInIcon />
            </IconButton>
            {[2024, 2025].map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? "contained" : "outlined"}
                onClick={() => setSelectedYear(year)}
                sx={{ 
                  color: selectedYear === year ? '#fff' : '#8b949e',
                  borderColor: '#30363d',
                  backgroundColor: selectedYear === year ? '#238636' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedYear === year ? '#2ea043' : 'rgba(48, 54, 61, 0.5)',
                  },
                }}
              >
                {year}
              </Button>
            ))}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <YearlyStats selectedYear={selectedYear} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ maxWidth: CONTAINER_WIDTH, margin: '0 auto' }}>
              <Typography variant="h5" sx={{ 
                color: '#c9d1d9',
                mb: 4,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}>
                Workout Timeline
              </Typography>
              
              <Container id="workout-timeline">
                {/* Month Labels */}
                {monthPositions.map(({ month, offset, width }, index) => {
                  const isVisible = offset < (CONTAINER_WIDTH - WEEKDAY_WIDTH - CONTAINER_PADDING * 2 - 50);
                  
                  return (
                    <MonthLabel 
                      key={index} 
                      sx={{ 
                        left: offset + WEEKDAY_WIDTH + CONTAINER_PADDING + (width / 2),
                        color: index === 0 ? '#c9d1d9' : '#7d8590',
                        display: isVisible ? 'block' : 'none',
                        transform: 'translateX(-50%)',
                        width: width,
                        textAlign: 'center',
                      }}
                    >
                      {month}
                    </MonthLabel>
                  );
                })}

                {/* Weekday Labels */}
                {weekdayPositions.map(({ label, dayOfWeek }) => (
                  <WeekdayLabel 
                    key={dayOfWeek} 
                    sx={{ 
                      top: MONTH_LABEL_HEIGHT + VERTICAL_GAP + CONTAINER_PADDING + (dayOfWeek * TOTAL_CELL_SIZE),
                      display: 'flex',
                      alignItems: 'center',
                      paddingRight: 1,
                    }}
                  >
                    {label}
                  </WeekdayLabel>
                ))}

                {/* Contribution Grid */}
                <GridWrapper>
                  {gridData.map((week, weekIndex) => 
                    week.map(({ date, dayOfWeek, isInYear }) => {
                      const dayAchievements = isInYear ? achievements.filter(a => {
                        const achievementDate = parseISO(a.date);
                        return isSameDay(achievementDate, date) && WORKOUT_TYPES.includes(a.type.id);
                      }) : [];
                      
                      return (
                        <Tooltip
                          key={date.toISOString()}
                          title={
                            isInYear ? (
                              <Box sx={{ p: 1 }}>
                                <Typography sx={{ color: '#c9d1d9', fontWeight: 'bold', fontSize: '12px' }}>
                                  {format(date, 'MMMM d, yyyy')}
                                </Typography>
                                <Typography sx={{ color: '#7d8590', fontSize: '12px' }}>
                                  {dayAchievements.length} achievement{dayAchievements.length !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            ) : null
                          }
                          arrow
                          placement="top"
                        >
                          <ContributionCell
                            onClick={(e) => isInYear && handleWorkoutDayClick(e, date, dayAchievements)}
                            sx={{
                              backgroundColor: isInYear ? getContributionColor(dayAchievements.length, true) : 'transparent',
                              border: isInYear ? '1px solid rgba(27,31,35,0.06)' : 'none',
                              gridRow: dayOfWeek + 1,
                              cursor: isInYear ? 'pointer' : 'default',
                              '&:hover': {
                                transform: isInYear ? 'scale(1.1)' : 'none',
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  )}
                </GridWrapper>

                {/* Legend */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mt: 3,
                  color: '#7d8590',
                  fontSize: '12px'
                }}>
                  Less
                  {[0, 1, 2, 3, 4].map((level) => (
                    <ContributionCell
                      key={level}
                      sx={{
                        backgroundColor: getContributionColor(level * 2, true),
                        cursor: 'default',
                        '&:hover': { transform: 'none' },
                      }}
                    />
                  ))}
                  More
                </Box>
              </Container>

              {/* Achievement Details Popover */}
              <Popover
                open={Boolean(workoutAnchorEl)}
                anchorEl={workoutAnchorEl}
                onClose={handleWorkoutClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible',
                  }
                }}
                sx={{
                  '& .MuiPopover-paper': {
                    marginTop: 1,
                  }
                }}
              >
                <AchievementPopover>
                  <Box sx={{ p: 2, borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ color: '#c9d1d9' }}>
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                    </Typography>
                    <IconButton onClick={handleWorkoutClose} size="small" sx={{ color: '#8b949e' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    {selectedWorkoutAchievements.length > 0 ? (
                      <Stack spacing={1.5}>
                        {Object.entries(ACHIEVEMENT_TYPES)
                          .filter(([type]) => WORKOUT_TYPES.includes(type))
                          .map(([type, { label, icon, color }]) => {
                            const typeAchievements = selectedWorkoutAchievements.filter(a => a.type.id === type);
                            if (typeAchievements.length === 0) return null;

                            return (
                              <Box key={type}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Box sx={{ color }}>{icon}</Box>
                                  <Typography sx={{ color: '#c9d1d9', fontSize: '0.9rem' }}>{label}</Typography>
                                </Box>
                                <Stack spacing={0.5}>
                                  {typeAchievements.map((achievement) => (
                                    <Chip
                                      key={achievement.id}
                                      label={achievement.text}
                                      size="small"
                                      sx={{
                                        bgcolor: color + '33',
                                        color: '#c9d1d9',
                                        height: 'auto',
                                        '& .MuiChip-label': {
                                          display: 'block',
                                          whiteSpace: 'normal',
                                          padding: '4px 0',
                                          fontSize: '0.85rem',
                                        },
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            );
                          })}
                      </Stack>
                    ) : (
                      <Typography sx={{ color: '#8b949e', textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                        No workout achievements recorded for this day
                      </Typography>
                    )}
                  </Box>
                </AchievementPopover>
              </Popover>
            </Box>

            <Box sx={{ maxWidth: CONTAINER_WIDTH, margin: '0 auto', mt: 6 }}>
              <Typography variant="h5" sx={{ 
                color: '#c9d1d9',
                mb: 4,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}>
                Work Timeline
              </Typography>
              
              <Container id="work-timeline">
                {/* Month Labels */}
                {monthPositions.map(({ month, offset, width }, index) => {
                  const isVisible = offset < (CONTAINER_WIDTH - WEEKDAY_WIDTH - CONTAINER_PADDING * 2 - 50);
                  
                  return (
                    <MonthLabel 
                      key={index} 
                      sx={{ 
                        left: offset + WEEKDAY_WIDTH + CONTAINER_PADDING + (width / 2),
                        color: index === 0 ? '#c9d1d9' : '#7d8590',
                        display: isVisible ? 'block' : 'none',
                        transform: 'translateX(-50%)',
                        width: width,
                        textAlign: 'center',
                      }}
                    >
                      {month}
                    </MonthLabel>
                  );
                })}

                {/* Weekday Labels */}
                {weekdayPositions.map(({ label, dayOfWeek }) => (
                  <WeekdayLabel 
                    key={dayOfWeek} 
                    sx={{ 
                      top: MONTH_LABEL_HEIGHT + VERTICAL_GAP + CONTAINER_PADDING + (dayOfWeek * TOTAL_CELL_SIZE),
                      display: 'flex',
                      alignItems: 'center',
                      paddingRight: 1,
                    }}
                  >
                    {label}
                  </WeekdayLabel>
                ))}

                {/* Contribution Grid */}
                <GridWrapper>
                  {gridData.map((week, weekIndex) => 
                    week.map(({ date, dayOfWeek, isInYear }) => {
                      const dayAchievements = isInYear ? achievements.filter(a => {
                        const achievementDate = parseISO(a.date);
                        return isSameDay(achievementDate, date) && WORK_TYPES.includes(a.type.id);
                      }) : [];
                      
                      return (
                        <Tooltip
                          key={date.toISOString()}
                          title={
                            isInYear ? (
                              <Box sx={{ p: 1 }}>
                                <Typography sx={{ color: '#c9d1d9', fontWeight: 'bold', fontSize: '12px' }}>
                                  {format(date, 'MMMM d, yyyy')}
                                </Typography>
                                <Typography sx={{ color: '#7d8590', fontSize: '12px' }}>
                                  {dayAchievements.length} achievement{dayAchievements.length !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            ) : null
                          }
                          arrow
                          placement="top"
                        >
                          <ContributionCell
                            onClick={(e) => isInYear && handleWorkDayClick(e, date, dayAchievements)}
                            sx={{
                              backgroundColor: isInYear ? getContributionColor(dayAchievements.length, false) : 'transparent',
                              border: isInYear ? '1px solid rgba(27,31,35,0.06)' : 'none',
                              gridRow: dayOfWeek + 1,
                              cursor: isInYear ? 'pointer' : 'default',
                              '&:hover': {
                                transform: isInYear ? 'scale(1.1)' : 'none',
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  )}
                </GridWrapper>

                {/* Legend */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mt: 3,
                  color: '#7d8590',
                  fontSize: '12px'
                }}>
                  Less
                  {[0, 1, 2, 3, 4].map((level) => (
                    <ContributionCell
                      key={level}
                      sx={{
                        backgroundColor: getContributionColor(level * 2, false),
                        cursor: 'default',
                        '&:hover': { transform: 'none' },
                      }}
                    />
                  ))}
                  More
                </Box>
              </Container>

              {/* Achievement Details Popover */}
              <Popover
                open={Boolean(workAnchorEl)}
                anchorEl={workAnchorEl}
                onClose={handleWorkClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible',
                  }
                }}
                sx={{
                  '& .MuiPopover-paper': {
                    marginTop: 1,
                  }
                }}
              >
                <AchievementPopover>
                  <Box sx={{ p: 2, borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ color: '#c9d1d9' }}>
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                    </Typography>
                    <IconButton onClick={handleWorkClose} size="small" sx={{ color: '#8b949e' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    {selectedWorkAchievements.length > 0 ? (
                      <Stack spacing={1.5}>
                        {Object.entries(ACHIEVEMENT_TYPES)
                          .filter(([type]) => WORK_TYPES.includes(type))
                          .map(([type, { label, icon, color }]) => {
                            const typeAchievements = selectedWorkAchievements.filter(a => a.type.id === type);
                            if (typeAchievements.length === 0) return null;

                            return (
                              <Box key={type}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Box sx={{ color }}>{icon}</Box>
                                  <Typography sx={{ color: '#c9d1d9', fontSize: '0.9rem' }}>{label}</Typography>
                                </Box>
                                <Stack spacing={0.5}>
                                  {typeAchievements.map((achievement) => (
                                    <Chip
                                      key={achievement.id}
                                      label={achievement.text}
                                      size="small"
                                      sx={{
                                        bgcolor: color + '33',
                                        color: '#c9d1d9',
                                        height: 'auto',
                                        '& .MuiChip-label': {
                                          display: 'block',
                                          whiteSpace: 'normal',
                                          padding: '4px 0',
                                          fontSize: '0.85rem',
                                        },
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            );
                          })}
                      </Stack>
                    ) : (
                      <Typography sx={{ color: '#8b949e', textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                        No work achievements recorded for this day
                      </Typography>
                    )}
                  </Box>
                </AchievementPopover>
              </Popover>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Timeline; 