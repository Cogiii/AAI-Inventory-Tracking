/**
 * Database Reset Script
 *
 * This script resets the AAI Inventory database by:
 * 1. Dropping the existing database
 * 2. Running schema.sql to create tables
 * 3. Running seed_data.sql for initial data
 * 4. Running all trigger files
 *
 * Usage: node scripts/reset-database.js
 * Or:    npm run db:reset
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_NAME = 'AAI_inventory_db';

// SQL files to execute in order
// Note: schema.sql is handled specially (executed without USE database)
// Other files are executed after switching to the database
const SQL_FILES = [
  { name: 'schema.sql', path: '../../documentation/database/schema.sql', isSchema: true },
  { name: 'seed_data.sql', path: '../../documentation/database/initial_data/seed_data.sql' },
  { name: 'item_status_migration.sql', path: '../../documentation/database/trigger/item_status_migration.sql' },
  { name: 'item_quantity_management.sql', path: '../../documentation/database/trigger/item_quantity_management.sql' },
  { name: 'project_status.sql', path: '../../documentation/database/trigger/project_status.sql' },
  { name: 'multi_warehouse_triggers.sql', path: '../../documentation/database/trigger/multi_warehouse_triggers.sql' }
];

// Console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(message, colors.green);
}

function logError(message) {
  log(message, colors.red);
}

function logInfo(message) {
  log(message, colors.cyan);
}

/**
 * Split SQL file into individual statements
 * Handles DELIMITER changes for triggers/procedures
 */
function splitSqlStatements(sql) {
  // Remove comments (-- style)
  sql = sql.replace(/--[^\n]*\n/g, '\n');

  // Check if file uses DELIMITER (for triggers/procedures)
  if (sql.toUpperCase().includes('DELIMITER')) {
    return splitWithDelimiter(sql);
  }

  // Simple split for regular SQL files
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toUpperCase().startsWith('--'));
}

/**
 * Split SQL that uses DELIMITER for triggers/procedures
 */
function splitWithDelimiter(sql) {
  const statements = [];
  const lines = sql.split('\n');
  let currentDelimiter = ';';
  let currentStatement = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for DELIMITER command
    if (trimmedLine.toUpperCase().startsWith('DELIMITER ')) {
      // Save current statement if any
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
      // Extract new delimiter
      currentDelimiter = trimmedLine.substring(10).trim();
      continue;
    }

    // Check if line ends with current delimiter
    if (trimmedLine.endsWith(currentDelimiter)) {
      // Remove delimiter from end and add to current statement
      const withoutDelimiter = trimmedLine.slice(0, -currentDelimiter.length);
      currentStatement += withoutDelimiter + '\n';

      // Save completed statement
      const stmt = currentStatement.trim();
      if (stmt && !stmt.toUpperCase().startsWith('DELIMITER')) {
        statements.push(stmt);
      }
      currentStatement = '';
    } else {
      // Add line to current statement
      currentStatement += line + '\n';
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    const stmt = currentStatement.trim();
    if (!stmt.toUpperCase().startsWith('DELIMITER')) {
      statements.push(stmt);
    }
  }

  return statements.filter(s => s.length > 0);
}

async function resetDatabase() {
  console.log('\n');
  log('========================================', colors.cyan);
  log('  AAI Inventory Database Reset Script  ', colors.bold + colors.cyan);
  log('========================================', colors.cyan);
  console.log('\n');

  // Database connection config (without database name initially)
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  };

  logInfo(`Connecting to MySQL at ${connectionConfig.host}:${connectionConfig.port}...`);

  let connection;

  try {
    // Connect without database
    connection = await mysql.createConnection(connectionConfig);
    logSuccess('Connected to MySQL server.\n');

    // Drop and recreate database
    logInfo('Dropping existing database if it exists...');
    await connection.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}`);
    await connection.query(`CREATE DATABASE ${DATABASE_NAME}`);
    await connection.query(`USE ${DATABASE_NAME}`);
    logSuccess('Database created.\n');

    // Execute SQL files in order
    for (let i = 0; i < SQL_FILES.length; i++) {
      const file = SQL_FILES[i];
      const filePath = path.join(__dirname, file.path);

      process.stdout.write(`[${i + 1}/${SQL_FILES.length}] Running ${file.name}... `);

      try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          logError(`\n    File not found: ${filePath}`);
          continue;
        }

        // Read SQL file
        let sql = fs.readFileSync(filePath, 'utf8');

        // For schema.sql, remove DROP/CREATE/USE database statements since we already handled that
        if (file.isSchema) {
          sql = sql
            .replace(/DROP\s+DATABASE\s+IF\s+EXISTS\s+\w+\s*;?/gi, '')
            .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+\w+\s*;?/gi, '')
            .replace(/USE\s+\w+\s*;?/gi, '');
        }

        // Remove USE statements from other files too (we're already in the right database)
        sql = sql.replace(/USE\s+AAI_inventory_db\s*;?/gi, '');

        // Split into statements to handle DELIMITER properly
        const statements = splitSqlStatements(sql);

        // Execute each statement
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.query(statement);
            } catch (stmtError) {
              // Log but continue on non-critical errors
              if (!stmtError.message.includes('already exists') &&
                  !stmtError.message.includes('Duplicate')) {
                throw stmtError;
              }
            }
          }
        }

        logSuccess('Done');
      } catch (fileError) {
        logError(`\n    Error: ${fileError.message}`);

        // Continue with next file
        if (i < SQL_FILES.length - 1) {
          logInfo('    Continuing with next file...');
        }
      }
    }

    // Enable event scheduler for scheduled tasks
    console.log('\n');
    logInfo('Enabling MySQL event scheduler...');
    try {
      await connection.query('SET GLOBAL event_scheduler = ON');
      logSuccess('Event scheduler enabled.\n');
    } catch (eventError) {
      log('Warning: Could not enable event scheduler (may require SUPER privilege)', colors.yellow);
      log('    You may need to enable it manually: SET GLOBAL event_scheduler = ON\n', colors.yellow);
    }

    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    logInfo(`Tables created: ${tables.length}`);

    // Success message
    console.log('\n');
    log('========================================', colors.green);
    log('  Database reset complete!             ', colors.bold + colors.green);
    log('========================================', colors.green);
    console.log('\n');
    logInfo('Default admin credentials:');
    log('  Username: admin', colors.bold);
    log('  Password: Password123', colors.bold);
    console.log('\n');

  } catch (error) {
    console.log('\n');
    logError('========================================');
    logError('  Database reset failed!');
    logError('========================================');
    logError(`\nError: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      logInfo('\nMake sure MySQL server is running and accessible.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logInfo('\nCheck your database credentials in the .env file:');
      logInfo('  DB_HOST, DB_USER, DB_PASSWORD, DB_PORT');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      logInfo('Connection closed.');
    }
  }
}

// Run the script
resetDatabase();
