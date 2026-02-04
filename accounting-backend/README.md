# Accounting System - Next.js Backend

This is the backend API server for the Personal Finance Manager built with Next.js.

## Features

- RESTful API endpoints for income, expenses, categories, and dashboard data
- MySQL database integration
- CORS enabled for frontend communication
- File upload support for bill photos
- Comprehensive error handling

## Prerequisites

- Node.js 18+ 
- MySQL 8+
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd accounting-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a MySQL database named `accounting_system`
   - Import the schema using the provided `schema.sql` file:
   ```bash
   mysql -u root -p accounting_system < schema.sql
   ```

4. Configure environment variables:
   - Copy `.env.local` and update with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=accounting_system
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
The server will start on http://localhost:3001

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses` - Update expense
- `DELETE /api/expenses?id={id}` - Delete expense

### Income
- `GET /api/income` - Get all income
- `POST /api/income` - Create new income
- `PUT /api/income` - Update income
- `DELETE /api/income?id={id}` - Delete income

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id={id}` - Delete category

## Database Schema

The application uses the following main tables:
- `expenses` - Store expense transactions
- `income` - Store income transactions
- `categories` - Store expense and income categories
- `budgets` - Store monthly budgets
- `goals` - Store financial goals

## Tech Stack

- **Framework**: Next.js 14
- **Database**: MySQL with mysql2 driver
- **File Upload**: Multer
- **CORS**: Built-in Next.js CORS handling

## Project Structure

```
src/
├── app/
│   └── api/
│       ├── dashboard/
│       ├── expenses/
│       ├── income/
│       └── categories/
└── lib/
    └── db.js
```