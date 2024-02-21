import { Box, useTheme, TextField, Button, Avatar, MenuItem, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import { useState } from "react";
import axios from "axios";
import { PhotoCameraOutlined } from "@mui/icons-material";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { useNavigate } from "react-router-dom";


const AddNewVehicle = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [licensePlateId, setLicensePlateId] = useState("");
  const [nickname, setNickname] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [year, setYear] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupportedFormat, setIsSupportedFormat] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };

  const handleManufacturerChange = (event) => {
    setManufacturer(event.target.value);
  };
  const handleModelChange = (event) => {
    setModel(event.target.value);
  };
  const handleLicensePlateIdChange = (event) => {
    setLicensePlateId(event.target.value);
  };
  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedFormats = ['jpg', 'jpeg', 'png', 'jfif'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        setIsSupportedFormat(false);
        setImage(null);
        setImageFile(null);
      } else {
        setIsSupportedFormat(true);
        setImage(URL.createObjectURL(file));
        setImageFile(file);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!licensePlateId || !manufacturer || !year || !model) {
      alert("Fields (License Plate Id, Manufacturer, Year, Model) are mandatory.");
      return;
    }

    try {
      setIsSubmitting(true);

      const postVehicleDetails = {
        manufacturer,
        model,
        licensePlateId,
        nickname,
        year,
        price: { value: 1, unit: "eur" }, // Temporarily setting price as unity until how to handle price is devised.
      };

      const accessToken = await getToken();

      const response = await axios.post(
        `${apiUrl}/api/vehicles`,
        postVehicleDetails,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const vehicleId = response.data.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        await axios.put(
          `${apiUrl}/api/vehicles/${vehicleId}/picture`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setIsSubmitting(false);

      navigate("/vehicles");
    } catch (error) {
      console.error(error);
    }
  };

  function YearInput(input) {
    return input.replace(/\D/g, "");
  }

  const handleYearChange = (event) => {
    const inputYear = YearInput(event.target.value);
    const parsedYear = parseInt(inputYear, 10)
    setYear(parsedYear);

    const currentYear = new Date().getFullYear();
    const yearPattern = /^\d{4}$/;

    if (yearPattern.test(inputYear)) {
      const yearValue = parseInt(inputYear);
      if (yearValue >= 1900 && yearValue <= currentYear) {
        setErrorMessage("");
      } else {
        setErrorMessage(
          `Please enter a valid year between 1900 and ${currentYear}`
        );
      }
    } else if (inputYear.length > 0) {
      setErrorMessage("Please enter a valid 4-digit year");
    } else {
      setErrorMessage("");
    }
  };

  return (
    <Box m="0px auto"
      width="100%"
      padding="1rem"
      maxWidth="1200px">

      {/* Vehicle Settings Grid */}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows="auto minmax(60px, auto)"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={1}
      >
        {/* Settings Grid */}
        <Box
          gridColumn="span 12"
          gridRow="1"
          overflow="auto"
          borderRadius="12px"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="10px"
          >
            <label htmlFor="vehicle-image">
              <Avatar
                alt="Vehicle Image"
                src={image}
                style={{
                  width: 100,
                  height: 100,
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                <PhotoCameraOutlined />
              </Avatar>
            </label>
            <input
              type="file" hidden accept=".jpg, .jpeg, .png, .jfif"
              id="vehicle-image"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {!isSupportedFormat && (
              <Box color="error">Please select a file with supported file types: .jpg, .png, .jpeg and .jfif </Box>
            )}
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onSubmit={handleSubmit}
            >
              <TextField
                label="Manufacturer"
                variant="outlined"
                value={manufacturer}
                onChange={handleManufacturerChange}
                style={{ margin: "1rem", width: "100%" }}
              />
              <TextField
                label="Model"
                variant="outlined"
                value={model}
                onChange={handleModelChange}
                style={{ marginBottom: "1rem", width: "100%" }}
              />
              <TextField
                label="License Plate Id"
                variant="outlined"
                value={licensePlateId}
                onChange={handleLicensePlateIdChange}
                style={{ marginBottom: "1rem", width: "100%" }}
              />
              <TextField
                label="Nickname"
                variant="outlined"
                value={nickname}
                onChange={handleNicknameChange}
                style={{ marginBottom: "1rem", width: "100%" }}
              />
              <TextField
                label="Year"
                variant="outlined"
                type="number"
                value={year}
                onChange={handleYearChange}
                error={!!errorMessage}
                helperText={errorMessage}
                style={{ marginBottom: "1rem", width: "100%" }}
                inputProps={{
                  maxLength: 4,
                }}
              />
              {isSubmitting ? (
                <CircularProgress style={{ zIndex: 999, color: "#FFFFFF" }} />
              ) : (
                <Button
                  variant="contained"
                  type="submit"
                  style={{
                    width: "100%",
                    height: "3rem",
                    backgroundColor: "#DA291C",
                    color: "#FFFFFF",
                    marginBottom: "1rem",
                  }}
                  onSubmit={() => handleSubmit()}
                >
                  Add Vehicle
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ width: "100%", height: "3rem" }}
                onClick={() => navigate("/vehicles")}
              >
                Don't save
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddNewVehicle;