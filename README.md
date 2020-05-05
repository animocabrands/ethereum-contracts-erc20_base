# Solidity Project ERC20 Base

This project serves as a base dependency for Solidity-based contract projects by providing ERC20 related base contracts, constants, and interfaces.


## Table of Contents

- [Overview](#overview)
  * [Installation](#installation)
  * [Usage](#usage)
    - [Solidity Contracts](#solidity-contracts)
    - [Test and Migration Scripts](#test-and-migration-scripts)


## Overview


### Installation

Install as a module dependency in your host NodeJS project:

```bash
$ npm install --save @animoca/ethereum-contracts-erc20_base
```


### Usage

#### Solidity Contracts

Import dependency contracts into your Solidity contracts as needed:

```solidity
import "@animoca/ethereum-contracts-erc20_base/contracts/{{Contract Group}}/{{Contract}}.sol"
```


#### Test and Migration Scripts

Require the NodeJS module dependency in your test and migration scripts as needed:

```javascript
const { constants, interfaces } = require('@animoca/ethereum-contracts-erc20_base');
```
