const express = require("express");
const userHandlers = require("./userHandlers");
const movieHandlers = require("./movieHandlers");
const app = express();
const { hashPassword, verifyPassword, verifyToken } = require("./auth.js");
const port = process.env.APP_PORT ?? 5001;

require("dotenv").config;
app.use(express.json());

const homeMessage = (req, res) => {
    res.send("c'est la homepage")
};


//accueil
app.get("/", homeMessage);

// Routes public
app.get("/api/users", userHandlers.getUsers);
app.get("/api/user/:id", userHandlers.getUserById);
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movie/:id", movieHandlers.getMovieById);

// Route login
app.post("/api/login",userHandlers.GetUserEmailPassword, verifyPassword);

 // Route protected
app.use(verifyToken);

app.post("/api/user", hashPassword, userHandlers.postUser);
app.put("/api/user/:id", hashPassword, userHandlers.updateUser);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);




app.listen(port, (err) => {
    if (err) {
        console.log("Somehting bad happened");
    } else {
        console.log("Server is listening on port ", port)
    }
});