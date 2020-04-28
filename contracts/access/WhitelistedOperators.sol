pragma solidity = 0.6.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract WhitelistedOperators is Ownable {

    mapping(address => bool) internal _whitelistedOperators;

    event WhitelistedOperator(address operator, bool enabled);

    /// @notice Enable or disable address operator access
    /// @param operator address that will be given/removed operator right.
    /// @param enabled set whether the operator is enabled or disabled.
    function whitelistOperator(address operator, bool enabled) external onlyOwner {
        _whitelistedOperators[operator] = enabled;
        emit WhitelistedOperator(operator, enabled);
    }

    /// @notice check whether address `who` is given operator rights.
    /// @param who The address to query.
    /// @return whether the address is whitelisted operator
    function isOperator(address who) public view returns (bool) {
        return _whitelistedOperators[who];
    }
}
