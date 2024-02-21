import { Box, useTheme, IconButton, Button } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import ProgressCircle from '../../components/ProgressCircle';
import { useState } from "react";





const DownloadYourData = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

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


  const handleDownloadButtonClick = async () => {
    try {
      setIsLoading(true);
      const accessToken = await getToken();
      const response = await axios.get(`${apiUrl}/api/user-data`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'blob',
      });
  
      if (response.status === 200) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(response.data);
        a.download = 'userdata.zip';
  
        a.click();
  
        URL.revokeObjectURL(a.href);
        setIsLoading(false);
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />
      <Box display="flex" justifyContent="flex-start" >
        <IconButton onClick={() => navigate("/settings")} >
          <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
        </IconButton>
      </Box>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header subtitle="Download your complete data stored in our database." />
      </Box>

      {/* Page to Download User Data */}

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="50vh"
        backgroundColor="#25222F"
      >
        <Button onClick={handleDownloadButtonClick} sx={{
          backgroundColor: "#DA291C",
          color: "#FFFFFF",
        }}>
          DOWNLOAD NOW
        </Button>
      </Box>

    </Box>
  );

};

export default DownloadYourData;