const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { randomBytes } = require("crypto");
const { toHex } = require("ethereum-cryptography/utils");

// Generate a random private key
const privateKey = randomBytes(32);

console.log("Private Key:", toHex(privateKey));

// Get the corresponding public key
const publicKey = secp256k1.getPublicKey(privateKey);

// Log the public key
console.log("Public Key:", toHex(publicKey));
