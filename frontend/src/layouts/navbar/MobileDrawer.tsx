import { NavLink } from 'react-router';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import {
  NAVBAR_HEIGHT,
  PRIMARY_NAV_ITEMS,
  AUTH_NAV_ITEMS,
} from '@/layouts/navbar/navbar.constants';

// Main visual customization points for the mobile drawer
const DRAWER_WIDTH = 240;
// Match MUI Container's default gutters so both hamburger and close buttons stay aligned
const DRAWER_PADDING = { xs: 2, sm: 3 };

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const MobileDrawer = ({ open, onClose }: MobileDrawerProps) => {
  const renderNavigationItems = (
    items: typeof PRIMARY_NAV_ITEMS | typeof AUTH_NAV_ITEMS
  ) =>
    items.map((item) => (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          component={NavLink}
          to={item.path}
          onClick={onClose}
          sx={{
            borderRadius: 1,
            color: 'primary.main',
            p: 1.5,
            '&:hover': {
              color: 'text.primary',
            },
            '&.active': {
              bgcolor: (theme) => alpha(theme.palette.secondary.light, 0.5),
              color: 'text.primary',
            },
          }}
        >
          <Typography fontWeight={600} sx={{ ml: 1 }}>
            {item.label}
          </Typography>
        </ListItemButton>
      </ListItem>
    ));

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 2,
          sx: {
            bgcolor: 'background.default',
            width: DRAWER_WIDTH,
          },
        },
      }}
    >
      <Box
        id="mobile-navigation-drawer"
        component="nav"
        aria-label="Mobile navigation"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          px: DRAWER_PADDING,
          pb: `calc(${DRAWER_PADDING.xs * 8}px + env(safe-area-inset-bottom))`,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: NAVBAR_HEIGHT,
            mb: 1,
          }}
        >
          <IconButton
            edge="start"
            aria-label="Close navigation menu"
            onClick={onClose}
            sx={{ borderRadius: 1, color: 'primary.main' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List
          disablePadding
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {renderNavigationItems(PRIMARY_NAV_ITEMS)}
        </List>

        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ mb: 1 }} />
          <List disablePadding>{renderNavigationItems(AUTH_NAV_ITEMS)}</List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
