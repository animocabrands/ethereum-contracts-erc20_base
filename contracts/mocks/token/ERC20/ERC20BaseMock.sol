pragma solidity = 0.6.2;

import "../../../token/ERC20/ERC20Base.sol";

contract ERC20BaseMock is ERC20Base {

    constructor (uint256 initialBalance) public ERC20Base(initialBalance, "ERC20Base", "E2B") {}

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }

}
