import mysql from 'mysql'

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'nidhinkg100@gmail',
    database:'blog'
})