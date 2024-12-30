import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Button, Box } from '@mui/material';
import { AchievementProvider } from './contexts/AchievementContext';
import DailyInput from './pages/DailyInput';
import Timeline from './pages/Timeline';
import Badges from './pages/Badges';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a73e8',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
    },
  },
});

function NavButton({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: 'text.primary',
        minWidth: '100px',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '10%',
          width: isActive ? '80%' : '0%',
          height: '2px',
          bgcolor: 'primary.main',
          transition: 'width 0.3s ease-in-out',
        },
        '&:hover:after': {
          width: '80%',
        }
      }}
    >
      {children}
    </Button>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AchievementProvider>
        <Router>
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderBottom: '1px solid #30363d'
            }}
          >
            <Toolbar sx={{ justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <NavButton to="/">Daily Log</NavButton>
                <NavButton to="/timeline">Timeline</NavButton>
                <NavButton to="/badges">Badges</NavButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<DailyInput />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/badges" element={<Badges />} />
            </Routes>
          </Container>
        </Router>
      </AchievementProvider>
    </ThemeProvider>
  );
}

export default App; 