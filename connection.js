const mongoose = require("mongoose");

//const dotenv=require("dotenv");
//dotenv.config({path:"./config.env"});"mongodb://127.0.0.1:27017/bigbusket"

const db = process.env.DATABASE;
mongoose.connect("mongodb://127.0.0.1:27017/bigbusket")
//mongoose.connect(db)
    //mongoose.connect(db)
    .then(() => {
        console.log("server is connect with mongodb");
    }).catch((err) => {
        console.log(err);
    });