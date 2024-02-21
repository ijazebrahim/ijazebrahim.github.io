import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Avatar } from "@mui/material";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import GridViewIcon from "@mui/icons-material/GridView";
import axios from "axios";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import { useMsal } from "@azure/msal-react";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { useGridContext } from "../../GridContext";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const { isGridChanged, handleAttemptedNavigation } = useGridContext();

  const handleClick = () => {
    if (!isGridChanged) {
      setSelected(title);
      navigate(to);
    } else {
      handleAttemptedNavigation();
    }
  };

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={handleClick}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const Sidebar = ({ setIsSidebarCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [compareTripCount, setCompareTripCount] = useState(0);
  const location = useLocation();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleToggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setIsSidebarCollapsed(newCollapsedState);
  };

  const { instance } = useMsal();
  let activeAccount;
  if (instance) {
    activeAccount = instance.getActiveAccount();
  }

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { // Update compare trip count when local storage is updated
    const updateCompareTripCount = () => {
      const storedTripIds = JSON.parse(
        localStorage.getItem("selectedTripIds") || "[]"
      );
      setCompareTripCount(storedTripIds.length);
    };

    updateCompareTripCount();
    window.addEventListener("local-storage-update", updateCompareTripCount);

    return () => {
      window.removeEventListener(
        "local-storage-update",
        updateCompareTripCount
      );
    };
  }, []);

  const renderCompareTripsIcon = () => (  // Render compare trips icon with count
    <Box position="relative">
      <CompareArrowsOutlinedIcon />
      {compareTripCount > 0 && (
        <Box
          position="absolute"
          bottom="-1px"
          right="-5px"
          bgcolor="#B7BF10"
          width="15px"
          height="15px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          sx={{
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
          }}
        >
          <Typography variant="caption" color="white">
            {compareTripCount}
          </Typography>
        </Box>
      )}
    </Box>
  );
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getToken();
        await axios.post(`${apiUrl}/api/user`, null, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setSelected("Overview");
    } else if (path === "/recorded-trips") {
      setSelected("Recorded Trips");
    } else if (path === "/compare-trips") {
      setSelected("Compare Trips");
    } else if (path === "/errors") {
      setSelected("Errors");
    } else if (path === "/settings") {
      setSelected("Settings");
    } else if (path === "/profile") {
      setSelected(null);
    } else if (path === "/vehicles") {
      setSelected(null);
    } else if (path === "/create-dashboard") {
      setSelected(null);
    } else if (path === "/journee-dashboards") {
      setSelected("Custom Dashboards");
    } else if (path === "/help") {
      setSelected("Help");
    }
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getToken();
        const response = await axios.get(`${apiUrl}/api/user`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        setProfileImage(response.data.profilePictureUrl);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [apiUrl, isCollapsed]);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: "#25222F",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#B7BF10 !important",
          backgroundColor: "#312F3C !important",
          borderRadius: "12px",
        },
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        style={{ height: "100vh", position: "fixed" }}
      >
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={handleToggleSidebar}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="50px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  JOURNEE
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <IconButton>
                  <Avatar
                    alt={activeAccount.idTokenClaims.given_name}
                    src={profileImage}
                    style={{
                      width: 80,
                      height: 80,
                      cursor: "pointer",
                      borderRadius: "50%",
                    }}
                  />
                </IconButton>
              </Box>
              <Box textAlign="center">
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {activeAccount.username}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"} display='flex' flexDirection='column' minHeight={isCollapsed ? '84vh' : undefined}>
            <Box flex={isCollapsed ? 1 : 0}>
              <Item
                title="Overview"
                to="/"
                icon={<DirectionsCarOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                {/* Trips */}
              </Typography>
              <Item
                title="Recorded Trips"
                to="/recorded-trips"
                icon={<RoomOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Compare Trips"
                to="/compare-trips"
                icon={renderCompareTripsIcon()} // Render compare trips icon with count
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Errors"
                to="/errors"
                icon={<ReportProblemOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box width={isCollapsed ? "100%" : "90%"} display='flex' flexDirection='column' mb='-10px'>
              <Item
                title="Journee Dashboards"
                to="/journee-dashboards"
                icon={<GridViewIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Help"
                to="/help"
                icon={< HelpOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Settings"
                to="/settings"
                icon={<SettingsOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
