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
  parallelism: 1,
};
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
      res.sendStatus(500);
    });
};

const verifyPassword = (req, res) => {
  /*
j'utilise argon 2 pour voir les possibilités de argon 2 voir dans  \node_modules\argon2\argon2.js à la fin on peut voir 
qu'il exporte module.exports = { defaults, limits, hash, needsRehash, verify, ...types };
ici ont utilise la fonction vérify qui va récuperer le champs req.user.hashedPasswor et comparer avec le mot de passe en clair envoyer par l'utilisateur dans le
body avec req.body.password
Il prend req.body.password envoyer avec le mot de passe en clair dans le body 
Il Hash le mot de passe avec hashingParams
Il le compare avec req.user.hashedPassword
  */
  argon2
    .verify(req.user.hashedPassword, req.body.password, hashingParams)
    /*
 ici is verified peut avoir 2 valeur true ou false
  */
    .then((isVerified) => {
      /*
si il est à true
  */
      if (isVerified) {
        /*
Le payload est créer pour le jeton
Une partie “Payload” contenant les informations du jeton, comme par exemple le nom de l’utilisateur, la date d’émission du jeton ou sa date d’expiration le tout en JSON encodé en Base64
Une partie “Signature”, qui correspond à la concaténation des parties “Header” et “Payload” chiffrée avec la clé privée.
Voici un exemple de jeton JWT :
plus d'information sur les jetons ici => https://www.vaadata.com/blog/fr/jetons-jwt-et-securite-principes-et-cas-dutilisation/
Partie “Header” :
{
“alg“:“HS256“,
“typ“:“JWT“
}

Partie“Payload“ :
{
“iat“: 1480929282,
“exp“: 1480932868,
“name“:“Username“
}

  */
        const payload = { sub: req.user.id, iat: new Date().getTime() };
        // ici ont inclu la signature dans le jeton à partir de la clé dans . en à ajouter dans le .env JWT_SECRET=Marionsecret avec la temps avant expiration

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        // Une fois le jeton créer on supprime les mots de passe en cache
        delete req.user.hashedPassword;
        delete req.body.password;
        // Pour information le jeton est afficher dans la console et en réponse (Ne pas utiliser en production)
        console.log(token);
        res.json(token);
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

// La fonction permet de vérifier que le token est valide avant d'appeler les routes poste update delete
const verifyToken = (req, res, next) => {
  // Récupération du champ authorisation dans le header
  try {
    const authorizationHeader = req.header("Authorization");
    // Si il ne contient pas de jeton (si il est  vide)
    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }
    // Si il ne contient pas de jeton (si il est  vide)
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
  verifyToken,
};
