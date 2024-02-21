import {
  Box,
  Typography,
  Dialog,
  useTheme,
  IconButton,
  Slider,
  DialogTitle,
  Drawer,
  Divider,
  DialogContent,
  DialogContentText,
  FormControl,
  List,
  ListItem,
  DialogActions,
  Button,
  Menu,
  TextField,
  ListItemIcon,
  RadioGroup,
  MenuItem,
  FormControlLabel,
  Radio,
  ListItemText,
  Autocomplete,
} from "@mui/material";
import { tokens } from "../../theme";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTime";
import CircleIcon from "@mui/icons-material/Circle";
import LineChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import {
  AddCircleOutline,
  ArrowDropDown,
  ArrowDropUp,
  LandscapeOutlined,
  LocalGasStationOutlined,
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import PropaneOutlinedIcon from "@mui/icons-material/PropaneOutlined";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { ArrowDownwardOutlined } from "@mui/icons-material";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ProgressCircle from "../../components/ProgressCircle";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { useState, useEffect, useContext } from "react";
import { VehicleContext } from "../../VehicleContext";
import { useGridContext } from "../../GridContext";
import AddIcon from "@mui/icons-material/Add";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import axios from "axios";
import { useParams } from "react-router-dom";
import PieChartTripDetails from "../../components/PieChartTripDetails";
import { formatTime } from "../../components/PieChartTripDetails";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SpeedIcon from "@mui/icons-material/Speed";
import { DonutLargeOutlined } from "@mui/icons-material";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import BarChartTripDetails from "../../components/BarChartTripDetails.jsx";
import LineChartTripDetails from "../../components/LineChartTripDetails.jsx";
import EditIcon from "@mui/icons-material/Edit";
import UnitPreferenceContext from "../../UnitPreferenceContext.js";
import {
  DEFAULT_UNITS_METRIC,
  DEFAULT_UNITS_IMPERIAL,
} from "../../utils/unitsName.js";
import {
  convertElevation,
  convertFuelConsumption,
  convertSpeed,
  convertTemperature,
  formatData,
} from "../../utils/unitUtils.js";
import { yellow } from "@mui/material/colors";

function formatDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = { year: "2-digit", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.toUpperCase();
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const DetailedTripView = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { selectedActiveVehicle } = useContext(VehicleContext);
  const [latLang, setLatLang] = useState([]);
  const [startLevelFontSize, setStartLevelFontSize] = useState("12px");
  const [endLevelFontSize, setEndLevelFontSize] = useState("12px");
  const [fuelSpentFontSize, setFuelSpentFontSize] = useState("12px");
  const [avgSpeedFontSize, setAvgSpeedFontSize] = useState("12px");
  const [maxSpeedFontSize, setMaxSpeedFontSize] = useState("12px");
  const [minSpeedFontSize, setMinSpeedFontSize] = useState("12px");
  const [maxElevationFontSize, setMaxElevationFontSize] = useState("12px");
  const [minElevationFontSize, setMinElevationFontSize] = useState("12px");
  const [elevationGainFontSize, setElevationGainFontSize] = useState("12px");
  const [tripCostSummaryFontSize, setTripCostSummaryFontSize] = useState(
    "12px"
  );
  const [
    tripDistanceSummaryFontSize,
    setTripDistanceSummaryFontSize,
  ] = useState("12px");
  const [
    fuelConsumptionSummaryFontSize,
    setFuelConsumptionSummaryFontSize,
  ] = useState("12px");
  const [
    tripDurationSummaryFontSize,
    setTripDurationSummaryFontSize,
  ] = useState("12px");
  const [fuelSpentSummaryFontSize, setFuelSpentSummaryFontSize] = useState(
    "12px"
  );
  const [avgSpeedSummaryFontSize, setAvgSpeedSummaryFontSize] = useState(
    "12px"
  );
  const { tripId } = useParams();
  const [tripsData, setTripsData] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDashboardUpdated, setIsDashboardUpdated] = useState(false);
  const [anchorDashboard, setAnchorDashboard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [editedDashboardName, setEditedDashboardName] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    "76f345d6-0a55-4001-811e-61d0356f3f54"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [deletionMode, setDeletionMode] = useState(false);
  const [temporaryTags, setTemporaryTags] = useState(tripsData?.tags || []);
  const {
    isGridChanged,
    setIsGridChanged,
    attemptNavigation,
    setAttemptNavigation,
  } = useGridContext();
  const [tripDistance, setTripDistance] = useState(0);
  const [elevationData, setElevationData] = useState([]);
  const [fuelConsumptionData, setFuelConsumptionData] = useState([]);
  const [ambientTempData, setAmbientTempData] = useState([]);
  const [speedGraphData, setSpeedGraphData] = useState([]);
  const [coolantTempData, setCoolantTempData] = useState([]);
  const [openTripEditDialog, setOpenTripEditDialog] = useState(false);
  const [formTripEditData, setFormTripEditData] = useState({
    title: tripsData?.title || "",
    origin: tripsData?.origin?.title || "",
    destination: tripsData?.destination?.title || "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isTripDeleteDialogOpen, setTripDeleteDialogOpen] = useState(false);
  const [unitName, setUnitName] = useState(DEFAULT_UNITS_METRIC);
  const { unitPreference, setUnitPreference } = useContext(
    UnitPreferenceContext
  );

  useEffect(() => {
    if (unitPreference === "imperial") {
      setUnitName(DEFAULT_UNITS_IMPERIAL);
    } else {
      setUnitName(DEFAULT_UNITS_METRIC);
    }
  }, [unitPreference]);

  const handleTripEditClick = () => {
    setOpenTripEditDialog(true);
  };

  const handleTripEditDialogClose = () => {
    setOpenTripEditDialog(false);
  };

  const handleTripEditChange = async (e) => {
    const { name, value } = e.target;

    setFormTripEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'origin' || name === 'destination') {
      try {
        setLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${value}`
        );


        if (!response.ok) {
          throw new Error("Network response was not ok");
        }


        const data = await response.json();
        const suggestions = data.features.map(feature => ({
          place_id: feature.properties.place_id,
          description: feature.properties.display_name
        }));
        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTripEditSubmit = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const updatedTripData = {
        title: formTripEditData.title,
        origin: {
          title: formTripEditData.origin,
        },
        destination: {
          title: formTripEditData.destination,
        },
        tags: tripsData?.tags,
      };

      const response = await fetch(`${apiUrl}/api/trips/${tripId}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(updatedTripData),
      });

      if (!response.ok) {
        throw new Error("Failed to update trip");
      }

      const data = await response.json();

      console.info("Trip updated successfully", data);

      setFormTripEditData({
        title: "",
        origin: "",
        destination: "",
      });

      handleTripEditDialogClose();
      fetchTripData();
    } catch (error) {
      console.error("Error updating trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTripClick = () => {
    setTripDeleteDialogOpen(true);
  };

  const handleCancelDeleteTrip = () => {
    setTripDeleteDialogOpen(false);
  };

  const handleConfirmDeleteTrip = () => {
    // wip
    setTripDeleteDialogOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleTagsChange = (event, newValue) => {
    setSelectedTags(newValue);
  };

  const handleAddButtonClick = () => {
    setIsMultiSelectOpen(true);
  };

  const handleAddTagsCancelClick = () => {
    setIsMultiSelectOpen(false);
  };

  const apiUrl = process.env.REACT_APP_API_URL;

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.error(error);
    }
  };

  const defaultLayout = [
    { w: 3, h: 2, x: 0, y: 0, i: "timeGrid", static: true },
    { w: 1, h: 1, x: 3, y: 0, i: "tripCostSummaryCard", static: true },
    { w: 1, h: 1, x: 4, y: 0, i: "tripDistanceSummaryCard", static: true },
    { w: 1, h: 1, x: 5, y: 0, i: "fuelConsumptionSummaryCard", static: true },
    { w: 1, h: 1, x: 6, y: 0, i: "tripDurationSummaryCard", static: true },
    { w: 1, h: 1, x: 7, y: 0, i: "fuelSpentSummaryCard", static: true },
    { w: 1, h: 1, x: 8, y: 0, i: "avgSpeedSummaryCard", static: true },
    { w: 6, h: 4, x: 3, y: 1, i: "mapGrid", static: true },
    { w: 3, h: 2, x: 0, y: 3, i: "fuelConsumptionGrid", static: true },
    { w: 3, h: 3, x: 0, y: 2, i: "fuelLevelGraphicGrid", static: true },
    { w: 3, h: 2, x: 3, y: 5, i: "speedGraphicGrid", static: true },
    { w: 3, h: 2, x: 6, y: 5, i: "elevationGainGraphicGrid", static: true },
    // { w: 1, h: 1, x: 0, y: 7, i: 'startLevelCard', static: true },
    // { w: 1, h: 1, x: 1, y: 7, i: 'endLevelCard', static: true },
    // { w: 1, h: 1, x: 2, y: 7, i: 'fuelSpentCard', static: true },
    // { w: 1, h: 1, x: 3, y: 7, i: 'avgSpeedCard', static: true },
    // { w: 1, h: 1, x: 4, y: 7, i: 'maxSpeedCard', static: true },
    // { w: 1, h: 1, x: 5, y: 7, i: 'minSpeedCard', static: true },
    // { w: 1, h: 1, x: 6, y: 7, i: 'maxElevationCard', static: true },
    // { w: 1, h: 1, x: 7, y: 7, i: 'minElevationCard', static: true },
    // { w: 1, h: 1, x: 8, y: 7, i: 'elevationGainCard', static: true },
    { w: 3, h: 2, x: 0, y: 7, i: "ambientTempGrid", static: true },
    { w: 6, h: 2, x: 3, y: 7, i: "coolantTempGrid", static: true },
  ];

  const [layout, setLayout] = useState(defaultLayout);
  const [newLayout, setNewLayout] = useState([]);

  const fetchDashboards = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const response = await axios.get(`${apiUrl}/api/trip-dashboard`, {
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchSelectedOption = async () => {
      try {
        const accessToken = await getToken();
        const response = await axios.get(`${apiUrl}/api/user`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const activeTripDashboard = response.data.activeTripDashboard;
        if (activeTripDashboard !== undefined) {
          setSelectedOption(activeTripDashboard);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchSelectedOption();
  }, []);

  const fetchTripData = async () => {
    try {
      setIsLoading(true);
      const accessToken = await getToken();

      const response = await axios.get(`${apiUrl}/api/trips/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          vehicleId: selectedActiveVehicle,
          queryType: "all",
        },
      });

      const filteredTrip = response.data.find((trip) => trip.id === tripId);
      const convertedInversedData = await formatData(
        filteredTrip,
        unitPreference
      );
      setTripsData(convertedInversedData);
      setTripDistance(convertedInversedData.totalDistance);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId, selectedActiveVehicle]);

  useEffect(() => {
    setFormTripEditData({
      title: tripsData?.title || "",
      origin: tripsData?.origin?.title || "",
      destination: tripsData?.destination?.title || "",
    });
  }, [tripsData]);

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
    setNewLayout(layout);

    const scalingFactor = 30;
    const baseFontSize = 12;

    const getFontSize = (h) => {
      return baseFontSize + h * scalingFactor;
    };

    if (layout.length > 0) {
      const gridItemIdsToUpdate = [
        "tripCostSummaryCard",
        "tripDistanceSummaryCard",
        "fuelConsumptionSummaryCard",
        "tripDurationSummaryCard",
        "fuelSpentSummaryCard",
        "avgSpeedSummaryCard",
        "startLevelCard",
        "endLevelCard",
        "fuelSpentCard",
        "avgSpeedCard",
        "maxSpeedCard",
        "minSpeedCard",
        "maxElevationCard",
        "minElevationCard",
        "elevationGainCard",
      ];
      gridItemIdsToUpdate.forEach((itemId) => {
        const gridItem = layout.find((item) => item.i === itemId);
        if (gridItem) {
          const updatedFontSize = getFontSize(gridItem.h);
          switch (itemId) {
            case "tripCostSummaryCard":
              setTripCostSummaryFontSize(updatedFontSize);
              break;
            case "tripDistanceSummaryCard":
              setTripDistanceSummaryFontSize(updatedFontSize);
              break;
            case "fuelConsumptionSummaryCard":
              setFuelConsumptionSummaryFontSize(updatedFontSize);
              break;
            case "tripDurationSummaryCard":
              setTripDurationSummaryFontSize(updatedFontSize);
              break;
            case "fuelSpentSummaryCard":
              setFuelSpentSummaryFontSize(updatedFontSize);
              break;
            case "avgSpeedSummaryCard":
              setAvgSpeedSummaryFontSize(updatedFontSize);
              break;
            case "startLevelCard":
              setStartLevelFontSize(updatedFontSize);
              break;
            case "endLevelCard":
              setEndLevelFontSize(updatedFontSize);
              break;
            case "fuelSpentCard":
              setFuelSpentFontSize(updatedFontSize);
              break;
            case "avgSpeedCard":
              setAvgSpeedFontSize(updatedFontSize);
              break;
            case "maxSpeedCard":
              setMaxSpeedFontSize(updatedFontSize);
              break;
            case "minSpeedCard":
              setMinSpeedFontSize(updatedFontSize);
              break;
            case "maxElevationCard":
              setMaxElevationFontSize(updatedFontSize);
              break;
            case "minElevationCard":
              setMinElevationFontSize(updatedFontSize);
              break;
            case "elevationGainCard":
              setElevationGainFontSize(updatedFontSize);
              break;
            default:
              break;
          }
        }
      });
    }
  };

  const handleDashboardSettingsClick = (event) => {
    if (isGridChanged) {
      setIsConfirmationOpen(true);
    } else {
      setAnchorDashboard(event.currentTarget);
    }
  };

  const handleDashboardCloseMenu = () => {
    setAnchorDashboard(null);
    setIsEditing(false);
  };

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
          activeTripDashboard: selectedOption,
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
    if (selectedOption === "76f345d6-0a55-4001-811e-61d0356f3f54") {
      setLayout(defaultLayout);
    } else {
      const selectedDashboard = dashboards.find(
        (item) => item.id === selectedOption
      );
      if (selectedDashboard) {
        setLayout(selectedDashboard.layout);
      } else {
        setLayout(defaultLayout);
        setSelectedOption("76f345d6-0a55-4001-811e-61d0356f3f54");
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
        `${apiUrl}/api/trip-dashboard/${selectedDashboard.id}`,
        {
          dashboardTitle: editedDashboardName,
          layout: selectedDashboard.layout,
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
        `${apiUrl}/api/trip-dashboard/${selectedOption}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setIsGridChanged(false);
    } catch (error) {
      console.error("Save request error:", error);
    } finally {
      setIsConfirmationOpen(false);
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
    if (isGridChanged && attemptNavigation) {
      setIsConfirmationOpen(true);
    }
  }, [isGridChanged, attemptNavigation]);

  const handleTagChooserSave = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      const existingTags = tripsData?.tags || [];
      const combinedTags = [...new Set([...existingTags, selectedTags])];
      const tagsPayload = { tags: combinedTags };

      const response = await fetch(`${apiUrl}/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(tagsPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.info("Success:", data);
    } catch (error) {
      console.error("Error in saving tags:", error);
    }
    setIsMultiSelectOpen(false);
    setIsLoading(false);
    fetchTripData();
    setSelectedTags([]);
  };

  useEffect(() => {
    const fetchAllTags = async () => {
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
        setTagOptions(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchAllTags();
  }, []);

  // Fuel Level Graphic Switcher

  const [
    anchorFuelLevelGraphicBarChartGridChartSwitcher,
    setAnchorFuelLevelGraphicBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorFuelLevelGraphicLineChartGridChartSwitcher,
    setAnchorFuelLevelGraphicLineChartGridChartSwitcher,
  ] = useState(null);

  const handleFuelLevelGraphicBarChartGridMoreIconClick = (event) => {
    setAnchorFuelLevelGraphicBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleFuelLevelGraphicLineChartGridMoreIconClick = (event) => {
    setAnchorFuelLevelGraphicLineChartGridChartSwitcher(event.currentTarget);
  };

  const handleFuelLevelGraphicBarChartGridChartSwitcherMenu = () => {
    setAnchorFuelLevelGraphicBarChartGridChartSwitcher(null);
  };

  const handleFuelLevelGraphicLineChartGridChartSwitcherMenu = () => {
    setAnchorFuelLevelGraphicLineChartGridChartSwitcher(null);
  };

  const handleFuelLevelGraphicChartGridSwitchClick = () => {
    const fuelLevelGraphicBarChartGridKey = "fuelLevelGraphicBarChartGrid";
    const fuelLevelGraphicLineChartGridKey = "fuelLevelGraphicLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === fuelLevelGraphicBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === fuelLevelGraphicLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === fuelLevelGraphicBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? fuelLevelGraphicLineChartGridKey
            : fuelLevelGraphicLineChartGridKey,
        };
      } else if (item.i === fuelLevelGraphicLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? fuelLevelGraphicBarChartGridKey
            : fuelLevelGraphicBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorFuelLevelGraphicBarChartGridChartSwitcher(null);
    setAnchorFuelLevelGraphicLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Fuel Consumption Switcher

  const [
    anchorFuelConsumptionBarChartGridChartSwitcher,
    setAnchorFuelConsumptionBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorFuelConsumptionLineChartGridChartSwitcher,
    setAnchorFuelConsumptionLineChartGridChartSwitcher,
  ] = useState(null);

  const handleFuelConsumptionBarChartGridMoreIconClick = (event) => {
    setAnchorFuelConsumptionBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleFuelConsumptionLineChartGridMoreIconClick = (event) => {
    setAnchorFuelConsumptionLineChartGridChartSwitcher(event.currentTarget);
  };

  const handleFuelConsumptionBarChartGridChartSwitcherMenu = () => {
    setAnchorFuelConsumptionBarChartGridChartSwitcher(null);
  };

  const handleFuelConsumptionLineChartGridChartSwitcherMenu = () => {
    setAnchorFuelConsumptionLineChartGridChartSwitcher(null);
  };

  const handleFuelConsumptionChartGridSwitchClick = () => {
    const fuelConsumptionBarChartGridKey = "fuelConsumptionBarChartGrid";
    const fuelConsumptionLineChartGridKey = "fuelConsumptionLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === fuelConsumptionBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === fuelConsumptionLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === fuelConsumptionBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? fuelConsumptionLineChartGridKey
            : fuelConsumptionLineChartGridKey,
        };
      } else if (item.i === fuelConsumptionLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? fuelConsumptionBarChartGridKey
            : fuelConsumptionBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorFuelConsumptionBarChartGridChartSwitcher(null);
    setAnchorFuelConsumptionLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Speed Graphic Switcher

  const [
    anchorSpeedGraphicBarChartGridChartSwitcher,
    setAnchorSpeedGraphicBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorSpeedGraphicLineChartGridChartSwitcher,
    setAnchorSpeedGraphicLineChartGridChartSwitcher,
  ] = useState(null);

  const handleSpeedGraphicBarChartGridMoreIconClick = (event) => {
    setAnchorSpeedGraphicBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleSpeedGraphicLineChartGridMoreIconClick = (event) => {
    setAnchorSpeedGraphicLineChartGridChartSwitcher(event.currentTarget);
  };

  const handleSpeedGraphicBarChartGridChartSwitcherMenu = () => {
    setAnchorSpeedGraphicBarChartGridChartSwitcher(null);
  };

  const handleSpeedGraphicLineChartGridChartSwitcherMenu = () => {
    setAnchorSpeedGraphicLineChartGridChartSwitcher(null);
  };

  const handleSpeedGraphicChartGridSwitchClick = () => {
    const speedGraphicBarChartGridKey = "speedGraphicBarChartGrid";
    const speedGraphicLineChartGridKey = "speedGraphicLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === speedGraphicBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === speedGraphicLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === speedGraphicBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? speedGraphicLineChartGridKey
            : speedGraphicLineChartGridKey,
        };
      } else if (item.i === speedGraphicLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? speedGraphicBarChartGridKey
            : speedGraphicBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorSpeedGraphicBarChartGridChartSwitcher(null);
    setAnchorSpeedGraphicLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Elevation Gain Graphic

  const [
    anchorElevationGainGraphicBarChartGridChartSwitcher,
    setAnchorElevationGainGraphicBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorElevationGainGraphicLineChartGridChartSwitcher,
    setAnchorElevationGainGraphicLineChartGridChartSwitcher,
  ] = useState(null);

  const handleElevationGainGraphicBarChartGridMoreIconClick = (event) => {
    setAnchorElevationGainGraphicBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleElevationGainGraphicLineChartGridMoreIconClick = (event) => {
    setAnchorElevationGainGraphicLineChartGridChartSwitcher(
      event.currentTarget
    );
  };

  const handleElevationGainGraphicBarChartGridChartSwitcherMenu = () => {
    setAnchorElevationGainGraphicBarChartGridChartSwitcher(null);
  };

  const handleElevationGainGraphicLineChartGridChartSwitcherMenu = () => {
    setAnchorElevationGainGraphicLineChartGridChartSwitcher(null);
  };

  const handleElevationGainGraphicChartGridSwitchClick = () => {
    const elevationGainGraphicBarChartGridKey =
      "elevationGainGraphicBarChartGrid";
    const elevationGainGraphicLineChartGridKey =
      "elevationGainGraphicLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === elevationGainGraphicBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === elevationGainGraphicLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === elevationGainGraphicBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? elevationGainGraphicLineChartGridKey
            : elevationGainGraphicLineChartGridKey,
        };
      } else if (item.i === elevationGainGraphicLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? elevationGainGraphicBarChartGridKey
            : elevationGainGraphicBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorElevationGainGraphicBarChartGridChartSwitcher(null);
    setAnchorElevationGainGraphicLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Ambient Temp Switcher

  const [
    anchorAmbientTempBarChartGridChartSwitcher,
    setAnchorAmbientTempBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorAmbientTempLineChartGridChartSwitcher,
    setAnchorAmbientTempLineChartGridChartSwitcher,
  ] = useState(null);

  const handleAmbientTempBarChartGridMoreIconClick = (event) => {
    setAnchorAmbientTempBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleAmbientTempLineChartGridMoreIconClick = (event) => {
    setAnchorAmbientTempLineChartGridChartSwitcher(event.currentTarget);
  };

  const handleAmbientTempBarChartGridChartSwitcherMenu = () => {
    setAnchorAmbientTempBarChartGridChartSwitcher(null);
  };

  const handleAmbientTempLineChartGridChartSwitcherMenu = () => {
    setAnchorAmbientTempLineChartGridChartSwitcher(null);
  };

  const handleAmbientTempChartGridSwitchClick = () => {
    const ambientTempBarChartGridKey = "ambientTempBarChartGrid";
    const ambientTempLineChartGridKey = "ambientTempLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === ambientTempBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === ambientTempLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === ambientTempBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? ambientTempLineChartGridKey
            : ambientTempLineChartGridKey,
        };
      } else if (item.i === ambientTempLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? ambientTempBarChartGridKey
            : ambientTempBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorAmbientTempBarChartGridChartSwitcher(null);
    setAnchorAmbientTempLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  // Coolant Temp Switcher

  const [
    anchorCoolantTempBarChartGridChartSwitcher,
    setAnchorCoolantTempBarChartGridChartSwitcher,
  ] = useState(null);
  const [
    anchorCoolantTempLineChartGridChartSwitcher,
    setAnchorCoolantTempLineChartGridChartSwitcher,
  ] = useState(null);

  const handleCoolantTempBarChartGridMoreIconClick = (event) => {
    setAnchorCoolantTempBarChartGridChartSwitcher(event.currentTarget);
  };

  const handleCoolantTempLineChartGridMoreIconClick = (event) => {
    setAnchorCoolantTempLineChartGridChartSwitcher(event.currentTarget);
  };

  const handleCoolantTempBarChartGridChartSwitcherMenu = () => {
    setAnchorCoolantTempBarChartGridChartSwitcher(null);
  };

  const handleCoolantTempLineChartGridChartSwitcherMenu = () => {
    setAnchorCoolantTempLineChartGridChartSwitcher(null);
  };

  const handleCoolantTempChartGridSwitchClick = () => {
    const coolantTempBarChartGridKey = "coolantTempBarChartGrid";
    const coolantTempLineChartGridKey = "coolantTempLineChartGrid";

    const hasBarChart = layout.some(
      (item) => item.i === coolantTempBarChartGridKey
    );
    const hasLineChart = layout.some(
      (item) => item.i === coolantTempLineChartGridKey
    );

    const newLayout = layout.map((item) => {
      if (item.i === coolantTempBarChartGridKey) {
        return {
          ...item,
          i: hasLineChart
            ? coolantTempLineChartGridKey
            : coolantTempLineChartGridKey,
        };
      } else if (item.i === coolantTempLineChartGridKey) {
        return {
          ...item,
          i: hasBarChart
            ? coolantTempBarChartGridKey
            : coolantTempBarChartGridKey,
        };
      }
      return item;
    });

    setLayout(newLayout);
    setAnchorCoolantTempBarChartGridChartSwitcher(null);
    setAnchorCoolantTempLineChartGridChartSwitcher(null);
    setIsGridChanged(true);
  };

  const toggleDeletionMode = () => {
    if (!deletionMode) {
      setTemporaryTags(tripsData?.tags || []);
    }
    setDeletionMode(!deletionMode);
  };

  const handleTagRemove = (tagToRemove) => {
    setTemporaryTags(temporaryTags.filter((tag) => tag !== tagToRemove));
  };

  const handleDeleteTagsSave = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();

      const tagsPayload = { tags: temporaryTags };

      const response = await fetch(`${apiUrl}/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(tagsPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.info("Success:", data);
    } catch (error) {
      console.error("Error in saving tags:", error);
    }

    setDeletionMode(false);
    fetchTripData();
    setIsLoading(false);
  };

  const handleKeyDown = async (event) => {
    if (!/[a-zA-Z0-9-_]/.test(event.key) && event.key.length === 1) {
      event.preventDefault();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleTagChooserSave();
    }
  };

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
      };
      setLayout((prevLayout) => [...prevLayout, newGridItem]);
      setIsGridChanged(true);
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

  useEffect(() => {
    const fetchWaypoints = async () => {
      try {
        const accessToken = await getToken();
        const requestBody = {
          tripIds: [tripId],
        };

        const response = await fetch(`${apiUrl}/api/trips/waypoints`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const convertedPoints = data[0].coordinates.values.map(
            (coordinate) => [coordinate.latitude, coordinate.longitude]
          );
          setLatLang(convertedPoints);
        } else {
          throw new Error("Failed to fetch waypoints");
        }
      } catch (error) {
        console.error("Error fetching waypoints:", error);
        setLatLang([]);
      }
    };

    fetchWaypoints();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  function averageSegment(data, segmentCount) {
    const segmentLength = Math.floor(data.length / segmentCount);
    const simplifiedData = [];

    for (let i = 0; i < data.length; i += segmentLength) {
      let segment = data.slice(i, i + segmentLength);

      segment = segment.filter((value) => value !== null);

      if (segment.length === 0) {
        simplifiedData.push(null);
      } else {
        const segmentAverage =
          segment.reduce((a, b) => a + b, 0) / segment.length;
        simplifiedData.push(Number(segmentAverage.toFixed(2)));
      }
    }
    return simplifiedData;
  }

  const MAX_DATA_POINTS = 50;

  const fetchData = async (dataKey, setDataFunction) => {
    try {
      const accessToken = await getToken();
      const requestBody = { tripIds: [tripId] };
      const response = await fetch(
        // `${apiUrl}/api/trips/waypoints?metrics=speed&metrics=engineLoad&metrics=ambientTemperature&metrics=elevation&metrics=fuelConsumption&metrics=timestamps`,
        `${apiUrl}/api/trips/waypoints?metrics=${dataKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let values = data[0][dataKey].values;

        if (values.length > MAX_DATA_POINTS) {
          values = averageSegment(values, MAX_DATA_POINTS);
        }
        switch (dataKey) {
          case "ambientTemperature":
            values = await convertTemperature(values, unitPreference);
            break;
          case "coolantTemperature":
            values = await convertTemperature(values, unitPreference);
            break;
          case "elevation":
            values = await convertElevation(values, unitPreference);
            break;
          case "speed":
            values = await convertSpeed(values, unitPreference);
            break;
          case "fuelConsumption":
            values = await convertFuelConsumption(values, unitPreference);
            break;
          default:
            break;
        }

        const stepSize = Math.round(
          (tripDistance * 1000) / (values.length - 1)
        );

        const processedData = values.map((value, index) => ({
          distance: stepSize * index,
          value,
        }));

        setDataFunction(processedData);
      } else {
        throw new Error(`Failed to fetch ${dataKey} waypoints`);
      }
    } catch (error) {
      console.error(`Error fetching ${dataKey} waypoints:`, error);
      setDataFunction([]);
    }
  };

  // useEffect for ambient temperature
  useEffect(() => {
    fetchData("ambientTemperature", setAmbientTempData);
  }, [tripId, tripDistance]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect for coolant temperature
  useEffect(() => {
    fetchData("coolantTemperature", setCoolantTempData);
  }, [tripId, tripDistance]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect for elevation
  useEffect(() => {
    fetchData("elevation", setElevationData);
  }, [tripId, tripDistance]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect for speed
  useEffect(() => {
    fetchData("speed", setSpeedGraphData);
  }, [tripId, tripDistance]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect for fuel consumption
  useEffect(() => {
    fetchData("fuelConsumption", setFuelConsumptionData);
  }, [tripId, tripDistance]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeAnyGridFromLayout = (gridKey) => {
    const updatedLayout = layout.filter((item) => item.i !== gridKey);
    setLayout(updatedLayout);
    setAnchorAmbientTempBarChartGridChartSwitcher(false);
    setAnchorAmbientTempLineChartGridChartSwitcher(false);
    setAnchorCoolantTempBarChartGridChartSwitcher(false);
    setAnchorCoolantTempLineChartGridChartSwitcher(false);
    setAnchorElevationGainGraphicBarChartGridChartSwitcher(false);
    setAnchorElevationGainGraphicLineChartGridChartSwitcher(false);
    setAnchorFuelConsumptionBarChartGridChartSwitcher(false);
    setAnchorFuelConsumptionLineChartGridChartSwitcher(false);
    setAnchorFuelLevelGraphicBarChartGridChartSwitcher(false);
    setAnchorFuelLevelGraphicLineChartGridChartSwitcher(false);
    setAnchorSpeedGraphicBarChartGridChartSwitcher(false);
    setAnchorSpeedGraphicLineChartGridChartSwitcher(false);
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

      {/* HEADER */}
      <Box display="flex" justifyContent="flex-start">
        <IconButton onClick={() => navigate("/recorded-trips")}>
          <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
        </IconButton>
        <Box display="flex" justifyContent="center" alignItems="center">
          <CalendarMonthOutlinedIcon
            sx={{
              color: colors.greenAccent[600],
              fontSize: "30px",
              ml: "20px",
            }}
          />
          <Typography variant="h5" sx={{ color: "#E9394B" }}>
            {formatDateFromTimestamp(tripsData?.time?.startTime)}
          </Typography>
          <Box>
            {deletionMode ? (
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {temporaryTags.map((tag, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "#312F3C",
                        color: "#B7BF10",
                        pl: "4px",
                        borderRadius: "18px",
                      }}
                    >
                      {truncateTag(tag)}
                      <IconButton
                        sx={{ color: "white" }}
                        onClick={() => handleTagRemove(tag)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                <Button
                  sx={{
                    color: "#FFFFFF",
                    height: "auto",
                  }}
                  autoFocus
                  onClick={handleDeleteTagsSave}
                  aria-label="save"
                >
                  SAVE
                </Button>
                <Button
                  onClick={toggleDeletionMode}
                  aria-label="cancel"
                  sx={{
                    color: "#FFFFFF",
                  }}
                >
                  CANCEL
                </Button>
              </Box>
            ) : (
              tripsData?.tags?.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {tripsData.tags.map((tag, index) => (
                    <Box
                      key={index}
                      sx={{
                        backgroundColor: "#312F3C",
                        color: "#B7BF10",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        padding: "8px",
                        margin: "5px",
                        borderRadius: "18px",
                      }}
                    >
                      {truncateTag(tag)}
                    </Box>
                  ))}
                  {!isMultiSelectOpen && (
                    <IconButton
                      title="Remove Tags"
                      onClick={toggleDeletionMode}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              )
            )}
          </Box>
          {!isMultiSelectOpen && !deletionMode && (
            <IconButton
              title="Assign New Tags"
              onClick={handleAddButtonClick}
              sx={{ ml: "10px", color: "white" }}
            >
              <AddCircleOutline sx={{ color: "white" }} />
            </IconButton>
          )}
          {isMultiSelectOpen && (
            <FormControl sx={{ ml: "10px", minWidth: 200, maxWidth: 600 }}>
              <Box>
                <Autocomplete
                  options={sortAlphabetically(tagOptions)}
                  value={selectedTags}
                  onInputChange={handleTagsChange}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Assign New Tags"
                      inputProps={{
                        ...params.inputProps,
                        maxLength: 254,
                        onKeyDown: handleKeyDown,
                      }}
                    />
                  )}
                />
              </Box>
            </FormControl>
          )}
          {isMultiSelectOpen && (
            <>
              <Button
                sx={{ ml: "10px", color: "#FFFFFF" }}
                onClick={handleTagChooserSave}
              >
                SAVE
              </Button>
              <Button
                sx={{ ml: "10px", color: "#FFFFFF" }}
                onClick={handleAddTagsCancelClick}
              >
                CANCEL
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography
          variant="h2"
          color={colors.grey[100]}
          fontWeight="bold"
          sx={{ m: "20px 20px 20px 0" }}
        >
          {tripsData?.title ? tripsData.title : "Trip Details"}
        </Typography>
        <Box display="flex" alignItems="center">
          <Box>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="h6" sx={{ color: "#B7A7B4" }}>
                {tripsData?.time?.startTime.substring(11, 16)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="h6" sx={{ color: "#B7A7B4" }}>
                {tripsData?.time?.endTime.substring(11, 16)}
              </Typography>
            </Box>
          </Box>
          <Box mx={2} display="flex" flexDirection="column" alignItems="center">
            <CircleOutlinedIcon
              sx={{
                color: "#B7A7B4",
                fontSize: "10px",
                position: "relative",
                top: "50%",
                bottom: "50%",
              }}
            />
            <ArrowDownwardOutlined
              sx={{ color: "#B7A7B4", fontSize: "10px" }}
            />
            <CircleOutlinedIcon
              sx={{
                color: "#B7A7B4",
                fontSize: "10px",
                position: "relative",
                top: "50%",
                bottom: "50%",
              }}
            />
          </Box>
          <Box>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="h6" sx={{ color: "#B7A7B4" }}>
                {tripsData?.origin?.title}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="h6" sx={{ color: "#B7A7B4" }}>
                {tripsData?.destination?.title}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          {isGridChanged && (
            <IconButton title="Save Layout Changes">
              <SaveOutlinedIcon onClick={handleSaveLayout} />
            </IconButton>
          )}
          <Typography variant="h3" fontWeight="600" color={colors.grey[100]}>
            {selectedOption === "76f345d6-0a55-4001-811e-61d0356f3f54"
              ? "Default"
              : dashboards.find((dashboard) => dashboard.id === selectedOption)
                  ?.dashboardTitle}
          </Typography>
          {selectedOption !== "76f345d6-0a55-4001-811e-61d0356f3f54" && (
            <IconButton title="Add widgets" onClick={toggleMenu}>
              <AddIcon />
            </IconButton>
          )}
          <IconButton title="Delete Trip" onClick={handleDeleteTripClick}>
            <DeleteIcon />
          </IconButton>
          <Dialog
            open={isTripDeleteDialogOpen}
            onClose={handleCancelDeleteTrip}
            aria-labelledby="confirmation-dialog-title"
          >
            <DialogTitle id="confirmation-dialog-title">
              Delete Trip?
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Deleting this trip is irreversible, and you won't be able to
                retrieve its details. Please proceed with caution!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDeleteTrip} variant="contained">
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmDeleteTrip}
                variant="contained"
                style={{
                  backgroundColor: "#DA291C",
                  color: "#FFFFFF",
                  marginLeft: "8px",
                }}
                autoFocus
              >
                DELETE
              </Button>
            </DialogActions>
          </Dialog>
          <IconButton title="Edit Trip" onClick={handleTripEditClick}>
            <EditIcon />
          </IconButton>
          <Dialog open={openTripEditDialog} onClose={handleTripEditDialogClose} maxWidth="sm">
            <DialogTitle>
              <EditIcon style={{ marginRight: '8px' }} /> Edit Trip
            </DialogTitle>
            <DialogContent>
              <TextField
                label="Title"
                name="title"
                value={formTripEditData.title}
                onChange={handleTripEditChange}
                fullWidth
                variant="outlined"
                style={{
                  marginBottom: "16px",
                  marginTop: "16px",
                  width: "300px",
                }}
              />
              <Autocomplete
                freeSolo
                id="origin-autocomplete"
                disableClearable
                options={suggestions.map((option) => option.description)}
                onChange={(event, newValue) => {
                  setFormTripEditData(prevData => ({ ...prevData, origin: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Origin"
                    name="origin"
                    variant="outlined"
                    onChange={(event) => {
                      handleTripEditChange(event);
                    }}
                    style={{ marginBottom: '16px', width: "300px" }}
                    InputProps={{ ...params.InputProps, type: 'search' }}
                  />
                )}
              />
              <Autocomplete
                freeSolo
                id="destination-autocomplete"
                disableClearable
                options={suggestions.map((option) => option.description)}
                onChange={(event, newValue) => {
                  setFormTripEditData(prevData => ({ ...prevData, destination: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destination"
                    name="destination"
                    variant="outlined"
                    onChange={(event) => {
                      handleTripEditChange(event);
                    }}
                    style={{ marginBottom: '16px', width: "300px" }}
                    InputProps={{ ...params.InputProps, type: 'search' }}
                  />
                )}
              />
              {loading && <p>Loading suggestions...</p>}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleTripEditDialogClose}
                color="primary"
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTripEditSubmit}
                color="primary"
                variant="contained"
                sx={{ backgroundColor: "#DA291C" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <IconButton
            title="Dashboard List"
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
                          <img src="editIcon.png" alt="EditIconTrip" />
                        </IconButton>
                      )}
                    </ListItemIcon>
                  </IconButton>
                )}
              </MenuItem>
            ))}
            <MenuItem onClick={() => navigate("/create-trip-dashboard")}>
              <ListItemIcon>
                <AddIcon sx={{ color: colors.greenAccent[600] }} />
              </ListItemIcon>
              <ListItemText primary="Add new" />
            </MenuItem>
          </RadioGroup>
        </Menu>
      </Box>

      {/* GRID & CHARTS */}

      <Box borderRadius="12px" backgroundColor="#25222F" overflow="auto">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={breakpoints}
          cols={cols}
          onLayoutChange={handleLayoutChange}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
        >
          {/* Trip Summary Cards */}

          {layout.map((gridItem) => {
            if (gridItem.i === "tripCostSummaryCard") {
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
                      style={{ fontSize: tripCostSummaryFontSize }}
                      display="inline"
                      color="#FFFFFF"
                      fontWeight="800"
                    >
                      {tripsData?.speed?.maxSpeed !== null &&
                      tripsData?.speed?.maxSpeed !== undefined
                        ? tripsData.speed.maxSpeed.toFixed(0)
                        : "N.A"}
                    </Typography>
                    <Typography
                      style={{ fontSize: `${tripCostSummaryFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.Speed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${tripCostSummaryFontSize / 3}px` }}
                      color="#828282"
                    >
                      Max Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "tripDistanceSummaryCard") {
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
                      style={{ fontSize: tripDistanceSummaryFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      {tripsData.totalDistance
                        ? tripsData.totalDistance.toFixed(2)
                        : "0.00"}
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${tripDistanceSummaryFontSize / 3}px`,
                      }}
                      display="inline"
                      alignItems="center"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.Distance}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${tripDistanceSummaryFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Trip Distance
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "fuelConsumptionSummaryCard") {
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
                      style={{ fontSize: fuelConsumptionSummaryFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      N.A.
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${fuelConsumptionSummaryFontSize / 3}px`,
                      }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${fuelConsumptionSummaryFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Fuel Consumption
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "tripDurationSummaryCard") {
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
                      fontWeight="800"
                      style={{ fontSize: tripDurationSummaryFontSize }}
                    >
                      {(tripsData?.time?.tripTime / 3600).toFixed(2)}
                    </Typography>
                    <Typography
                      style={{
                        fontSize: `${tripDurationSummaryFontSize / 3}px`,
                      }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.tripTime}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        fontSize: `${tripDurationSummaryFontSize / 3}px`,
                      }}
                      color="#828282"
                    >
                      Trip Duration
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "fuelSpentSummaryCard") {
              return (
                <Box
                  key={gridItem.i}
                  borderRadius="12px"
                  p="30px"
                  border={1}
                  borderColor="#312F3C"
                  backgroundColor="#312F3C"
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
                      fontWeight="800"
                      style={{ fontSize: fuelSpentSummaryFontSize }}
                    >
                      N.A
                    </Typography>
                    <Typography
                      style={{ fontSize: `${fuelSpentSummaryFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${fuelSpentSummaryFontSize / 3}px` }}
                      color="#828282"
                    >
                      Fuel Spent
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "avgSpeedSummaryCard") {
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
                      style={{ fontSize: avgSpeedSummaryFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      {tripsData?.speed?.avgSpeed !== null &&
                      tripsData?.speed?.avgSpeed !== undefined
                        ? tripsData.speed.avgSpeed.toFixed(0)
                        : "N.A"}
                    </Typography>
                    <Typography
                      style={{ fontSize: `${avgSpeedSummaryFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.Speed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${avgSpeedSummaryFontSize / 3}px` }}
                      color="#828282"
                    >
                      Avg. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }

            /* TIME GRID */

            if (gridItem.i === "timeGrid") {
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
                      {tripsData && tripsData.time && (
                        <PieChartTripDetails data={tripsData.time} />
                      )}
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
                          {/* <Typography variant="subtitle1">65%</Typography> */}
                        </Box>
                        <Box ml={2}>
                          <Typography color="#B7A7B4">Moving Time</Typography>
                          <Typography variant="h3">
                            {formatTime(tripsData?.time?.movingTime)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon
                            sx={{ color: "#FF0000", fontSize: "26px" }}
                          />
                          {/* <Typography variant="subtitle1">30%</Typography> */}
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">
                            Time in Traffic
                          </Typography>
                          <Typography variant="h3">
                            {formatTime(tripsData?.time?.trafficTime)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2} display="flex" alignItems="center">
                        <Box display="flex" flexDirection="column">
                          <CircleIcon
                            sx={{ color: "#4298B5", fontSize: "26px" }}
                          />
                          {/* <Typography variant="subtitle1">05%</Typography> */}
                        </Box>
                        <Box mr={2}></Box>
                        <Box>
                          <Typography color="#B7A7B4">Idle Time</Typography>
                          <Typography variant="h3">
                            {formatTime(tripsData?.time?.idleTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            }

            /* MAP GRID */

            if (gridItem.i === "mapGrid") {
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
                  {selectedOption !==
                    "76f345d6-0a55-4001-811e-61d0356f3f54" && (
                    <IconButton
                      aria-label="delete"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "white",
                        zIndex: 1000,
                      }}
                      onClick={() => removeAnyGridFromLayout(gridItem.i)}
                    >
                      <DeleteIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  )}
                  <Box onMouseDown={(e) => e.stopPropagation()}>
                    {latLang.length > 0 && (
                      <MapContainer
                        attributionControl={false}
                        bounds={[
                          latLang[0], // Start position
                          latLang[latLang.length - 1], // End position
                        ]}
                        style={{
                          borderRadius: "12px 12px 0px 0px",
                          height: "400px",
                        }}
                      >
                        <TileLayer url="https://atlas.microsoft.com/map/tile/png?api-version=1&layer=basic&style=dark&tileSize=512&view=Auto&zoom={z}&x={x}&y={y}&subscription-key=6vuNs7oLJKeZR-z9RUSKw0wlXtq6oTjBB-_t9BWPwhU" />
                        <Polyline positions={latLang} color="red" />
                        <Marker position={latLang[0]} icon={customStartMarker}>
                          <Popup>Start</Popup>
                        </Marker>
                        <Marker
                          position={latLang[latLang.length - 1]}
                          icon={customEndMarker}
                        >
                          <Popup>End</Popup>
                        </Marker>
                      </MapContainer>
                    )}
                    {latLang.length > 0 && (
                      <Slider
                        sx={{
                          m: "12px 0px 12px 0px",
                          color: "red",
                          display: "none",
                        }}
                        defaultValue={50}
                        aria-label="Default"
                      />
                    )}
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
                            {tripsData?.speed?.avgSpeed
                              ? tripsData.speed.avgSpeed.toFixed(2)
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.Speed}
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
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            {tripsData?.fuelConsumption
                              ? tripsData.fuelConsumption.toFixed(2)
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.fuelConsumption}
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
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            {tripsData?.elevation?.gainedElevation
                              ? tripsData.elevation.gainedElevation.toFixed(2)
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.Elevation}
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
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            {tripsData?.engineLoad?.avgEngineLoad
                              ? tripsData.engineLoad.avgEngineLoad.toFixed(2)
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.EngineLoad}
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
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            <ArrowDropUp
                              sx={{
                                color: "yellow",
                              }}
                            />
                            {tripsData?.ambientTemperature
                              ?.maxAmbientTemperature
                              ? tripsData.ambientTemperature.maxAmbientTemperature.toFixed(
                                  0
                                )
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.ambientTemperature}
                          </Typography>
                          <Typography variant="h3" fontWeight="600">
                            <ArrowDropDown
                              sx={{
                                color: "red",
                              }}
                            />
                            {tripsData?.ambientTemperature
                              ?.minAmbientTemperature
                              ? tripsData.ambientTemperature.minAmbientTemperature.toFixed(
                                  0
                                )
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.ambientTemperature}
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
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography variant="h3" fontWeight="600">
                            <ArrowDropUp
                              sx={{
                                color: "yellow",
                              }}
                            />
                            {tripsData?.coolantTemperature
                              ?.maxCoolantTemperature
                              ? tripsData.coolantTemperature.maxCoolantTemperature.toFixed(
                                  0
                                )
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.coolantTemperature}
                          </Typography>
                          <Typography variant="h3" fontWeight="600">
                            <ArrowDropDown
                              sx={{
                                color: "red",
                              }}
                            />
                            {tripsData?.coolantTemperature
                              ?.minCoolantTemperature
                              ? tripsData.coolantTemperature.minCoolantTemperature.toFixed(
                                  0
                                )
                              : "N.A"}
                          </Typography>
                          <Typography mt="5px" sx={{ color: colors.grey[500] }}>
                            {unitName.coolantTemperature}
                          </Typography>
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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
                            sx={{
                              color: colors.greenAccent[600],
                              fontSize: "26px",
                            }}
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

            {
              /* FUEL CONSUMPTION GRAPH */
            }

            if (gridItem.i === "fuelConsumptionGrid") {
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
                    <LineChartTripDetails
                      data={fuelConsumptionData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend={unitName.fuelConsumption}
                    />
                    {/* <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                    >
                      <Typography variant="h6" fontWeight="600" color="#F4F4F4">
                        No data available
                      </Typography>
                    </Box> */}
                  </Box>
                </Box>
              );
            }

            {
              /* FUEL LEVEL GRAPHIC GRID */
            }

            if (gridItem.i === "fuelLevelGraphicGrid") {
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
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={fuelConsumptionData}
                      dataKeyX="distance"
                      dataKeyY="fuelConsumption"
                      axisLeftLegend={unitName.fuelSpent}
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

            {
              /* SPEED GRAPHIC */
            }

            if (gridItem.i === "speedGraphicGrid") {
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
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={speedGraphData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend={unitName.Speed}
                    />
                  </Box>
                </Box>
              );
            }

            {
              /* ELEVATION GAIN GRAPHIC */
            }

            if (gridItem.i === "elevationGainGraphicGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    {elevationData && elevationData.length > 0 && (
                      <LineChartTripDetails
                        data={elevationData}
                        dataKeyX="distance"
                        dataKeyY="elevation"
                        axisLeftLegend={unitName.Elevation}
                      />
                    )}
                    {elevationData && elevationData.length === 0 && (
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

            {
              /* AMBIENT TEMPERATURE GRAPHIC */
            }

            if (gridItem.i === "ambientTempGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={ambientTempData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend={unitName.ambientTemperature}
                    />
                    {ambientTempData && ambientTempData.length === 0 && (
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

            {
              /* COOLANT TEMPERATURE GRAPHIC */
            }

            if (gridItem.i === "coolantTempGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={coolantTempData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend={unitName.coolantTemperature}
                    />
                    {coolantTempData && coolantTempData.length === 0 && (
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

            {
              /* Cards Grid */
            }

            if (gridItem.i === "startLevelCard") {
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
                    <Typography
                      style={{ fontSize: startLevelFontSize }}
                      display="inline"
                      color="#FFFFFF"
                      fontWeight="800"
                    >
                      86
                    </Typography>
                    <Typography
                      style={{ fontSize: `${startLevelFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${startLevelFontSize / 3}px` }}
                      color="#828282"
                    >
                      Start Level
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "endLevelCard") {
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
                    <Typography
                      style={{ fontSize: endLevelFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      26
                    </Typography>
                    <Typography
                      style={{ fontSize: `${endLevelFontSize / 3}px` }}
                      display="inline"
                      alignItems="center"
                      color={colors.greenAccent[500]}
                    >
                      l
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${endLevelFontSize / 3}px` }}
                      color="#828282"
                    >
                      End Level
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "fuelSpentCard") {
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
                    <Typography
                      style={{ fontSize: fuelSpentFontSize }}
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                    >
                      60
                    </Typography>
                    <Typography
                      style={{ fontSize: `${fuelSpentFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.fuelSpent}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${fuelSpentFontSize / 3}px` }}
                      color="#828282"
                    >
                      Fuel Spent
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "avgSpeedCard") {
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
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: avgSpeedFontSize }}
                    >
                      86
                    </Typography>
                    <Typography
                      style={{ fontSize: `${avgSpeedFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.Speed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${avgSpeedFontSize / 3}px` }}
                      color="#828282"
                    >
                      Avg. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "maxSpeedCard") {
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
                    <Typography
                      display="inline"
                      color={colors.grey[100]}
                      fontWeight="800"
                      style={{ fontSize: maxSpeedFontSize }}
                    >
                      {tripsData?.speed?.maxSpeed !== null &&
                      tripsData?.speed?.maxSpeed !== undefined
                        ? tripsData.speed.maxSpeed.toFixed(0)
                        : "N.A"}
                    </Typography>
                    <Typography
                      style={{ fontSize: `${maxSpeedFontSize / 3}px` }}
                      display="inline"
                      color={colors.greenAccent[500]}
                    >
                      {unitName.Speed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${maxSpeedFontSize / 3}px` }}
                      color="#828282"
                    >
                      Max Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "minSpeedCard") {
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
                    <Typography
                      style={{ fontSize: minSpeedFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      126
                    </Typography>
                    <Typography
                      style={{ fontSize: `${minSpeedFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.Speed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${minSpeedFontSize / 3}px` }}
                      color="#828282"
                    >
                      Min. Speed
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "maxElevationCard") {
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
                    <Typography
                      style={{ fontSize: maxElevationFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      1306
                    </Typography>
                    <Typography
                      style={{ fontSize: `${maxElevationFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.Elevation}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${maxElevationFontSize / 3}px` }}
                      color="#828282"
                    >
                      Max Elevation
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (gridItem.i === "minElevationCard") {
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
                    <Typography
                      style={{ fontSize: minElevationFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      126
                    </Typography>
                    <Typography
                      style={{ fontSize: `${minElevationFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.Elevation}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${minElevationFontSize / 3}px` }}
                      color="#828282"
                    >
                      Min Elevation
                    </Typography>
                  </Box>
                </Box>
              );
            }
            if (gridItem.i === "elevationGainCard") {
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
                    <Typography
                      style={{ fontSize: elevationGainFontSize }}
                      fontWeight="800"
                      display="inline"
                    >
                      1306
                    </Typography>
                    <Typography
                      style={{ fontSize: `${elevationGainFontSize / 3}px` }}
                      color={colors.greenAccent[500]}
                      display="inline"
                    >
                      {unitName.Elevation}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      style={{ fontSize: `${elevationGainFontSize / 3}px` }}
                      color="#828282"
                    >
                      Elevation Gain
                    </Typography>
                  </Box>
                </Box>
              );
            }

            // Custom Journee Dashboard Requirement

            if (gridItem.i === "fuelLevelGraphicBarChartGrid") {
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
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleFuelLevelGraphicBarChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={fuelConsumptionData}
                      indexBy="distance"
                      keys={["value"]}
                      axisLeftLegend="l/100km"
                    />
                  </Box>
                  <Menu
                    anchorEl={anchorFuelLevelGraphicBarChartGridChartSwitcher}
                    open={Boolean(
                      anchorFuelLevelGraphicBarChartGridChartSwitcher
                    )}
                    onClose={
                      handleFuelLevelGraphicBarChartGridChartSwitcherMenu
                    }
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
                          onClick={handleFuelLevelGraphicChartGridSwitchClick}
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

            if (gridItem.i === "fuelLevelGraphicLineChartGrid") {
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
                        FUEL LEVEL GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleFuelLevelGraphicLineChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={fuelConsumptionData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend="l/100km"
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
                    anchorEl={anchorFuelLevelGraphicLineChartGridChartSwitcher}
                    open={Boolean(
                      anchorFuelLevelGraphicLineChartGridChartSwitcher
                    )}
                    onClose={
                      handleFuelLevelGraphicLineChartGridChartSwitcherMenu
                    }
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
                          onClick={handleFuelLevelGraphicChartGridSwitchClick}
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

            if (gridItem.i === "fuelConsumptionBarChartGrid") {
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
                    <IconButton
                      onClick={handleFuelConsumptionBarChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={fuelConsumptionData}
                      keys={["value"]}
                      indexBy="distance"
                      axisLeftLegend="l/100km"
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
                    anchorEl={anchorFuelConsumptionBarChartGridChartSwitcher}
                    open={Boolean(
                      anchorFuelConsumptionBarChartGridChartSwitcher
                    )}
                    onClose={handleFuelConsumptionBarChartGridChartSwitcherMenu}
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
                          onClick={handleFuelConsumptionChartGridSwitchClick}
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

            if (gridItem.i === "fuelConsumptionLineChartGrid") {
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
                    <IconButton
                      onClick={handleFuelConsumptionLineChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={fuelConsumptionData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend="l/100km"
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
                    anchorEl={anchorFuelConsumptionLineChartGridChartSwitcher}
                    open={Boolean(
                      anchorFuelConsumptionLineChartGridChartSwitcher
                    )}
                    onClose={
                      handleFuelConsumptionLineChartGridChartSwitcherMenu
                    }
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
                          onClick={handleFuelConsumptionChartGridSwitchClick}
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

            if (gridItem.i === "speedGraphicBarChartGrid") {
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
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleSpeedGraphicBarChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={speedGraphData}
                      indexBy="distance"
                      keys={["value"]}
                      axisLeftLegend="km/h"
                    />
                  </Box>
                  <Menu
                    anchorEl={anchorSpeedGraphicBarChartGridChartSwitcher}
                    open={Boolean(anchorSpeedGraphicBarChartGridChartSwitcher)}
                    onClose={handleSpeedGraphicBarChartGridChartSwitcherMenu}
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
                      {" "}
                      <MenuItem>
                        <LineChartIcon
                          onClick={handleSpeedGraphicChartGridSwitchClick}
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

            if (gridItem.i === "speedGraphicLineChartGrid") {
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
                        SPEED GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleSpeedGraphicLineChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={speedGraphData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend="km/h"
                    />
                  </Box>
                  <Menu
                    anchorEl={anchorSpeedGraphicLineChartGridChartSwitcher}
                    open={Boolean(anchorSpeedGraphicLineChartGridChartSwitcher)}
                    onClose={handleSpeedGraphicLineChartGridChartSwitcherMenu}
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
                          onClick={handleSpeedGraphicChartGridSwitchClick}
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

            if (gridItem.i === "elevationGainGraphicBarChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={
                        handleElevationGainGraphicBarChartGridMoreIconClick
                      }
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={elevationData}
                      indexBy="distance"
                      keys={["elevation"]}
                      axisLeftLegend="m"
                    />
                  </Box>
                  <Menu
                    anchorEl={
                      anchorElevationGainGraphicBarChartGridChartSwitcher
                    }
                    open={Boolean(
                      anchorElevationGainGraphicBarChartGridChartSwitcher
                    )}
                    onClose={
                      handleElevationGainGraphicBarChartGridChartSwitcherMenu
                    }
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
                          onClick={
                            handleElevationGainGraphicChartGridSwitchClick
                          }
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

            if (gridItem.i === "elevationGainGraphicLineChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        ELEVATION GAIN GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={
                        handleElevationGainGraphicLineChartGridMoreIconClick
                      }
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={elevationData}
                      dataKeyX="distance"
                      dataKeyY="elevation"
                      axisLeftLegend="m"
                    />
                  </Box>
                  <Menu
                    anchorEl={
                      anchorElevationGainGraphicLineChartGridChartSwitcher
                    }
                    open={Boolean(
                      anchorElevationGainGraphicLineChartGridChartSwitcher
                    )}
                    onClose={
                      handleElevationGainGraphicLineChartGridChartSwitcherMenu
                    }
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
                          onClick={
                            handleElevationGainGraphicChartGridSwitchClick
                          }
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

            if (gridItem.i === "ambientTempBarChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleAmbientTempBarChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={ambientTempData}
                      indexBy="distance"
                      keys={["value"]}
                      axisLeftLegend="c"
                    />
                  </Box>
                  <Menu
                    anchorEl={anchorAmbientTempBarChartGridChartSwitcher}
                    open={Boolean(anchorAmbientTempBarChartGridChartSwitcher)}
                    onClose={handleAmbientTempBarChartGridChartSwitcherMenu}
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
                          onClick={handleAmbientTempChartGridSwitchClick}
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

            if (gridItem.i === "ambientTempLineChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        AMBIENT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleAmbientTempLineChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={ambientTempData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend="c"
                    />
                  </Box>
                  <Menu
                    anchorEl={anchorAmbientTempLineChartGridChartSwitcher}
                    open={Boolean(anchorAmbientTempLineChartGridChartSwitcher)}
                    onClose={handleAmbientTempLineChartGridChartSwitcherMenu}
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
                          onClick={handleAmbientTempChartGridSwitchClick}
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

            if (gridItem.i === "coolantTempBarChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleCoolantTempBarChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <BarChartTripDetails
                      data={coolantTempData}
                      indexBy="distance"
                      keys={["value"]}
                      axisLeftLegend="c"
                    />
                    {coolantTempData && coolantTempData.length === 0 && (
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
                    anchorEl={anchorCoolantTempBarChartGridChartSwitcher}
                    open={Boolean(anchorCoolantTempBarChartGridChartSwitcher)}
                    onClose={handleCoolantTempBarChartGridChartSwitcherMenu}
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
                          onClick={handleCoolantTempChartGridSwitchClick}
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

            if (gridItem.i === "coolantTempLineChartGrid") {
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
                        sx={{
                          color: colors.greenAccent[600],
                          fontSize: "26px",
                        }}
                      />
                      <Typography variant="h5" fontWeight="600" color="#F4F4F4">
                        COOLANT TEMPERATURE GRAPHIC
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={handleCoolantTempLineChartGridMoreIconClick}
                    >
                      <MoreVertIcon
                        sx={{ color: colors.grey[100], fontSize: "26px" }}
                      />
                    </IconButton>
                  </Box>
                  <Box height="85%" m="-20px 0 0 0">
                    <LineChartTripDetails
                      data={coolantTempData}
                      dataKeyX="distance"
                      dataKeyY="value"
                      axisLeftLegend="c"
                    />
                    {coolantTempData && coolantTempData.length === 0 && (
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
                    anchorEl={anchorCoolantTempLineChartGridChartSwitcher}
                    open={Boolean(anchorCoolantTempLineChartGridChartSwitcher)}
                    onClose={handleCoolantTempLineChartGridChartSwitcherMenu}
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
                          onClick={handleCoolantTempChartGridSwitchClick}
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
                <LocalGasStationIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Level Graphic" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("fuelLevelGraphicBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("fuelLevelGraphicLineChartGrid")
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
                  onClick={() =>
                    addAnyChartsGridToLayout("fuelConsumptionBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("fuelConsumptionLineChartGrid")
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText primary="Speed Graphic" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("speedGraphicBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("speedGraphicLineChartGrid")
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LandscapeOutlined />
              </ListItemIcon>
              <ListItemText primary="Elevation Gain Graphic" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("elevationGainGraphicBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout(
                      "elevationGainGraphicLineChartGrid"
                    )
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DeviceThermostatOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Ambient Temperature Graphic" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("ambientTempBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("ambientTempLineChartGrid")
                  }
                />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DeviceThermostatOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Coolant Temperature Graphic" />
              <IconButton>
                <BarChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("coolantTempBarChartGrid")
                  }
                />
              </IconButton>
              <IconButton>
                <LineChartIcon
                  onClick={() =>
                    addAnyChartsGridToLayout("coolantTempLineChartGrid")
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

            {/* Map Column */}

            <ListItem button onClick={() => addMapGridToLayout("mapGrid")}>
              <ListItemText primary="Map View" />
            </ListItem>

            {/* "Cards" column */}
            <ListItem>
              <ListItemText primary="Cards" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("tripCostSummaryCard")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Max Speed" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("tripDistanceSummaryCard")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Trip Distance" />
            </ListItem>
            <ListItem
              button
              onClick={() =>
                addAnyCardsGridToLayout("fuelConsumptionSummaryCard")
              }
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Consumption" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("tripDurationSummaryCard")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Trip Duration" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("fuelSpentSummaryCard")}
            >
              <ListItemIcon>
                <ViewCarouselIcon />
              </ListItemIcon>
              <ListItemText primary="Fuel Spent" />
            </ListItem>
            <ListItem
              button
              onClick={() => addAnyCardsGridToLayout("avgSpeedSummaryCard")}
            >
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

export default DetailedTripView;
