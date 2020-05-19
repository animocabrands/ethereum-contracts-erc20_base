// const {sh} = require('@animoca/ethereum-contracts-core_library');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');

const { shouldBehaveLikeERC20 } = require('./behaviors/ERC20.behavior');
const { shouldBehaveLikeERC20Meta } = require('./behaviors/ERC20Meta.behavior');

const ERC20MetaMock = contract.fromArtifact('ERC20MetaMock');
const ERC20WithOperatorsMock = contract.fromArtifact('ERC20WithOperatorsMock');

describe('ERC20Meta', function () {
    const [_, initialHolder, recipient, feeCollector, executor, anotherAccount, ...otherAccounts] = accounts;

    const name = 'ERC20Meta';
    const symbol = 'E2M';
    const decimals = new BN(18);
    const initialSupply = new BN(100);
    const initialSupplyGasToken = '100000000000000000000';

    beforeEach(async function () {
        this.gasToken = await ERC20WithOperatorsMock.new(initialSupplyGasToken, { from: initialHolder });
        this.token = await ERC20MetaMock.new(initialSupply, this.gasToken.address, feeCollector, { from: initialHolder });
    });

    shouldBehaveLikeERC20(name, symbol, decimals, initialSupply, initialHolder, recipient, otherAccounts);
    shouldBehaveLikeERC20Meta(initialSupply, initialSupplyGasToken, initialHolder, recipient, feeCollector, executor, anotherAccount, otherAccounts);
});
