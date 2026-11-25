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

### Automated deployment (.env VPS > main tag > GHCR > VPS): 
> [!WARNING]
> When adding or modifying env variables, you must update the main `.env` file on the VPS before pushing the tag.
[More about automated deployment](https://github.com/WeFriiends/DockerCompose#3-%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%BA%D1%88%D0%B5%D0%BD%D0%B0-%D0%B0%D0%B2%D1%82%D0%BE-%D0%B4%D0%B5%D0%BF%D0%BB%D0%BE%D0%B9)