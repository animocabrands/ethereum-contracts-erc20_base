// const {sh} = require('@animoca/ethereum-contracts-core_library');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const { shouldBehaveLikeERC20 } = require('./behaviors/ERC20.behavior');

const ERC20Mock = contract.fromArtifact('ERC20Mock');

describe('ERC20', function () {
    const [_, initialHolder, recipient, ...otherAccounts] = accounts;

    const name = 'ERC20';
    const symbol = 'E20';
    const decimals = new BN(18);
    const initialSupply = new BN(100);

    beforeEach(async function () {
        this.token = await ERC20Mock.new(initialSupply, {from: initialHolder});
    });

    shouldBehaveLikeERC20(name, symbol, decimals, initialSupply, initialHolder, recipient, otherAccounts);
});
