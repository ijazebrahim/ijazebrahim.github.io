import { Box, Typography, IconButton, Avatar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useMsal } from '@azure/msal-react';
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import { InteractionStatus } from "@azure/msal-browser";
import { b2cPolicies } from '../../authConfig'
import { useState, useEffect } from "react";
import ProgressCircle from '../../components/ProgressCircle';
import axios from 'axios';
import { useNavigate } from "react-router-dom";





const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const previewImage = selectedImage ? URL.createObjectURL(selectedImage) : data.profilePictureUrl;
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupportedFormat, setIsSupportedFormat] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      country: data?.country
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const payload = {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        country: editedData.country,
      };

      const accessToken = await getToken();

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.patch(`${apiUrl}/api/user`, payload, { headers });

      setIsEditing(false);
      setSaveCompleted(true);
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  let activeAccount;
  if (instance) {
    activeAccount = instance.getActiveAccount();
  }

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

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const accessToken = await getToken();
        const response = await axios.get(`${apiUrl}/api/user`, {
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
    })();
  }, [saveCompleted]);

  const handleAvatarClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setErrorMessage("");
    setSelectedImage(null);
    setIsSupportedFormat(true);
  };

  const handleUpdateClick = async () => {
    try {
      setIsLoading(true);

      const file = selectedImage;
      const formData = new FormData();
      formData.append('image', file, file.name);

      const accessToken = await getToken();

      const response = await axios.put(
        `${apiUrl}/api/user/picture`,
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
      setSaveCompleted(true);
    } catch (error) {
      console.error(error);
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
  }

  const handleRemoveButtonClick = async () => {
    try {
      setIsLoading(true);

      const accessToken = await getToken();

      const updatedUser = {
        profilePictureUrl: null,
      };

      const response = await axios.put(
        `${apiUrl}/api/user/`,
        updatedUser,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsLoading(false);
      setDialogOpen(false);
      navigate('/profile');
      document.location.reload();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (inProgress === InteractionStatus.None) {
      instance.acquireTokenRedirect(b2cPolicies.authorities.resetPassword);
    }
  };


  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />

      {/* Overview Grid */}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="60px"
        gap="10px"
        borderRadius="12px"
        height="100vh"
        backgroundColor="#25222F"
        marginBottom={2}
        p={1}
      >

        {/* ROW 1 */}

        <Box
          gridRow="span 4"
          gridColumn="span 8"
          backgroundColor="#292734"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
          position="relative"
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, overflow: "hidden" }} m="6px">
            {!isEditing && (
              <Button
                sx={{
                  color: "white",
                  '&:hover': {
                    backgroundColor: "#312F3C"
                  }
                }}
                onClick={handlePasswordChange}
              >
                <Typography color="#D9D8D9">Change Password</Typography>
              </Button>
            )}
            {isEditing ? (
              <Box>
                <Button variant="contained" onClick={handleCancelClick}>Cancel</Button>
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: "#DA291C",
                    color: "#FFFFFF",
                    marginLeft: "8px"
                  }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            ) : (
              <IconButton
                title="Edit Profile Details"
                variant="info"
                className="profileButton"
                onClick={handleEdit}
              >
                <img src="editIconGrey.png" alt="Edit Icon" />
              </IconButton>
            )}
          </Box>
          <Avatar sx={{ ml: 2, width: 120, height: 120, cursor: 'pointer' }} onClick={handleAvatarClick} src={data.profilePictureUrl} />
          <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                <Box mb={2}>
                  <Avatar sx={{ width: 80, height: 80 }} src={previewImage} />
                </Box>
                {errorMessage && <Box color="error" mb={2}>{errorMessage}</Box>}
                <Button variant="contained" component="label">
                  Choose Image
                  <input type="file" hidden accept=".jpg, .jpeg, .png, .jfif" onChange={handleChooseImageButtonClick} />
                </Button>
                <Box sx={{ display: 'none', displayPrint: 'block' }} mt={2}>
                  <Button color="error" onClick={handleRemoveButtonClick}>Remove Image</Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button sx={{ color: "#FFFFFF" }} onClick={handleDialogClose}>CLOSE</Button>
              <Button sx={{ color: "#FFFFFF", backgroundColor: "#DA291C" }} onClick={handleUpdateClick} disabled={!isSupportedFormat}>UPDATE</Button>
            </DialogActions>
          </Dialog>
          <Box sx={{ ml: 2 }}>
            <Typography color="#D9D8D9" variant="h5" gutterBottom>
              {isEditing ? (
                <TextField
                  label="Name"
                  value={editedData.firstName}
                  onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                  sx={{ marginTop: '4px' }}
                />
              ) : (
                <>
                  <span style={{ marginRight: '60px' }}>Name</span> {data?.firstName || 'N.A'}
                </>
              )}
            </Typography>
            <Typography color="#D9D8D9" paddingTop={1} variant="h5" gutterBottom>
              {isEditing ? (
                <TextField
                  label="Surname"
                  value={editedData.lastName}
                  onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
                  sx={{ marginTop: '4px' }}
                />
              ) : (
                <>
                  <span style={{ marginRight: '38px' }}>Surname</span> {data?.lastName || 'N.A'}
                </>
              )}
            </Typography>
            <Typography color="#D9D8D9" paddingTop={1} variant="h5">
              {isEditing ? (
                <TextField
                  label="Country"
                  value={editedData.country}
                  onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                  sx={{ marginTop: '4px' }}
                />
              ) : (
                <>
                  <span style={{ marginRight: '44px' }}>Country</span> {data?.country || 'N.A'}
                </>
              )}
            </Typography>
            <Typography color="#D9D8D9" paddingTop="14px" variant="h5" gutterBottom>
              {!isEditing && (
                <>
                  <span style={{ marginRight: '60px' }}>Email</span> {data?.email || 'N.A'}
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box >
  );
};

export default UserProfile;
