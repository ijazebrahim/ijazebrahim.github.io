import {
  Box,
  Typography,
  Dialog,
  useTheme,
  IconButton,
  Slider, TextField, Drawer, List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { tokens } from "../../theme";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTime";
import CircleIcon from "@mui/icons-material/Circle";
import LineChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import {
  LandscapeOutlined,
  LocalGasStationOutlined,
} from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import LineChartDefault from "../../components/LineChartDefault";
import BarChartDefault from "../../components/BarChartDefault";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import PropaneOutlinedIcon from "@mui/icons-material/PropaneOutlined";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import PieChart from "../../components/PieChart";
import SaveIcon from '@mui/icons-material/Save';
import { useState } from "react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ProgressCircle from '../../components/ProgressCircle';
import axios from "axios";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SpeedIcon from '@mui/icons-material/Speed';
import { DonutLargeOutlined } from "@mui/icons-material";




const ResponsiveGridLayout = WidthProvider(Responsive);


const CreateTripDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const movingTime = 12;
  const timeInTraffic = 12;
  const idleTime = 12;
  const totalTime = movingTime + timeInTraffic + idleTime;
  const [errorMessage, setErrorMessage] = useState('');
  const [dashboardTitle, setDashboardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startLevelFontSize, setStartLevelFontSize] = useState('12px');
  const [endLevelFontSize, setEndLevelFontSize] = useState('12px');
  const [fuelSpentFontSize, setFuelSpentFontSize] = useState('12px');
  const [avgSpeedFontSize, setAvgSpeedFontSize] = useState('12px');
  const [maxSpeedFontSize, setMaxSpeedFontSize] = useState('12px');
  const [minSpeedFontSize, setMinSpeedFontSize] = useState('12px');
  const [maxElevationFontSize, setMaxElevationFontSize] = useState('12px');
  const [minElevationFontSize, setMinElevationFontSize] = useState('12px');
  const [elevationGainFontSize, setElevationGainFontSize] = useState('12px');
  const [tripCostSummaryFontSize, setTripCostSummaryFontSize] = useState('12px');
  const [tripDistanceSummaryFontSize, setTripDistanceSummaryFontSize] = useState('12px');
  const [fuelConsumptionSummaryFontSize, setFuelConsumptionSummaryFontSize] = useState('12px');
  const [tripDurationSummaryFontSize, setTripDurationSummaryFontSize] = useState('12px');
  const [fuelSpentSummaryFontSize, setFuelSpentSummaryFontSize] = useState('12px');
  const [avgSpeedSummaryFontSize, setAvgSpeedSummaryFontSize] = useState('12px');
  const [isMenuOpen, setMenuOpen] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
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

  const [layout, setLayout] = useState([
    // { w: 3, h: 2, x: 0, y: 0, i: 'timeGrid' },
    // { w: 1, h: 1, x: 3, y: 0, i: 'tripCostSummaryCard' },
    // { w: 1, h: 1, x: 4, y: 0, i: 'tripDistanceSummaryCard' },
    // { w: 1, h: 1, x: 5, y: 0, i: 'fuelConsumptionSummaryCard' },
    // { w: 1, h: 1, x: 6, y: 0, i: 'tripDurationSummaryCard' },
    // { w: 1, h: 1, x: 7, y: 0, i: 'fuelSpentSummaryCard' },
    // { w: 1, h: 1, x: 8, y: 0, i: 'avgSpeedSummaryCard' },
    // { w: 6, h: 4, x: 3, y: 1, i: 'mapGrid' },
    // { w: 3, h: 2, x: 0, y: 3, i: 'fuelConsumptionGrid' },
    // { w: 3, h: 3, x: 0, y: 2, i: 'fuelLevelGraphicGrid' },
    // { w: 3, h: 2, x: 3, y: 5, i: 'speedGraphicGrid' },
    // { w: 3, h: 2, x: 6, y: 5, i: 'elevationGainGraphicGrid' },
    // { w: 1, h: 1, x: 0, y: 7, i: 'startLevelCard' },
    // { w: 1, h: 1, x: 1, y: 7, i: 'endLevelCard' },
    // { w: 1, h: 1, x: 2, y: 7, i: 'fuelSpentCard' },
    // { w: 1, h: 1, x: 3, y: 7, i: 'avgSpeedCard' },
    // { w: 1, h: 1, x: 4, y: 7, i: 'maxSpeedCard' },
    // { w: 1, h: 1, x: 5, y: 7, i: 'minSpeedCard' },
    // { w: 1, h: 1, x: 6, y: 7, i: 'maxElevationCard' },
    // { w: 1, h: 1, x: 7, y: 7, i: 'minElevationCard' },
    // { w: 1, h: 1, x: 8, y: 7, i: 'elevationGainCard' },
    // { w: 3, h: 2, x: 0, y: 7, i: 'ambientTempGrid' },
    // { w: 6, h: 2, x: 3, y: 7, i: 'coolantTempGrid' }
  ]);

  const breakpoints = {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: Infinity,
  };

  const cols = {
    xs: 4,
    sm: 6,
    md: 9,
    lg: 9,
    xl: 9,
  };

  const customEndMarker = new L.Icon({
    iconUrl:
      "https://driveinsightsstorage.blob.core.windows.net/driveinsightscontainer/LocationEndMarker.png",
    iconAnchor: [16, 16],
  });

  const customStartMarker = new L.Icon({
    iconUrl:
      "https://driveinsightsstorage.blob.core.windows.net/driveinsightscontainer/LocationStartMarker.png",
    iconAnchor: [2, 8],
  });

  const points = [
    [36.8529, -75.978], // Virginia Beach, Virginia
    [35.7796, -78.6382], // Raleigh, North Carolina
    [34.0007, -81.0348], // Columbia, South Carolina
    [33.749, -84.388], // Atlanta, Georgia
    [32.3792, -86.3077], // Montgomery, Alabama
    [30.4383, -84.2807], // Tallahassee, Florida
  ];

  const handleLayoutChange = (layout) => {
    setLayout(layout);

    const scalingFactor = 30;
    const baseFontSize = 12;

    const getFontSize = (h) => {
      return baseFontSize + h * scalingFactor;
    };

    if (layout.length > 0) {
      const gridItemIdsToUpdate = [
        'tripCostSummaryCard',
        'tripDistanceSummaryCard',
        'fuelConsumptionSummaryCard',
        'tripDurationSummaryCard',
        'fuelSpentSummaryCard',
        'avgSpeedSummaryCard',
        'startLevelCard',
        'endLevelCard',
        'fuelSpentCard',
        'avgSpeedCard',
        'maxSpeedCard',
        'minSpeedCard',
        'maxElevationCard',
        'minElevationCard',
        'elevationGainCard',
      ];
      gridItemIdsToUpdate.forEach((itemId) => {
        const gridItem = layout.find((item) => item.i === itemId);
        if (gridItem) {
          const updatedFontSize = getFontSize(gridItem.h);
          switch (itemId) {
            case 'tripCostSummaryCard':
              setTripCostSummaryFontSize(updatedFontSize);
              break;
            case 'tripDistanceSummaryCard':
              setTripDistanceSummaryFontSize(updatedFontSize);
              break;
            case 'fuelConsumptionSummaryCard':
              setFuelConsumptionSummaryFontSize(updatedFontSize);
              break;
            case 'tripDurationSummaryCard':
              setTripDurationSummaryFontSize(updatedFontSize);
              break;
            case 'fuelSpentSummaryCard':
              setFuelSpentSummaryFontSize(updatedFontSize);
              break;
            case 'avgSpeedSummaryCard':
              setAvgSpeedSummaryFontSize(updatedFontSize);
              break;
            case 'startLevelCard':
              setStartLevelFontSize(updatedFontSize);
              break;
            case 'endLevelCard':
              setEndLevelFontSize(updatedFontSize);
              break;
            case 'fuelSpentCard':
              setFuelSpentFontSize(updatedFontSize);
              break;
            case 'avgSpeedCard':
              setAvgSpeedFontSize(updatedFontSize);
              break;
            case 'maxSpeedCard':
              setMaxSpeedFontSize(updatedFontSize);
              break;
            case 'minSpeedCard':
              setMinSpeedFontSize(updatedFontSize);
              break;
            case 'maxElevationCard':
              setMaxElevationFontSize(updatedFontSize);
              break;
            case 'minElevationCard':
              setMinElevationFontSize(updatedFontSize);
              break;
            case 'elevationGainCard':
              setElevationGainFontSize(updatedFontSize);
              break;
          }
        }
      });
    }
  };

  const handleSaveIconClick = async () => {

    if (!dashboardTitle) {
      setErrorMessage('Title is needed!');
      return;
    }

    if (layout.length === 0) {
      setErrorMessage("Add at least one widget to the view");
      return;
    }

    setIsLoading(true);

    const requestBody = {
      dashboardTitle,
      layout
    };

    const accessToken = await getToken();

    axios.post(`${apiUrl}/api/trip-dashboard`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(response => {
        // Handle successful response
        console.log('Save request successful');
        navigate('/journee-dashboards')
      })
      .catch(error => {
        // Handle error
        console.error('Save request error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTextFieldChange = (event) => {
    setDashboardTitle(event.target.value);
    setErrorMessage('');
  };

  const addTimeGridToLayout = (gridKey) => {
    if (!layout.some((item) => item.i === gridKey)) {
      const newGridItem = {
        i: gridKey,
        x: 0,
        y: 0,
        w: 4,
        h: 2,
      };
      setLayout((prevLayout) => [...prevLayout, newGridItem]);
    }
  };

  const addMapGridToLayout = (gridKey) => {
    if (!layout.some((item) => item.i === gridKey)) {
      const newGridItem = {
        i: gridKey,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      };
      setLayout((prevLayout) => [...prevLayout, newGridItem]);
    }
  };

  const addAnyCardsGridToLayout = (gridKey) => {
    if (!layout.some((item) => item.i === gridKey)) {
      const newGridItem = {
        i: gridKey,
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      };
      setLayout((prevLayout) => [...prevLayout, newGridItem]);
    }
  };

  const addAnyChartsGridToLayout = (gridKey) => {
    if (!layout.some((item) => item.i === gridKey)) {
      const newGridItem = {
        i: gridKey,
        x: 0,
        y: 0,
        w: 4,
        h: 2,
      };
      setLayout((prevLayout) => [...prevLayout, newGridItem]);
    }
  };

  const removeAnyGridFromLayout = (gridKey) => {
    const updatedLayout = layout.filter((item) => item.i !== gridKey);
    setLayout(updatedLayout);
  };


  return (
    <Box m="20px">

      <ProgressCircle isLoading={isLoading} />
      {/* HEADER */}
      <Box display="flex" justifyContent="flex-start" >
        <IconButton onClick={() => navigate("/journee-dashboards")} >
          <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
        </IconButton>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        borderRadius="12px"
        backgroundColor="#25222F"
        minHeight="100vh"
        overflow="auto"
      >
        <Box
          gridColumn="span 12"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p="8px 0px 0px 8px"
        >
          <Box
            position="relative"
            borderRadius="12px"
          >
            <TextField
              label="Name Dashboard"
              variant="outlined"
              style={{ margin: '1rem', width: '100%' }}
              value={dashboardTitle}
              onChange={handleTextFieldChange}
            />

            {errorMessage && (
              <Typography variant="body2" color="error">
                {errorMessage}
              </Typography>
            )}
          </Box>
          <Box style={{ marginLeft: "auto" }}>
            <IconButton title="Add widgets" onClick={toggleMenu}>
              <AddIcon />
            </IconButton>
            <IconButton title="Save Dashboard" onClick={handleSaveIconClick}>
              <SaveIcon />
            </IconButton>
          </Box>
        </Box>

        <ResponsiveGridLayout className="layout"
          layouts={{ lg: layout }} breakpoints={breakpoints}
          cols={cols} onLayoutChange={handleLayoutChange}
        >

          {/* TIME GRID */}

          {layout.map((gridItem) => {
            if (gridItem.i === 'timeGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                  overflow="hidden"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <AccessTimeOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight="600"
                        color={colors.grey[100]}
                      >
                        TIME
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box display="flex" flexDirection="row" justifyContent="center">
                    <Box position="relative" height="250px" width="50%">
                      <PieChart />
                    </Box>
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      mr={4}
                    >
                      <Box display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon sx={{ color: "#FFFF00", fontSize: "26px" }} />
                          <Typography variant="subtitle1">65%</Typography>
                        </Box>
                        <Box ml={2}>
                          <Typography color="#B7A7B4">Moving Time</Typography>
                          <Typography variant="h3">00:20:00</Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon sx={{ color: "#FF0000", fontSize: "26px" }} />
                          <Typography variant="subtitle1">30%</Typography>
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">Time in Traffic</Typography>
                          <Typography variant="h3">00:11:00</Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon sx={{ color: "#4298B5", fontSize: "26px" }} />
                          <Typography variant="subtitle1">05%</Typography>
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">Idle Time</Typography>
                          <Typography variant="h3">00:00:06</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            }

            {/* Trip Summary Cards */ }

            if (gridItem.i === 'tripCostSummaryCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box >
                    <Typography style={{ fontSize: tripCostSummaryFontSize }} display="inline" color="#FFFFFF" fontWeight="800">
                      86
                    </Typography>
                    <Typography style={{ fontSize: `${tripCostSummaryFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${tripCostSummaryFontSize / 3}px` }} color="#828282">
                      Max Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'tripDistanceSummaryCard') {
              return (
                <Box
                  key="tripDistanceSummaryCard"
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box >
                    <Typography style={{ fontSize: tripDistanceSummaryFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      40
                    </Typography>
                    <Typography style={{ fontSize: `${tripDistanceSummaryFontSize / 3}px` }} display="inline" alignItems="center" color={colors.greenAccent[500]}  >
                      km
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${tripDistanceSummaryFontSize / 3}px` }} color="#828282">
                      Trip Distance
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelConsumptionSummaryCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography style={{ fontSize: fuelConsumptionSummaryFontSize }} display="inline" color={colors.grey[100]} fontWeight="800">
                      56
                    </Typography>
                    <Typography style={{ fontSize: `${fuelConsumptionSummaryFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}>l</Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${fuelConsumptionSummaryFontSize / 3}px` }} color="#828282">Fuel Consumption</Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'tripDurationSummaryCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box >
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: tripDurationSummaryFontSize }}
                    >
                      56
                    </Typography>
                    <Typography style={{ fontSize: `${tripDurationSummaryFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${tripDurationSummaryFontSize / 3}px` }} color="#828282">
                      Trip Duration
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelSpentSummaryCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box >
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: fuelSpentSummaryFontSize }}
                    >
                      13
                    </Typography>
                    <Typography style={{ fontSize: `${fuelSpentSummaryFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${fuelSpentSummaryFontSize / 3}px` }} color="#828282">
                      Fuel Spent
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'avgSpeedSummaryCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  postion="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box >
                    <Typography style={{ fontSize: avgSpeedSummaryFontSize }} fontWeight="800" display="inline">
                      96
                    </Typography>
                    <Typography style={{ fontSize: `${avgSpeedSummaryFontSize / 3}px` }} color={colors.greenAccent[500]} display="inline">
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${avgSpeedSummaryFontSize / 3}px` }} color="#828282">
                      Avg. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }

            {/* MAP GRID */ }

            if (gridItem.i === 'mapGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                  overflow="hidden"
                  position="relative"
                >
                  <IconButton
                    aria-label="delete"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: 'white',
                      zIndex: 1000
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon sx={{ color: colors.grey[100], fontSize: "26px" }} />
                  </IconButton>
                  <Box >
                    <MapContainer
                      attributionControl={false}
                      center={[33.749, -84.388]}
                      zoom={5}
                      style={{ borderRadius: "12px 12px 0px 0px", height: "360px" }}
                      dragging={false}
                    >
                      <TileLayer url="https://atlas.microsoft.com/map/tile/png?api-version=1&layer=basic&style=dark&tileSize=512&view=Auto&zoom={z}&x={x}&y={y}&subscription-key=6vuNs7oLJKeZR-z9RUSKw0wlXtq6oTjBB-_t9BWPwhU" />
                      <Polyline positions={points} color="red" />
                      <Marker position={points[0]} icon={customStartMarker}>
                        <Popup>Start</Popup>
                      </Marker>
                      <Marker
                        position={points[points.length - 1]}
                        icon={customEndMarker}
                      >
                        <Popup>End</Popup>
                      </Marker>
                    </MapContainer>
                    <Slider
                      sx={{ m: "12px 0px 12px 0px", color: "red" }}
                      defaultValue={50}
                      aria-label="Default"
                    />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gridAutoRows="60px"
                      gap="10px"
                      borderRadius="12px"
                      p={1}
                    >
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            23
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>Km/h</Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            07
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>l/100Km</Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            123
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>m</Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            1007
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>kW</Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            18
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>c</Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            93
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>c</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gridAutoRows="60px"
                      gap="10px"
                      borderRadius="12px"
                      p={1}
                    >
                      {/* ROW 1 */}
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <SpeedOutlinedIcon
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Speed History
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <LocalGasStationOutlinedIcon
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Fuel History
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <LandscapeOutlined
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Elevation History
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <PropaneOutlinedIcon
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Engine
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <DeviceThermostatOutlinedIcon
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Ambient Temperature
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        gridColumn="span 2"
                        backgroundColor="#312F3C"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="12px"
                      >
                        <Box
                          m={2}
                          gap={1}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <DeviceThermostatOutlinedIcon
                            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                          />
                          <Typography variant="h6" fontWeight="400">
                            Coolant Temperature
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            }

            {/* FUEL CONSUMPTION GRAPH */ }

            if (gridItem.i === 'fuelConsumptionGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="l/100km" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }

            {/* FUEL LEVEL GRAPHIC GRID */ }

            if (gridItem.i === 'fuelLevelGraphicGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="l/100km" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }

            {/* SPEED GRAPHIC */ }

            if (gridItem.i === 'speedGraphicGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SpeedOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="km/h" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }

            {/* ELEVATION GAIN GRAPHIC */ }

            if (gridItem.i === 'elevationGainGraphicGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LandscapeOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="m" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }

            {/* Cards Grid */ }

            if (gridItem.i === 'startLevelCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: startLevelFontSize }} display="inline" color="#FFFFFF" fontWeight="800">
                      86
                    </Typography>
                    <Typography style={{ fontSize: `${startLevelFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${startLevelFontSize / 3}px` }} color="#828282">
                      Start Level
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'endLevelCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: endLevelFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      26
                    </Typography>
                    <Typography style={{ fontSize: `${endLevelFontSize / 3}px` }} display="inline" alignItems="center" color={colors.greenAccent[500]}  >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${endLevelFontSize / 3}px` }} color="#828282">
                      End Level
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelSpentCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box>
                    <Typography style={{ fontSize: fuelSpentFontSize }} display="inline" color={colors.grey[100]} fontWeight="800">
                      60
                    </Typography>
                    <Typography style={{ fontSize: `${fuelSpentFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}>l</Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${fuelSpentFontSize / 3}px` }} color="#828282">Fuel Spent</Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'avgSpeedCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: avgSpeedFontSize }}
                    >
                      86
                    </Typography>
                    <Typography style={{ fontSize: `${avgSpeedFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${avgSpeedFontSize / 3}px` }} color="#828282">
                      Avg. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }


            if (gridItem.i === 'maxSpeedCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: maxSpeedFontSize }}
                    >
                      60
                    </Typography>
                    <Typography style={{ fontSize: `${maxSpeedFontSize / 3}px` }} display="inline" color={colors.greenAccent[500]}  >
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${maxSpeedFontSize / 3}px` }} color="#828282">
                      Max Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }


            if (gridItem.i === 'minSpeedCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: minSpeedFontSize }} fontWeight="800" display="inline">
                      126
                    </Typography>
                    <Typography style={{ fontSize: `${minSpeedFontSize / 3}px` }} color={colors.greenAccent[500]} display="inline">
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${minSpeedFontSize / 3}px` }} color="#828282">
                      Min. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }


            if (gridItem.i === 'maxElevationCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: maxElevationFontSize }} fontWeight="800" display="inline">
                      1306
                    </Typography>
                    <Typography style={{ fontSize: `${maxElevationFontSize / 3}px` }} color={colors.greenAccent[500]} display="inline">
                      m
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${maxElevationFontSize / 3}px` }} color="#828282">
                      Max Elevation
                    </Typography>
                  </Box>
                </Box>
              );
            }


            if (gridItem.i === 'minElevationCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: minElevationFontSize }} fontWeight="800" display="inline">
                      126
                    </Typography>
                    <Typography style={{ fontSize: `${minElevationFontSize / 3}px` }} color={colors.greenAccent[500]} display="inline">
                      m
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${minElevationFontSize / 3}px` }} color="#828282">
                      Min Elevation
                    </Typography>
                  </Box>
                </Box>
              );
            }


            if (gridItem.i === 'elevationGainCard') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#312F3C"
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Box >
                    <Typography style={{ fontSize: elevationGainFontSize }} fontWeight="800" display="inline">
                      1306
                    </Typography>
                    <Typography style={{ fontSize: `${elevationGainFontSize / 3}px` }} color={colors.greenAccent[500]} display="inline">
                      m
                    </Typography>
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: `${elevationGainFontSize / 3}px` }} color="#828282">
                      Elevation Gain
                    </Typography>
                  </Box>
                </Box>
              );
            }

            {/* AMBIENT TEMPERATURE GRAPHIC */ }

            if (gridItem.i === 'ambientTempGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="c" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }

            {/* COOLANT TEMPERATURE GRAPHIC */ }

            if (gridItem.i === 'coolantTempGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="c" />
                  </Box>
                  <Dialog>
                    <Box p={2} display="flex" justifyContent="space-between">
                      <IconButton>
                        <LineChartIcon />
                      </IconButton>
                      <IconButton>
                        <BarChartIcon />
                      </IconButton>
                    </Box>
                  </Dialog>
                </Box>
              );
            }
            // Custom Journee Dashboard Requirement

            if (gridItem.i === 'fuelLevelGraphicBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="l/100km" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelLevelGraphicLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="l/100km" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelConsumptionBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="l/100km" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelConsumptionLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LocalGasStationOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="l/100km" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'speedGraphicBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SpeedOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="km/h" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'speedGraphicLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <SpeedOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="km/h" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'elevationGainGraphicBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LandscapeOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="m" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'elevationGainGraphicLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <LandscapeOutlined
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="m" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'ambientTempBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="c" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'ambientTempLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="c" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'coolantTempBarChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartDefault axisLeftLegend="c" />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'coolantTempLineChartGrid') {
              return (
                <Box
                  key={gridItem.i}
                  backgroundColor="#292734"
                  borderRadius="12px"
                  border={1}
                  borderColor="#312F3C"
                >
                  <Box
                    mt="25px"
                    p="0 30px"
                    display="flex "
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <DeviceThermostatOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartDefault axisLeftLegend="c" />
                  </Box>
                </Box>
              );
            }

            return null;
          })}
        </ResponsiveGridLayout>
        <Drawer open={isMenuOpen} onClose={toggleMenu}>
          <List>
            {/* "Charts" column */}
            <ListItem>
              <ListItemText primary="Charts" />
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <LocalGasStationIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Level Graphic" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('fuelLevelGraphicBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('fuelLevelGraphicLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <LocalGasStationIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Consumption" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('fuelConsumptionBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('fuelConsumptionLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText primary="Speed Graphic" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('speedGraphicBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('speedGraphicLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <LandscapeOutlined />
              </ListItemIcon>
              <ListItemText primary="Elevation Gain Graphic" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('elevationGainGraphicBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('elevationGainGraphicLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <DeviceThermostatOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Ambient Temperature Graphic" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('ambientTempBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('ambientTempLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <DeviceThermostatOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Coolant Temperature Graphic" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('coolantTempBarChartGrid')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('coolantTempLineChartGrid')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <AccessTimeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Time" />
              <IconButton onClick={() => addTimeGridToLayout('timeGrid')}>
                <DonutLargeOutlined />
              </IconButton>
            </ListItem>

            {/* Map Column */}

            <ListItem button onClick={() => addMapGridToLayout('mapGrid')}>
              <ListItemText primary="Map View" />
            </ListItem>

            {/* "Cards" column */}
            <ListItem>
              <ListItemText primary="Cards" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('tripCostSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Max Speed" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('tripDistanceSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Trip Distance" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('fuelConsumptionSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Consumption" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('tripDurationSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Trip Duration" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('fuelSpentSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Spent" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('avgSpeedSummaryCard')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Avg Speed" />
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </Box>
  );
};

export default CreateTripDashboard;
