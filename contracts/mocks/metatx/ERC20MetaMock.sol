pragma solidity = 0.6.2;

import "../../token/ERC20/ERC20Base.sol";
import "../../metatx/ERC20Fees.sol";

contract ERC20MetaMock is ERC20Base, ERC20Fees {

    uint256 public _state = 0;

    constructor (
        uint256 initialBalance,
        address gasTokenAddress,
        address payoutWallet
    ) public ERC20Base(initialBalance, "ERC20Meta", "E2M") ERC20Fees(gasTokenAddress, payoutWallet) {}

    function anUnrelayableFunction() public returns (bytes4) {
        _state = _state + 1;
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

    /**
     * @dev Replacement for msg.sender. Returns the actual sender of a transaction: msg.sender for regular transactions,
     * and the end-user for GSN relayed calls (where msg.sender is actually `RelayHub`).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.sender`, and use {_msgSender} instead.
     */
    function _msgSender() internal override(Context, ERC20Fees) view returns (address payable) {
        return super._msgSender();
    }

    /**
     * @dev Replacement for msg.data. Returns the actual calldata of a transaction: msg.data for regular transactions,
     * and a reduced version for GSN relayed calls (where msg.data contains additional information).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.data`, and use {_msgData} instead.
     */
    function _msgData() internal override(Context, ERC20Fees) view returns (bytes memory) {
        return super._msgData();
    }
}
