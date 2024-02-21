import {
  Box,
  IconButton,
  Typography,
  useTheme,
  TextField, Button, List, ListItem, ListItemIcon, ListItemText, Drawer,
} from "@mui/material";
import { tokens } from "../../theme";
import CircleIcon from "@mui/icons-material/Circle";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTime";
import BarChart from "../../components/BarChart";
import LineChart from "../../components/LineChart";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import LineChartIcon from "@mui/icons-material/ShowChart";
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import { DonutLargeOutlined, LocalGasStationOutlined } from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";
import { Responsive, WidthProvider } from "react-grid-layout";
import { mockBarData as data } from "../../data/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import axios from "axios";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ProgressCircle from "../../components/ProgressCircle";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import PieChart from "../../components/PieChart";
import AddIcon from '@mui/icons-material/Add';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import TireRepairIcon from '@mui/icons-material/TireRepair';

const ResponsiveGridLayout = WidthProvider(Responsive);

const CreateDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  const [lowConsumptionCardGridFontSize, setLowConsumptionCardGridFontSize] =
    useState("12px");
  const [highConsumptionCardGridFontSize, setHighConsumptionCardGridFontSize] =
    useState("12px");
  const [avgConsumptionCardGridFontSize, setAvgConsumptionCardGridFontSize] =
    useState("12px");
  const [cheapestTripGridFontSize, setCheapestTripCardGridFontSize] =
    useState("12px");
  const [expensiveTripCardGridFontSize, setExpensiveTripCardGridFontSize] =
    useState("12px");
  const [avgSpeedCardGridFontSize, setAvgSpeedCardGridFontSize] =
    useState("12px");

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };

  const apiUrl = process.env.REACT_APP_API_URL;

  const [layout, setLayout] = useState([]);


  const handleLayoutChange = (layout) => {
    setLayout(layout);

    const scalingFactor = 30;
    const baseFontSize = 12;

    const getFontSize = (h) => {
      return baseFontSize + h * scalingFactor;
    };

    if (layout.length > 0) {
      const gridItemIdsToUpdate = [
        'cheapestTripCardGrid',
        'expensiveTripCardGrid',
        'avgSpeedCardGrid',
        'avgConsumptionCardGrid',
        'highConsumptionCardGrid',
        'lowConsumptionCardGrid',
      ];
      gridItemIdsToUpdate.forEach((itemId) => {
        const gridItem = layout.find((item) => item.i === itemId);
        if (gridItem) {
          const updatedFontSize = getFontSize(gridItem.h);
          switch (itemId) {
            case 'cheapestTripCardGrid':
              setCheapestTripCardGridFontSize(updatedFontSize);
              break;
            case 'expensiveTripCardGrid':
              setExpensiveTripCardGridFontSize(updatedFontSize);
              break;
            case 'avgSpeedCardGrid':
              setAvgSpeedCardGridFontSize(updatedFontSize);
              break;
            case 'avgConsumptionCardGrid':
              setAvgConsumptionCardGridFontSize(updatedFontSize);
              break;
            case 'highConsumptionCardGrid':
              setHighConsumptionCardGridFontSize(updatedFontSize);
              break;
            case 'lowConsumptionCardGrid':
              setLowConsumptionCardGridFontSize(updatedFontSize);
              break;
          }
        }
      });
    }
  };


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
    md: 10,
    lg: 10,
    xl: 10,
  };

  const handleSaveIconClick = async () => {
    if (!dashboardTitle) {
      setErrorMessage("Title is needed!");
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

    axios
      .post(
        `${apiUrl}/api/custom-dashboard`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        console.log("Save request successful");
        navigate("/journee-dashboards");
      })
      .catch((error) => {
        console.error("Save request error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTextFieldChange = (event) => {
    setDashboardTitle(event.target.value);
    setErrorMessage("");
  };

  const addTimeGridToLayout = (gridKey) => {
    if (!layout.some((item) => item.i === gridKey)) {
      const newGridItem = {
        i: gridKey,
        x: 0,
        y: 0,
        w: 4,
        h: 2,
        isResizable: false,
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

      {/* Overview Grid */}
      <IconButton onClick={() => navigate("/journee-dashboards")}>
        <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
      </IconButton>

      <Box borderRadius="12px" backgroundColor="#25222F" minHeight="100vh" overflow="auto">
        <Box
          gridColumn="span 12"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p="8px 0px 0px 8px"
        >
          <Box position="relative" borderRadius="12px">
            <TextField
              label="Name Dashboard"
              variant="outlined"
              style={{ margin: "1rem", width: "100%" }}
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
        {/* ROW 2 */}

        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={breakpoints}
          cols={cols}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map((gridItem) => {
            if (gridItem.i === 'maxSpeedGrid') {
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
                        MAX SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["maxSpeed"]}
                      axisLeftLegend="km/h"
                    />
                  </Box>
                </Box>
              );
            }

            {/* Cards Grid */ }
            if (gridItem.i === 'cheapestTripCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      style={{ fontSize: cheapestTripGridFontSize }}
                      display="inline"
                      color="#FFFFFF"
                      variant="h1"
                      fontWeight="800"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${cheapestTripGridFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      euro
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${cheapestTripGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      Cheapest Trip
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === 'expensiveTripCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      style={{ fontSize: expensiveTripCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      variant="h1"
                      fontWeight="800"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${expensiveTripCardGridFontSize / 3}px` }}
                      display="inline"
                      alignItems="center"
                      color={colors.greenAccent[500]}
                    >
                      euro
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${expensiveTripCardGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      Most Expensive Trip
                    </Typography>
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'avgSpeedCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      style={{ fontSize: avgSpeedCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      variant="h1"
                      fontWeight="800"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${avgSpeedCardGridFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${avgSpeedCardGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      Avg. Speed
                    </Typography>
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'avgConsumptionCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      style={{ fontSize: avgConsumptionCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      variant="h1"
                      fontWeight="800"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${avgConsumptionCardGridFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      l/100km
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${avgConsumptionCardGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      Avg. Consumption
                    </Typography>
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'highConsumptionCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      style={{ fontSize: highConsumptionCardGridFontSize }}
                      fontWeight="800"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${highConsumptionCardGridFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      l/100km
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${highConsumptionCardGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      High Consumption
                    </Typography>
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'lowConsumptionCardGrid') {
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
                      top: '8px',
                      right: '8px',
                      color: 'white'
                    }}
                    onClick={() => removeAnyGridFromLayout(gridItem.i)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <Box>
                    <Typography
                      style={{ fontSize: lowConsumptionCardGridFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      0
                    </Typography>
                    <Typography
                      style={{ fontSize: `${lowConsumptionCardGridFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      l/100km
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${lowConsumptionCardGridFontSize / 3}px` }}
                      color="#828282"
                    >
                      Low Consumption
                    </Typography>
                  </Box>
                </Box>

              );
            }

            {/* ROW 2 */ }

            if (gridItem.i === 'fuelGrid') {
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
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="l/100km"
                    />
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'speedGrid') {
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
                        AVG SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="km/h"
                    />
                  </Box>
                </Box>

              );
            }
            {/* ROW 3 */ }

            if (gridItem.i === 'distanceGrid') {
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
                      <LocationOnOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="km"
                    />
                  </Box>
                </Box>

              );
            }

            if (gridItem.i === 'timeGrid') {
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
                          <Typography variant="subtitle1">60%</Typography>
                        </Box>
                        <Box ml={2}>
                          <Typography color="#B7A7B4">Moving Time</Typography>
                          <Typography variant="h3">10:00:10</Typography>
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
                          <Typography variant="h3">03:00:50</Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon sx={{ color: "#4298B5", fontSize: "26px" }} />
                          <Typography variant="subtitle1">10%</Typography>
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">Idle Time</Typography>
                          <Typography variant="h3">02:50:00</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            }

            // Custom Journee Dashboards Requirement

            if (gridItem.i === 'maxSpeedGridBarChart') {
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
                        MAX SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="km/h"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'maxSpeedGridLineChart') {
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
                        MAX SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distance"
                      axisLeftLegend="km/h"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelGridBarChart') {
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
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="l/100km"
                    />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'fuelGridLineChart') {
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
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distance"
                      axisLeftLegend="l/100km"
                    />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'distanceGridBarChart') {
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
                      <LocationOnOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="km"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'distanceGridLineChart') {
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
                      <LocationOnOutlinedIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distance"
                      axisLeftLegend="km"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'speedGridBarChart') {
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
                        AVG SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="km/h"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'speedGridLineChart') {
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
                        AVG SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distance"
                      axisLeftLegend="km/h"
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'tyrePressureGridBarChart') {
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
                      <TireRepairIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TYRE PRESSURE
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distance"]}
                      axisLeftLegend="unit"
                    />
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === 'tyrePressureGridLineChart') {
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
                      <TireRepairIcon
                        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TYRE PRESSURE
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeAnyGridFromLayout(gridItem.i)}>
                      <DeleteOutlineIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distance"
                      axisLeftLegend="unit"
                    />
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
                <LocationOnOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Trips Distance" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('distanceGridBarChart')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('distanceGridLineChart')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <LocalGasStationIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Consumption" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('fuelGridBarChart')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('fuelGridLineChart')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText primary="Avg Speed" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('speedGridBarChart')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('speedGridLineChart')} />
              </IconButton>
            </ListItem>
            <ListItem >
              <ListItemIcon>
                <SpeedOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Max Speed" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('maxSpeedGridBarChart')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('maxSpeedGridLineChart')} />
              </IconButton>
            </ListItem>
            {/* <ListItem >
              <ListItemIcon>
                <TireRepairIcon />
              </ListItemIcon>
              <ListItemText primary="Tyre Pressure" />
              <IconButton>
                <BarChartIcon onClick={() => addAnyChartsGridToLayout('tyrePressureGridBarChart')} />
              </IconButton>
              <IconButton>
                <LineChartIcon onClick={() => addAnyChartsGridToLayout('tyrePressureGridLineChart')} />
              </IconButton>
            </ListItem> */}
            <ListItem >
              <ListItemIcon>
                <AccessTimeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Time" />
              <IconButton onClick={() => addTimeGridToLayout('timeGrid')}>
                <DonutLargeOutlined />
              </IconButton>
            </ListItem>

            {/* "Cards" column */}
            <ListItem>
              <ListItemText primary="Cards" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('avgSpeedCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Avg. Speed" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('expensiveTripCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Most Expensive Trip" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('cheapestTripCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Cheapest Trip" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('highConsumptionCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="High Consumption" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('lowConsumptionCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Low Consumption" />
            </ListItem>
            <ListItem button onClick={() => addAnyCardsGridToLayout('avgConsumptionCardGrid')}>
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Avg Consumption" />
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </Box>
  );
};

export default CreateDashboard;
