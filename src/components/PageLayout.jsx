import { AuthenticatedTemplate } from "@azure/msal-react";
import { UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import Dashboard from "../scenes/dashboard/dashboard";
import Topbar from "../scenes/global/Topbar";
import Sidebar from "../scenes/global/Sidebar";
import RecordedTrips from "../scenes/recordedTrips/recordedTrips";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import UserProfile from "../scenes/userProfile/userProfile";
import Errors from "../scenes/errors/errors";
import CompareTrips from "../scenes/compareTrips/compareTrips";
import WebSettings from "../scenes/webSettings/webSettings";
import DetailedTripView from "../scenes/detailedTripView/detailedTripView";
import VehicleSettings from "../scenes/vehicleSettings/vehicleSettings";
import AddNewVehicle from "../scenes/addNewVehicle/addNewVehicle";
import CustomDashboards from "../scenes/customDashboards/customDashboards";
import CreateDashboard from "../scenes/createDashboard/createDashboard";
import About from "../scenes/about/about";
import DownloadYourData from "../scenes/downloadYourData/downloadYourData";
import { VehicleProvider } from '../VehicleContext';
import { GridProvider } from '../GridContext';
import CreateTripDashboard from "../scenes/createTripDashboard/createTripDashboard";
import Help from "../scenes/help/help";
import LogoutSuccessfulRedirect from "../scenes/logoutSuccessfulRedirect/LogoutSuccessfulRedirect";
import TermsAndConditions from "../scenes/termsAndConditions/TermsAndConditions";
import GDPR from "../scenes/gdpr/gdpr";
import LegalStatements from "../scenes/legalStatements/LegalStatements";



export const PageLayout = () => {
  const [isSidebar, setIsSidebar] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { instance } = useMsal();
  let activeAccount;

  useEffect(() => {
    if (!activeAccount && instance) {
      handleLoginRedirect();
    }
  }, []);

  const handleLoginRedirect = () => {
    instance.loginRedirect(loginRequest).catch((error) => console.log(error));
  };

  return (
    <>
      <AuthenticatedTemplate>
        <div className="app">
          <GridProvider>
            <Sidebar className={`${isSidebarCollapsed ? 'sd-collapsed' : 'sd-expanded'}`} setIsSidebarCollapsed={setIsSidebarCollapsed} />
            <main className={`content ${isSidebarCollapsed ? 'ct-collapsed' : 'ct-expanded'}`}>
              <VehicleProvider>
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/recorded-trips" element={<RecordedTrips />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/compare-trips" element={<CompareTrips />} />
                  <Route path="/errors" element={<Errors />} />
                  <Route path="/settings" element={<WebSettings />} />
                  <Route path="/trip-details/id/:tripId" element={<DetailedTripView />} />
                  <Route path="/vehicles" element={<VehicleSettings />} />
                  <Route path="/add-vehicle" element={<AddNewVehicle />} />
                  <Route path="/create-dashboard" element={<CreateDashboard />} />
                  <Route path="/journee-dashboards" element={<CustomDashboards />} />
                  <Route path="/create-trip-dashboard" element={<CreateTripDashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/download-data" element={<DownloadYourData />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/gdpr" element={<GDPR />} />
                  <Route path="/legal-statements" element={<LegalStatements />} />
                </Routes>
              </VehicleProvider>
            </main>
          </GridProvider>
        </div>
      </AuthenticatedTemplate>
      <div className="navigation">
        <UnauthenticatedTemplate>
          <Routes>
            <Route path="/logout-successful" element={<LogoutSuccessfulRedirect />} />
          </Routes>
        </UnauthenticatedTemplate>
      </div>
    </>
  );
};
