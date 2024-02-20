# nodejs sederhana dengan framework expressjs #

---

instalasi expressjs:

    > npm install express


pastikan sebelumnya telah menginstall paket diperlukan yaitu :

- mysql, dotenv


    - cara install

            ❯ npm install mysql

            `#install locally (recommended)`

            ❯ npm install dotenv --save


    - tampilkan list paket
    
            ❯ npm list
        
                ├── dotenv@16.0.3
    
                ├── express@4.18.0
            
                └── mysql@2.18.1


periksa file json dan buat file js secara manual serta isinya.

- package.json

- app.js

- .env

---

    ❯ cat .env

        DB_HOST=127.0.0.1
        DB_USER=root
        DB_PASSWORD=password
        DB_DATABASE=ujimysqlkudb
        DB_PORT=3309
        DB_INSECUREAUTH=true
        
---



jalankan (command) :

    ❯ node app.js
        op:
        Server running on port 3000


---


desclimer:

saat menjalankan pertama kali pada container mysql maka akan terdapat error sebagai berikut:

    ❯ node app.js


Server berjalan pada port 3000
Koneksi ke database gagal:  Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client

untuk mengatasi hal tersebut lakukan langkah berikut:

    ❯ mysql -h 127.0.0.1 -P 3309 -u root -p --ssl-mode=DISABLED

        mysql> ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
        Query OK, 0 rows affected (0.03 sec)

        mysql> use ujimysqlkudb;
        

        mysql> select * from angkabesar;
        Empty set (0.01 sec)


        mysql> show columns in angkabesar;
        +----------------+-----------+------+-----+---------+----------------+
        | Field          | Type      | Null | Key | Default | Extra          |
        +----------------+-----------+------+-----+---------+----------------+
        | bigintincr     | bigint    | NO   | PRI | NULL    | auto_increment |
        | bigintbiasa    | bigint    | YES  |     | NULL    |                |
        | mediumintbiasa | mediumint | YES  |     | NULL    |                |
        | angka_autoincr | int       | YES  |     | NULL    |                |
        +----------------+-----------+------+-----+---------+----------------+
        4 rows in set (0.01 sec)


        mysql> insert into angkabesar(bigintbiasa,mediumintbiasa,angka_autoincr) values(2147500000,8000000,6);
        Query OK, 1 row affected (0.01 sec)


        mysql> insert into angkabesar(bigintbiasa,mediumintbiasa,angka_autoincr) values(2147500000,8400000,5);
        ERROR 1264 (22003): Out of range value for column 'mediumintbiasa' at row 1


        mysql> select * from angkabesar;
        +------------+-------------+----------------+----------------+
        | bigintincr | bigintbiasa | mediumintbiasa | angka_autoincr |
        +------------+-------------+----------------+----------------+
        |          1 |  2147500000 |        8000000 |              6 |
        +------------+-------------+----------------+----------------+
        1 row in set (0.01 sec)


        mysql> SELECT b.bigintincr, a.intbiasa, a.intpositive, b.bigintbiasa, b.mediumintbiasa FROM angkabesar AS b LEFT JOIN angka AS a ON b.angka_autoincr = a.autoincr;
        +------------+------------+-------------+-------------+----------------+
        | bigintincr | intbiasa   | intpositive | bigintbiasa | mediumintbiasa |
        +------------+------------+-------------+-------------+----------------+
        |          1 | 2147100000 |  4294900000 |  2147500000 |        8000000 |
        +------------+------------+-------------+-------------+----------------+
        1 row in set (0.00 sec)

---

lanjut coba jalankan kembali aplikasi

    ❯ node app.js

        Server berjalan pada port 3000
        Terhubung ke database MySQL

---


eksekusi dengan CURL:
- contoh 1

        curl -X POST -H "Content-Type: application/json" -d '{ "intbiasa": 2147100001, "intpositive": 4294900001, "bigintbiasa": 2147500001, "mediumintbiasa": 8000001 }' http://localhost:3000/api/insert-data

    output :

        {"message":"Transaksi berhasil."}


- contoh 2 ( skenario gagal insert pada tabel ke-2 )

        curl -X POST -H "Content-Type: application/json" -d '{ "intbiasa": 2147100001, "intpositive": 4294900001, "bigintbiasa": 2147500001, "mediumintbiasa": 8900002 }' http://localhost:3000/api/insert-data

    output :

        {"error":"Terjadi kesalahan saat menambahkan data pada tabel 2."}



---

### check data

    ❯ mysql -h 127.0.0.1 -P 3309 -u root -p --ssl-mode=DISABLED

        Enter password: password

        mysql> use ujimysqlkudb;

        mysql> SELECT b.bigintincr, a.intbiasa, a.intpositive, b.bigintbiasa, b.mediumintbiasa FROM angkabesar AS b LEFT JOIN angka AS a ON b.angka_autoincr = a.autoincr;

        +------------+------------+-------------+-------------+----------------+
        | bigintincr | intbiasa   | intpositive | bigintbiasa | mediumintbiasa |
        +------------+------------+-------------+-------------+----------------+
        |          1 | 2147100000 |  4294900000 |  2147500000 |        8000000 |
        |          4 | 2147100001 |  4294900001 |  2147500001 |        8000001 |
        |          5 | 2147100001 |  4294900001 |  2147500001 |        8000001 |
        +------------+------------+-------------+-------------+----------------+
        3 rows in set (0.01 sec)


### mekanisme backup database

    ❯ mysqldump -h 127.0.0.1 -P 3309 -u root -p ujimysqlkudb > backup_ujimysqlkudb.sql

        Enter password: