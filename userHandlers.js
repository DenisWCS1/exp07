const database = require("./database");
/*
let sql = "select * from users";
*/
const sqlValues = [];

/*
const getUsers = (req, res) => {
    database
        .query("select * from users")
        .then(([users]) => {
            res.json(users);
        })
        .catch((err) => {
            console.log(err),
                res.status(500).send("Erreur impossible d'executer la requete")
        });
};

*/
const getUserById = (req, res) => {
    const id = Number(req.params.id);
    database
        .query(`select * from users where id = ?`, [id])
        .then(([users]) => {
            if (users[0] != null) {
                res.json(users[0]);
            } else {
                res.status(404).send("Not Found");
            }
        })
        .catch((err) => {
            res.status(500).send("Error retrieving data from database", err);
        });
};


const postUser = (req, res) => {
    const { firstname, lastname, email, city, language, hashedPassword } = req.body;
    database
        .query(
            "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?,?,?,?,?,?)",
            [firstname, lastname, email, city, language, hashedPassword]
        )
        .then(([result]) => {
            res.location(`/api/user/${result.inserID}`).sendStatus(201);
        })
        .catch((err) => {
            res.status(500).send(`Error ${err}`)
        })

}

const updateUser = (req, res) => {
    const id = Number(req.params.id);
    const { firstname, lastname, email, city, language, hashedPassword } = req.body;
    database
        .query(
            "update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? where id = ?",
            [firstname, lastname, email, city, language, hashedPassword, id]
        )
        .then(([result]) => {
            if (result.affectedRows === 1) {
                res.status(404).send("Not Found");
            } else {
                res.sendStatus(204);
            }
        })
        .catch((err) => {
            res.status(500).send("Error editing the user", err);
        });
};

module.exports = {
    getUsers,
    getUserById,
    postUser,
    updateUser
}