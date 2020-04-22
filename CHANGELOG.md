# Changelog

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