const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { MAX_UINT256, ZERO_ADDRESS } = constants;

function shouldBehaveLikeERC20BaseWhitelistedOperators(initialSupply, initialHolder, recipient, [ spender ]) {
    describe('ERC20 Base is WhitelistedOperators', function () {
        beforeEach(async function () {
            await this.token.whitelistOperator(spender, true, {from: initialHolder});
        });

        describe('approve', function () {
            describe('when the spender is not the zero address', function () {
                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    it('does not emit an approval event', async function () {
                        const { tx } = await this.token.approve(spender, amount, { from: initialHolder });

                        expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('does not emit an approval event', async function () {
                        const { tx } = await this.token.approve(spender, amount, { from: initialHolder });

                        expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });
                });
            });
        });

        describe('_approve', function () {
            const amount = initialSupply;

            it('does not emit an approval event', async function () {
                const { tx } = await this.token.underscoreApprove(initialHolder, spender, amount, { from: initialHolder });

                expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                    owner: initialHolder,
                    spender: spender,
                    value: amount,
                });
            });

            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                await this.token.underscoreApprove(initialHolder, spender, amount, { from: initialHolder });
                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
            });
        });

        describe('transfer from', function () {
            describe('when the recipient is not the zero address', function () {
                const to = recipient;

                describe('when the spender has enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, initialSupply, { from: initialHolder });
                    });

                    describe('when the initial holder has enough balance', function () {
                        const amount = initialSupply;

                        it('transfers the requested amount', async function () {
                            await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('0');

                            (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });

                        it('emits a transfer event', async function () {
                            const { logs } = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent.inLogs(logs, 'Transfer', {
                                from: initialHolder,
                                to: to,
                                value: amount,
                            });
                        });

                        it('does not emit an approval event', async function () {
                            const { tx } = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                                owner: initialHolder,
                                spender: spender,
                                value: await this.token.allowance(initialHolder, spender),
                            });
                        });
                    });

                    describe('when the initial holder does not have enough balance', function () {
                        const amount = initialSupply.addn(1);

                        it('reverts', async function () {
                            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, { from: spender }));
                        });
                    });
                });

                describe('when the spender does not have enough approved balance', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, initialSupply.subn(1), { from: initialHolder });
                    });

                    describe('when the initial holder has enough balance', function () {
                        const amount = initialSupply;

                        // it('reverts', async function () {
                        //     await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, { from: spender }));
                        // });
                        it('transfers the requested amount', async function () {
                            await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('0');

                            (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });

                        it('emits a transfer event', async function () {
                            const { logs } = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent.inLogs(logs, 'Transfer', {
                                from: initialHolder,
                                to: to,
                                value: amount,
                            });
                        });

                        it('does not emit an approval event', async function () {
                            const { tx } = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                                owner: initialHolder,
                                spender: spender,
                                value: await this.token.allowance(initialHolder, spender),
                            });
                        });
                    });

                    describe('when the initial holder does not have enough balance', function () {
                        const amount = initialSupply.addn(1);

                        it('reverts', async function () {
                            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, { from: spender }));
                        });
                    });
                });
            });

            describe('when the recipient is the zero address', function () {
                const amount = initialSupply;
                const to = ZERO_ADDRESS;

                beforeEach(async function () {
                    await this.token.approve(spender, amount, { from: initialHolder });
                });

                it('reverts', async function () {
                    await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, { from: spender }));
                });
            });
        });

        describe('decrease allowance', function () {
            describe('when the spender is not the zero address', function () {
                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.decreaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        const approvedAmount = amount;

                        beforeEach(async function () {
                            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
                        });

                        it('does not emit an approval event', async function () {
                            const { tx } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

                            expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                                owner: initialHolder,
                                spender: spender,
                                value: new BN(0),
                            });
                        });

                        describe('when subtracting the requested amount', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });

                        describe('when all allowance is removed', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });

                        describe('when more than the full allowance is removed', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.decreaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        const approvedAmount = amount;

                        beforeEach(async function () {
                            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
                        });

                        it('does not emit an approval event', async function () {
                            const { tx } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

                            expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                                owner: initialHolder,
                                spender: spender,
                                value: new BN(0),
                            });
                        });

                        describe('when subtracting the requested amount', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });

                        describe('when all allowance is removed', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });

                        describe('when more than the full allowance is removed', function () {
                            it('has no effect on the allowance amount of MAX_UINT256', async function () {
                                await this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder });
                                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                            });
                        });
                    });
                });
            });
        });

        describe('increase allowance', function () {
            describe('when the spender is not the zero address', function () {
                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    it('does not emit an approval event', async function () {
                        const { tx } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('does not emit an approval event', async function () {
                        const { tx } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expectEvent.not.inTransaction(tx, this.token, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('has no effect on the allowance amount of MAX_UINT256', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(MAX_UINT256);
                        });
                    });
                });
            });
        });
    });
}

module.exports = {
    shouldBehaveLikeERC20BaseWhitelistedOperators
};
