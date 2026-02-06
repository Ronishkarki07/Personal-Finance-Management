import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Starting database setup...');
    
    // First connect without specifying database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log('📝 Executing database schema...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database schema created successfully');
    
    // Test connection to the new database
    await connection.changeUser({ database: 'accounting_system' });
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Created tables:', tables.map(t => Object.values(t)[0]));
    
    // Check if categories have data
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    console.log('📊 Categories loaded:', categoryCount[0].count);
    
    // Check budgets table structure
    const [budgetSchema] = await connection.execute('DESCRIBE budgets');
    console.log('💰 Budget table structure verified:', budgetSchema.length, 'columns');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📌 Your accounting system is ready to use');
    console.log('💡 You can now start the backend server with: npm start');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('📋 Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Add some helpful diagnostics
async function checkDatabaseRequirements() {
  console.log('🔍 Checking MySQL installation...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
    
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log('✅ MySQL version:', version[0].version);
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('💡 Make sure MySQL is installed and running');
    console.error('💡 Default connection: host=localhost, user=root, password=""');
    return false;
  }
}

// Main execution
async function main() {
  const mysqlOk = await checkDatabaseRequirements();
  if (!mysqlOk) {
    process.exit(1);
  }
  
  await setupDatabase();
}

main();