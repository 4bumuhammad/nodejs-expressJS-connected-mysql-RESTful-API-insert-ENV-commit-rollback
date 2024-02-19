require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware untuk parsing body permintaan menjadi JSON
app.use(bodyParser.json());


// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  insecureAuth: process.env.DB_INSECUREAUTH
};

// Fungsi untuk menjalankan transaksi
const runTransaction = (transactionFn) => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((error) => {
    if (error) {
      console.error('Gagal membuka koneksi: ', error);
      return;
    }

    connection.beginTransaction((error) => {
      if (error) {
        console.error('Gagal memulai transaksi: ', error);
        connection.rollback(() => {
          console.log('Rollback transaksi');
          connection.end();
        });
        return;
      }

      transactionFn(connection);
    });//connection.beginTransaction

  }); //connection.connect
};


// Menangani permintaan POST untuk operasi INSERT ke dua tabel terkait
app.post('/api/insert-data', (req, res) => {
  const { intbiasa, intpositive, bigintbiasa, mediumintbiasa } = req.body;

  runTransaction((connection) => {
      connection.query('INSERT INTO angka (intbiasa, intpositive) VALUES (?, ?)', [intbiasa, intpositive], (error, results1) => {
        if (error) {
          console.error('Terjadi kesalahan saat insert ke tabel pertama: ', error);
          connection.rollback(() => {
            console.log('Rollback transaksi');
            res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan data pada tabel 1.' });
            connection.end(); // Menutup koneksi database
          });
          return;
        }    

        // Mendapatkan ID yang di-generate dari tabel pertama
        const insertedId1 = results1.insertId;   
        console.log(`Data tabel 1 berhasil ditambahkan | ${insertedId1}`);


        connection.query('INSERT INTO angkabesar (bigintbiasa, mediumintbiasa, angka_autoincr) VALUES (?, ?, ?)', [bigintbiasa, mediumintbiasa, insertedId1], (error, results2) => {
          if (error) {
              console.error('Terjadi kesalahan saat insert ke tabel kedua: ', error);
              connection.rollback(() => {
                console.log('Rollback transaksi');
                res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan data pada tabel 2.' });
                connection.end(); // Menutup koneksi database
              });
              return;
          }

          // Commit transaksi jika sukses
          connection.commit((error) => {
            if (error) {
              console.error('Gagal melakukan commit transaksi: ', error);
              connection.rollback(() => {
                console.log('Rollback transaksi');
                res.status(500).json({ error: 'Terjadi kesalahan saat melakukan commit transaksi.' });
                connection.end(); // Menutup koneksi database
              });
            } else {
              console.log('Transaksi berhasil');
              res.status(200).json({ message: 'Transaksi berhasil.' });
              connection.end(); // Menutup koneksi database
            }
          }); //connection.commit


        }); //connection.query results2

      }); //connection.query results1

  }); //runTransaction

}); //app.post



// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
