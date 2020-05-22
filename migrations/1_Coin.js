const Coin = artifacts.require('ERC20Mock');

module.exports = async (deployer, network, accounts) => {
    const initialBalance = '1000000';
    await deployer.deploy(Coin, initialBalance);
    const coin = await Coin.deployed();
    console.log(await coin.getERC165());
}