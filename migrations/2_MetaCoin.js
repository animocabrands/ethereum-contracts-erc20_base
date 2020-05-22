const GasToken = artifacts.require('ERC20WithOperatorsMock');
const MetaCoin = artifacts.require('ERC20MetaMock');

module.exports = async (deployer, network, accounts) => {
    const gasTokenBalance = '1000000';
    const coinBalance = '1000000';
    const payoutWallet = accounts[1];

    await deployer.deploy(GasToken, gasTokenBalance);
    const gasToken = await GasToken.deployed();
    const metaCoin = await deployer.deploy(MetaCoin, coinBalance, gasToken.address, payoutWallet);
    await gasToken.whitelistOperator(metaCoin.address, true);
}