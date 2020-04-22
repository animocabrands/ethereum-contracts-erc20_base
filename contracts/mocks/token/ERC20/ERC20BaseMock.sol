pragma solidity = 0.5.16;

import "../../../token/ERC20/ERC20Base.sol";

contract ERC20BaseMock is ERC20Base {

    constructor (uint256 initialBalance) public ERC20Base(initialBalance) {}

    function name() public view returns (string memory) {
        return "ERC20Base";
    }

    function symbol() public view returns (string memory) {
        return "E2B";
    }

    function decimals() public view returns (uint8) {
        return 18;
    }

    function underscoreApprove(address owner, address spender, uint256 value) public {
        super._approve(owner, spender, value);
    }

    function underscoreBurnFrom(address account, uint256 amount) public {
        super._burnFrom(account, amount);
    }
}
