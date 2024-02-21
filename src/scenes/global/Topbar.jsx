import { Box, IconButton, Menu, MenuItem, ListItemIcon, useTheme, Typography } from "@mui/material";
import { useState, useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMsal } from "@azure/msal-react";
import { useNavigate, useLocation } from 'react-router-dom';
import VehicleSelector from "../../components/VehicleSelector";
import DriveEtaOutlinedIcon from '@mui/icons-material/DriveEtaOutlined';
import { useGridContext } from '../../GridContext';



const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isGridChanged, handleAttemptedNavigation } = useGridContext();


  const handleProfileIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleNavigation = (path) => {
    if (!isGridChanged) {
      navigate(path);
      handleClose();
    } else {
      handleAttemptedNavigation();
    }
  };

  const { instance } = useMsal();
  let activeAccount;
  if (instance) {
    activeAccount = instance.getActiveAccount();
  }
  const handleLogoutRedirect = () => {
    localStorage.removeItem('selectedTripIds');
    instance.logoutRedirect();
  };

  const pages = {
    '/': 'My Overview',
    '/recorded-trips': 'Recorded Trips',
    '/compare-trips': 'Compare Trips',
    '/errors': 'Errors',
    '/vehicles': 'Vehicles',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/add-vehicle': "Add a new vehicle",
    '/journee-dashboards': "Journee Dashboards",
    '/create-dashboard': "Create Dashboard",
    '/about': "About",
    '/download-data': "Download Your Data",
    '/create-trip-dashboard': "Create Dashboard",
    '/help': "Help",
    '/gdpr': "GDPR Agreements",
    '/terms-and-conditions': "Terms and Conditions",
    '/legal-statements': "Legal Statements"
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box display="flex" justifyContent="center" alignItems="center" borderRadius="3px">
        <Typography variant="h2" mr={2} fontWeight="bold">{pages[location.pathname]}</Typography>
        {!location.pathname.startsWith('/trip-details/') && location.pathname !== '/add-vehicle' && location.pathname !== '/journee-dashboards' && location.pathname !== '/create-dashboard' && location.pathname !== '/vehicles' && location.pathname !== '/profile' && location.pathname !== '/settings' && location.pathname !== '/help' && location.pathname !== '/create-trip-dashboard' && location.pathname !== '/about' && location.pathname !== '/webportal-permissions' && location.pathname !== '/download-data' && location.pathname !== '/gdpr' && location.pathname !== '/terms-and-conditions' && location.pathname !== '/legal-statements' && <VehicleSelector />}
      </Box>

      {/* ICONS */}
      <Box>
        <IconButton onClick={handleLogoutRedirect}
          variant="warning"
          drop="start"
          title={
            activeAccount && activeAccount.username
              ? "Log out as " + activeAccount.username
              : "Unknown"
          } >
          <LogoutIcon />
        </IconButton>
        <IconButton title="Profile" onClick={handleProfileIconClick}>
          <AccountCircleOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <ListItemIcon>
              <AccountCircleOutlinedIcon sx={{ color: colors.greenAccent[600] }} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/vehicles')}>
            <ListItemIcon>
              <DriveEtaOutlinedIcon sx={{ color: colors.greenAccent[600] }} />
            </ListItemIcon>
            Vehicles</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
