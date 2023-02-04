const argon2 = require("argon2");
const jwt = require("jsonwebtoken"); 
const hashingParams = {
    type: argon2.argon2id,
    /*La quantité de mémoire à utiliser par la fonction de hachage, en KiB. Chaque thread (voir parallélisme ) aura un pool de mémoire de cette taille.
     Notez que des valeurs élevées pour une utilisation hautement simultanée entraîneront une famine et une agitation si votre mémoire système est pleine.
    La valeur par défaut est 65536 , ce qui signifie un pool de 64 Mio par thread.
    */
    memoryCost: 2 ** 16,
    /*Le coût en temps est le nombre de passes (itérations) utilisées par la fonction de hachage. 
    Il augmente la force de hachage au détriment du temps nécessaire au calcul.
    La valeur par défaut est 3 .*/
    timeCost: 3,
    /*
    Le nombre de threads sur lesquels calculer le hachage. Chaque thread a un pool de mémoire avec une memoryCosttaille. 
    Notez que le modifier modifie également le hachage résultant.
    La valeur par défaut est 4 , ce qui signifie que 4 threads sont utilisés.
    */
    parallelism: 1
}
const hashPassword = (req, res, next) => {
    argon2
        .hash(req.body.password, hashingParams)
        .then((hashedPassword) => {
            req.body.hashedPassword = hashedPassword;
            delete req.body.password;
            next();
        })
        .catch((err) => {
            console.error("error hash", err);
            res.sendStatus(500)

        });
};

const verifyPassword = (req, res) => {
    argon2
      .verify(req.user.hashedPassword, req.body.password)
      .then((isVerified) => {
        if (isVerified) {
          const payload = { sub: req.user.id };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          delete req.user.hashedPassword;
          res.send({ token, user: req.user });
        } else {
          res.sendStatus(401);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
  



const verifyToken = (req, res, next) => {
    try {
      const authorizationHeader  = req.header("Authorization");

      if (authorizationHeader  == null) {
        throw new Error("Authorization header is missing");
      }
  
      const [type, token] = authorizationHeader.split(" ");
  
      if (type !== "Bearer") {
        throw new Error("Authorization header has not the 'Bearer' type");
      }
  
      req.payload = jwt.verify(token, process.env.JWT_SECRET);
  
      next();
    } catch (err) {
      console.error(err);
      res.sendStatus(401);
    }
  };

module.exports = {
    hashPassword,
    verifyPassword,
    verifyToken
};

