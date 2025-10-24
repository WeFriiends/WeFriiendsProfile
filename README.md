# WeFriiends Profile API

A backend API service for the WeFriiends social platform that helps people connect and make new friends based on shared interests, location, and compatibility. Built with Node.js, Express, TypeScript, and MongoDB.

## 🌟 Features

- **User Profiles**: Create and manage detailed user profiles with personal information, preferences, and photos
- **Friend Matching**: Advanced matching algorithm based on location, interests, and compatibility
- **Chat System**: Real-time messaging between matched users
- **Like/Dislike System**: Tinder-like functionality for finding potential friends
- **Photo Management**: Upload and manage profile photos
- **Authentication**: Secure OAuth authentication via Auth0
- **API Documentation**: Complete Swagger documentation for all endpoints

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)
- Auth0 account for authentication

## 🔑 Environment Setup

1. Request the `.env` file from your teammates.

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/WeFriiends/WeFriiendsProfile.git
cd WeFriiendsProfile
```

2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## 🚀 Running the Application

### Development Mode

Run the application with hot-reloading for development:

```bash
npm run dev
```

### Production Mode

Build and run the application for production:

```bash
npm run build
npm run start
```

The API will be available at `http://localhost:8080` (or the port specified in your `.env` file).

## 🚀 Deployment

### Deploying to Namecheap Shared Hosting

Follow these steps to deploy the application to Namecheap shared hosting:

1. **Prepare your project for deployment**:

   ```bash
   npm run build
   ```

2. **Create a ZIP archive of the following files/folders**:
   - `dist/` folder (compiled JavaScript)
   - `package.json` and `package-lock.json`
   - `.env` file (make sure to update the environment variables for production)
   - Any other necessary files (e.g., static assets)

3. **Set up your Namecheap hosting account**:
   - Log in to your Namecheap account
   - Go to cPanel for your hosting account
   - Find the "File Manager" tool

4. **Upload and extract your files**:
   - Navigate to the directory where you want to deploy your application (usually `public_html` or a subdirectory)
   - Upload your ZIP archive
   - Extract the ZIP archive

5. **Set up Node.js environment**:
   - In cPanel, find the "Setup Node.js App" tool
   - Create a new Node.js application
   - Set the application path to your uploaded files
   - Set the application URL
   - Set the Node.js version (v14 or later)
   - Set the application startup file to `dist/index.js`
   - Save the configuration

6. **Install dependencies**:
   - Connect to your server via SSH (if available) or use the Terminal in cPanel
   - Navigate to your application directory
   - Run `npm install --production` to install only production dependencies

7. **Configure environment variables**:
   - Make sure your `.env` file is properly configured for production
   - Update the `MONGO_URI` to point to your production MongoDB instance
   - Update the CORS settings in `src/config/middleware.ts` to allow requests from your production frontend URL
   - Rebuild the application if you made changes to the source code

8. **Start your application**:
   - If using the Node.js App setup in cPanel, restart the application
   - If using SSH, you can use a process manager like PM2:
     ```bash
     npm install -g pm2
     pm2 start dist/index.js
     ```

9. **Set up a custom domain or subdomain** (if needed):
   - In cPanel, use the "Domains" or "Subdomains" tool to set up your domain
   - Point the domain to your application directory

10. **Test your deployment**:
    - Visit your application URL to make sure it's working
    - Test the API endpoints using the Swagger documentation or a tool like Postman

### Troubleshooting

- If you encounter a 500 error, check the error logs in cPanel
- Make sure your Node.js version is compatible with your code
- Verify that all environment variables are correctly set
- Check that the MongoDB connection is working
- Ensure that the port specified in your code is allowed by the hosting provider

#### Common Deployment Issues

1. **"Cannot GET /" Error**:
   - Check that the `.htaccess` file has the correct `PassengerStartupFile` path (should be `dist/index.js`)
   - Ensure there are no duplicate Passenger configurations in the `.htaccess` file
   - Verify that the root route ("/") is properly handled in your application

2. **Swagger Shows No Endpoints**:
   - Make sure the Swagger configuration is looking for JavaScript files in the `dist` directory
   - Update the `apis` property in `src/config/swagger.ts` to include both TypeScript and JavaScript files:
     ```javascript
     apis: ["./src/routes/*.ts", "./src/modules/**/*.route.ts", "./dist/routes/*.js", "./dist/modules/**/*.route.js"]
     ```
   - Rebuild the application after making changes

3. **CORS Issues**:
   - Update the CORS configuration in `src/config/middleware.ts` to allow requests from your production domain:
     ```javascript
     cors({
       origin: ["http://localhost:3000", "https://yourdomain.com", "https://www.yourdomain.com"]
     })
     ```
   - Rebuild the application after making changes

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:8080/api-docs
```

This provides interactive documentation for all available endpoints.

## 💻 Technologies

- **Backend**: Node.js, Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth0 (JWT)
- **File Upload**: Multer, Cloudinary
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Other Tools**:
  - Sharp (image processing)
  - Moment (date handling)
  - CORS (cross-origin resource sharing)

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🔍 Core Features Explained

### Profile Management

Users can create and update detailed profiles with personal information, preferences, and photos. The profile includes:

- Basic info (name, date of birth, gender)
- Location data for proximity-based matching
- Zodiac sign (automatically calculated)
- Preferences (languages, smoking habits, education level, etc.)
- Matching preferences (age range, distance)

### Friend Matching System

The application uses several factors to suggest potential friends:

- Geographic proximity (using haversine distance calculation)
- Age preferences
- Shared interests and preferences
- Mutual likes

### Photo Management

Users can upload and manage profile photos with:

- Secure storage using Cloudinary
- Image processing with Sharp
- Multiple photo support

### Chat System

Once users match (mutual likes), they can communicate through the built-in chat system:

- Message history
- Real-time communication
- User-friendly interface

### Privacy Features

- Blacklist functionality to block unwanted connections
- Secure authentication through Auth0
- Data protection measures
