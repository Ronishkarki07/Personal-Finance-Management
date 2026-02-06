# 💾 Database Setup Guide

## Quick Setup

1. **Install MySQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install mysql
   brew services start mysql
   ```

2. **Setup the database**:
   ```bash
   cd accounting-backend
   npm run setup-db
   ```

3. **Test the connection**:
   ```bash
   npm run test-db
   ```

4. **Start the backend**:
   ```bash
   npm start
   ```

## 🗂️ Database Schema

The system creates these tables:
- **📊 expenses** - Track all expenses with categories
- **💰 income** - Record income sources
- **🏷️ categories** - Expense and income categories
- **📋 budgets** - Monthly/yearly budgets per category
- **🎯 goals** - Financial goals and targets
- **🏢 company_info** - Business information

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file if you need custom database settings:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=accounting_system
```

### Default Settings
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: (empty)
- **Database**: accounting_system

## 🆘 Troubleshooting

### "Can't connect to MySQL server"
1. Make sure MySQL is running:
   ```bash
   brew services start mysql
   ```
2. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### "Access denied for user 'root'"
Update your `.env` file with correct credentials or reset MySQL password.

### "Database already exists"
This is fine! The setup script safely handles existing databases.

## 📋 Budget Table Structure

The budget system uses this table structure:
```sql
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget (category, month, year)
);
```

### Key Features:
- **Unique budgets** per category, month, and year
- **Decimal precision** for accurate amounts
- **Auto timestamps** for tracking
- **Category validation** against existing categories

## 🚀 Ready to Go!

Once setup is complete, your budget system will:
✅ Store budgets by category and month
✅ Track spending against budgets
✅ Calculate remaining amounts
✅ Provide budget analytics
✅ Support multiple time periods