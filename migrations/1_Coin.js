const Coin = artifacts.require('ERC20FullMock');

module.exports = async (deployer, network, accounts) => {
    const initialBalance = "1000000";
    await deployer.deploy(Coin, initialBalance);
}