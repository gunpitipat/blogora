import { useEffect, useState } from 'react';
import { Link as RouterLink, NavLink } from 'react-router';
import { alpha, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import MobileDrawer from '@/layouts/navbar/MobileDrawer';
import {
  NAVBAR_HEIGHT,
  PRIMARY_NAV_ITEMS,
  AUTH_NAV_ITEMS,
} from '@/layouts/navbar/navbar.constants';

const desktopNavItemSx = {
  color: 'primary.main',
  fontWeight: 600,
  px: 2,
  position: 'relative',
  // Underline effect
  '&::after': {
    bgcolor: 'secondary.main',
    bottom: 0,
    content: '""',
    height: 3,
    left: 16,
    opacity: 0,
    position: 'absolute',
    right: 16,
    transition: 'opacity 150ms ease',
  },
  '&:hover': {
    bgcolor: 'transparent',
    color: 'text.primary',
  },
  '&.active': {
    color: 'text.primary',
    '&::after': {
      opacity: 1,
    },
  },
} as const;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  // Close mobile UI when crossing the theme's md breakpoint
  useEffect(() => {
    const desktopQuery = window.matchMedia(
      `(min-width: ${theme.breakpoints.values.md}px)`
    );
    const handleDesktopResize = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    desktopQuery.addEventListener('change', handleDesktopResize);
    return () =>
      desktopQuery.removeEventListener('change', handleDesktopResize);
  }, [theme.breakpoints.values.md]);

  return (
    <>
      <AppBar
        elevation={0}
        sx={{
          bgcolor: (theme) => alpha(theme.palette.secondary.light, 0.75),
          backdropFilter: 'blur(4px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ minHeight: `${NAVBAR_HEIGHT}px !important` }}
          >
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              aria-controls={open ? 'mobile-navigation-drawer' : undefined}
              aria-expanded={open}
              onClick={() => setOpen(true)}
              sx={{
                display: { md: 'none' },
                mr: 1,
                borderRadius: 1,
                color: 'primary.main',
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              component={RouterLink}
              to="/"
              sx={{
                alignItems: 'center',
                alignSelf: 'stretch',
                color: 'primary.main',
                display: 'flex',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.025em',
                px: 1.5,
                textDecoration: 'none',
              }}
            >
              BLOGORA
            </Typography>

            <Box
              component="nav"
              aria-label="Primary navigation"
              sx={{
                alignSelf: 'stretch',
                display: { xs: 'none', md: 'flex' },
                ml: 2,
              }}
            >
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  sx={desktopNavItemSx}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box
              component="nav"
              aria-label="Authentication navigation"
              sx={{
                alignSelf: 'stretch',
                display: { xs: 'none', md: 'flex' },
                ml: 'auto',
              }}
            >
              {AUTH_NAV_ITEMS.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  sx={desktopNavItemSx}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Prevents fixed AppBar from covering page content */}
      <Toolbar sx={{ minHeight: `${NAVBAR_HEIGHT}px !important` }} />

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Navbar;
