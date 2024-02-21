import {
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  TextField,
  useTheme,
  Dialog,
  DialogContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  ListItemIcon,
  ListItemText,
  DialogTitle,
  Divider,
  DialogActions,
  Drawer,
  List,
  ListItem,
} from "@mui/material";
import { tokens } from "../../theme";
import CircleIcon from "@mui/icons-material/Circle";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import LineChart from "../../components/LineChart";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTime";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import Stack from "@mui/material/Stack";
import LineChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import ArrowForwardIosOutlined from "@mui/icons-material/ArrowForwardIosOutlined";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { LocalGasStationOutlined } from "@mui/icons-material";
import MyDateRangePicker from "../../components/DateRangePicker";
import { useNavigate } from "react-router-dom";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { VehicleContext } from "../../VehicleContext";
import { useGridContext } from "../../GridContext";
import ProgressCircle from "../../components/ProgressCircle";
import PieChartDashboard from "../../components/PieChartDashboard";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ButtonGroup from "@mui/material/ButtonGroup";
import { formatTime } from "../../components/PieChartDashboard";
import TireRepairIcon from "@mui/icons-material/TireRepair";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SpeedIcon from "@mui/icons-material/Speed";
import { DonutLargeOutlined } from "@mui/icons-material";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import UnitPreferenceContext from "../../UnitPreferenceContext.js";
import {
  DEFAULT_UNITS_METRIC,
  DEFAULT_UNITS_IMPERIAL,
} from "../../utils/unitsName.js";
import {
  convertDistance,
  convertSpeed,
  formatData,
} from "../../utils/unitUtils.js";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(() => {
    const savedTags = localStorage.getItem("selectedTags");
    if (savedTags) {
      const parsedTags = JSON.parse(savedTags);
      const allExist = parsedTags.every((tag) => tags.includes(tag));
      return allExist ? parsedTags : [];
    }
    return [];
  });

  const [dateRange, setDateRange] = useState(() => {
    try {
      const storedDateRange = localStorage.getItem("dateRange");
      if (storedDateRange) {
        const parsedDateRange = JSON.parse(storedDateRange);

        if (Array.isArray(parsedDateRange)) {
          return parsedDateRange.map((d) => new Date(d));
        }
      }
    } catch (error) {
      console.error("Error parsing date range from localStorage:", error);
    }
    return null;
  });
  const [data, setData] = useState([]);
  const [selectedButton, setSelectedButton] = useState(() => {
    const storedDate = localStorage.getItem("dateRange");
    if (storedDate) {
      const parsedDate = JSON.parse(storedDate);
      const [startDate, endDate] = parsedDate.map((date) => new Date(date));
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      if (
        startDate >= new Date().setHours(0, 0, 0, 0) &&
        endDate <= new Date().setHours(23, 59, 59, 999)
      ) {
        return "today";
      } else if (
        startDate >= getStartOfWeek(currentDate) &&
        endDate <= getEndOfWeek(currentDate)
      ) {
        return "thisWeek";
      } else if (
        startDate.getFullYear() === currentYear &&
        endDate.getFullYear() === currentYear &&
        startDate.getMonth() === currentMonth &&
        endDate.getMonth() === currentMonth
      ) {
        return "thisMonth";
      } else if (
        startDate.getFullYear() === currentYear &&
        endDate.getFullYear() === currentYear
      ) {
        return "thisYear";
      } else if (
        startDate.getFullYear() < currentYear &&
        endDate.getFullYear() <= currentYear
      ) {
        return "allTime";
      }

      function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(date.getFullYear(), date.getMonth(), diff);
        start.setHours(0, 0, 0, 0);
        return start;
      }

      function getEndOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const end = new Date(date.getFullYear(), date.getMonth(), diff + 6);
        end.setHours(23, 59, 59, 999);
        return end;
      }
    }
    return "allTime";
  });
  const navigate = useNavigate();
  const { selectedActiveVehicle, setSelectedValue } = useContext(
    VehicleContext
  );
  const [isLoading, setIsLoading] = useState(false);
  const [anchorDashboard, setAnchorDashboard] = useState(null);
  const [
    anchorMaxSpeedGridBarChartChartSwitcher,
    setAnchorMaxSpeedGridBarChartChartSwitcher,
  ] = useState(null);
  const [
    anchorMaxSpeedGridLineChartChartSwitcher,
    setAnchorMaxSpeedGridLineChartChartSwitcher,
  ] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [editedDashboardName, setEditedDashboardName] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    "76f345d6-0a55-4001-811e-61d0356f3f54"
  );
  const [
    cheapestTripCardGridFontSize,
    setCheapestTripCardGridFontSize,
  ] = useState("12px");
  const [
    expensiveTripCardGridFontSize,
    setExpensiveTripCardGridFontSize,
  ] = useState("12px");
  const [avgSpeedCardGridFontSize, setAvgSpeedCardGridFontSize] = useState(
    "12px"
  );
  const [
    avgConsumptionCardGridFontSize,
    setAvgConsumptionCardGridFontSize,
  ] = useState("12px");
  const [
    highConsumptionCardGridFontSize,
    setHighConsumptionCardGridFontSize,
  ] = useState("12px");
  const [
    lowConsumptionCardGridFontSize,
    setLowConsumptionCardGridFontSize,
  ] = useState("12px");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDashboardUpdated, setIsDashboardUpdated] = useState(false);
  const [tripData, setTripData] = useState([]);
  const [period, setPeriod] = useState("thisWeek");
  const [showData, setShowData] = useState(false);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [unitName, setUnitName] = useState(DEFAULT_UNITS_METRIC);
  const { unitPreference, setUnitPreference } = useContext(
    UnitPreferenceContext
  );

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (unitPreference === "imperial") {
      setUnitName(DEFAULT_UNITS_IMPERIAL);
    } else {
      setUnitName(DEFAULT_UNITS_METRIC);
    }
  }, [unitPreference]);

  useEffect(() => {
    if (dateRange && showData) {
      handleDateRangeSelect(dateRange);
      setShowData(false);
    }
  }, [dateRange, period, showData]);

  function isDateRangeAllTime(startDate, endDate) {
    return endDate.getFullYear() - startDate.getFullYear() > 10;
  }

  const isDateRangeWeek = (startDate, endDate) => {
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
    const difference = endDate - startDate;
    return difference <= oneWeekInMillis;
  };

  const isDateRangeMonth = (startDate, endDate) => {
    return (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth()
    );
  };

  const isDateRangeDay = (startDate, endDate) => {
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const difference = endDate - startDate;

    return difference <= oneDayInMillis;
  };

  const isDateRangeYear = (startDate, endDate) => {
    const oneYearInMillis = 365 * 24 * 60 * 60 * 1000;
    const difference = endDate - startDate;
    return difference >= oneYearInMillis;
  };

  const defaultLayout = [
    { i: "maxSpeedGrid", x: 0, y: 0, w: 8, h: 2, static: true },
    { i: "speedGrid", x: 4, y: 2, w: 4, h: 2, static: true },
    { i: "fuelGrid", x: 0, y: 2, w: 4, h: 2, static: true },
    { i: "distanceGrid", x: 0, y: 4, w: 4, h: 2, static: true },
    { i: "timeGrid", x: 4, y: 4, w: 4, h: 2, static: true, isResizable: false },
    { i: "cheapestTripCardGrid", x: 10, y: 0, w: 2, h: 1, static: true },
    { i: "expensiveTripCardGrid", x: 10, y: 1, w: 2, h: 1, static: true },
    { i: "avgSpeedCardGrid", x: 10, y: 2, w: 2, h: 1, static: true },
    { i: "avgConsumptionCardGrid", x: 10, y: 3, w: 2, h: 1, static: true },
    { i: "highConsumptionCardGrid", x: 10, y: 4, w: 2, h: 1, static: true },
    { i: "lowConsumptionCardGrid", x: 10, y: 5, w: 2, h: 1, static: true },
  ];

  const [layout, setLayout] = useState(defaultLayout);
  const [newLayout, setNewLayout] = useState([]);
  const {
    isGridChanged,
    setIsGridChanged,
    attemptNavigation,
    setAttemptNavigation,
  } = useGridContext();
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [cheapestTripCost, setCheapestTripCost] = useState(0);
  const [expensiveTripCost, setExpensiveTripCost] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);

  const fetchDashboards = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.get(`${apiUrl}/api/custom-dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
      setDashboards(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  useEffect(() => {
    const fetchSelectedOption = async () => {
      setIsLoading(true);
      try {
        const accessToken = await getToken();
        const response = await axios.get(`${apiUrl}/api/user`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const activeDashboard = response.data.activeDashboard;
        if (activeDashboard !== undefined) {
          setSelectedOption(
            activeDashboard || "76f345d6-0a55-4001-811e-61d0356f3f54"
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSelectedOption();
  }, []);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const accessToken = await getToken();
        const response = await axios.get(`${apiUrl}/api/vehicles`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          if (response.data.length === 0) {
            setAddVehicleDialogOpen(true);
            setSelectedValue("e2701bd8-f58b-4117-9acb-fa2d8fe99f07");
          }
        } else {
          console.error("Failed to fetch vehicles");
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    }

    fetchVehicles();
  }, []);

  const handleLayoutChange = (layout) => {
    setNewLayout(layout);

    const scalingFactor = 30;
    const baseFontSize = 12;

    const getFontSize = (h) => {
      return baseFontSize + h * scalingFactor;
    };

    if (layout.length > 0) {
      const gridItemIdsToUpdate = [
        "cheapestTripCardGrid",
        "expensiveTripCardGrid",
        "avgSpeedCardGrid",
        "avgConsumptionCardGrid",
        "highConsumptionCardGrid",
        "lowConsumptionCardGrid",
      ];
      gridItemIdsToUpdate.forEach((itemId) => {
        const gridItem = layout.find((item) => item.i === itemId);
        if (gridItem) {
          const updatedFontSize = getFontSize(gridItem.h);
          switch (itemId) {
            case "cheapestTripCardGrid":
              setCheapestTripCardGridFontSize(updatedFontSize);
              break;
            case "expensiveTripCardGrid":
              setExpensiveTripCardGridFontSize(updatedFontSize);
              break;
            case "avgSpeedCardGrid":
              setAvgSpeedCardGridFontSize(updatedFontSize);
              break;
            case "avgConsumptionCardGrid":
              setAvgConsumptionCardGridFontSize(updatedFontSize);
              break;
            case "highConsumptionCardGrid":
              setHighConsumptionCardGridFontSize(updatedFontSize);
              break;
            case "lowConsumptionCardGrid":
              setLowConsumptionCardGridFontSize(updatedFontSize);
              break;
            default:
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

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setTags(event.target.value);
  };

  useEffect(() => {
    const getStoredDateRange = () => {
      const storedDateRange = localStorage.getItem("dateRange");
      if (storedDateRange) {
        const parsedDateRange = JSON.parse(storedDateRange);
        return parsedDateRange.map((d) => new Date(d));
      }
      return null;
    };

    const storedDateRange = getStoredDateRange();

    if (storedDateRange) {
      handleDateRangeSelect(storedDateRange);
    } else if (selectedActiveVehicle) {
      handleAllTimeClick(selectedActiveVehicle);
    }
  }, [selectedActiveVehicle]);

  const handleDateRangeSelect = async (date) => {
    if (!date || date.length === 0) {
      return;
    }
    const dateRangeToStore = date.map((d) => d.toISOString());
    localStorage.setItem("dateRange", JSON.stringify(dateRangeToStore));

    setIsLoading(true);
    const accessToken = await getToken();
    setDateRange(date);

    const startDate = date[0];
    const endDate = date[1];
    const vehicleId = selectedActiveVehicle;
    const queryType = "custom";

    const tagsParameter = selectedTags
      .map((tag) => `tags[]=${encodeURIComponent(tag)}`)
      .join("&");

    try {
      const response = await axios.get(
        `${apiUrl}/api/overview/?${tagsParameter}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            start: startDate,
            end: endDate,
            vehicleId,
            queryType,
          },
        }
      );

      let totalDistance = 0;
      let totalCost = 0;
      let cheapestTrip = Infinity;
      let expensiveTrip = -Infinity;
      let totalSpeedAvg = 0;
      let countSpeedAvg = 0;
      const flattenedData = response.data.map((item) => {
        const flattenedItem = {
          userId: item.userId,
          vehicleId: item.vehicleId,
          date: item.date,
        };
        Object.keys(item.speed).forEach((key) => {
          flattenedItem[`speed${key}`] = item.speed[key];
          if (key === "avg") {
            totalSpeedAvg += item.speed[key];
            countSpeedAvg++;
          }
        });
        Object.keys(item.time).forEach((key) => {
          flattenedItem[`time${key}`] = item.time[key];
        });
        Object.keys(item.distance).forEach((key) => {
          const distanceKey = `distance${key}`;
          const distanceInKm = parseFloat(item.distance[key].toFixed(2));
          flattenedItem[distanceKey] = distanceInKm;

          totalDistance += distanceInKm;
          totalDistance = parseFloat(totalDistance.toFixed(2));
          totalCost += parseFloat(distanceInKm) * 2;
          cheapestTrip = Math.min(cheapestTrip, parseFloat(distanceInKm));
          expensiveTrip = Math.max(expensiveTrip, parseFloat(distanceInKm));
        });
        return flattenedItem;
      });

      const avgSpeed =
        countSpeedAvg !== 0 ? (totalSpeedAvg / countSpeedAvg).toFixed(2) : 0;
      const cheapestTripCost = cheapestTrip !== Infinity ? cheapestTrip * 2 : 0;
      const expensiveTripCost =
        expensiveTrip !== -Infinity ? expensiveTrip * 2 : 0;
      const maxSpeed = flattenedData.reduce((max, item) => {
        const speedKeys = Object.keys(item).filter((key) =>
          key.startsWith("speed")
        );
        const speeds = speedKeys.map((key) => item[key]);
        const itemMaxSpeed = Math.max(...speeds);
        return Math.max(max, itemMaxSpeed);
      }, 0);
      const convertedFlattendData = await Promise.all(
        flattenedData.map(async (item) => {
          item.speedmin = await convertSpeed(item.speedmin, unitPreference);
          item.speedmax = await convertSpeed(item.speedmax, unitPreference);
          item.speedavg = await convertSpeed(item.speedavg, unitPreference);
          item.distancetotal = await convertDistance(
            item.distancetotal,
            unitPreference
          );
          item.distanceshortest = await convertDistance(
            item.distanceshortest,
            unitPreference
          );
          item.distancelongest = await convertDistance(
            item.distancelongest,
            unitPreference
          );
          return item;
        })
      );
      setData(convertedFlattendData);
      setTotalCost(totalCost);
      setCheapestTripCost(cheapestTripCost);
      setExpensiveTripCost(expensiveTripCost);
      const convertedAvgSpeed = await convertSpeed(avgSpeed, unitPreference);
      setAvgSpeed(convertedAvgSpeed);
      const convertedMaxSpeed = await convertSpeed(maxSpeed, unitPreference);
      setMaxSpeed(convertedMaxSpeed);
      const responseTrips = await axios.get(
        `${apiUrl}/api/trips/?${tagsParameter}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            start: startDate,
            end: endDate,
            vehicleId,
            queryType,
          },
        }
      );

      const filteredData = responseTrips.data.filter(
        (item) => item.status === "ready"
      );

      const convertedData = await formatData(filteredData, unitPreference);

      setTripData(convertedData);

      const calculatedTotalDistance = convertedData.reduce(
        (sum, item) => sum + item.totalDistance,
        0
      );
      const roundedTotalDistance = Number(calculatedTotalDistance.toFixed(2));

      setTotalDistance(roundedTotalDistance);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllTimeClick = () => {
    // const today = new Date();
    const start = new Date(2020, 0, 1);
    const end = new Date();
    setDateRange([start, end]);
    setPeriod("allTime");
    setSelectedButton("allTime");
    setShowData(true);
  };

  const handleThisYearClick = () => {
    const today = new Date();
    const year = today.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date();
    setDateRange([start, end]);
    setPeriod("thisYear");

    if (isDateRangeYear(start, end)) {
      setSelectedButton("thisYear");
    }
    setSelectedButton("thisYear");
    setShowData(true);
  };

  const handleThisMonthClick = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateRange([start, end]);
    setPeriod("thisMonth");
    setSelectedButton("thisMonth");
    setShowData(true);
  };

  const handleThisWeekClick = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.getFullYear(), today.getMonth(), diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today.getFullYear(), today.getMonth(), diff + 6);
    end.setHours(23, 59, 59, 999);

    setSelectedButton("thisWeek");
    setDateRange([start, end]);
    setPeriod("thisWeek");
    setShowData(true);
  };

  const handleTodayClick = () => {
    console.log("Day.. ");
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    setDateRange([todayStart, todayEnd]);

    setSelectedButton("today");
    setPeriod("today");
    handleDateRangeSelect([todayStart, todayEnd]);
  };

  const handlePreviousPeriod = () => {
    if (!dateRange) return;

    const [startDate, endDate] = dateRange;
    let newStartDate, newEndDate;

    if (period === "thisWeek") {
      newStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "thisMonth") {
      newStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() - 1,
        1
      );
      newEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
    } else if (period === "thisYear") {
      newStartDate = new Date(startDate.getFullYear() - 1, 0, 1);
      newEndDate = new Date(
        startDate.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59,
        999
      );
    } else if (period === "today") {
      newStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }
    setDateRange([newStartDate, newEndDate]);
    setShowData(true);
  };

  const handleNextPeriod = () => {
    if (!dateRange) return;

    const [startDate, endDate] = dateRange;
    let newStartDate, newEndDate;

    if (period === "thisWeek") {
      newStartDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (period === "thisMonth") {
      newStartDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
      newEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 2, 0);
    } else if (period === "thisYear") {
      newStartDate = new Date(endDate.getFullYear() + 1, 0, 1);
      newEndDate = new Date(endDate.getFullYear() + 1, 11, 31, 23, 59, 59, 999);
    } else if (period === "today") {
      newStartDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      newEndDate = new Date(endDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    }

    setDateRange([newStartDate, newEndDate]);
    setShowData(true);
  };

  // Max Speed Grid Switcher

  const handleMaxSpeedGridBarChartMoreIconClick = (event) => {
    setAnchorMaxSpeedGridBarChartChartSwitcher(event.currentTarget);
  };

  const handleMaxSpeedGridLineChartMoreIconClick = (event) => {
    setAnchorMaxSpeedGridLineChartChartSwitcher(event.currentTarget);
  };

  const handleMaxSpeedGridBarChartChartSwitcherMenu = () => {
    setAnchorMaxSpeedGridBarChartChartSwitcher(null);
  };

  const handleMaxSpeedGridLineChartChartSwitcherMenu = () => {
    setAnchorMaxSpeedGridLineChartChartSwitcher(null);
  };

  const handleMaxSpeedGridChartSwitchClick = () => {
    const maxSpeedGridBarChartKey = "maxSpeedGridBarChart";
    const maxSpeedGridLineChartKey = "maxSpeedGridLineChart";

    const hasBarChart = layout.some(
      (item) => item.i === maxSpeedGridBarChartKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === maxSpeedGridLineChartKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === maxSpeedGridBarChartKey) {
        return {
          ...item,
          i: hasLineChart ? maxSpeedGridLineChartKey : maxSpeedGridLineChartKey,
        };
      } else if (item.i === maxSpeedGridLineChartKey) {
        return {
          ...item,
          i: hasBarChart ? maxSpeedGridBarChartKey : maxSpeedGridBarChartKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorMaxSpeedGridBarChartChartSwitcher(null);
    setAnchorMaxSpeedGridLineChartChartSwitcher(null);
    setIsGridChanged(true);
  };

  // fuelGrids Switcher

  const [
    anchorFuelGridBarChartChartSwitcher,
    setAnchorFuelGridBarChartChartSwitcher,
  ] = useState(null);
  const [
    anchorFuelGridLineChartChartSwitcher,
    setAnchorFuelGridLineChartChartSwitcher,
  ] = useState(null);

  const handleFuelGridBarChartMoreIconClick = (event) => {
    setAnchorFuelGridBarChartChartSwitcher(event.currentTarget);
  };

  const handleFuelGridLineChartMoreIconClick = (event) => {
    setAnchorFuelGridLineChartChartSwitcher(event.currentTarget);
  };

  const handleFuelGridBarChartChartSwitcherMenu = () => {
    setAnchorFuelGridBarChartChartSwitcher(null);
  };

  const handleFuelGridLineChartChartSwitcherMenu = () => {
    setAnchorFuelGridLineChartChartSwitcher(null);
  };

  const handleFuelGridChartSwitchClick = () => {
    const fuelGridBarChartKey = "fuelGridBarChart";
    const fuelGridLineChartKey = "fuelGridLineChart";

    const hasBarChart = layout.some((item) => item.i === fuelGridBarChartKey);
    const hasLineChart = layout.some((item) => item.i === fuelGridLineChartKey);

    const newLayout = layout.map((item) => {
      if (item.i === fuelGridBarChartKey) {
        return {
          ...item,
          i: hasLineChart ? fuelGridLineChartKey : fuelGridLineChartKey,
        };
      } else if (item.i === fuelGridLineChartKey) {
        return {
          ...item,
          i: hasBarChart ? fuelGridBarChartKey : fuelGridBarChartKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorFuelGridBarChartChartSwitcher(null);
    setAnchorFuelGridLineChartChartSwitcher(null);
    setIsGridChanged(true);
  };

  const handleDashboardSettingsClick = (event) => {
    if (isGridChanged) {
      setIsConfirmationOpen(true);
    } else {
      setAnchorDashboard(event.currentTarget);
    }
  };

  useEffect(() => {
    if (isGridChanged && attemptNavigation) {
      setIsConfirmationOpen(true);
    }
  }, [isGridChanged, attemptNavigation]);

  const handleDashboardCloseMenu = () => {
    setAnchorDashboard(null);
    setIsEditing(false);
  };

  // Distance Grid Switcher

  const [
    anchorDistanceGridBarChartChartSwitcher,
    setAnchorDistanceGridBarChartChartSwitcher,
  ] = useState(null);
  const [
    anchorDistanceGridLineChartChartSwitcher,
    setAnchorDistanceGridLineChartChartSwitcher,
  ] = useState(null);

  const handleDistanceGridBarChartMoreIconClick = (event) => {
    setAnchorDistanceGridBarChartChartSwitcher(event.currentTarget);
  };

  const handleDistanceGridLineChartMoreIconClick = (event) => {
    setAnchorDistanceGridLineChartChartSwitcher(event.currentTarget);
  };

  const handleDistanceGridBarChartChartSwitcherMenu = () => {
    setAnchorDistanceGridBarChartChartSwitcher(null);
  };

  const handleDistanceGridLineChartChartSwitcherMenu = () => {
    setAnchorDistanceGridLineChartChartSwitcher(null);
  };

  const handleDistanceGridChartSwitchClick = () => {
    const distanceGridBarChartKey = "distanceGridBarChart";
    const distanceGridLineChartKey = "distanceGridLineChart";

    const hasBarChart = layout.some(
      (item) => item.i === distanceGridBarChartKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === distanceGridLineChartKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === distanceGridBarChartKey) {
        return {
          ...item,
          i: hasLineChart ? distanceGridLineChartKey : distanceGridLineChartKey,
        };
      } else if (item.i === distanceGridLineChartKey) {
        return {
          ...item,
          i: hasBarChart ? distanceGridBarChartKey : distanceGridBarChartKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorDistanceGridBarChartChartSwitcher(null);
    setAnchorDistanceGridLineChartChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Avg Speed Grid Switcher

  const [
    anchorSpeedGridBarChartChartSwitcher,
    setAnchorSpeedGridBarChartChartSwitcher,
  ] = useState(null);
  const [
    anchorSpeedGridLineChartChartSwitcher,
    setAnchorSpeedGridLineChartChartSwitcher,
  ] = useState(null);

  const handleSpeedGridBarChartMoreIconClick = (event) => {
    setAnchorSpeedGridBarChartChartSwitcher(event.currentTarget);
  };

  const handleSpeedGridLineChartMoreIconClick = (event) => {
    setAnchorSpeedGridLineChartChartSwitcher(event.currentTarget);
  };

  const handleSpeedGridBarChartChartSwitcherMenu = () => {
    setAnchorSpeedGridBarChartChartSwitcher(null);
  };

  const handleSpeedGridLineChartChartSwitcherMenu = () => {
    setAnchorSpeedGridLineChartChartSwitcher(null);
  };

  const handleSpeedGridChartSwitchClick = () => {
    const speedGridBarChartKey = "speedGridBarChart";
    const speedGridLineChartKey = "speedGridLineChart";

    const hasBarChart = layout.some((item) => item.i === speedGridBarChartKey);
    const hasLineChart = layout.some(
      (item) => item.i === speedGridLineChartKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === speedGridBarChartKey) {
        return {
          ...item,
          i: hasLineChart ? speedGridLineChartKey : speedGridLineChartKey,
        };
      } else if (item.i === speedGridLineChartKey) {
        return {
          ...item,
          i: hasBarChart ? speedGridBarChartKey : speedGridBarChartKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorSpeedGridBarChartChartSwitcher(null);
    setAnchorSpeedGridLineChartChartSwitcher(null);
    setIsGridChanged(true);
  };

  // convert time strings to seconds
  function convertToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 * 60 + minutes * 60 + seconds;
  }

  const handleDashboardSelection = async (selectedId) => {
    if (isEditing) {
      return;
    }
    setIsLoading(true);

    try {
      if (selectedId === "76f345d6-0a55-4001-811e-61d0356f3f54") {
        setSelectedOption(selectedId);
        setLayout(defaultLayout);
      } else {
        const selectedDashboard = dashboards.find(
          (item) => item.id === selectedId
        );

        if (selectedDashboard) {
          setSelectedOption(selectedId);
          setLayout(selectedDashboard.layout);
        }
      }

      const accessToken = await getToken();
      await axios.patch(
        `${apiUrl}/api/user`,
        {
          activeDashboard: selectedOption,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (selectedOption === "76f345d6-0a55-4001-811e-61d0356f3f54") {
      setLayout(defaultLayout);
      setIsLoading(false);
    } else {
      const selectedDashboard = dashboards.find(
        (item) => item.id === selectedOption
      );
      if (selectedDashboard) {
        setLayout(selectedDashboard.layout);
        setIsLoading(false);
      } else {
        setLayout(defaultLayout);
        setSelectedOption("76f345d6-0a55-4001-811e-61d0356f3f54");
        setIsLoading(false);
      }
    }
  }, [selectedOption, dashboards]);

  const handleDashboardEditIconClick = (selectedId) => {
    const selectedDashboard = dashboards.find((item) => item.id === selectedId);
    setIsEditing(true);
    setEditedDashboardName(selectedDashboard?.dashboardTitle || "");
    setSelectedOption(selectedId);
  };

  const handleSaveDashboardTitle = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const selectedDashboard = dashboards.find(
        (item) => item.id === selectedOption
      );

      await axios.patch(
        `${apiUrl}/api/custom-dashboard/${selectedDashboard.id}`,
        {
          dashboardTitle: editedDashboardName,
          layout,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      fetchDashboards();
      setIsEditing(false);
    }
  };

  const handleDragStop = () => {
    setIsGridChanged(true);
  };

  const handleResizeStop = () => {
    setIsGridChanged(true);
  };

  const handleSaveLayout = async () => {
    setIsLoading(true);

    try {
      const accessToken = await getToken();
      const selectedDashboard = dashboards.find(
        (item) => item.id === selectedOption
      );

      const requestBody = {
        dashboardTitle: selectedDashboard.dashboardTitle,
        layout: newLayout,
      };

      await axios.patch(
        `${apiUrl}/api/custom-dashboard/${selectedOption}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setIsGridChanged(false);
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error("Save request error:", error);
    } finally {
      setIsLoading(false);
      fetchDashboards();
      setIsDashboardUpdated(false);
    }
  };

  const handleCancelSave = () => {
    setIsConfirmationOpen(false);
    setIsGridChanged(false);
    setAttemptNavigation(false);
  };

  useEffect(() => {
    localStorage.setItem("selectedTags", JSON.stringify(selectedTags));
  }, [selectedTags]);

  const handleTagChange = (event) => {
    setSelectedTags(event.target.value);
  };

  useEffect(() => {
    handleDateRangeSelect(dateRange);
  }, [selectedTags]);

  const totalMovingTime = data.reduce(
    (total, item) => total + item.timemoving,
    0
  );
  const totalTrafficTime = data.reduce(
    (total, item) => total + item.timetraffic,
    0
  );
  const totalIdleTime = data.reduce((total, item) => total + item.timeidle, 0);
  const totalTripTimeInSeconds =
    totalMovingTime + totalTrafficTime + totalIdleTime;

  const movingTimePercentage = (totalMovingTime / totalTripTimeInSeconds) * 100;
  const trafficTimePercentage =
    (totalTrafficTime / totalTripTimeInSeconds) * 100;
  const idleTimePercentage = (totalIdleTime / totalTripTimeInSeconds) * 100;

  // Fetch Tags

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await getToken();
        const response = await fetch(
          `${apiUrl}/api/trips/tags/${selectedActiveVehicle}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    if (selectedActiveVehicle) {
      fetchData();
    }
  }, [selectedActiveVehicle]);

  const truncateTag = (tag) => {
    return tag.length > 20 ? `${tag.substring(0, 20)}...` : tag;
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
      setIsGridChanged(true);
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
      setIsGridChanged(true);
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
      setIsGridChanged(true);
    }
  };

  const removeAnyGridFromLayout = (gridKey) => {
    const updatedLayout = layout.filter((item) => item.i !== gridKey);
    setLayout(updatedLayout);
    setAnchorDistanceGridBarChartChartSwitcher(false);
    setAnchorDistanceGridLineChartChartSwitcher(false);
    setAnchorFuelGridBarChartChartSwitcher(false);
    setAnchorFuelGridLineChartChartSwitcher(false);
    setAnchorMaxSpeedGridBarChartChartSwitcher(false);
    setAnchorMaxSpeedGridLineChartChartSwitcher(false);
    setAnchorSpeedGridBarChartChartSwitcher(false);
    setAnchorSpeedGridLineChartChartSwitcher(false);
    setIsGridChanged(true);
  };

  function sortAlphabetically(arr) {
    const customSort = (a, b) => {
      const normalizedA = a.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const normalizedB = b.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const isSpecialA = !/^[a-zA-Z0-9]/.test(a);
      const isSpecialB = !/^[a-zA-Z0-9]/.test(b);

      if (isSpecialA && !isSpecialB) {
        return -1;
      }
      if (!isSpecialA && isSpecialB) {
        return 1;
      }

      if (normalizedA < normalizedB) {
        return -1;
      }
      if (normalizedA > normalizedB) {
        return 1;
      }
      return 0;
    };

    return [...arr].sort(customSort);
  }

  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />
      <Dialog
        open={addVehicleDialogOpen}
        onClose={() => setAddVehicleDialogOpen(false)}
      >
        <DialogTitle>Add a New Vehicle</DialogTitle>
        <DialogContent>
          It seems you haven't added any vehicle, add a new vehicle and start
          recording trips from Journee app.
        </DialogContent>
        <DialogActions>
          <Button
            style={{ backgroundColor: "#DA291C", color: "#FFFFFF" }}
            onClick={() => {
              navigate("/add-vehicle");
            }}
          >
            ADD
          </Button>
          <Button
            style={{ color: "#FFFFFF" }}
            onClick={() => setAddVehicleDialogOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Box mb="24px">
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleAllTimeClick}
            sx={{
              backgroundColor:
                selectedButton === "allTime" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            ALL TIME
          </Button>
          <Button
            onClick={handleThisYearClick}
            sx={{
              backgroundColor:
                selectedButton === "thisYear" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            YEAR
          </Button>
          <Button
            onClick={handleThisMonthClick}
            sx={{
              backgroundColor:
                selectedButton === "thisMonth" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            MONTH
          </Button>
          <Button
            onClick={handleThisWeekClick}
            sx={{
              backgroundColor:
                selectedButton === "thisWeek" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            WEEK
          </Button>

          <Button
            onClick={handleTodayClick}
            sx={{
              backgroundColor:
                selectedButton === "today" ? "#DA291C" : "transparent",
              color: "white",
            }}
          >
            DAY
          </Button>

          <MyDateRangePicker
            onChange={handleDateRangeSelect}
            value={dateRange}
          />

          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small">Tags</InputLabel>
            <Select
              labelId="demo-select-small"
              id="demo-select-small"
              multiple
              value={selectedTags}
              label="Tags"
              onChange={handleTagChange}
              renderValue={(selected) =>
                selected
                  .map((tag) =>
                    tag.length > 20 ? `${tag.substring(0, 20)}...` : tag
                  )
                  .join(", ")
              }
            >
              {sortAlphabetically(tags).map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {truncateTag(tag)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Overview Grid */}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="60px"
        gap="10px"
        borderRadius="12px"
        marginBottom={2}
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
          onClick={() => navigate("/recorded-trips")}
          sx={{
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#363340",
            },
          }}
        >
          <StatBox
            value={tripData.length}
            property="Total Trips"
            icon={
              <LocationOnOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          <ArrowForwardIosOutlined sx={{ pr: "12px", fontSize: "26px" }} />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          <StatBox
            value={
              typeof totalDistance === "number"
                ? totalDistance.toFixed(2)
                : totalDistance
                ? totalDistance
                : "N.A"
            }
            property="Total Distance"
            unit={unitName.Distance}
            icon={<img src="distanceIcon.png" alt="Distance Icon" />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          <StatBox
            value={
              typeof maxSpeed === "number"
                ? maxSpeed.toFixed(2)
                : maxSpeed
                ? maxSpeed
                : "N.A"
            }
            property="Max Speed"
            unit={unitName.Speed}
            icon={
              <SpeedOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
        >
          <StatBox
            value="N.A"
            property="Avg. Consumption"
            unit={unitName.Consumption}
            icon={
              <LocalGasStationOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box borderRadius="12px" backgroundColor="#25222F" overflow="auto">
        {/* Dashboard Name Box */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={"8px 0px 0px 8px"}
        >
          <Box position="relative" borderRadius="12px">
            <Typography variant="h3" fontWeight="600" color={colors.grey[100]}>
              <Typography
                variant="h3"
                fontWeight="600"
                color={colors.grey[100]}
              >
                {selectedOption === "76f345d6-0a55-4001-811e-61d0356f3f54"
                  ? "Main Dashboard"
                  : dashboards.find(
                      (dashboard) => dashboard.id === selectedOption
                    )?.dashboardTitle}
              </Typography>
            </Typography>
          </Box>
          <Box style={{ marginLeft: "auto" }}>
            {selectedOption !== "76f345d6-0a55-4001-811e-61d0356f3f54" && (
              <IconButton title="Add widgets" onClick={toggleMenu}>
                <AddIcon />
              </IconButton>
            )}
            {isGridChanged && (
              <IconButton value="Save Layout Changes">
                <SaveOutlinedIcon onClick={handleSaveLayout} />
              </IconButton>
            )}
            <IconButton
              value="Dashboard List"
              onClick={handleDashboardSettingsClick}
            >
              <SettingsOutlinedIcon />
            </IconButton>
            <Dialog
              open={isConfirmationOpen}
              onClose={handleCancelSave}
              aria-labelledby="confirmation-dialog-title"
            >
              <DialogTitle id="confirmation-dialog-title">
                Update Layout?
              </DialogTitle>
              <DialogActions>
                <Button onClick={handleCancelSave} variant="contained">
                  CANCEL
                </Button>
                <Button
                  onClick={handleSaveLayout}
                  variant="contained"
                  style={{
                    backgroundColor: "#DA291C",
                    color: "#FFFFFF",
                    marginLeft: "8px",
                  }}
                  autoFocus
                >
                  UPDATE
                </Button>
              </DialogActions>
            </Dialog>
            {isDashboardUpdated && (
              <Dialog
                open={isDashboardUpdated}
                onClose={() => setIsDashboardUpdated(false)}
              >
                <DialogTitle>Dashboard Updated Successfully</DialogTitle>
                <DialogActions>
                  <Button
                    style={{
                      backgroundColor: "#DA291C",
                      color: "#FFFFFF",
                    }}
                    onClick={() => setIsDashboardUpdated(false)}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>
          <Menu
            anchorEl={anchorDashboard}
            open={Boolean(anchorDashboard)}
            onClose={handleDashboardCloseMenu}
          >
            <Typography variant="h5" fontWeight="600" sx={{ p: 2 }}>
              Choose dashboard
            </Typography>
            <RadioGroup value={selectedOption}>
              <MenuItem>
                <FormControlLabel
                  value="76f345d6-0a55-4001-811e-61d0356f3f54"
                  label="Default"
                  control={
                    <Radio
                      sx={{
                        color: colors.greenAccent[600],
                        "&.Mui-checked": {
                          color: colors.greenAccent[600],
                        },
                      }}
                    />
                  }
                  checked={
                    selectedOption === "76f345d6-0a55-4001-811e-61d0356f3f54"
                  }
                  onClick={() =>
                    handleDashboardSelection(
                      "76f345d6-0a55-4001-811e-61d0356f3f54"
                    )
                  }
                />
              </MenuItem>
              {dashboards.map((dashboard, index) => (
                <MenuItem key={index}>
                  <FormControlLabel
                    value={dashboard.id}
                    control={
                      <Radio
                        sx={{
                          color: colors.greenAccent[600],
                          "&.Mui-checked": {
                            color: colors.greenAccent[600],
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        {isEditing && selectedOption === dashboard.id ? (
                          <TextField
                            value={editedDashboardName}
                            onChange={(e) =>
                              setEditedDashboardName(e.target.value)
                            }
                            style={{ width: "200px" }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {dashboard.dashboardTitle}
                          </Typography>
                        )}
                      </Box>
                    }
                    checked={selectedOption === dashboard.id}
                    onClick={() => handleDashboardSelection(dashboard.id)}
                  />
                  {selectedOption === dashboard.id && (
                    <IconButton
                      onClick={() => handleDashboardEditIconClick(dashboard.id)}
                    >
                      <ListItemIcon>
                        {isEditing ? (
                          <IconButton onClick={handleSaveDashboardTitle}>
                            <SaveOutlinedIcon
                              sx={{ color: colors.greenAccent[600] }}
                            />
                          </IconButton>
                        ) : (
                          <IconButton>
                            <img src="editIcon.png" alt="Edit Icon" />
                          </IconButton>
                        )}
                      </ListItemIcon>
                    </IconButton>
                  )}
                </MenuItem>
              ))}
              <MenuItem onClick={() => navigate("/create-dashboard")}>
                <ListItemIcon>
                  <AddIcon sx={{ color: colors.greenAccent[600] }} />
                </ListItemIcon>
                <ListItemText primary="Add new" />
              </MenuItem>
            </RadioGroup>
          </Menu>
        </Box>
        {/* ROW 2 */}

        <ResponsiveGridLayout
          breakpoints={breakpoints}
          cols={cols}
          className="layout"
          layouts={{ lg: layout }}
          onLayoutChange={handleLayoutChange}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
        >
          {layout.map((gridItem) => {
            if (gridItem.i === "maxSpeedGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        MAX SPEED
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["speedmax"]}
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            /* Cards Grid */

            if (gridItem.i === "cheapestTripCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      style={{ fontSize: cheapestTripCardGridFontSize }}
                      display="inline"
                      color="#FFFFFF"
                      fontWeight="800"
                    >
                      N.A.
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${cheapestTripCardGridFontSize / 3}px`,
                      }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      euro
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${cheapestTripCardGridFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Cheapest Trip
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "expensiveTripCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      style={{ fontSize: expensiveTripCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      N.A.
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${expensiveTripCardGridFontSize / 3}px`,
                      }}
                      display="inline"
                      alignItems="center"
                      color={colors.greenAccent[500]}
                    >
                      euro
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${expensiveTripCardGridFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Most Expensive Trip
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "avgSpeedCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      style={{ fontSize: avgSpeedCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      {typeof avgSpeed === "number"
                        ? avgSpeed.toFixed(2)
                        : avgSpeed
                        ? avgSpeed
                        : "N.A"}
                    </Typography>
                    <Typography
                      style={{ fontSize: `${avgSpeedCardGridFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.Speed}
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

            if (gridItem.i === "avgConsumptionCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      style={{ fontSize: avgConsumptionCardGridFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      N.A
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${avgConsumptionCardGridFontSize / 3}px`,
                      }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.fuelConsumption}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${avgConsumptionCardGridFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Avg. Consumption
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "highConsumptionCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      style={{ fontSize: highConsumptionCardGridFontSize }}
                      fontWeight="800"
                    >
                      N.A
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${highConsumptionCardGridFontSize / 3}px`,
                      }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.fuelConsumption}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${highConsumptionCardGridFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      High Consumption
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "lowConsumptionCardGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography
                      style={{ fontSize: lowConsumptionCardGridFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      N.A
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${lowConsumptionCardGridFontSize / 3}px`,
                      }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.fuelConsumption}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${lowConsumptionCardGridFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Low Consumption
                    </Typography>
                  </Box>
                </Box>
              );
            }

            /* ROW 2 */

            if (gridItem.i === "fuelGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["fuelConsumption"]}
                      axisLeftLegend={unitName.fuelConsumption}
                    />
                    <Box
                      position="absolute"
                      top="40%"
                      left="40%"
                      transform="translate(-50%, -50%)"
                    >
                      <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                        No data available
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "speedGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AVG SPEED
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["speedavg"]}
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            /* ROW 3 */

            if (gridItem.i === "distanceGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distancetotal"]}
                      axisLeftLegend={unitName.Distance}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "timeGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight="600"
                        color={colors.grey[100]}
                      >
                        TIME
                      </Typography>
                    </Box>
                    {selectedOption !==
                      "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                      <IconButton
                        onClick={() => removeAnyGridFromLayout(gridItem.i)}
                      >
                        <DeleteIcon
                          sx={{ color: colors.grey[100], fontSize: "26px" }}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                  >
                    <Box position="relative" height="250px" width="50%">
                      <PieChartDashboard data={data} />
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
                          <CircleIcon
                            sx={{ color: "#FFFF00", fontSize: "26px" }}
                          />
                          <Typography variant="subtitle1">
                            {isNaN(movingTimePercentage)
                              ? "0%"
                              : `${movingTimePercentage.toFixed(0)}%`}
                          </Typography>
                        </Box>
                        <Box ml={2}>
                          <Typography color="#B7A7B4">Moving Time</Typography>
                          <Typography variant="h3">
                            {formatTime(totalMovingTime)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon
                            sx={{ color: "#FF0000", fontSize: "26px" }}
                          />
                          <Typography variant="subtitle1">
                            {isNaN(trafficTimePercentage)
                              ? "0%"
                              : `${trafficTimePercentage.toFixed(2)}%`}
                          </Typography>
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Time in Traffic
                          </Typography>
                          <Typography variant="h3">
                            {formatTime(totalTrafficTime)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon
                            sx={{ color: "#4298B5", fontSize: "26px" }}
                          />
                          <Typography variant="subtitle1">
                            {isNaN(idleTimePercentage)
                              ? "0%"
                              : `${idleTimePercentage.toFixed(2)}%`}
                          </Typography>
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">Idle Time</Typography>
                          <Typography variant="h3">
                            {formatTime(totalIdleTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            }

            // Custom Journee Dashboards Requirement

            if (gridItem.i === "maxSpeedGridBarChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        MAX SPEED
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleMaxSpeedGridBarChartMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["speedmax"]}
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorMaxSpeedGridBarChartChartSwitcher}
                    open={Boolean(anchorMaxSpeedGridBarChartChartSwitcher)}
                    onClose={handleMaxSpeedGridBarChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon
                          onClick={handleMaxSpeedGridChartSwitchClick}
                        />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "maxSpeedGridLineChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        MAX SPEED
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleMaxSpeedGridLineChartMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="speedmax"
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorMaxSpeedGridLineChartChartSwitcher}
                    open={Boolean(anchorMaxSpeedGridLineChartChartSwitcher)}
                    onClose={handleMaxSpeedGridLineChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon
                          onClick={handleMaxSpeedGridChartSwitchClick}
                        />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "fuelGridBarChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                    <IconButton onClick={handleFuelGridBarChartMoreIconClick}>
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["fuelConsumption"]}
                      axisLeftLegend={unitName.fuelConsumption}
                    />
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
                  </Box>
                  <Menu
                    anchorEl={anchorFuelGridBarChartChartSwitcher}
                    open={Boolean(anchorFuelGridBarChartChartSwitcher)}
                    onClose={handleFuelGridBarChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon
                          onClick={handleFuelGridChartSwitchClick}
                        />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "fuelGridLineChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        FUEL CONSUMPTION
                      </Typography>
                    </Box>
                    <IconButton onClick={handleFuelGridLineChartMoreIconClick}>
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="fuelConsumption"
                      axisLeftLegend={unitName.fuelConsumption}
                    />
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
                  </Box>
                  <Menu
                    anchorEl={anchorFuelGridLineChartChartSwitcher}
                    open={Boolean(anchorFuelGridLineChartChartSwitcher)}
                    onClose={handleFuelGridLineChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon
                          onClick={handleFuelGridChartSwitchClick}
                        />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "distanceGridBarChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        onClick={handleDistanceGridBarChartMoreIconClick}
                      >
                        <MoreVertIcon
                          sx={{ color: colors.grey[100], fontSize: "26px" }}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["distancetotal"]}
                      axisLeftLegend={unitName.Distance}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorDistanceGridBarChartChartSwitcher}
                    open={Boolean(anchorDistanceGridBarChartChartSwitcher)}
                    onClose={handleDistanceGridBarChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon
                          onClick={handleDistanceGridChartSwitchClick}
                        />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "distanceGridLineChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TRIPS DISTANCE
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleDistanceGridLineChartMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="distancetotal"
                      axisLeftLegend={unitName.Distance}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorDistanceGridLineChartChartSwitcher}
                    open={Boolean(anchorDistanceGridLineChartChartSwitcher)}
                    onClose={handleDistanceGridLineChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon
                          onClick={handleDistanceGridChartSwitchClick}
                        />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "speedGridBarChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AVG SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={handleSpeedGridBarChartMoreIconClick}>
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["speedavg"]}
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorSpeedGridBarChartChartSwitcher}
                    open={Boolean(anchorSpeedGridBarChartChartSwitcher)}
                    onClose={handleSpeedGridBarChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon
                          onClick={handleSpeedGridChartSwitchClick}
                        />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "speedGridLineChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AVG SPEED
                      </Typography>
                    </Box>
                    <IconButton onClick={handleSpeedGridLineChartMoreIconClick}>
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="speedavg"
                      axisLeftLegend={unitName.Speed}
                    />
                    {data && data.length === 0 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="#F4F4F4"
                        >
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Menu
                    anchorEl={anchorSpeedGridLineChartChartSwitcher}
                    open={Boolean(anchorSpeedGridLineChartChartSwitcher)}
                    onClose={handleSpeedGridLineChartChartSwitcherMenu}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    MenuListProps={{
                      style: {
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Box display="flex" flexDirection="row">
                      <MenuItem>
                        <LineChartIcon />
                      </MenuItem>
                      <MenuItem>
                        <BarChartIcon
                          onClick={handleSpeedGridChartSwitchClick}
                        />
                      </MenuItem>
                    </Box>
                    <Divider
                      style={{
                        backgroundColor: "transparent",
                        border: "1px dashed white",
                      }}
                    />
                    <MenuItem
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon sx={{ mr: "3px" }} />
                      <Typography variant="body2">Remove</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            if (gridItem.i === "tyrePressureGridBarChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TIRE PRESSURE
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChart
                      data={data}
                      isDashboard={true}
                      indexBy="date"
                      keys={["fuelConsumption"]}
                      axisLeftLegend="unit"
                    />
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
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "tyrePressureGridLineChart") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        TIRE PRESSURE
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChart
                      data={data}
                      dataKeyX="date"
                      dataKeyY="fuelConsumption"
                      axisLeftLegend="unit"
                    />
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
            <ListItem>
              <ListItemIcon>
                <LocationOnOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Trips Distance" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("distanceGridBarChart")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("distanceGridLineChart")
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocalGasStationIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Consumption" />
              <IconButton>
                <BarChartIcon
                  onClick={() => addAnyChartsGridToLayout("fuelGridBarChart")}
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() => addAnyChartsGridToLayout("fuelGridLineChart")}
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText primary="Avg Speed" />
              <IconButton>
                <BarChartIcon
                  onClick={() => addAnyChartsGridToLayout("speedGridBarChart")}
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() => addAnyChartsGridToLayout("speedGridLineChart")}
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Max Speed" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("maxSpeedGridBarChart")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("maxSpeedGridLineChart")
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccessTimeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Time" />
              <IconButton onClick={() => addTimeGridToLayout("timeGrid")}>
                <DonutLargeOutlined />
              </IconButton>
            </ListItem>

            {/* "Cards" column */}
            <ListItem>
              <ListItemText primary="Cards" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("avgSpeedCardGrid")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Avg. Speed" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("expensiveTripCardGrid")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Most Expensive Trip" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("cheapestTripCardGrid")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Cheapest Trip" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("highConsumptionCardGrid")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="High Consumption" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("lowConsumptionCardGrid")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Low Consumption" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("avgConsumptionCardGrid")}
            >
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

export default Dashboard;
