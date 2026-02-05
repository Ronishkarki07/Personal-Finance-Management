import mysql from 'mysql2/promise';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'accounting_system'
    });
    
    console.log('Connected to database successfully!');
    
    // Test categories table
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    console.log('Categories count:', rows[0].count);
    
    // Get sample categories
    const [categories] = await connection.execute('SELECT * FROM categories LIMIT 5');
    console.log('Sample categories:', categories);
    
    await connection.end();
    console.log('Database connection test completed successfully!');
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testDatabaseConnection();