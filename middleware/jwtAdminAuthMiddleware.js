const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { ref } = require("joi");

const getAccessToken = (userID, expires) => {
  return new Promise((resolve, reject) => {
    if (!expires) {
      expires = "24h";
    }
    const payload = {};
    const options = {
      audience: userID.toString(),
      issuer: "bdic",
      expiresIn: expires,
    };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ADMIN_SECRET,
      options,
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
};
const verifyAccessToken = (req, res, next) => {
  const token = req.headers["x-bearer-token"];
  if (!token) {
    return res.status(401).send({ errors: "Unauthorized Access..." });
  }
  jwt.verify(token, process.env.JWT_ADMIN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({errors:createError.Unauthorized(err.message)});
    }
  
    next();
  });
};
const getRefreshToken = (userID) => {
  return new Promise((resolve, reject) => {
    let expires = "30d";
    const payload = {};
    const options = {
      audience: userID.toString(),
      issuer: "naijaleap",
      expiresIn: expires,
    };
  
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_ADMIN_SECRET,
      options,
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  })

};
const JWTAUTH = {
  getAccessToken: getAccessToken,
  verifyAccessToken: verifyAccessToken,
  getRefreshToken: getRefreshToken,
};

module.exports = JWTAUTH;
