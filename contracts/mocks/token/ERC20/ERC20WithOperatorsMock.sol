// SPDX-License-Identifier: MIT

pragma solidity 0.6.8;

import "../../../token/ERC20/ERC20WithOperators.sol";

contract ERC20WithOperatorsMock is ERC20WithOperators {

    string public override constant name = "ERC20WithOperators";
    string public override constant symbol = "E2O";
    uint8 public override constant decimals = 18;

    constructor (uint256 initialBalance) public {
        _mint(_msgSender(), initialBalance);
    }

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }
}
