import { Box, useTheme, IconButton, Typography } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';



const About = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const aboutStaticText = "WIP: The Journee Webportal visualizes complex trip data based on the data provided by various sensors from the vehicle.";
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    const animationInterval = 30; 

    const typingAnimation = setInterval(() => {
      if (currentIndex <= aboutStaticText.length) {
        setAboutText(aboutStaticText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingAnimation);
      }
    }, animationInterval);

    return () => clearInterval(typingAnimation);
  }, []);


  return (
    <Box m="20px">

      <Box display="flex" justifyContent="flex-start" >
        <IconButton onClick={() => navigate("/settings")} >
          <ArrowCircleLeftOutlinedIcon sx={{ fontSize: "30px" }} />
        </IconButton>
      </Box>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header subtitle="Magna Journee Web Portal." />
      </Box>

      {/* About Drive WebPortal Grid */}

      <Box
        height="100vh"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={1}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center">
          <Typography variant="h5">{aboutText}</Typography>
        </Box>
      </Box>
    </Box>
  );

};

export default About;