const GasToken = artifacts.require('ERC20BaseMock');
const MetaCoin = artifacts.require('ERC20MetaMock');

module.exports = async (deployer, network, accounts) => {
    const gasTokenBalance = "1000000";
    const coinBalance = "1000000";
    const payoutWallet = "0xc974C5f0C5b0662E00a54139C039273608b74754";

    await deployer.deploy(GasToken, gasTokenBalance);
    const gasToken = await GasToken.deployed();
    await deployer.deploy(MetaCoin, coinBalance, gasToken.address, payoutWallet);
}