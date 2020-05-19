pragma solidity ^0.6.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/GSN/GSNRecipient.sol";
import "@animoca/ethereum-contracts-core_library/contracts/payment/PayoutWallet.sol";
import "../token/ERC20/IERC20.sol";

/**
    @title ERC20Fees
    @dev a GSNRecipient contract with support for ERC-20 fees
    Note: .
 */
abstract contract ERC20Fees is GSNRecipient, PayoutWallet
{
    enum ErrorCodes {
        INSUFFICIENT_BALANCE,
        RESTRICTED_METHOD
    }

    IERC20 public gasToken;
    uint public gasPriceScaling = GAS_PRICE_SCALING_SCALE;

    uint constant internal GAS_PRICE_SCALING_SCALE = 1000;

    /**
     * @dev Constructor function
     */
    constructor(address gasTokenAddress, address payoutWallet) internal PayoutWallet(payoutWallet) {
        setGasToken(gasTokenAddress);
    }

    function setGasToken(address gasTokenAddress) public onlyOwner {
        gasToken = IERC20(gasTokenAddress);
    }

    function setGasPrice(uint gasPriceScaling_) public onlyOwner {
        gasPriceScaling = gasPriceScaling_;
    }

    /**
     * @dev Withdraws the recipient's deposits in `RelayHub`.
     */
    function withdrawDeposits(uint256 amount, address payable payee) external onlyOwner {
        _withdrawDeposits(amount, payee);
    }

/////////////////////////////////////////// GSNRecipient ///////////////////////////////////
    /**
     * @dev Ensures that only users with enough gas payment token balance can have transactions relayed through the GSN.
     */
    function acceptRelayedCall(
        address,
        address from,
        bytes memory,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256,
        uint256,
        bytes memory,
        uint256 maxPossibleCharge
    )
        public
        virtual
        override
        view
        returns (uint256, bytes memory)
    {
        if (gasToken.balanceOf(from) < (SafeMath.mul(maxPossibleCharge, gasPriceScaling) / GAS_PRICE_SCALING_SCALE)) {
            return _rejectRelayedCall(uint256(ErrorCodes.INSUFFICIENT_BALANCE));
        }

        return _approveRelayedCall(abi.encode(from, maxPossibleCharge, transactionFee, gasPrice));
    }

    /**
     * @dev Implements the precharge to the user. The maximum possible charge (depending on gas limit, gas price, and
     * fee) will be deducted from the user balance of gas payment token. Note that this is an overestimation of the
     * actual charge, necessary because we cannot predict how much gas the execution will actually need. The remainder
     * is returned to the user in {_postRelayedCall}.
     */
    function _preRelayedCall(bytes memory context) internal override returns (bytes32) {
        (address from, uint256 maxPossibleCharge) = abi.decode(context, (address, uint256));

        // The maximum token charge is pre-charged from the user
        require(gasToken.transferFrom(from, payoutWallet, SafeMath.mul(maxPossibleCharge, gasPriceScaling) / GAS_PRICE_SCALING_SCALE));
    }

    /**
     * @dev Returns to the user the extra amount that was previously charged, once the actual execution cost is known.
     */
    function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal override {
        (address from, uint256 maxPossibleCharge, uint256 transactionFee, uint256 gasPrice) =
            abi.decode(context, (address, uint256, uint256, uint256));

        // actualCharge is an _estimated_ charge, which assumes postRelayedCall will use all available gas.
        // This implementation's gas cost can be roughly estimated as 10k gas, for the two SSTORE operations in an
        // ERC20 transfer.
        uint256 overestimation = _computeCharge(SafeMath.sub(_POST_RELAYED_CALL_MAX_GAS, 10000), gasPrice, transactionFee);
        actualCharge = SafeMath.sub(actualCharge, overestimation);

        // After the relayed call has been executed and the actual charge estimated, the excess pre-charge is returned
        require(gasToken.transferFrom(payoutWallet, from, SafeMath.mul(SafeMath.sub(maxPossibleCharge, actualCharge), gasPriceScaling) / GAS_PRICE_SCALING_SCALE));
    }

    /**
     * @dev Replacement for msg.sender. Returns the actual sender of a transaction: msg.sender for regular transactions,
     * and the end-user for GSN relayed calls (where msg.sender is actually `RelayHub`).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.sender`, and use {_msgSender} instead.
     */
    function _msgSender() internal virtual override(Context, GSNRecipient) view returns (address payable) {
        return GSNRecipient._msgSender();
    }

    /**
     * @dev Replacement for msg.data. Returns the actual calldata of a transaction: msg.data for regular transactions,
     * and a reduced version for GSN relayed calls (where msg.data contains additional information).
     *
     * IMPORTANT: Contracts derived from {GSNRecipient} should never use `msg.data`, and use {_msgData} instead.
     */
    function _msgData() internal virtual override(Context, GSNRecipient) view returns (bytes memory) {
        return GSNRecipient._msgData();
    }
}
