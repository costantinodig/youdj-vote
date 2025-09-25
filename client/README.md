# YouDJ Vote - Client

This is the React frontend client for the YouDJ Vote application.

## Project Structure

This is a React + Vite application with the following structure:

```
client/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Features

- **React 18.2.0** with modern hooks and components
- **Vite 5.4.8** for fast development and building
- **Socket.io Client** for real-time communication with the server
- **DJ Dashboard** for managing songs and playlists
- **Guest Interface** for voting on songs
- **Room-based system** for multiple concurrent events

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Configuration

The Vite configuration includes:
- API proxy to backend server on port 4000
- React plugin for JSX support
- Development server on port 5173

## Next Steps

The current setup provides a complete React Vite template structure. To complete the application, you'll need to:

1. Implement the missing components:
   - `JoinRoom.jsx`
   - `DJDashboard.jsx`
   - `GuestRoom.jsx`

2. Add styling (CSS/SCSS)
3. Connect to the backend API
4. Test real-time functionality

## Backend Connection

The client is configured to connect to a Node.js backend server on port 4000. Make sure the server is running for full functionality.
