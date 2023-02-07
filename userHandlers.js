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
//Je créer ma fonction pour vérifier l'email de l'utilisateur
const GetUserEmailPassword = (req, res, next) => {
  /*
 Ici par exemple dans postman le body envoyer correspond à 
     {
        "email": "denis@denis.com",
        "password": "azerty1234"
    }
    donc Email =     {
        "email": "denis@denis.com",
        "password": "azerty1234"
    }
  */
  const { email } = req.body;
  /*
je me connecte à la base de données
  */
  database
    /*
 Je selectionne le champ correspondant à l'email dans la base de données
  */
    .query(`select * from users where email = ?`, [email])
    /*
  J'affecte le résultat au tableau user donc user =
  {
    "id": 11,
    "firstname": "Denis",
    "lastname": "Doe",
    "email": "denis@denis.com",
    "city": "Nantes",
    "language": "English",
    "hashedPassword": "$argon2id$v=19$m=65536,t=3,p=1$ZQzcKsErRLxOf/snU4658w$0BH++qfIsXVoXGKZbAAEfela16XefVh4iASLL+P2e1E"
}
  */
    .then(([users]) => {
      /*
Je vérifie que le premier champs n'est pas vide en gros que l'email à été trouvé dans la bdd
  */
      if (users[0] != null) {
        /*
j'affecte la valeur du premier champ du tableau à req.user pour ensuite l'utiliser dans vérify password
  */
        req.user = users[0];
        /*
 Je passe sur le middleware verifypassword
  */
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
