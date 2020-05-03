pragma solidity ^0.6.6;

import "../../../token/ERC20/ERC20Full.sol";
import "../../../token/ERC20/IERC20Detailed.sol";

contract ERC20FullMock is ERC20Full {

    constructor (uint256 initialBalance) public ERC20Full(initialBalance) {}

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }

    function name() external override view returns (string memory) {
        return "ERC20Full";
    }

    function symbol() external override view returns (string memory) {
        return "E2F";
    }

    function decimals() external override view returns (uint8) {
        return 18;
    }

}
