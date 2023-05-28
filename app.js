const dotenv = require("dotenv");
const cors = require('cors');
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");


dotenv.config({ path: "./config.env" });
const port = process.env.PORT;

require("./connection");

const userModel = require("./model/schema");

//app.use(express.json());

app.use(cors());
//we can coonect the router file ushinh this middelwear
app.use(cookieParser(""));
app.use(require("./router/auth"));


// app.get("/", (req, res) => {
//     res.send("welcome my root page");
// });

// app.get("/about", (req, res) => {
//     res.send("welcome my about about page");
// });

// app.get("/contact", (req, res) => {
//     res.send("welcome my contact contact page");
// });

// app.get("/signin", (req, res) => {
//     res.send("welcome my signin signin page");
// });

// app.get("/signup", (req, res) => {
//     res.send("welcome my signUP signUP page");
// });

app.listen(port, () => {
    console.log(`connect my backend surver at ${port} port`);
})