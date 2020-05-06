pragma solidity ^0.6.6;

import "../../../token/ERC20/ERC20Full.sol";
import "../../../token/ERC20/IERC20Detailed.sol";

contract ERC20FullMock is ERC20Full {

    string public override constant name = "ERC20Full";
    string public override constant symbol = "E2F";
    uint8 public override constant decimals = 18;

    constructor (uint256 initialBalance) public ERC20Full(initialBalance) {}

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }
}
