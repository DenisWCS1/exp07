const database = require("./database");

const sqlValues = [];
/*
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
*/

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
            if (result.affectedRows === 0) {
                res.status(404).send("Not Found");
            } else {
                console.log("result " + result.changedRows);
                res.status(204).send("result");
            }
        })
        .catch((err) => {
            res.status(500).send("Error editing the user" + err);
        });
};

module.exports = {
    // getUsers,
    getUserById,
    postUser,
    updateUser
}