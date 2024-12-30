import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Button } from '@mui/material';
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

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AchievementProvider>
        <Router>
          <AppBar position="static" sx={{ bgcolor: '#161b22', borderBottom: '1px solid #30363d' }}>
            <Toolbar>
              <Button color="inherit" component={Link} to="/">
                Daily Log
              </Button>
              <Button color="inherit" component={Link} to="/timeline">
                Timeline
              </Button>
              <Button color="inherit" component={Link} to="/badges">
                Badges
              </Button>
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