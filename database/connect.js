const mysql = require("mysql")
const connection = mysql.createConnection({
    host: "sql301.infinityfree.com",
    user: "if0_38721385",
    password: "Q2U0yKPCpLzS4kg",
    database: "if0_38721385_root22"
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
