# User Profile

The repository hosts backend modules for managing user profiles within the "WeFriiends" project. These modules facilitate operations such as registering profiles, retrieving profile information, updating profiles, and deleting profiles. All endpoints require authentication using JWT tokens.

# Setup

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies using ```npm install```.
4. Set up environment variables, including ```MONGODB_URL```.
5. Ensure access to necessary databases and external services.

To obtain ***JWT (JSON Web Token)*** tokens for authentication, typically, ***you would follow a process like this***:

1. User Authentication:

Users authenticate themselves using their credentials (such as email and password) through a designated endpoint in your application (e.g., /api/auth/login).

2. Verify Credentials:

Your backend verifies the provided credentials against the stored data (e.g., in a database).

3. Generate JWT:

Upon successful authentication, your backend generates a JWT token.
This token typically contains a payload (claims) with information about the user (e.g., userId, role), and it's digitally signed with a secret key known only to your server.

4. Send Token to Client:

The generated JWT token is sent back to the client as part of the authentication response.

5. Store Token:

The client stores the received token securely, usually in local storage or in memory.

6. Send Token with Requests:

For subsequent requests to protected endpoints, the client includes the JWT token in the request headers, typically in the Authorization header as a bearer token.

7. Verify Token:

Your backend verifies the authenticity and validity of the JWT token with each request by checking the signature and expiration time.

8. Grant Access:

If the token is valid and the user has the required permissions, the requested operation is performed.

# Github Packages:
Programming Language: ***JavaScript (Node.js)***
Frameworks/Libraries: ***Mongoose, Date utilities***
# Dependencies:
Mongoose: Object modeling tool for MongoDB.
Date utilities: Custom utility functions for date manipulation.

# Commands to Run:

```npm start```: Start the server.


# Running Tests: 
1. Ensure the project is set up locally.
2. Run ```npm test``` to execute tests.
3. Tests are located in the /__tests__ directory.


# Submit pull requests: 

Fork the repository, make changes, and submit a pull request for review.
