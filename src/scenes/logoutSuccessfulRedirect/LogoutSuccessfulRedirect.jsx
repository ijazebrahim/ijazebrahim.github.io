import React from 'react';
import { Box, Typography, Button } from "@mui/material";

const LogoutSuccessfulRedirect = () => {

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h4">Successfully Logged Out</Typography>
      <Typography variant="body1" style={{ margin: '20px 0' }}>
        You have been successfully logged out.
      </Typography>
      <Button onClick={handleReload} sx={{ bgcolor:"#DA291C", color: "white" }}>
        Login Again
      </Button>
    </Box>
  );
};

export default LogoutSuccessfulRedirect;