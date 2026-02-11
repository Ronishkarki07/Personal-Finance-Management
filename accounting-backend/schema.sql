-- Accounting System Database Schema
CREATE DATABASE IF NOT EXISTS accounting_system;
USE accounting_system;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    bill_photo MEDIUMTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Budget table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget (category, month, year)
);

-- Company information table
CREATE TABLE IF NOT EXISTS company_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT IGNORE INTO categories (name, type, icon, color) VALUES
-- Income categories
('Salary', 'income', '💼', '#43e97b'),
('Freelance', 'income', '💻', '#38f9d7'),
('Business', 'income', '🏢', '#667eea'),
('Investment', 'income', '📈', '#4facfe'),
('Parents', 'income', '👨‍👩‍👧‍👦', '#ff9ff3'),
('Gift', 'income', '🎁', '#f093fb'),
('Other Income', 'income', '💰', '#feca57'),

-- Expense categories
('Food & Dining', 'expense', '🍽️', '#ff6b6b'),
('Transportation', 'expense', '🚗', '#4ecdc4'),
('Shopping', 'expense', '🛍️', '#45b7d1'),
('Entertainment', 'expense', '🎬', '#f39c12'),
('Bills & Utilities', 'expense', '⚡', '#e74c3c'),
('Healthcare', 'expense', '🏥', '#2ecc71'),
('Education', 'expense', '📚', '#9b59b6'),
('Travel', 'expense', '✈️', '#1abc9c'),
('Home & Garden', 'expense', '🏠', '#34495e'),
('Personal Care', 'expense', '💆', '#e67e22'),
('Other Expenses', 'expense', '💸', '#95a5a6');