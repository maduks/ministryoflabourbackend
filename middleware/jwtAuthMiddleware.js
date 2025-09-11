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
      issuer: "pickwave",
      expiresIn: expires,
    };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      options,
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
};
const checkRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
};

const checkMinistryAdmin = (req, res, next) => {
  if (
    req.user.role === "ministry_admin" &&
    req.user.ministry.equals(req.params.ministryId)
  ) {
    return next();
  }
  res.status(403).json({ error: "Access denied: Not your ministry" });
};
const verifyAccessToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).send({ data: "Unauthorized Access..." });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send(createError.Unauthorized(err.message));
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
      process.env.REFRESH_SECRET,
      options,
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
};
const JWTAUTH = {
  getAccessToken: getAccessToken,
  verifyAccessToken: verifyAccessToken,
  getRefreshToken: getRefreshToken,
  checkMinistryAdmin,
  checkRole,
};

module.exports = JWTAUTH;
