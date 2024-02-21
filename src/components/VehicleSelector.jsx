import { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { msalInstance } from "../index.js";
import { loginRequest } from "../authConfig.js";
import { tokens } from "../theme.js";
import { VehicleContext } from "../VehicleContext.js";
import { useNavigate } from "react-router-dom";

const VehicleSelector = () => {
  const [options, setOptions] = useState([]);
  const [optionsDataFetched, setOptionsDataFetched] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [accessToken, setAccessToken] = useState(null);
  const { selectedActiveVehicle, setSelectedValue } = useContext(VehicleContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      setAccessToken(accessToken);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${apiUrl}/api/vehicles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setOptions(data);
      // Set dataFetched to true once data is fetched
      setOptionsDataFetched(true);
    };

    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  useEffect(() => {
    if (optionsDataFetched) {
      if (options.length > 0) {
        if (
          !selectedActiveVehicle ||
          !options.some((option) => option.id === selectedActiveVehicle)
        ) {
          setSelectedValue(options[0]?.id);
        }
      } else {
        setSelectedValue(null);
      }
    }
  }, [optionsDataFetched, options]);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    localStorage.removeItem("selectedTripIds");
    window.dispatchEvent(new Event("local-storage-update"));
    navigate("/");
  };

  const SelectWithIcon = styled(Select)({
    display: "flex",
    alignItems: "center",
  });

  const Icon = styled("img")({
    marginRight: 8,
  });

  return (
    <FormControl sx={{ height: "auto", minWidth: 120 }}>
      <InputLabel>Select Vehicle</InputLabel>
      <SelectWithIcon
        value={selectedActiveVehicle}
        onChange={handleChange}
        sx={{ display: "flex" }}
        renderValue={(selected) => (
          <>
            {options.find((option) => option.id === selected)
              ?.vehiclePictureUrl ? (
              <Icon
                src={
                  options.find((option) => option.id === selected)
                    ?.vehiclePictureUrl
                }
                alt=""
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            ) : (
              <DirectionsCarOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "40px" }}
              />
            )}
            {options.find((option) => option.id === selected)?.manufacturer}{" "}
            {options.find((option) => option.id === selected)?.model}{" "}
            {options.find((option) => option.id === selected)?.nickname &&
              `(${options.find((option) => option.id === selected)?.nickname})`}
          </>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.vehiclePictureUrl ? (
              <Icon
                src={option.vehiclePictureUrl}
                alt={option.model}
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            ) : (
              <DirectionsCarOutlinedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "40px" }}
              />
            )}
            {option.manufacturer} {option.model}{" "}
            {option.nickname && `(${option.nickname})`}
          </MenuItem>
        ))}
      </SelectWithIcon>
    </FormControl>
  );
};

export default VehicleSelector;
