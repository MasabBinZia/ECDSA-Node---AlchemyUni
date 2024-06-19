const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "03b77fefeeb42127810e4bf9464d062006e46bb51b2f28beb9b8a10fef6f5618f5": 100,
  "028d95598d61bb2e57f77dbf1ed7480d59d2959df770dd923d6a52c7af42b96686": 50,
  "0204ed7e043f95dc0012c9887b6d163b84370a9ec6b0df100fb029f21c45b99c1b": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, messageHash } = req.body;

  // Recover the public address from the signature
  const publicKey = recoverPublicKey(messageHash, signature);
  const recoveredAddress = toHex(publicKey);

  if (recoveredAddress !== sender) {
    return res.status(400).send({ message: "Invalid signature!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function recoverPublicKey(messageHash, signature) {
  const [r, s, v] = [
    signature.slice(0, 64),
    signature.slice(64, 128),
    parseInt(signature.slice(128, 130), 16),
  ];

  const publicKey = secp256k1.recoverPublicKey(
    Buffer.from(messageHash, "hex"),
    Buffer.from(signature.slice(0, 128), "hex"),
    v
  );
  return publicKey;
}
