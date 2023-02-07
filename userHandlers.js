const database = require("./database");

const sqlValues = [];

// getUserById
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

// getUsers
const getUsers = (req, res) => {
  database
    .query("select * from users")
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving data from database");
    });
};

// postUser
const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;
  database
    .query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?,?,?,?,?,?)",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/user/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      res.status(500).send(`Error ${err}`);
    });
};

// updateUser
const updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;
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

// GetUserEmailPassword
const GetUserEmailPassword = (req, res, next) => {
  const { email } = req.body;
  database
    .query(`select * from users where email = ?`, [email])
    .then(([users]) => {
      if (users[0] != null) {
        req.user = users[0];
        next();
      } else {
        res.status(404);
      }
    })
    .catch((err) => {
      res.status(500).send("Error retrieving data from database", err);
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("delete from users where id = ?", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send("Not Found");
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting the user");
    });
};
module.exports = {
  GetUserEmailPassword,
  getUsers,
  getUserById,
  deleteUser,
  postUser,
  updateUser,
};
