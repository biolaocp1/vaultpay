// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VaultPay {
    address public owner;
    
    struct Payment {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bool released;
    }
    
    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;
    
    event PaymentCreated(uint256 indexed id, address sender, address recipient, uint256 amount);
    event PaymentReleased(uint256 indexed id);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function createPayment(address _recipient) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be > 0");
        require(_recipient != address(0), "Invalid recipient");
        
        uint256 id = paymentCount++;
        payments[id] = Payment({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            timestamp: block.timestamp,
            released: false
        });
        
        emit PaymentCreated(id, msg.sender, _recipient, msg.value);
        return id;
    }
    
    function releasePayment(uint256 _id) external {
        Payment storage p = payments[_id];
        require(msg.sender == p.sender || msg.sender == owner, "Not authorized");
        require(!p.released, "Already released");
        require(p.amount > 0, "Invalid payment");
        
        p.released = true;
        payable(p.recipient).transfer(p.amount);
        
        emit PaymentReleased(_id);
    }
    
    function getPayment(uint256 _id) external view returns (Payment memory) {
        return payments[_id];
    }
}
