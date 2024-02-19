require('dotenv').config();

const express = require('express');
const mysql = require('mysql');

const app = express();

// Konfigurasi koneksi database MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  insecureAuth: process.env.DB_INSECUREAUTH
});

// // Membuat koneksi ke database
// connection.connect((err) => {
//   if (err) {
//     console.error('Koneksi ke database gagal: ', err);
//   } else {
//     console.log('Koneksi ke database berhasil');
//   }
// });

// // Middleware untuk mengizinkan parsing body dari request
// app.use(express.json());

// // Route untuk menambahkan data baru ke database
// app.post('/data', (req, res) => {
//   const { intbiasa, intpositive } = req.body;

//   // Query INSERT ke database
//   const query = `INSERT INTO angka (intbiasa, intpositive) VALUES (?, ?)`;
//   connection.query(query, [intbiasa, intpositive], (error, results) => {
//     if (error) {
//       console.error('Error saat menambahkan data: ', error);
//       res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan data.', detail : error.message});
//     } else {
//       res.status(201).json({ message: 'Data berhasil ditambahkan' });
//     }
//   });
// });

// Membuka koneksi ke database
connection.connect((error) => {
  if (error) {
    console.error('Koneksi ke database gagal: ', error);
  } else {
    console.log('Koneksi ke database berhasil');

    // Menangani permintaan POST untuk operasi INSERT ke dua tabel terkait
    app.post('/api/insert-data', (req, res) => {
      const { intbiasa, intpositive, bigintbiasa, mediumintbiasa } = req.body;


      // Memulai transaksi
      connection.beginTransaction((error) => {
        if (error) {
          console.error('Gagal memulai transaksi: ', error);
          res.status(500).json({ error: 'Terjadi kesalahan saat memulai transaksi.' });
          return;
        }

        // // Data untuk tabel pertama
        // const dataTable1 = { intbiasa: 2147100001, intpositive: 4294900001 };

        // // Data untuk tabel kedua
        // const dataTable2 = { bigintbiasa: 2147500001, mediumintbiasa: 8000001 };      

        // Operasi INSERT pada tabel pertama
        // connection.query('INSERT INTO angka SET ?', dataTable1, (error, results1) => {
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
          const insertedId1 = results1.autoincr;        

          // Menyisipkan ID dari tabel pertama ke data tabel kedua
          // dataTable2.angka_autoincr = insertedId1;

          // Operasi INSERT pada tabel kedua
          // connection.query('INSERT INTO angkabesar SET ?', dataTable2, (error, results2) => {
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
            });
          });
        });
      });



    });
    

    }
  });          

// Menjalankan server
app.listen(3000, () => {
  console.log('Server berjalan pada port 3000');
});