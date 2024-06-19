import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  async function signTransaction(sender, recipient, amount) {
    const messageHash = keccak256(Buffer.from(`${sender}${recipient}${amount}`));
    const signature = secp256k1.sign(messageHash, hexToBytes(privateKey));
    return { signature: toHex(signature), messageHash: toHex(messageHash) };
  }

  async function transferFunds(sender, recipient, amount) {
    const { signature, messageHash } = await signTransaction(sender, recipient, amount);
    const response = await fetch("http://localhost:3042/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        recipient,
        amount,
        signature,
        messageHash,
      }),
    });
    const data = await response.json();
    if (data.balance !== undefined) {
      setBalance(data.balance);
    } else {
      console.error(data.message);
    }
  }

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
      />
      <Transfer setBalance={setBalance} address={address} transferFunds={transferFunds} />
    </div>
  );
}

export default App;
