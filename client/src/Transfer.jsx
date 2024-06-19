import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function signTransaction(sender, recipient, amount) {
    const message = `${sender}${recipient}${amount}`;
    const messageHash = toHex(keccak256(Buffer.from(message)));
    const privateKeyBytes = hexToBytes(privateKey);
    const [signature, recid] = secp256k1.sign(messageHash, privateKeyBytes, { recovered: true });
    return { signature: toHex(signature), messageHash };
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const { signature, messageHash } = await signTransaction(address, recipient, sendAmount);

      const response = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        messageHash,
      });

      const { balance } = response.data;
      setBalance(balance);
    } catch (ex) {
      if (ex.response && ex.response.data) {
        alert(ex.response.data.message);
      } else {
        alert("An unexpected error occurred: " + ex.message);
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
