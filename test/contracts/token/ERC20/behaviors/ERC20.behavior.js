const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { constants, behaviors } = require('@animoca/ethereum-contracts-core_library');
const { ZeroAddress } = constants;
const interfaces = require('../../../../../src/interfaces/ERC165');

function shouldBehaveLikeERC20(name, symbol, decimals, initialSupply, initialHolder, recipient, [anotherAccount]) {
    describe('like an ERC20', function () {

        describe('details', function () {
            it('has a name', async function () {
                (await this.token.name()).should.be.equal(name);
            });

            it('has a symbol', async function () {
                (await this.token.symbol()).should.be.equal(symbol);
            });

            it('has an amount of decimals', async function () {
                (await this.token.decimals()).should.be.bignumber.equal(decimals);
            });
        });

        describe('total supply', function () {
            it('returns the total amount of tokens', async function () {
                (await this.token.totalSupply()).should.be.bignumber.equal(initialSupply);
            });
        });

        describe('balanceOf', function () {
            describe('when the requested account has no tokens', function () {
                it('returns zero', async function () {
                    (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal('0');
                });
            });

            describe('when the requested account has some tokens', function () {
                it('returns the total amount of tokens', async function () {
                    (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal(initialSupply);
                });
            });
        });

        describe('transfer', function () {
            describe('when the recipient is not the zero address', function () {
                const to = recipient;

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('reverts', async function () {
                        await expectRevert.unspecified(this.token.transfer(to, amount, { from: initialHolder }));
                    });
                });

                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    it('transfers the requested amount', async function () {
                        await this.token.transfer(to, amount, { from: initialHolder });
                        (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('0');
                        (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
                    });

                    it('emits a transfer event', async function () {
                        const receipt = await this.token.transfer(to, amount, { from: initialHolder });

                        expectEvent(receipt, 'Transfer', {
                            _from: initialHolder,
                            _to: to,
                            _value: amount,
                        });
                    });
                });
            });

            describe('when the recipient is the zero address', function () {
                const to = ZeroAddress;

                it('reverts', async function () {
                    await expectRevert.unspecified(this.token.transfer(to, initialSupply, { from: initialHolder }));
                });
            });
        });

        describe('approve', function () {
            describe('when the spender is not the zero address', function () {
                const spender = recipient;

                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    it('emits an approval event', async function () {
                        const receipt = await this.token.approve(spender, amount, { from: initialHolder });

                        expectEvent(receipt, 'Approval', {
                            _owner: initialHolder,
                            _spender: spender,
                            _value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('emits an approval event', async function () {
                        const receipt = await this.token.approve(spender, amount, { from: initialHolder });

                        expectEvent(receipt, 'Approval', {
                            _owner: initialHolder,
                            _spender: spender,
                            _value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('approves the requested amount and replaces the previous one', async function () {
                            await this.token.approve(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });
                });
            });

            describe('when the spender is the zero address', function () {
                const amount = initialSupply;
                const spender = ZeroAddress;

                it('reverts', async function () {
                    await expectRevert.unspecified(this.token.approve(spender, amount, { from: initialHolder }));
                });
            });
        });

        describe('_approve', function () {
            const amount = initialSupply;
            const spender = anotherAccount;

            it('emits an approval event', async function () {
                const receipt = await this.token.underscoreApprove(initialHolder, spender, amount, { from: initialHolder });

                expectEvent(receipt, 'Approval', {
                    _owner: initialHolder,
                    _spender: spender,
                    _value: amount,
                });
            });

            it('updates the allowance amount by setting it with the approval amount', async function () {
                await this.token.underscoreApprove(initialHolder, spender, amount, { from: initialHolder });
                (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
            });
        });

        describe('transfer from', function () {
            const spender = recipient;

            describe('when the recipient is not the zero address', function () {
                const to = anotherAccount;

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

                        it('decreases the spender allowance', async function () {
                            await this.token.transferFrom(initialHolder, to, amount, { from: spender });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0');
                        });

                        it('emits a transfer event', async function () {
                            const receipt = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent(receipt, 'Transfer', {
                                _from: initialHolder,
                                _to: to,
                                _value: amount,
                            });
                        });

                        it('emits an approval event', async function () {
                            const receipt = await this.token.transferFrom(initialHolder, to, amount, { from: spender });

                            expectEvent(receipt, 'Approval', {
                                _owner: initialHolder,
                                _spender: spender,
                                _value: await this.token.allowance(initialHolder, spender),
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

                        it('reverts', async function () {
                            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, { from: spender }));
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
                const to = ZeroAddress;

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
                const spender = recipient;

                describe('when the sender has enough balance', function () {
                    const amount = initialSupply;

                    describe('when there was no approved amount before', function () {
                        it('reverts', async function () {
                            await expectRevert.unspecified(this.token.decreaseAllowance(spender, amount, { from: initialHolder }));
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        const approvedAmount = amount;

                        beforeEach(async function () {
                            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
                        });

                        it('emits an approval event', async function () {
                            const receipt = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

                            expectEvent(receipt, 'Approval', {
                                _owner: initialHolder,
                                _spender: spender,
                                _value: new BN(0),
                            });
                        });

                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('1');
                        });

                        it('sets the allowance to zero when all allowance is removed', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0');
                        });

                        it('reverts when more than the full allowance is removed', async function () {
                            await expectRevert.unspecified(this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder })
                            );
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    describe('when there was no approved amount before', function () {
                        it('reverts', async function () {
                            await expectRevert.unspecified(this.token.decreaseAllowance(spender, amount, { from: initialHolder }));
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        const approvedAmount = amount;

                        beforeEach(async function () {
                            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
                        });

                        it('emits an approval event', async function () {
                            const receipt = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

                            expectEvent(receipt, 'Approval', {
                                _owner: initialHolder,
                                _spender: spender,
                                _value: new BN(0),
                            });
                        });

                        it('decreases the spender allowance subtracting the requested amount', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('1');
                        });

                        it('sets the allowance to zero when all allowance is removed', async function () {
                            await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0');
                        });

                        it('reverts when more than the full allowance is removed', async function () {
                            await expectRevert.unspecified(this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder })
                            );
                        });
                    });
                });
            });

            describe('when the spender is the zero address', function () {
                const amount = initialSupply;
                const spender = ZeroAddress;

                it('reverts', async function () {
                    await expectRevert.unspecified(this.token.decreaseAllowance(spender, amount, { from: initialHolder }));
                });
            });
        });

        describe('increase allowance', function () {
            const amount = initialSupply;

            describe('when the spender is not the zero address', function () {
                const spender = recipient;

                describe('when the sender has enough balance', function () {
                    it('emits an approval event', async function () {
                        const receipt = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expectEvent(receipt, 'Approval', {
                            _owner: initialHolder,
                            _spender: spender,
                            _value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1));
                        });
                    });
                });

                describe('when the sender does not have enough balance', function () {
                    const amount = initialSupply.addn(1);

                    it('emits an approval event', async function () {
                        const receipt = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expectEvent(receipt, 'Approval', {
                            _owner: initialHolder,
                            _spender: spender,
                            _value: amount,
                        });
                    });

                    describe('when there was no approved amount before', function () {
                        it('approves the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount);
                        });
                    });

                    describe('when the spender had an approved amount', function () {
                        beforeEach(async function () {
                            await this.token.approve(spender, new BN(1), { from: initialHolder });
                        });

                        it('increases the spender allowance adding the requested amount', async function () {
                            await this.token.increaseAllowance(spender, amount, { from: initialHolder });
                            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1));
                        });
                    });
                });
            });

            describe('when the spender is the zero address', function () {
                const spender = ZeroAddress;

                it('reverts', async function () {
                    await expectRevert.unspecified(this.token.increaseAllowance(spender, amount, { from: initialHolder }));
                });
            });
        });

        behaviors.shouldSupportInterfaces([
            interfaces.ERC20,
            interfaces.ERC20Name,
            interfaces.ERC20Symbol,
            interfaces.ERC20Decimals,
            interfaces.ERC20Detailed_Experimental,
            interfaces.ERC20Allowance_Experimental
        ]);
    });
}

module.exports = {
    shouldBehaveLikeERC20
};
