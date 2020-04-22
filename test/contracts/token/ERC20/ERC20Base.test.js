const {sh} = require('@animoca/ethereum-contracts-core_library');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const { shouldBehaveLikeERC20BaseWhitelistedOperators } = require('./ERC20BaseWhitelistedOperators.behavior');
const { shouldBehaveLikeERC20Base } = require('./ERC20Base.behavior');

const ERC20BaseMock = contract.fromArtifact('ERC20BaseMock');

describe('ERC20 Base', function () {
    const [_, initialHolder, recipient, anotherAccount, ...otherAccounts] = accounts;

    const name = 'ERC20Base';
    const symbol = 'E2B';
    const decimals = new BN(18);
    const initialSupply = new BN(100);

    beforeEach(async function () {
        this.token = await ERC20BaseMock.new(initialSupply, {from: initialHolder});
    });

    shouldBehaveLikeERC20Base(name, symbol, decimals, initialSupply, initialHolder, recipient, otherAccounts);
    shouldBehaveLikeERC20BaseWhitelistedOperators(initialSupply, initialHolder, recipient, otherAccounts);
});
