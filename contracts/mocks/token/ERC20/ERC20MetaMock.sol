// SPDX-License-Identifier: MIT

pragma solidity 0.6.8;

import "../../../metatx/ERC20Fees.sol";
import "../../../token/ERC20/ERC20.sol";

contract ERC20MetaMock is ERC20Fees, ERC20 {

    uint256 public state = 0;

    string public override constant name = "ERC20Meta";
    string public override constant symbol = "E2M";
    uint8 public override constant decimals = 18;

    constructor (
        uint256 initialBalance,
        address gasTokenAddress,
        address payoutWallet
    ) public ERC20Fees(gasTokenAddress, payoutWallet)
    {
        _mint(_msgSender(), initialBalance);
    }

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }

    function anUnrelayableFunction() public returns (bytes4) {
        state = state + 1;
        // bytes4(keccak256("anUnrelayableFunction()")) == 0x2f398d8d
        return bytes4(keccak256("anUnrelayableFunction()"));
    }

///////////////////////// GSNRecipient implementation //////////////////////////


    /**
     * @dev Ensures that only users with enough gas payment token balance can have transactions relayed through the GSN.
     */
    function acceptRelayedCall(
        address relay,
        address from,
        bytes memory encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes memory approvalData,
        uint256 maxPossibleCharge
    )
        public
        override
        view
        returns (uint256, bytes memory mem)
    {
        // restrict anUnrelayableFunction()
        // load methodId stored in first 4 bytes https://solidity.readthedocs.io/en/v0.5.16/abi-spec.html#function-selector-and-argument-encoding
        // 32 bytes offset is required to skip array length
        bytes4 methodId;
        mem = encodedFunction;
        assembly {
            let dest := add(mem, 32)
            methodId := mload(dest)
        }

        if (methodId == bytes4(keccak256("anUnrelayableFunction()"))) {
            return _rejectRelayedCall(uint256(ErrorCodes.RESTRICTED_METHOD));
        }

        return super.acceptRelayedCall(
            relay,
            from,
            encodedFunction,
            transactionFee,
            gasPrice,
            gasLimit,
            nonce,
            approvalData,
            maxPossibleCharge);
    }

    function _msgSender() internal override(Context, ERC20Fees) view returns (address payable) {
        return super._msgSender();
    }

    function _msgData() internal override(Context, ERC20Fees) view returns (bytes memory) {
        return super._msgData();
    }
}
