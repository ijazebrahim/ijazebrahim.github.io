import {
  Box,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ButtonGroup,
} from "@mui/material";
import { tokens } from "../../theme";
import { useMsal } from "@azure/msal-react";
import { b2cPolicies } from "../../authConfig";
import { InteractionStatus } from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { msalInstance } from "../../index.js";
import { loginRequest } from "../../authConfig.js";
import ProgressCircle from "../../components/ProgressCircle";
import UnitPreferenceContext from "../../UnitPreferenceContext.js";

const WebSettings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { unitPreference, setUnitPreference } = useContext(
    UnitPreferenceContext
  );
  const [selectedUnit, setSelectedUnit] = useState(unitPreference);

  useEffect(() => {
    setUnitPreference(selectedUnit);
  }, [selectedUnit]);

  const apiUrl = process.env.REACT_APP_API_URL;

  let activeAccount;
  if (instance) {
    activeAccount = instance.getActiveAccount();
  }
  const handlePasswordChange = () => {
    if (inProgress === InteractionStatus.None) {
      instance.acquireTokenRedirect(b2cPolicies.authorities.resetPassword);
    }
  };

  const getToken = async () => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
      const accessToken = tokenResponse.idToken;
      return accessToken;
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccountButtonClick = () => {
    setDeleteConfirmationPopup(true);
  };

  const handlePopUpConfirm = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getToken();
      await axios.delete(`${apiUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      window.location.href =
        "https://magnajournee.b2clogin.com/magnajournee.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_DEMO_DELETE_MY_ACCOUNT&client_id=ce454e6c-e88c-43e9-baa8-f6dc9fef556c&nonce=defaultNonce&redirect_uri=https%3A%2F%2Fjournee.magna.com&scope=openid&response_type=id_token&prompt=login";
    } catch (error) {
      console.error("Error deleting account:", error);
    }

    setDeleteConfirmationPopup(false);
  };

  const handlePopUpCancel = () => {
    setDeleteConfirmationPopup(false);
  };

  return (
    <Box m="20px">
      <ProgressCircle isLoading={isLoading} />
      <Box mb="24px"></Box>
      {/* Settings Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        height="100vh"
        gap="10px"
        borderRadius="12px"
        backgroundColor="#25222F"
        p={1}
        alignItems="start"
      >
        <Box
          gridColumn="span 3"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          backgroundColor="#312F3C"
          borderRadius="12px"
          border={1}
          borderColor="#312F3C"
          p={2}
          gap={1}
          height="auto"
        >
          <Button
            onClick={() => navigate("/about")}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>About</Typography>
          </Button>
          <Button
            onClick={() => navigate("/download-data")}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>Download Your Data</Typography>
          </Button>
          <Button
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
            onClick={handlePasswordChange}
          >
            <Typography>Change Password</Typography>
          </Button>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={1}
            paddingLeft={"8px"}
          >
            <Typography>UNIT:</Typography>
            <ButtonGroup
              variant="outlined"
              size="small"
              aria-label="Basic button group"
              color="secondary"
            >
              <Button
                onClick={() => setSelectedUnit("metric")}
                color={selectedUnit === "metric" ? "primary" : "secondary"}
                variant={selectedUnit === "metric" ? "contained" : "outlined"}
              >
                Metric
              </Button>
              <Button
                onClick={() => setSelectedUnit("imperial")}
                color={selectedUnit === "imperial" ? "primary" : "secondary"}
                variant={selectedUnit === "imperial" ? "contained" : "outlined"}
              >
                Imperial
              </Button>
            </ButtonGroup>
          </Box>
          <Button
            onClick={() => navigate("/terms-and-conditions")}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>TERMS AND CONDITIONS</Typography>
          </Button>
          <Button
            onClick={() => navigate("/gdpr")}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>GDPR AGREEMENTS</Typography>
          </Button>
          <Button
            onClick={() => navigate("/legal-statements")}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>LEGAL STATEMENTS</Typography>
          </Button>
          <Button
            onClick={handleDeleteAccountButtonClick}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "red",
              },
            }}
          >
            <Typography>Delete Account</Typography>
          </Button>
          <Dialog open={deleteConfirmationPopup} onClose={handlePopUpCancel}>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                By proceeding, all your account data will be permanently erased,
                and the account deletion process will be initiated. This action
                is irreversible, and you won't be able to recover your data
                after deletion.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handlePopUpCancel}>
                NOT NOW
              </Button>
              <Button
                onClick={handlePopUpConfirm}
                sx={{ backgroundColor: "red", color: "white" }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default WebSettings;
