// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockTUSD is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1000 * 10 ** 18;

    constructor() ERC20("Test USD", "tUSD") {}

    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
