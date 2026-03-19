const crypto = require("crypto");
const env = require("../config/env");

const keySource = env.phoneEncryptionKey.padEnd(32, "0").slice(0, 32);
const KEY = Buffer.from(keySource, "utf8");
const IV_LENGTH = 16;

function encryptText(plainText) {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decryptText(cipherText) {
  if (!cipherText) return "";
  const [ivHex, encrypted] = cipherText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function hashText(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { encryptText, decryptText, hashText };
