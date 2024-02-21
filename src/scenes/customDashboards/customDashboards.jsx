import { Box, useTheme, Button, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ProgressCircle from '../../components/ProgressCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';





const CustomDashboards = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  const [dashboards, setDashboards] = useState([]);
  const [tripDashboards, setTripDashboards] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorTripDashboard, setAnchorTripDashboard] = useState(null);
  const [selectedDashboardIndex, setSelectedDashboardIndex] = useState(null);
  const [selectedTripDashboardIndex, setSelectedTripDashboardIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateTripDashboardDialogOpen, setDuplicateTripDashboardDialogOpen] = useState(false);
  const [newDashboardTitle, setNewDashboardTitle] = useState('');
  const [newTripDashboardTitle, setNewTripDashboardTitle] = useState('');
  const [anchorCreateDashboardButton, setAnchorCreateDashboardButton] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCreateDashboardButtonMenuOpen = (event) => {
    setAnchorCreateDashboardButton(event.currentTarget);
  };

  const handleCreateDashboardButtonMenuClose = () => {
    setAnchorCreateDashboardButton(null);
  };

  const handleCreateDashboardButtonOptionsClick = (option) => {
    switch (option) {
      case 'Overview Dashboard':
        navigate('/create-dashboard');
        break;
      case 'Trip Dashboard':
        navigate('/create-trip-dashboard');
        break;
      default:
        break;
    }
  };

  const handleOptionsMenu = (event, index) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDashboardIndex(index);
  };

  const handleTripDashboardOptionsMenu = (event, index) => {
    event.stopPropagation();
    setAnchorTripDashboard(event.currentTarget);
    setSelectedTripDashboardIndex(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleTripDashboardCloseMenu = () => {
    setAnchorTripDashboard(null);
  };

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboards = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.get(
        `${apiUrl}/api/custom-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = response.data;
      setDashboards(data);
      data.forEach((item) => {
        console.log(Object.values(item.layout));
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTripDashboards = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.get(
        `${apiUrl}/api/trip-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = response.data;
      setTripDashboards(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDashboards();
    fetchTripDashboards();
  }, []);

  const handleDeleteDashboard = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const selectedDashboard = dashboards[selectedDashboardIndex];

      await axios.delete(
        `${apiUrl}/api/custom-dashboard/${selectedDashboard.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchDashboards();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }

    handleCloseMenu();
  };

  const handleDeleteTripDashboard = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const selectedTripDashboard = tripDashboards[selectedTripDashboardIndex];

      await axios.delete(
        `${apiUrl}/api/trip-dashboard/${selectedTripDashboard.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchTripDashboards();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
    handleTripDashboardCloseMenu();
  };

  const handleDuplicateDashboard = () => {
    setDuplicateDialogOpen(true);
    handleCloseMenu();
  };

  const handleDuplicateTripDashboard = () => {
    setDuplicateTripDashboardDialogOpen(true);
    handleTripDashboardCloseMenu();
  };

  const handleDuplicateTripDashboardDialogClose = () => {
    setDuplicateTripDashboardDialogOpen(false);
  };

  const handleDuplicateDialogClose = () => {
    setDuplicateDialogOpen(false);
  };


  const handleDuplicateConfirm = async () => {
    setIsLoading(true);
    try {
      const selectedDashboard = dashboards[selectedDashboardIndex];
      const accessToken = await getToken();
      const response = await axios.post(
        `${apiUrl}/api/custom-dashboard`,
        { dashboardTitle: newDashboardTitle, layout: selectedDashboard.layout },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      handleCloseMenu();
      handleDuplicateDialogClose();
      fetchDashboards();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDuplicateTripDashboardConfirm = async () => {
    setIsLoading(true);
    try {
      const selectedTripDashboard = tripDashboards[selectedTripDashboardIndex];
      const accessToken = await getToken();
      const response = await axios.post(
        `${apiUrl}/api/trip-dashboard`,
        { dashboardTitle: newTripDashboardTitle, layout: selectedTripDashboard.layout },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      handleTripDashboardCloseMenu();
      handleDuplicateTripDashboardDialogClose();
      fetchTripDashboards();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOverviewDashboardClick = async (dashboardId) => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.patch(
        `${apiUrl}/api/user`,
        { activeDashboard: dashboardId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.status === 200) {
        setTimeout(() => {
          navigate('/');
        }, 4000); // Delay for 4 seconds (4000 milliseconds)
      } else {
        console.log('Patch request was not successful');
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Dashboard changed");
    }
  };

  const handleOverviewDefaultDashboardClick = async (dashboardId) => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.patch(
        `${apiUrl}/api/user`,
        { activeDashboard: dashboardId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.status === 200) {
        setTimeout(() => {
          navigate('/');
        }, 2000); // Delay for 2 seconds (3000 milliseconds) to make sure the dashboardId is successfully transmitted.
      } else {
        console.log('Patch request was not successful');
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Dashboard changed to default");
    }
  };


  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header subtitle="Dashboards you created are here!" />
        <Button sx={{
          backgroundColor: "#DA291C",
          color: "#FFFFFF",
        }} onClick={handleCreateDashboardButtonMenuOpen}>
          Create a new dashboard
        </Button>
      </Box>

      <Menu
        anchorEl={anchorCreateDashboardButton}
        open={Boolean(anchorCreateDashboardButton)}
        onClose={handleCreateDashboardButtonMenuClose}
      >
        <MenuItem onClick={() => handleCreateDashboardButtonOptionsClick('Overview Dashboard')}>
          Overview Dashboard
        </MenuItem>
        <MenuItem onClick={() => handleCreateDashboardButtonOptionsClick('Trip Dashboard')}>
          Trip Dashboard
        </MenuItem>
      </Menu>


      {/* Overview Dashboard */}

      <Header title="Overview" />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        height="auto"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={2}
        gap={3}
        mb={3}
      >
        <Box
          gridColumn="span 3"
          borderRadius="12px"
          backgroundColor="#1A1825"
          p={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          position="relative"
          onClick={() => handleOverviewDefaultDashboardClick('76f345d6-0a55-4001-811e-61d0356f3f54')}
        >
          <img
            src="dashscreenshot.png"
            alt="Dashboard Screenshot"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          <Box borderRadius="12px" pb={1}
            backgroundColor="#1A1825" textAlign="center">
            <span style={{ color: "#FFFFFF" }}>
              Default
            </span>
          </Box>
        </Box>
        {dashboards.map((dashboard, index) => (
          <Box
            key={index}
            gridColumn="span 3"
            borderRadius="12px"
            backgroundColor="#1A1825"
            p={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            position="relative"
            onClick={() => handleOverviewDashboardClick(dashboard.id)}
          >
            <img
              src="dashscreenshot.png"
              alt="Dashboard Screenshot"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
            <Box borderRadius="12px" pb={1}
              backgroundColor="#1A1825" textAlign="center">
              <span style={{ color: "#FFFFFF" }}>
                {dashboard.dashboardTitle}
              </span>
            </Box>
            <Box
              position="absolute"
              top={0}
              right={0}
              padding={1}
            >
              <IconButton
                style={{ color: "#FFFFFF" }}
                onClick={(event) => handleOptionsMenu(event, index)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        ))}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleDeleteDashboard}>
            <DeleteIcon sx={{ color: colors.greenAccent[600] }} />
            Delete
          </MenuItem>
          <MenuItem onClick={handleDuplicateDashboard}>
            <FileCopyIcon sx={{ color: colors.greenAccent[600] }} />
            Duplicate
          </MenuItem>
        </Menu>
        <Dialog open={duplicateDialogOpen} onClose={handleDuplicateDialogClose}>
          <DialogTitle>Duplicated Dashboard Title</DialogTitle>
          <DialogContent>
            <TextField
              label="Enter Dashboard Title"
              value={newDashboardTitle}
              onChange={(e) => setNewDashboardTitle(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleDuplicateDialogClose}>Cancel</Button>
            <Button variant="contained" style={{
              backgroundColor: "#DA291C",
              color: "#FFFFFF",
              marginLeft: "8px"
            }} onClick={handleDuplicateConfirm}>Duplicate</Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Trip Details Dashboard */}

      <Header title="Trips" />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        height="auto"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={2}
        gap={3}
      >
        <Box
          gridColumn="span 3"
          borderRadius="12px"
          backgroundColor="#1A1825"
          p={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          position="relative"
        >
          <img
            src="tripdashscreenshot.png"
            alt="Dashboard Screenshot"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          <Box borderRadius="12px" pb={1}
            backgroundColor="#1A1825" textAlign="center">
            <span style={{ color: "#FFFFFF" }}>
              Default
            </span>
          </Box>
        </Box>
        {tripDashboards.map((dashboard, index) => (
          <Box
            key={index}
            gridColumn="span 3"
            borderRadius="12px"
            backgroundColor="#1A1825"
            p={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            position="relative"
          >
            <img
              src="tripdashscreenshot.png"
              alt="Dashboard Screenshot"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
            <Box borderRadius="12px" pb={1}
              backgroundColor="#1A1825" textAlign="center">
              <span style={{ color: "#FFFFFF" }}>
                {dashboard.dashboardTitle}
              </span>
            </Box>
            <Box
              position="absolute"
              top={0}
              right={0}
              padding={1}
            >
              <IconButton
                style={{ color: "#FFFFFF" }}
                onClick={(event) => handleTripDashboardOptionsMenu(event, index)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        ))}

        <Menu
          anchorEl={anchorTripDashboard}
          open={Boolean(anchorTripDashboard)}
          onClose={handleTripDashboardCloseMenu}
        >
          <MenuItem onClick={handleDeleteTripDashboard}>
            <DeleteIcon sx={{ color: colors.greenAccent[600] }} />
            Delete
          </MenuItem>
          <MenuItem onClick={handleDuplicateTripDashboard}>
            <FileCopyIcon sx={{ color: colors.greenAccent[600] }} />
            Duplicate
          </MenuItem>
        </Menu>
        <Dialog open={duplicateTripDashboardDialogOpen} onClose={handleDuplicateTripDashboardDialogClose}>
          <DialogTitle>Duplicated Dashboard Title</DialogTitle>
          <DialogContent>
            <TextField
              label="Enter Dashboard Title"
              value={newTripDashboardTitle}
              onChange={(e) => setNewTripDashboardTitle(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleDuplicateTripDashboardDialogClose}>Cancel</Button>
            <Button variant="contained" style={{
              backgroundColor: "#DA291C",
              color: "#FFFFFF",
              marginLeft: "8px"
            }} onClick={handleDuplicateTripDashboardConfirm}>Duplicate</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CustomDashboards;
