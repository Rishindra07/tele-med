const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");

const getAccessSecret = () => process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const getAccessExpiry = () => process.env.ACCESS_TOKEN_EXPIRES || process.env.JWT_EXPIRES || "15m";
const getRefreshExpiry = () => process.env.REFRESH_TOKEN_EXPIRES || "30d";
const getRefreshExpiryMs = () =>
  Number(process.env.REFRESH_TOKEN_EXPIRES_MS || 30 * 24 * 60 * 60 * 1000);

const createAccessToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, type: "access" },
    getAccessSecret(),
    { expiresIn: getAccessExpiry() }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, type: "refresh" },
    getRefreshSecret(),
    { expiresIn: getRefreshExpiry() }
  );

const issueAuthTokens = async (user, req) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await RefreshToken.create({
    user_id: user._id,
    token: refreshToken,
    device: req.headers["user-agent"] || null,
    ip_address: req.ip || req.socket?.remoteAddress || null,
    expires_at: new Date(Date.now() + getRefreshExpiryMs())
  });

  return { accessToken, refreshToken };
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  issueAuthTokens,
  getAccessSecret,
  getRefreshSecret
};
