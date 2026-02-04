# Accounting System - React Frontend

This is the frontend React application for the Personal Finance Manager.

## Features

- Modern React application with React Router
- Responsive design with dark/light theme support
- Dashboard with charts and statistics
- Income and expense management
- Category management
- Real-time data visualization with Recharts
- Toast notifications
- File upload for bill photos

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on http://localhost:3001

## Installation

1. Navigate to the frontend directory:
```bash
cd accounting-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Make sure the backend server is running on port 3001

## Running the Application

### Development Mode
```bash
npm start
```
The application will start on http://localhost:3000

### Production Build
```bash
npm run build
npm run serve
```

## Features Overview

### Dashboard
- Monthly income, expenses, and balance summary
- Visual charts showing expense categories
- Recent transactions list
- Income vs expenses comparison

### Income Management
- Add, edit, and delete income entries
- Categorize income sources
- Search and filter functionality
- Date-based organization

### Expense Management
- Add, edit, and delete expense entries
- Categorize expenses
- Payment method tracking
- Bill photo upload
- Search and filter functionality

### Additional Features
- Dark/light theme toggle
- Responsive sidebar navigation
- Toast notifications for user feedback
- Form validation and error handling

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/
│   └── Sidebar.js
├── pages/
│   ├── Dashboard.js
│   ├── Income.js
│   ├── Expenses.js
│   ├── MonthlyView.js
│   ├── Categories.js
│   ├── Budget.js
│   ├── Goals.js
│   └── Reports.js
├── services/
│   └── api.js
└── utils/
```

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (one-way operation)

## API Integration

The frontend communicates with the Next.js backend through RESTful APIs. All API calls are centralized in `src/services/api.js` using Axios.

## Responsive Design

The application is fully responsive and works well on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Theme Support

The application supports both light and dark themes, with the preference saved to localStorage.