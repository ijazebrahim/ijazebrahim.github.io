import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import TrainIcon from "@mui/icons-material/Train";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

const TripCard = () => {
  return (
    <Box bgcolor="background.paper" boxShadow={1} borderRadius={2} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            SUN, 14 SEP 22
          </Typography>
          <Typography variant="h6" gutterBottom>
            Morning trip
          </Typography>
        </Box>
        <IconButton>
          <WorkIcon />
        </IconButton>
      </Box>
      <Box pl={2} py={1} display="flex" alignItems="center">
        <AccessTimeIcon color="action" />
        <Box pl={1}>
          <Typography ml="4px" variant="h6" sx={{ color: "#B7A7B4" }}>
            11:35
          </Typography>
          <CircleOutlinedIcon sx={{ color: "#B7A7B4", fontSize: "20px" }} />
          <Typography ml="4px" variant="h6" sx={{ color: "#B7A7B4" }}>
            Hauptbahnhof Wien
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hauptbahnhof Wien
          </Typography>
        </Box>
      </Box>
      <Box pl={2} py={1} display="flex" alignItems="center">
        <LocationOnIcon color="action" />
        <Box pl={1}>
          <Typography variant="body2">16:35</Typography>
          <Typography variant="body2" color="text.secondary">
            Salzburg, Argentinierstrasse 83
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TripCard;
