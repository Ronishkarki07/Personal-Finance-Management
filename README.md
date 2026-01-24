# 💰 Personal Finance Manager

**Track Your Money - Personal Finance Tracker for Nepal**

A complete, frontend-only personal finance management system built with HTML, CSS, and Vanilla JavaScript. Designed for individuals to track income, expenses, and manage their monthly budget in Nepal.

---

## ✨ Features

### 💵 Income Tracking
- Track income from multiple sources (Salary, Freelance, Business, etc.)
- Categorize income by type
- Add detailed descriptions
- View income history with search and filters

### 💸 Expense Management
- Record all your expenses
- Categorize expenses (Food, Rent, Transportation, etc.)
- Track payment methods (Cash, Bank, Card, Mobile Payment)
- Search and filter expense history

### 📅 Monthly View
- View income and expenses by month
- Navigate between months
- See monthly totals and savings
- Track spending patterns

### 🏷️ Categories
- Pre-configured income categories (Salary, Freelance, Business, etc.)
- Pre-configured expense categories (Food, Rent, Utilities, etc.)
- Easy category management

### 🎯 Budget Planning
- Set monthly budgets (Coming soon)
- Track spending against budget
- Get alerts when approaching limits

### 🎖️ Savings Goals
- Set financial goals (Coming soon)
- Track progress toward goals
- Visualize savings journey

### 📊 Reports
- **Income Report**: View income breakdown by category
- **Expense Report**: Analyze spending by category
- **Monthly Summary**: Month-by-month financial overview
- **Yearly Summary**: Annual financial performance

### 💾 Data Management
- All data stored locally in your browser
- Backup and restore functionality
- Export reports as CSV
- Import data from backups

### 🎨 User Interface
- Modern, clean design
- Dark mode support
- Responsive (works on mobile and desktop)
- Smooth animations
- Intuitive navigation

---

## 🚀 Getting Started

### Installation

1. **Download** or **Clone** this repository
2. **No installation required!** Just open `index.html` in your browser

```bash
# Option 1: Direct open
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### First-Time Setup

1. **Open** `index.html` in your web browser
2. The system will automatically initialize with default categories
3. Start adding your income and expenses!

---

## 📖 How to Use

### Adding Income

1. **Click** "+ Add Income" button on dashboard or Income page
2. **Enter** details:
   - Date
   - Amount (in Rs.)
   - Category (Salary, Freelance, etc.)
   - Source (e.g., "Monthly Salary from ABC Company")
   - Description (optional)
3. **Save** the income record

**Keyboard Shortcut**: `Ctrl/Cmd + I`

### Adding Expenses

1. **Click** "+ Add Expense" button on dashboard or Expenses page
2. **Enter** details:
   - Date
   - Amount (in Rs.)
   - Category (Food, Rent, etc.)
   - Payment Method (Cash, Bank, Card, etc.)
   - Description
3. **Save** the expense record

**Keyboard Shortcut**: `Ctrl/Cmd + E`

### Viewing Monthly Summary

1. **Navigate** to "Monthly View" from sidebar
2. **Use** Previous/Next buttons to navigate months
3. **View** total income, expenses, and savings for each month

### Generating Reports

1. **Go to** "Reports" page
2. **Click** on any report type:
   - Income Report
   - Expense Report
   - Monthly Summary
   - Yearly Summary
3. **Export** as CSV if needed

---

## 💡 Tips for Better Money Management

### Track Everything
- Record every income and expense, no matter how small
- Be consistent with daily tracking
- Use descriptive names for better clarity

### Categorize Properly
- Use appropriate categories for accurate reports
- Be consistent with category selection
- Review categories monthly

### Review Regularly
- Check your monthly view at the end of each month
- Analyze expense reports to find spending patterns
- Identify areas where you can save money

### Set Goals
- Define clear financial goals
- Track progress regularly
- Celebrate milestones

---

## 📊 Sample Categories

### Income Categories
- 💼 Salary
- 💻 Freelance
- 🏢 Business
- 📈 Investment
- 🎁 Gift
- 💰 Other Income

### Expense Categories
- 🍽️ Food & Dining
- 🚗 Transportation
- 🏠 Rent
- 💡 Utilities
- 🏥 Healthcare
- 🎬 Entertainment
- 🛍️ Shopping
- 📚 Education
- 📱 Internet & Phone
- 💸 Other Expenses

---

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + I**: Add Income
- **Ctrl/Cmd + E**: Add Expense
- **Escape**: Close Modal

---

## 💾 Data & Privacy

### Local Storage
- All your financial data is stored **locally** in your browser
- **No server**, **no cloud**, **no external APIs**
- **Your data never leaves your computer**
- Complete privacy and security

### Backup & Restore
- Regular backups recommended
- Use the "Backup Data" button to download your data
- Store backups in a safe location
- Use "Restore Data" to import backups

---

## 🔧 Technical Details

### Technology Stack
- **HTML5**: Structure
- **CSS3**: Styling with modern design
- **Vanilla JavaScript**: All functionality
- **IndexedDB**: Primary storage
- **LocalStorage**: Fallback storage

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (limited support)

### File Structure
```
index.html              # Main HTML file
css/
  └── style.css         # Complete styling
js/
  ├── utils/
  │   └── helpers.js    # Utility functions
  ├── core/
  │   └── storage.js    # Data storage
  ├── modules/
  │   ├── income.js     # Income management
  │   ├── expenses.js   # Expense management
  │   ├── monthlyView.js # Monthly view
  │   ├── categories.js  # Category management
  │   ├── budget.js      # Budget planning
  │   ├── reports.js     # Financial reports
  │   └── goals.js       # Savings goals
  └── app.js            # Main application
```

---

## 🎯 Future Enhancements

- [ ] Budget planning (full implementation)
- [ ] Savings goals tracking (full implementation)
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Multi-currency support
- [ ] Charts and graphs
- [ ] Mobile app version
- [ ] Cloud sync option
- [ ] Receipt photo upload
- [ ] Tax calculation

---

## 📱 Mobile Usage

The application is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Optimized for small screens
- Swipe gestures supported
- Mobile-first design

---

## 🔒 Security Best Practices

1. **Regular Backups**: Backup your data weekly
2. **Browser Security**: Use a secure, updated browser
3. **Device Security**: Keep your device password-protected
4. **Clear Cache Carefully**: Don't clear browser data without backing up first

---

## 🐛 Troubleshooting

### Data not saving
**Solution**: Ensure cookies/storage is enabled in browser settings

### Can't see my data
**Solution**: Check if you're using the same browser and haven't cleared cache

### Reports showing zero
**Solution**: Make sure you have added income/expenses first

---

## 📄 License

This project is provided as-is for personal use.

---

## 🙏 Acknowledgments

Built with ❤️ for personal finance management in Nepal

**Namaste! 🙏**

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review the documentation
3. Ensure you're using a modern browser

---

## 🎉 Getting Started Checklist

- [ ] Open `index.html` in browser
- [ ] Add your first income
- [ ] Add your first expense
- [ ] Check the monthly view
- [ ] Generate a report
- [ ] Backup your data
- [ ] Set up dark mode (if preferred)

**Happy Tracking! 💰**
