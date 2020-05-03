pragma solidity ^0.6.6;

import "@animoca/ethereum-contracts-core_library/contracts/access/WhitelistedOperators.sol";
import "./ERC20.sol";
import "./IERC20Detailed.sol";

abstract contract ERC20Full is ERC20, IERC20Detailed, WhitelistedOperators {
    uint256 private constant UINT256_MAX = 2**256 - 1;

    constructor(uint256 initialBalance) internal
    {
        _mint(_msgSender(), initialBalance);
    }

    /**
     * @dev Check if support an interface id
     * @param interfaceId interface id to query
     * @return bool if support the given interface id
     */
    function supportsInterface(bytes4 interfaceId) external virtual override view returns (bool) {
        return (
            // ERC165 interface id
            interfaceId == 0x01ffc9a7 ||
            // ERC20 interface id
            interfaceId == 0x36372b07 ||
            // ERC20Name interface id
            interfaceId == 0x06fdde03 ||
            // ERC20Symbol interface id
            interfaceId == 0x95d89b41 ||
            // ERC20Decimals interface id
            interfaceId == 0x313ce567 ||
            // ERC20Detailed interface id
            interfaceId == 0xa219a025
        );
    }

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
            return UINT256_MAX;
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
