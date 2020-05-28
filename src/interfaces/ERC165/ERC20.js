const { makeInterfaceId } = require('@openzeppelin/test-helpers');

const ERC20_Functions = [
    'totalSupply()',
    'balanceOf(address)',
    'transfer(address,uint256)',
    'allowance(address,address)',
    'approve(address,uint256)',
    'transferFrom(address,address,uint256)'
];

const ERC20Name_Functions = [
    'name()'
];

const ERC20Symbol_Functions = [
    'symbol()'
];

const ERC20Decimals_Functions = [
    'decimals()'
];

const ERC20Detailed_Functions = [
    'name()',
    'symbol()',
    'decimals()'
];

const ERC20Allowance_Functions = [
    'increaseAllowance(address,uint256)',
    'decreaseAllowance(address,uint256)'
];

module.exports = {
    ERC20: {
        name: 'ERC20',
        functions: ERC20_Functions,
        id: makeInterfaceId.ERC165(ERC20_Functions),
    }, // '0x36372b07'
    ERC20Name: {
        name: 'ERC20Name',
        functions: ERC20Name_Functions,
        id: makeInterfaceId.ERC165(ERC20Name_Functions),
    }, // '0x06fdde03'
    ERC20Symbol: {
        name: 'ERC20Symbol',
        functions: ERC20Symbol_Functions,
        id: makeInterfaceId.ERC165(ERC20Symbol_Functions),
    }, // '0x95d89b41'
    ERC20Decimals: {
        name: 'ERC20Decimals',
        functions: ERC20Decimals_Functions,
        id: makeInterfaceId.ERC165(ERC20Decimals_Functions),
    }, // '0x313ce567'
    ERC20Detailed_Experimental: {
        name: 'ERC20Detailed_Experimental',
        functions: ERC20Detailed_Functions,
        id: makeInterfaceId.ERC165(ERC20Detailed_Functions),
    }, // '0xa219a025'
    ERC20Allowance_Experimental: {
        name: 'ERC20Allowance_Experimental',
        functions: ERC20Allowance_Functions,
        id: makeInterfaceId.ERC165(ERC20Allowance_Functions),
    }, // '0x9d075186'
}
