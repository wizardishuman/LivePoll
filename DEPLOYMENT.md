# LivePoll Application

A real-time polling application with user authentication and MongoDB Atlas integration.

## Features

- User authentication (register/login)
- Create and share polls
- Real-time voting results
- User dashboard with voting history
- MongoDB Atlas data persistence

## Tech Stack

- **Backend:** Node.js, Express, MongoDB Atlas
- **Frontend:** HTML, CSS, JavaScript (React via CDN)
- **Database:** MongoDB Atlas
- **Authentication:** JWT tokens

## Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb+srv://saurabhpvt999_db_user:sc7MMWLVW6OvAnJ@livepoll.wle6ztd.mongodb.net/livePoll?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=https://your-domain.com
```

## Local Development

1. Install dependencies:
```bash
npm install express mongoose cors crypto dotenv
```

2. Create `.env` file with your MongoDB Atlas credentials

3. Start the server:
```bash
node server.js
```

4. Open http://localhost:5000 in your browser

## Deployment

### Render (Backend)

1. Push code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 5000
   - `FRONTEND_URL`: Your Vercel domain
4. Deploy - Render will automatically install dependencies and start the server

### Vercel (Frontend)

1. Push HTML files to GitHub
2. Connect repository to Vercel
3. Update API URLs in HTML files to your Render backend URL

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/polls/:pollId` - Get poll by ID
- `POST /api/polls` - Create new poll (authenticated)
- `POST /api/votes/:pollId` - Vote on poll (authenticated)
- `GET /health` - Health check

## File Structure

```
LivePoll/
├── server.js              # Main server file
├── .env                    # Environment variables
├── package.json            # Dependencies
├── login.html             # Login/Register page
├── dashboard.html         # User dashboard
├── auth-poll-create.html  # Poll creation page
├── simple-vote.html       # Voting page
└── README.md              # This file
```

## Security Notes

- In production, always hash passwords using bcrypt
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
