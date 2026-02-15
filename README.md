# LivePoll - Real-time Polling Application

A simple, clean, and stable real-time polling web application built with Node.js, Express, React, and Socket.io.

## Features

- **Poll Creation**: Create polls with questions and multiple options
- **Real-time Updates**: Live vote counting using Socket.io
- **Anti-abuse Protection**: Prevents multiple votes from same IP and browser
- **Responsive Design**: Works on desktop and mobile devices
- **Shareable Links**: Generate unique links for each poll
- **Persistent Storage**: All data stored in MongoDB

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.io for real-time communication
- UUID for unique poll IDs

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Socket.io client

## Project Structure

```
LivePoll/
├── server/
│   ├── models/
│   │   └── Poll.js              # Poll and Vote schemas
│   ├── controllers/
│   │   ├── pollController.js    # Poll CRUD operations
│   │   └── voteController.js    # Vote handling
│   ├── routes/
│   │   ├── pollRoutes.js        # Poll API routes
│   │   └── voteRoutes.js        # Vote API routes
│   ├── socket/
│   │   └── socketHandler.js     # Socket.io event handlers
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── CreatePoll.jsx
    │   │   ├── PollResults.jsx
    │   │   ├── Loading.jsx
    │   │   └── NotFound.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   └── PollPage.jsx
    │   ├── hooks/
    │   │   └── useSocket.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── .env.example
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and frontend URL:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=livePoll
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

## Running the Application

1. Start the backend server (port 5000):
```bash
cd server
npm run dev
```

2. Start the frontend server (port 5173):
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Backend (Render)

1. Push your code to a GitHub repository
2. Go to [Render](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Set the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: `5000`
   - `FRONTEND_URL`: Your Vercel app URL
5. Set the build command: `npm install`
6. Set the start command: `npm start`
7. Deploy!

### Frontend (Vercel)

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set the following environment variable:
   - `VITE_API_URL`: Your Render app URL
4. Deploy!

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB Atlas connection string
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## API Endpoints

### Polls
- `POST /api/polls` - Create a new poll
- `GET /api/polls/:pollId` - Get poll by ID

### Votes
- `POST /api/votes/:pollId` - Vote on a poll

## Socket Events

### Client to Server
- `joinPoll` - Join a poll room
- `leavePoll` - Leave a poll room

### Server to Client
- `voteUpdate` - Broadcast vote updates to all clients in a poll room

## Anti-abuse Features

1. **IP-based protection**: Each IP address can vote only once per poll
2. **Browser fingerprinting**: Uses browser fingerprint to prevent multiple votes from same browser
3. **LocalStorage**: Marks when a user has voted in a specific poll

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
