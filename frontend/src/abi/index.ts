export const TUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function faucet()",
];

export const VAULTPAY_ABI = [
  "function createPayment(address recipient, uint256 amount, uint256 deadline) returns (uint256)",
  "function claimPayment(uint256 id)",
  "function cancelPayment(uint256 id)",
  "function getPayment(uint256 id) view returns (tuple(address payer, address recipient, uint256 amount, uint256 deadline, bool claimed, bool cancelled))",
  "event PaymentCreated(uint256 indexed id, address payer, address recipient, uint256 amount, uint256 deadline)",
  "event PaymentClaimed(uint256 indexed id)",
  "event PaymentCancelled(uint256 indexed id)",
];
