import React from "react";
import { Box, CircularProgress } from "@mui/material";

const ProgressCircle = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(0, 0, 0, 0.3)"
          zIndex="9999"
        >
          <CircularProgress
            style={{
              color: "#FFFFFF",
              backgroundImage: `url(https://driveinsightsstorage.blob.core.windows.net/driveinsightscontainer/logo.svg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "50%",
              padding: "4px",
              boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.3)",
            }}
          />
        </Box>
      )}
    </>
  );
};

export default ProgressCircle;
