import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sp@tiz0510',
      database: 'booth_rental'
    });
    
    const [rows] = await connection.query("SHOW COLUMNS FROM booths");
    console.log("Columns:", rows);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
main();
