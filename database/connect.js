const mysql = require("mysql")
const connection = mysql.createConnection({
    host: "mysql.gb.stackcp.com:63180",
    user: "ordering_user",
    password: "Support5997733",
    database: "ordering_db-3530303381b7"
})

// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "xcodehubproject_db"
// })
// global.user_id = "xcode"


connection.connect((err)=> { 
    if (err) throw err;
    console.error("we are connected",err)
})

module.exports = connection
