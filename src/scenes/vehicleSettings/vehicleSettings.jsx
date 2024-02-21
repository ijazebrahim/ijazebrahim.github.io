import { Box, Typography, useTheme, Button, Avatar, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from 'axios';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { useNavigate } from 'react-router-dom';
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import ProgressCircle from '../../components/ProgressCircle';


const VehicleSettings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [manufacturer, setManufacturer] = useState(editMode ? selectedVehicle.manufacturer : '');
  const [model, setModel] = useState(editMode ? selectedVehicle.model : '');
  const [licensePlateId, setLicensePlateId] = useState(editMode ? selectedVehicle.licensePlateId : '');
  const [nickname, setNickname] = useState(editMode ? selectedVehicle.nickname : '');
  const [year, setYear] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fuelTypes = ['petrol', 'diesel'];
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaveCompletedOpen, setIsSaveCompletedOpen] = useState(false);
  const previewImage = selectedImage ? URL.createObjectURL(selectedImage) : selectedVehicle.vehiclePictureUrl;
  const [isSupportedFormat, setIsSupportedFormat] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

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

  const navigate = useNavigate();

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
  };

  const handleUpdateClick = async () => {
    try {
      setIsLoading(true);

      const vehicleId = selectedVehicle.id;

      const formData = new FormData();
      formData.append('image', selectedImage);

      const accessToken = await getToken();

      const response = await axios.put(
        `${apiUrl}/api/vehicles/${vehicleId}/picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsLoading(false);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setManufacturer(selectedVehicle.manufacturer);
    setModel(selectedVehicle.model);
    setLicensePlateId(selectedVehicle.licensePlateId);
    setNickname(selectedVehicle.nickname);
    setYear(selectedVehicle.year);
    setLicensePlateId(selectedVehicle.licensePlateId);
  }, [selectedVehicle]);



  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(
        loginRequest
      );
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };


  const handleBoxClick = (itemId) => {
    const clickedItem = data.find((item) => item.id === itemId);
    setSelectedVehicle(clickedItem);
    setSelectedItemId(itemId);
  };


  const fetchData = async () => {
    try {
      setIsLoading(true);
      const accessToken = await getToken();
      const response = await axios.get(`${apiUrl}/api/vehicles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    setIsLoading(true);
    setConfirmDelete(false);
    const accessToken = await getToken();
    const vehicleId = id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
      await axios.delete(`${apiUrl}/api/vehicles/${vehicleId}`, config);
      fetchData();
      setSelectedVehicle(false);
      setIsSaveCompletedOpen(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  const handleSaveClick = async (id) => {
    try {
      setIsLoading(true);
      const accessToken = await getToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const data = {
        manufacturer,
        model,
        year,
        licensePlateId,
        nickname,
        price: { value: 1, unit: "eur", }
      };

      await axios.patch(`${apiUrl}/api/vehicles/${id}`, data, {
        headers,
      });
      setEditMode(false);
      fetchData();
      setSelectedVehicle(false);
      setIsSaveCompletedOpen(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleSaveCompletedClose = () => {
    setIsSaveCompletedOpen(false);
  };

  const handleAvatarClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setErrorMessage("");
    setSelectedImage(null);
    setIsSupportedFormat(true);
  };

  const handleRemoveButtonClick = async () => {
    try {
      setIsLoading(true);
      const accessToken = await getToken();
      const body = {
        carId: selectedVehicle.carId,
        carImage: "https://zwestvanappgrade.blob.core.windows.net/carimage/defaultCarVector.png", // Set the image to default to remove it
        manufacturer: selectedVehicle.manufacturer,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
        fuelType: selectedVehicle.fuelType,
        cubicCapacity: selectedVehicle.cubicCapacity,
      };

      const response = await axios.put(`${apiUrl}/api/vehicle`, body, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
      });

      console.log(response.data);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('There was a problem with the axios operation:', error);
      setIsLoading(false);
    }
  };

  const handleChooseImageButtonClick = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedFormats = ["jpg", "jpeg", "png", "jfif"];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        setIsSupportedFormat(false);
        setErrorMessage("Please select file with supported file types : .jpg, .png, .jpeg and .jfif");
        setSelectedImage(null);
      } else {
        setIsSupportedFormat(true);
        setErrorMessage("");
        setSelectedImage(file);
      }
    }
  };


  return (
    <Box m="20px">
      {/* HEADER */}
      <ProgressCircle isLoading={isLoading} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header subtitle="Select a vehicle to view the details" />
        <Button sx={{
          backgroundColor: "#DA291C",
          color: "#FFFFFF",
        }} onClick={() => navigate('/add-vehicle')}>
          Add a new vehicle
        </Button>
      </Box>

      {/* Vehicle Settings Grid */}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows="auto minmax(60px, auto)"
        gap="10px"
        borderRadius="12px"
        height="100vh"
        backgroundColor="#25222F"
        p={1}
      >

        {/* Dialog for Actions */}

        <Dialog open={isSaveCompletedOpen} onClose={handleSaveCompletedClose}>
          <DialogTitle>Vehicle Details Updated</DialogTitle>
          <DialogContent>
            {/* Additional content or message here */}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" style={{
              backgroundColor: "#DA291C",
              color: "#FFFFFF"
            }} onClick={handleSaveCompletedClose}>OK</Button>
          </DialogActions>
        </Dialog>
        {/* Settings Grid */}

        <Box
          gridColumn="span 3"
          gridRow="span 10"
          overflow="auto"
          borderRadius="12px"
        >
          {data.map(item => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              backgroundColor={selectedItemId === item.id ? '#434255' : '#312F3C'}
              mb="8px"
              borderRadius="12px"
              p={1}
              sx={{
                cursor: 'pointer',
                ':hover': {
                  backgroundColor: '#434255',
                },
              }}
              onClick={() => handleBoxClick(item.id)}
            >
              <Box display="flex" alignItems="center" width="100%" >
                <Box mr="10px">
                  <Avatar
                    src={item.vehiclePictureUrl}
                    style={{ width: 40, height: 40, borderRadius: '50%' }}
                  >
                    <DirectionsCarOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} />
                  </Avatar>
                </Box>
                <Box display="flex" flexDirection="column" flex="1">
                  <Box >
                    <Typography variant="h6" sx={{ color: colors.grey[100] }}>{item.manufacturer} {item.model} {item.nickname && `(${item.nickname})`}
                    </Typography>
                  </Box>
                </Box>
                {selectedItemId !== item.id && (
                  <Box display="flex" alignItems="center" justifyContent="flex-end" >
                    <Box>
                      <ArrowForwardIosOutlinedIcon />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Vehicle Details Grid */}

        {selectedVehicle && (
          <Box
            display="flex"
            flexDirection="row"
            gridColumn="span 9"
            gridRow="span 6"
            overflow="auto"
            borderRadius="12px"
            backgroundColor="#312F3C"
            p={2}
            position="relative"
          >
            {editMode ? (
              <Box display='flex' flexDirection='column' alignItems='center' sx={{ m: 1 }}>
                <TextField style={{ margin: '1rem', width: '100%' }} label="Manufacturer" onChange={(e) => setManufacturer(e.target.value)} value={manufacturer} />
                <TextField style={{ marginBottom: '1rem', width: '100%' }} label="Model" onChange={(e) => setModel(e.target.value)} value={model} />
                <TextField
                  label="License Plate Id"
                  variant="outlined"
                  value={licensePlateId}
                  onChange={(e) => setLicensePlateId(e.target.value)}
                  style={{ marginBottom: "1rem", width: "100%" }}
                />
                <TextField
                  label="Nickname"
                  variant="outlined"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
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
                <Box mt={2} display="flex" justifyContent="space-between" gap="1rem">
                  <Button variant="contained" onClick={handleCancelClick}>Cancel</Button>
                  <Button variant="contained" style={{
                    backgroundColor: "#DA291C",
                    color: "#FFFFFF"
                  }} onClick={() => handleSaveClick(selectedVehicle.id)}>Save</Button>
                </Box>
              </Box>
            ) : (
              <>
                <IconButton
                  title="Delete Vehicle"
                  onClick={() => setConfirmDelete(true)}
                  sx={{ position: "absolute", top: 0, right: 30 }}
                >
                  <img src="deleteIcon.png" alt="Edit Icon" />
                </IconButton>
                <IconButton
                  title="Edit vehicle details"
                  onClick={handleEditClick}
                  sx={{ position: "absolute", top: 0, right: 0 }}
                >
                  <img src="editIconGrey.png" alt="Edit Icon" />
                </IconButton>

                {/* Delete Component Reusable Later */}

                <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                  <DialogTitle>Delete Vehicle</DialogTitle>
                  <DialogContent>
                    <Typography>Are you sure you want to delete this vehicle?</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button style={{ color: "#FFFFFF" }} onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button style={{ backgroundColor: "#DA291C", color: "#FFFFFF" }} onClick={() => handleDelete(selectedVehicle.id)}>Delete</Button>
                  </DialogActions>
                </Dialog>

                <Avatar alt="Vehicle Image" src={selectedVehicle.vehiclePictureUrl} sx={{ width: 100, height: 100, cursor: 'pointer' }} onClick={handleAvatarClick}> <DirectionsCarOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} /> </Avatar>
                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                  <DialogTitle>Update Vehicle Image</DialogTitle>
                  <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                      <Box mb={2}>
                        <Avatar sx={{ width: 80, height: 80 }} src={previewImage} ><DirectionsCarOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "40px" }} /> </Avatar>
                      </Box>
                      {errorMessage && <Box color="error" mb={2}>{errorMessage}</Box>}
                      <Button variant="contained" component="label">
                        Choose Image
                        <input type="file" hidden accept=".jpg, .jpeg, .png, .jfif" onChange={handleChooseImageButtonClick} />
                      </Button>
                      <Box display="none" mt={2}>
                        <Button variant="outlined" color="error" onClick={handleRemoveButtonClick}>Remove Image</Button>
                      </Box>
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button sx={{ color: "#FFFFFF" }} onClick={handleDialogClose}>Close</Button>
                    <Button sx={{ color: "#FFFFFF", backgroundColor: "#DA291C" }} onClick={handleUpdateClick} disabled={!isSupportedFormat}>UPDATE</Button>
                  </DialogActions>
                </Dialog>
                <Box sx={{ m: 1 }}>
                  <Typography mb="1rem" variant="h5">Manufacturer</Typography>
                  <Typography mb="1rem" variant="h5">Model</Typography>
                  <Typography mb="1rem" variant="h5">License Plate Id</Typography>
                  <Typography mb="1rem" variant="h5">Nickname</Typography>
                  <Typography mb="1rem" variant="h5">Year</Typography>
                </Box>

                <Box sx={{ m: 1 }}>
                  <Typography mb="1rem" variant="h5">{selectedVehicle.manufacturer ? selectedVehicle.manufacturer : "N.A"}</Typography>
                  <Typography mb="1rem" variant="h5">{selectedVehicle.model ? selectedVehicle.model : "N.A"}</Typography>
                  <Typography mb="1rem" variant="h5">{selectedVehicle.licensePlateId ? selectedVehicle.licensePlateId : "N.A"}</Typography>
                  <Typography mb="1rem" variant="h5">{selectedVehicle.nickname ? selectedVehicle.nickname : "N.A"}</Typography>
                  <Typography mb="1rem" variant="h5">{selectedVehicle.year ? selectedVehicle.year : "N.A"}</Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VehicleSettings;