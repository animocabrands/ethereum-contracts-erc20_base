pragma solidity ^0.6.6;

/**
 * @dev Interface for commonly used additional ERC20 features
 */
abstract contract IERC20Detailed {
    function decimals() public view virtual returns (uint8);
    function name() public view virtual returns (string memory);
    function symbol() public view virtual returns (string memory);
}
