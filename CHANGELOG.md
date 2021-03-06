# Changelog

## 3.0.0 (17/06/2020)

### Breaking changes
 * Contracts compiler version fixed at solidity 0.6.8.
 * Updated `@animoca/ethereum-contracts-core_library` to version 3 and downgraded it to be a dev dependency.

## 2.0.0 (27/05/2020)

### Breaking changes
 * Updated dependecy to `@animoca/ethereum-contracts-core_library:2.0.0`.
 * Updated compiler to `solc:0.6.8`.
 * Added `ERC20.sol` and `ERC20WithOperators.sol`. Removed `ERC20Full.sol`. Refactored the unit tests.
 * Applied naming convention on public members.

### Improvements
 * Support of new ERC165 interface for allowance functions.

## 1.0.1 (06/05/2020)

### Improvements
 * Added missing `constant` keyword in Mocks.
 * Updated dependency on `@animoca/ethereum-contracts-core_library` to `1.1.0`.

## 1.0.0 (03/05/2020)

### Breaking changes
 * Migration to `@animoca/ethereum-contracts-core_library:1.0.0` with `solc:0.6.x` and `@openzeppelin/contracts:3.x`.
 * Moved `WhitelistedOperators.sol` to `@animoca/ethereum-contracts-core_library`.
 * Renamed `ERC20Base` to `ERC20Full`.

### New features
 * Added `ERC20.sol`, `IERC20.sol` and `IERC20Detailed.sol`.
 * Added example migrations.

### Improvements
 * `ERC20Fees` now inherits `PayoutWallet` contract.

## 0.0.2 (14/04/2020)

### Breaking changes
* Removed `ERC20Fees` inheritance by `ERC20Base`.
* `ERC20Base`'s constructor changed to `constructor(uint256 initialBalance)`. `name()`, `symbol()` and `decimals()` need to be implemented by child contract.

### Feature
* Added `ERC20MetaMock` which inherits from `ERC20Fees`.
* Added `ERC165` support in contracts, tests, `src/interfaces` and `src/constants`.
* The module now exports `constants` and `interfaces` objects.

### Improvements
* Refactored tests.

## 0.0.1 (14/04/2020)
* Initial commit.
