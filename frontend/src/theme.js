import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Vibrant Blue
      light: '#DBEAFE',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#10B981', // Emerald Green
      light: '#D1FAE5',
      dark: '#047857',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#475569', // Slate 600
    }
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontSize: '2rem', fontWeight: 700 },
    h4: { fontFamily: '"Outfit", sans-serif', fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontSize: '1.125rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 15px -3px rgba(37, 99, 235, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          background: '#FFFFFF',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        }
      }
    }
  },
});

export default theme;
