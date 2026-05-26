// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VaultPay is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    struct Payment {
        address payer;
        address recipient;
        uint256 amount;
        uint256 deadline;
        bool claimed;
        bool cancelled;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;

    event PaymentCreated(uint256 indexed id, address payer, address recipient, uint256 amount, uint256 deadline);
    event PaymentClaimed(uint256 indexed id);
    event PaymentCancelled(uint256 indexed id);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function createPayment(address _recipient, uint256 _amount, uint256 _deadline) external nonReentrant returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");

        uint256 id = paymentCount++;
        payments[id] = Payment({
            payer: msg.sender,
            recipient: _recipient,
            amount: _amount,
            deadline: _deadline,
            claimed: false,
            cancelled: false
        });

        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit PaymentCreated(id, msg.sender, _recipient, _amount, _deadline);
        return id;
    }

    function claimPayment(uint256 _id) external nonReentrant {
        Payment storage p = payments[_id];
        require(msg.sender == p.recipient, "Not recipient");
        require(!p.claimed, "Already claimed");
        require(!p.cancelled, "Already cancelled");

        p.claimed = true;
        token.safeTransfer(p.recipient, p.amount);
        emit PaymentClaimed(_id);
    }

    function cancelPayment(uint256 _id) external nonReentrant {
        Payment storage p = payments[_id];
        require(msg.sender == p.payer, "Not payer");
        require(!p.claimed, "Already claimed");
        require(!p.cancelled, "Already cancelled");
        require(block.timestamp >= p.deadline, "Deadline not passed");

        p.cancelled = true;
        token.safeTransfer(p.payer, p.amount);
        emit PaymentCancelled(_id);
    }

    function getPayment(uint256 _id) external view returns (Payment memory) {
        return payments[_id];
    }
}
