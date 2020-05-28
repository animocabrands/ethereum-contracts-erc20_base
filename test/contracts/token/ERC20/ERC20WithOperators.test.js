// const {sh} = require('@animoca/ethereum-contracts-core_library');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const { shouldBehaveLikeERC20 } = require('./behaviors/ERC20.behavior');
const { shouldBehaveLikeERC20WithOperators } = require('./behaviors/ERC20WithOperators.behavior');

const ERC20WithOperatorsMock = contract.fromArtifact('ERC20WithOperatorsMock');

describe('ERC20WithOperatorsMock', function () {
    const [_, initialHolder, recipient, anotherAccount, ...otherAccounts] = accounts;

    const name = 'ERC20WithOperators';
    const symbol = 'E2O';
    const decimals = new BN(18);
    const initialSupply = new BN(100);

    beforeEach(async function () {
        this.token = await ERC20WithOperatorsMock.new(initialSupply, {from: initialHolder});
    });

    shouldBehaveLikeERC20(name, symbol, decimals, initialSupply, initialHolder, recipient, otherAccounts);
    shouldBehaveLikeERC20WithOperators(initialSupply, initialHolder, recipient, otherAccounts);
});
