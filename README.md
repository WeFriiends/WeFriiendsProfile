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
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)
- Auth0 account for authentication

## 🔑 Environment Setup

1. Create a `.env` file in the root directory based on the provided `.env.sample`:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/wefriiends
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-audience
```

- `PORT`: The port on which the server will run
- `MONGO_URI`: Your MongoDB connection string
- `AUTH0_DOMAIN`: Your Auth0 domain
- `AUTH0_AUDIENCE`: Your Auth0 API audience identifier

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

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:8080/api-docs
```

This provides interactive documentation for all available endpoints.

## 📁 Project Structure

```
WeFriiendsProfile/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Express middleware
│   ├── models/         # MongoDB models
│   ├── modules/        # Feature modules
│   │   ├── chat/       # Chat functionality
│   │   ├── deslikes/   # Dislike functionality
│   │   ├── likes/      # Like functionality
│   │   ├── match/      # Match functionality
│   │   ├── photo/      # Photo management
│   │   └── profile/    # User profile management
│   ├── routes/         # API routes
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── index.ts        # Application entry point
│   └── server.ts       # Server configuration
├── uploads/            # Uploaded files storage
├── .env                # Environment variables (create from .env.sample)
├── .env.sample         # Sample environment variables
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

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