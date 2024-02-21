# Magna Journee web app

Welcome Journee web application! This repository contains the source code for the journee web app, and it is configured with GitHub Actions for continuous integration and deployment to Azure App Service.

## Getting Started

To get started with this project, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/MAGNA-Global/driveinsights_web_app.git

2. Install dependencies
   ```bash
   npm install

3. Run the development server
   ```bash
   npm start

React app should now be running locally at http://localhost:3000/.

## GitHub Actions Workflow

This project is configured with a GitHub Actions workflow that automates the build and deployment process to Azure App Service. Here's how it works:

When you push changes to the main branch or manually trigger the workflow, GitHub Actions will:

* Build your React app.
* Create a production-ready build in the build directory.
* Deploy the built app to Azure App Service.

## Secrets

For secure configuration, this project uses GitHub Secrets to store information such as API URL to be adaptive with different environments. Make sure to set up the following GitHub Secrets in repository:

* AZURE_WEBAPP_PUBLISH_PROFILE: Azure App Service publish profile for production.
* AZURE_WEBAPP_PUBLISH_PROFILE_DEVELOP: Azure App Service publish profile for development.
* REACT_APP_API_URL: API URL for your application.

## Workflow Status

Check the status of the workflow by navigating to the "Actions" tab in GitHub repository. The workflow runs automatically on pushes to the main branch or when manually triggered.




