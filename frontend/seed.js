import mysql from 'mysql2/promise';
import crypto from 'crypto';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sp@tiz0510',
    database: 'booth_rental'
  });

  const booths = [];
  for(let i=0; i<15; i++) {
    const zone = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    const code = `${zone}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const name = `Gian hàng ${zone}${Math.floor(Math.random() * 100)}`;
    const price = [5000000, 8000000, 10000000, 12000000, 15000000, 20000000][Math.floor(Math.random() * 6)];
    const area = [20, 25, 30, 40, 50, 60][Math.floor(Math.random() * 6)];
    booths.push([
      crypto.randomUUID(), code, name, area, zone, price, 'TRONG', 0, 'Đây là gian hàng trống mới được bổ sung.', null
    ]);
  }

  const sql = "INSERT INTO booths (id, booth_code, name, area, zone, price, status, version, description, thumbnail_url) VALUES ?";
  
  try {
     await connection.query(sql, [booths]);
     console.log('Inserted 15 booths!');
  } catch(e) {
     console.error('Error inserting:', e);
  }
  process.exit();
}

main();
