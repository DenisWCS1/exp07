const express = require("express");
const userHandlers = require("./userHandlers");
//const bodyParser = require("body-parser");
const app = express();
const { hashPassword } = require("./auth.js");
const port = process.env.APP_PORT ?? 5001;

require("dotenv").config;
app.use(express.json());
//app.use(bodyParser.json({ type: "application/json" }));
//app.use(bodyParser.urlencoded({ extended: true }));

const homeMessage = (req, res) => {
    res.send("Welcome")
};

app.get("/", homeMessage);
//app.get("/api/allusers", userHandlers.getUsers);
app.get("/api/user/:id", userHandlers.getUserById);
app.put("/api/user/:id", hashPassword, userHandlers.updateUser);
app.post("/api/user", hashPassword, userHandlers.postUser);

app.listen(port, (err) => {
    if (err) {
        console.log("Somehting bad happened");
    } else {
        console.log("Server is listening on port ", port)
    }
});