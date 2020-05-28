// SPDX-License-Identifier: MIT

pragma solidity ^0.6.8;

import "@animoca/ethereum-contracts-core_library/contracts/access/WhitelistedOperators.sol";
import "./ERC20.sol";

abstract contract ERC20WithOperators is ERC20, WhitelistedOperators {

    /**
     * NOTICE
     * This override will allow *any* whitelisted operator to be able to
     * transfer unresitricted amounts of ERC20WithOperators-based tokens from 'sender'
     * to 'recipient'. Care must be taken to ensure to integrity of the
     * whitelisted operator list.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        address msgSender = _msgSender();

        // bypass the internal allowance manipulation and checks for the
        // whitelisted operator (i.e. _msgSender()). as a side-effect, the
        // 'Approval' event will not be emitted since the allowance was not
        // updated.
        if (!isOperator(msgSender)) {
            _approve(sender, msgSender, allowance(sender, msgSender).sub(amount));
        }

        _transfer(sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public override view returns (uint256) {
        if (isOperator(spender)) {
            // allow the front-end to determine whether or not an approval is
            // necessary, given that the whitelisted operator status of the
            // spender is unknown. A call to WhitelistedOperators::isOperator()
            // is more direct, but we want to expose a mechanism by which to
            // check through the ERC20 interface.
            return type(uint256).max;
        } else {
            return super.allowance(owner, spender);
        }
    }

    function increaseAllowance(address spender, uint256 addedValue) public override returns (bool) {
        if (isOperator(spender)) {
            // bypass the internal allowance manipulation and checks for the
            // whitelisted operator (i.e. spender). as a side-effect, the
            // 'Approval' event will not be emitted since the allowance was not
            // updated.
            return true;
        } else {
            return super.increaseAllowance(spender, addedValue);
        }
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public override returns (bool) {
        if (isOperator(spender)) {
            // bypass the internal allowance manipulation and checks for the
            // whitelisted operator (i.e. spender). as a side-effect, the
            // 'Approval' event will not be emitted since the allowance was not
            // updated.
            return true;
        } else {
            return super.decreaseAllowance(spender, subtractedValue);
        }
    }

    function _approve(address owner, address spender, uint256 value) internal override {
        if (isOperator(spender)) {
            // bypass the internal allowance manipulation and checks for the
            // whitelisted operator (i.e. spender). as a side-effect, the
            // 'Approval' event will not be emitted since the allowance was not
            // updated.
            return;
        } else {
            super._approve(owner, spender, value);
        }
    }
}
