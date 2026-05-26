import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { TOKEN_ADDRESS, VAULTPAY_ADDRESS } from "./config";
import { TUSD_ABI, VAULTPAY_ABI } from "./abi/index";

type Status = { type: "success" | "error" | "pending"; message: string } | null;

export default function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [status, setStatus] = useState<Status>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [payment, setPayment] = useState<any>(null);

  const getProvider = () => new ethers.BrowserProvider((window as any).ethereum);

  const refreshBalance = useCallback(async (acc: string) => {
    const provider = getProvider();
    const token = new ethers.Contract(TOKEN_ADDRESS, TUSD_ABI, provider);
    const vaultpay = new ethers.Contract(VAULTPAY_ADDRESS, VAULTPAY_ABI, provider);
    const bal = await token.balanceOf(acc);
    const allow = await token.allowance(acc, VAULTPAY_ADDRESS);
    setBalance(ethers.formatEther(bal));
    setAllowance(ethers.formatEther(allow));
  }, []);

  const connect = async () => {
    try {
      const provider = getProvider();
      await provider.send("eth_requestAccounts", []);
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x7A69" }]);
      const signer = await provider.getSigner();
      const acc = await signer.getAddress();
      setAccount(acc);
      await refreshBalance(acc);
      setStatus({ type: "success", message: "Wallet connected!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const faucet = async () => {
    try {
      setStatus({ type: "pending", message: "Requesting tUSD from faucet..." });
      const signer = await getProvider().getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, TUSD_ABI, signer);
      const tx = await token.faucet();
      await tx.wait();
      await refreshBalance(account);
      setStatus({ type: "success", message: "Received 1000 tUSD!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const approve = async () => {
    try {
      setStatus({ type: "pending", message: "Approving tUSD..." });
      const signer = await getProvider().getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, TUSD_ABI, signer);
      const tx = await token.approve(VAULTPAY_ADDRESS, ethers.MaxUint256);
      await tx.wait();
      await refreshBalance(account);
      setStatus({ type: "success", message: "Approved!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const createPayment = async () => {
    try {
      setStatus({ type: "pending", message: "Creating payment..." });
      const signer = await getProvider().getSigner();
      const vaultpay = new ethers.Contract(VAULTPAY_ADDRESS, VAULTPAY_ABI, signer);
      const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);
      const tx = await vaultpay.createPayment(recipient, ethers.parseEther(amount), deadlineTs);
      await tx.wait();
      await refreshBalance(account);
      setStatus({ type: "success", message: "Payment created!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const claimPayment = async () => {
    try {
      setStatus({ type: "pending", message: "Claiming payment..." });
      const signer = await getProvider().getSigner();
      const vaultpay = new ethers.Contract(VAULTPAY_ADDRESS, VAULTPAY_ABI, signer);
      const tx = await vaultpay.claimPayment(Number(paymentId));
      await tx.wait();
      await refreshBalance(account);
      setStatus({ type: "success", message: "Payment claimed!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const cancelPayment = async () => {
    try {
      setStatus({ type: "pending", message: "Cancelling payment..." });
      const signer = await getProvider().getSigner();
      const vaultpay = new ethers.Contract(VAULTPAY_ADDRESS, VAULTPAY_ABI, signer);
      const tx = await vaultpay.cancelPayment(Number(paymentId));
      await tx.wait();
      await refreshBalance(account);
      setStatus({ type: "success", message: "Payment cancelled!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  const getPayment = async () => {
    try {
      const provider = getProvider();
      const vaultpay = new ethers.Contract(VAULTPAY_ADDRESS, VAULTPAY_ABI, provider);
      const p = await vaultpay.getPayment(Number(paymentId));
      setPayment(p);
      setStatus({ type: "success", message: "Payment fetched!" });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    }
  };

  return (
    <div className="app">
      <h1>⚡ VaultPay</h1>
      <p className="subtitle">Decentralized escrow payments with tUSD</p>

      <div className="card">
        <h2>Wallet</h2>
        {account ? (
          <>
            <p className="info">Address: <span>{account}</span></p>
            <p className="info">Balance: <span>{parseFloat(balance).toFixed(2)} tUSD</span></p>
            <p className="info">Allowance: <span>{parseFloat(allowance).toFixed(2)} tUSD</span></p>
            <button onClick={faucet}>Get 1000 tUSD</button>
            <button onClick={approve}>Approve VaultPay</button>
          </>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </div>

      <div className="card">
        <h2>Create Payment</h2>
        <label>Recipient Address</label>
        <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." />
        <label>Amount (tUSD)</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" />
        <label>Deadline</label>
        <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <button onClick={createPayment} disabled={!account}>Create Payment</button>
      </div>

      <div className="card">
        <h2>Claim / Cancel Payment</h2>
        <label>Payment ID</label>
        <input value={paymentId} onChange={e => setPaymentId(e.target.value)} placeholder="0" />
        <button onClick={claimPayment} disabled={!account}>Claim</button>
        <button onClick={cancelPayment} disabled={!account}>Cancel</button>
        <button onClick={getPayment}>Get Details</button>
        {payment && (
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#aaa" }}>
            <p>Payer: <span style={{color:"#fff"}}>{payment.payer}</span></p>
            <p>Recipient: <span style={{color:"#fff"}}>{payment.recipient}</span></p>
            <p>Amount: <span style={{color:"#fff"}}>{ethers.formatEther(payment.amount)} tUSD</span></p>
            <p>Claimed: <span style={{color:"#fff"}}>{payment.claimed.toString()}</span></p>
            <p>Cancelled: <span style={{color:"#fff"}}>{payment.cancelled.toString()}</span></p>
          </div>
        )}
      </div>

      {status && <div className={`status ${status.type}`}>{status.message}</div>}
    </div>
  );
}
