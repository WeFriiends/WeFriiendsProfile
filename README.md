# SPA Backend API

This project is a backend API for a Single Page Application (SPA) built with Node.js, Express, TypeScript, and MongoDB. It uses OAuth for authentication via Auth0 and provides a REST API for managing users. The API is documented using Swagger.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [Accessing Swagger Documentation](#accessing-swagger-documentation)
- [Docker Setup](#docker-setup)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or later)
- Docker (optional, for running the application with Docker)
- Docker Compose (optional, for running the application with Docker Compose)

## Environment Variables

Create a `.env` file in the root of the project and add the following environment variables:

```env
PORT=8080
MONGO_URI=mongodb://root:example@mongodb:27017/yourdbname?authSource=admin
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience

Replace your_auth0_domain and your_auth0_audience with your Auth0 configuration details.

Project Setup
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/spa-backend.git
cd spa-backend
Install dependencies:

bash
Copy code
npm install
Build the TypeScript code:

bash
Copy code
npm run build
Running the Application
Running in Development Mode
To run the application in development mode with automatic server restarts on code changes:

bash
Copy code
npm run dev
Running in Production Mode
To run the compiled JavaScript code in production mode:

bash
Copy code
npm run start
Accessing Swagger Documentation
Once the application is running, you can access the Swagger documentation at:

bash
Copy code
http://localhost:8080/api-docs
This URL will display the Swagger UI with all the API documentation.

Docker Setup
Using Docker Compose
Build and run the containers:

bash
Copy code
docker-compose up --build
Access the application:

The Node.js application will be available at http://localhost:3000.
The MongoDB service will be accessible at mongodb://localhost:27017.
Contributing
If you would like to contribute to this project, please fork the repository and create a pull request with your changes. Make sure to follow the code style and include tests for any new features or bug fixes.

License
This project is licensed under the MIT License. See the LICENSE file for more information.

vbnet
Copy code

### Summary

This `README.md` file provides clear instructions on setting up and running the project, including both local and Docker-based setups. It also includes a section for accessing the Swagger documentation to help users easily test and understand the API endpoints. Feel free to customize it further to suit your project's needs.

### Hotkeys:
- Z: Write finished fully implemented code to files. Zip user files, download link
- N: Netlify auto Deploy, instantly create static site
- REPL: Replit auto Deploy, instantly export to replit.com
- B: Use Search browser tool