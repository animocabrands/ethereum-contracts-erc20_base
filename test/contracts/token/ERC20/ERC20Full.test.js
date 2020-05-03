// const {sh} = require('@animoca/ethereum-contracts-core_library');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const { shouldBehaveLikeERC20FullWhitelistedOperators } = require('./ERC20Full.WhitelistedOperators.behavior');
const { shouldBehaveLikeERC20Full } = require('./ERC20Full.behavior');

const ERC20FullMock = contract.fromArtifact('ERC20FullMock');

describe('ERC20 Base', function () {
    const [_, initialHolder, recipient, anotherAccount, ...otherAccounts] = accounts;

    const name = 'ERC20Full';
    const symbol = 'E2F';
    const decimals = new BN(18);
    const initialSupply = new BN(100);

    beforeEach(async function () {
        this.token = await ERC20FullMock.new(initialSupply, {from: initialHolder});
    });

    shouldBehaveLikeERC20Full(name, symbol, decimals, initialSupply, initialHolder, recipient, otherAccounts);
    shouldBehaveLikeERC20FullWhitelistedOperators(initialSupply, initialHolder, recipient, otherAccounts);
});
