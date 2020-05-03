const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { GSNDevProvider } = require('@openzeppelin/gsn-provider');
const { fundRecipient } = require('@openzeppelin/gsn-helpers');

const ERC20FullMock = contract.fromArtifact('ERC20FullMock');
const ERC20MetaMock = contract.fromArtifact('ERC20MetaMock');

describe('ERC20 Meta', function () {

    const [_, initialHolder, recipient, feeCollector, executor, anotherAccount, ...otherAccounts] = accounts;

    const signingAccount1 = {
        address: '0xde2400329a9721819c6D45bbED48203d26E861Ac',
        privateKey: '0xf827bb5ced203b20b9a50214f6a44ca361fe25622dfbe2fc43ee1deb55bb03d9'
    };

    const signingAccount2 = {
        address: '0xb075cc759A7387c79ABDFF102180e99362dEe5C4',
        privateKey: '0xbdd2a908b14f3cb946f1bba5bc7abdeedfa92615bad825d74b55056de424cb5f'
    };

    const sender = signingAccount1.address;

    const initialSupplyGasToken = '100000000000000000000';
    const initialSupply = new BN(100);

    before(function () {
        this.gsnProvider = new GSNDevProvider(web3.currentProvider, {
            txFee: 90,
            fixedGasPrice: 20000000022,
            gasPrice: 20000000022,
            fixedGasLimit: 500000,
            gasLimit: 500000,
            httpTimeout: 30000,
            signKey: signingAccount1.privateKey,
            verbose: false
        });

        this.gsnProvider2 = new GSNDevProvider(web3.currentProvider, {
            txFee: 90,
            fixedGasPrice: 20000000022,
            gasPrice: 20000000022,
            fixedGasLimit: 500000,
            gasLimit: 500000,
            httpTimeout: 30000,
            signKey: signingAccount2.privateKey,
            verbose: false
        });

        this.gsnProviderFromAccounts = new GSNDevProvider(web3.currentProvider, {
            txFee: 90,
            fixedGasPrice: 20000000022,
            gasPrice: 20000000022,
            fixedGasLimit: 500000,
            gasLimit: 500000,
            httpTimeout: 30000,
            verbose: false
        });
    });

    beforeEach(async function () {
        this.ERC20 = await ERC20FullMock.new(
            initialSupplyGasToken,
            { from: initialHolder }
        );
        this.token = await ERC20MetaMock.new(
            initialSupply,
            this.ERC20.address,
            feeCollector,
            { from: initialHolder }
        )

        await fundRecipient(web3, { recipient: this.token.address, from: initialHolder });

        await this.ERC20.whitelistOperator(this.token.address, true, { from: initialHolder });

        this.token.contract.setProvider(this.gsnProvider);
    });

    const sendWithoutGSN = async function (callFn, from) {
        return await callFn.send({ from: from, gas: 1e6, useGSN: false });
    };

    const approveWasSuccessful = function (owner, spender, amount) {
        const amountBN = amount instanceof BN ? amount : new BN(amount);

        it('adjusts spenders allowance', async function () {
            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amountBN);
        });

        it('emits an Approval event', async function () {
            await expectEvent(this.receipt, 'Approval', {
                _owner: owner,
                _spender: spender,
                _value: amountBN
            });
        });
    };

    const transferWasSuccessful = function (from, to, amount) {
        const amountBN = amount instanceof BN ? amount : new BN(amount);

        it('adjusts owners balances', async function () {
            (await this.token.balanceOf(from)).should.be.bignumber.equal(initialSupply.sub(amountBN));
        });

        it('adjusts recipients balances', async function () {
            (await this.token.balanceOf(to)).should.be.bignumber.equal(amountBN);
        });

        it('emits a Transfer event', async function () {
            await expectEvent(this.receipt, 'Transfer', {
                _from: from,
                _to: to,
                _value: amountBN
            });
        });
    };

    const transferFromWasSuccessful = function (owner, spender, recipient, amount) {
        const amountBN = amount instanceof BN ? amount : new BN(amount);

        transferWasSuccessful(owner, recipient, amountBN);
        approveWasSuccessful(owner, spender, initialSupply.sub(amountBN));
    };

    const shouldBeRelayed = function (sender, callFn, funsNArgs) {
        beforeEach(async function () {
            this.senderBalanceBefore = await this.ERC20.balanceOf(sender);
            this.feeCollectorBalanceBefore = await this.ERC20.balanceOf(feeCollector);
            this.receipt = await callFn.call(this).send({ from: sender });
        });

        it('sender paid ERC20 gas tokens to the fee collector', async function () {
            const senderBalanceAfter = await this.ERC20.balanceOf(sender);
            const feeCollectorBalanceAfter = await this.ERC20.balanceOf(feeCollector);

            const feesPaid = this.senderBalanceBefore.sub(senderBalanceAfter);
            const feesCollected = feeCollectorBalanceAfter.sub(this.feeCollectorBalanceBefore);

            feesPaid.gt(new BN(0)).should.be.true;
            feesCollected.gt(new BN(0)).should.be.true;
            feesPaid.should.be.bignumber.equal(feesCollected);
        });

        if (funsNArgs) {
            for (let fNa of funsNArgs) {
                fNa();
            }
        }
    };

    const failedToPayInsufficientBalance = function (callFn) {
        it('reverts - insufficient GSN gas token balance', async function () {
            this.token.contract.setProvider(this.gsnProviderFromAccounts);
            await expectRevert(callFn.call(this).send({ from: executor }), 'Error: Recipient canRelay call was rejected with error 11');
        });
    };

    const failedToPayRestrictedMethod = function (callFn) {
        it('reverts - restricted GSN relayed function', async function () {
            this.token.contract.setProvider(this.gsnProviderFromAccounts);
            await expectRevert(callFn.call(this).send({ from: executor }), 'Error: Recipient canRelay call was rejected with error 12');
        });
    };


    //////////////////////////////// ERC20Fees /////////////////////////////////////

    describe('ERC20Fees::setGasToken()', function () {
        context('when called by owner', function () {
            it('must change gas token', async function () {
                await sendWithoutGSN(
                    this.token.contract.methods.setGasToken(otherAccounts[0]),
                    initialHolder);
                const gasToken = await this.token.contract.methods._gasToken().call();
                gasToken.should.be.equal(otherAccounts[0]);
            });
        });

        context('when called by non-owner', function () {
            it('reverts', async function () {
                await expectRevert.unspecified(
                    sendWithoutGSN(
                        this.token.contract.methods.setGasToken(otherAccounts[0]),
                        executor));
            });
        });
    });

    describe('ERC20Fees::setGasPrice()', function () {
        const oldGasPrice = '1000'; // 100%
        const newGasPrice = '500'; // 50%

        context('when called by owner', function () {
            it('must change gas price', async function () {
                await sendWithoutGSN(
                    this.token.contract.methods.setGasPrice(newGasPrice),
                    initialHolder);
                const newPrice = await this.token._gasPriceScaling();
                newPrice.toString().should.be.equal(newGasPrice);
            });
        });

        context('when called by non-owner', function () {
            it('reverts', async function () {
                await expectRevert.unspecified(
                    sendWithoutGSN(
                        this.token.contract.methods.setGasPrice(newGasPrice),
                        executor));
            });
        });

        describe('when transaction is executed', function () {
            const amount = '10';

            beforeEach(async function () {
                const gasTokenAmount = new BN(initialSupplyGasToken).divn(2);
                await this.ERC20.transfer(signingAccount1.address, gasTokenAmount, { from: initialHolder });
                await this.ERC20.transfer(signingAccount2.address, gasTokenAmount, { from: initialHolder });
                await this.token.transfer(signingAccount1.address, amount, { from: initialHolder });
            });

            it('fee must scale accordingly', async function () {
                const sender1BalanceBefore = await this.ERC20.balanceOf(signingAccount1.address);
                const sender2BalanceBefore = await this.ERC20.balanceOf(signingAccount2.address);

                await this.token.contract.methods.transfer(signingAccount2.address, amount).send({ from: signingAccount1.address });
                const sender1BalanceAfter = await this.ERC20.balanceOf(signingAccount1.address);
                const sender1FeesPaid = sender1BalanceAfter.sub(sender1BalanceBefore);

                await sendWithoutGSN(
                    this.token.contract.methods.setGasPrice(newGasPrice),
                    initialHolder);

                this.token.contract.setProvider(this.gsnProvider2);

                await this.token.contract.methods.transfer(signingAccount1.address, amount).send({ from: signingAccount2.address });
                const sender2BalanceAfter = await this.ERC20.balanceOf(signingAccount2.address);
                const sender2FeesPaid = sender2BalanceAfter.sub(sender2BalanceBefore);

                const gasPriceScale = new BN(oldGasPrice).div(new BN(newGasPrice));
                const feesPaidScale = new BN(sender1FeesPaid).div(sender2FeesPaid);

                feesPaidScale.should.be.bignumber.equal(gasPriceScale);
            });
        });
    });

    describe('ERC20Fees::withdrawDeposits()', function () {
        const amount = '1000000000000000000';

        context('when called by owner', function () {
            it('must withdraw the deposit', async function () {
                const balanceBefore = await web3.eth.getBalance(feeCollector);
                await sendWithoutGSN(
                    this.token.contract.methods.withdrawDeposits(amount, feeCollector),
                    initialHolder);
                const balanceAfter = await web3.eth.getBalance(feeCollector);
                balanceAfter.should.be.bignumber.gt(balanceBefore);
            });
        });

        context('when called by non-owner', function () {
            it('reverts', async function () {
                await expectRevert.unspecified(
                    sendWithoutGSN(
                        this.token.contract.methods.withdrawDeposits(amount, initialHolder),
                        executor));
            });
        });
    });


    ///////////////////////////////////// ERC20 ////////////////////////////////////


    describe('ERC20::totalSupply()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.totalSupply(); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.totalSupply();
            });
        });
    });

    describe('ERC20::balanceOf()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.balanceOf(initialHolder); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.balanceOf(initialHolder);
            });
        });
    });

    describe('ERC20::transfer()', function () {
        beforeEach(async function () {
            await this.token.transfer(sender, initialSupply, { from: initialHolder });
        });

        describe('when the recipient is not the zero address', function () {
            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1).toString();

                beforeEach(async function () {
                    await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                });

                it('reverts', async function () {
                    const call = this.token.contract.methods.transfer(recipient, amount).send({ from: sender });
                    await expectRevert.unspecified(call);
                });
            });

            describe('when the sender has enough balance', function () {
                const amount = initialSupply.toString();

                context('when the sender has enough gas tokens to pay the tx fees', function () {
                    beforeEach(async function () {
                        await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                    });

                    shouldBeRelayed(
                        sender,
                        function () { return this.token.contract.methods.transfer(recipient, amount); },
                        [transferWasSuccessful.bind(this, sender, recipient, amount)]);
                });

                context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                    failedToPayInsufficientBalance(function () {
                        return this.token.contract.methods.transfer(recipient, amount);
                    });
                });
            });
        });

        describe('when the recipient is the zero address', function () {
            const amount = initialSupply.toString();

            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            it('reverts', async function () {
                const call = this.token.contract.methods.transfer(ZERO_ADDRESS, amount).send({ from: sender });
                await expectRevert.unspecified(call);
            });
        });
    });

    describe('ERC20::allowance()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.allowance(initialHolder, sender); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.allowance(initialHolder, sender);
            });
        });
    });

    describe('ERC20::approve()', function () {
        const amount = initialSupply.toString();

        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.approve(anotherAccount, amount); },
                [approveWasSuccessful.bind(this, sender, anotherAccount, amount)]);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.approve(anotherAccount, amount);
            });
        });
    });

    describe('ERC20::transferFrom()', function () {
        const spender = sender;

        context('when the recipient is not the zero address', function () {
            context('when the spender has enough approved balance', function () {
                beforeEach(async function () {
                    await this.token.approve(spender, initialSupply, { from: initialHolder });
                });

                context('when the initial holder has enough balance', function () {
                    const amount = initialSupply.toString();

                    context('when the spender has enough gas tokens to pay the tx fees', function () {
                        beforeEach(async function () {
                            await this.ERC20.transfer(spender, initialSupplyGasToken, { from: initialHolder });
                        });

                        shouldBeRelayed(
                            spender,
                            function () { return this.token.contract.methods.transferFrom(initialHolder, recipient, amount); },
                            [transferFromWasSuccessful.bind(this, initialHolder, spender, recipient, amount)]);
                    });

                    context('when the spender does not have enough gas tokens to pay the tx fees', function () {
                        failedToPayInsufficientBalance(function () {
                            return this.token.contract.methods.transferFrom(initialHolder, recipient, amount);
                        });
                    });
                });

                context('when the initial holder does not have enough balance', function () {
                    const amount = initialSupply.addn(1).toString();

                    beforeEach(async function () {
                        await this.ERC20.transfer(spender, initialSupplyGasToken, { from: initialHolder });
                    });

                    it('reverts', async function () {
                        const call = this.token.contract.methods.transferFrom(initialHolder, recipient, amount).send({ from: spender });
                        await expectRevert.unspecified(call);
                    });
                });
            });

            context('when the spender does not have enough approved balance', function () {
                beforeEach(async function () {
                    await this.ERC20.transfer(spender, initialSupplyGasToken, { from: initialHolder });
                    await this.token.approve(spender, initialSupply.subn(1), { from: initialHolder });
                });

                context('when the initial holder has enough balance', function () {
                    const amount = initialSupply.toString();

                    it('reverts', async function () {
                        const call = this.token.contract.methods.transferFrom(initialHolder, recipient, amount).send({ from: spender });
                        await expectRevert.unspecified(call);
                    });
                });

                context('when the initial holder does not have enough balance', function () {
                    const amount = initialSupply.addn(1).toString();

                    it('reverts', async function () {
                        const call = this.token.contract.methods.transferFrom(initialHolder, recipient, amount).send({ from: spender });
                        await expectRevert.unspecified(call);
                    });
                });
            });
        });

        context('when the recipient is the zero address', function () {
            const amount = initialSupply.toString();

            beforeEach(async function () {
                await this.ERC20.transfer(spender, initialSupplyGasToken, { from: initialHolder });
                await this.token.approve(spender, amount, { from: initialHolder });
            });

            it('reverts', async function () {
                const call = this.token.contract.methods.transferFrom(initialHolder, ZERO_ADDRESS, amount).send({ from: spender });
                await expectRevert.unspecified(call);
            });
        });
    });

    describe('ERC20::increaseAllowance()', function () {
        const amount = initialSupply.toString();

        context('when the spender is not the zero address', function () {
            context('when there was no approved amount before', function () {
                context('when the sender has enough gas tokens to pay the tx fees', function () {
                    beforeEach(async function () {
                        await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                    });

                    shouldBeRelayed(
                        sender,
                        function () { return this.token.contract.methods.increaseAllowance(anotherAccount, amount); },
                        [approveWasSuccessful.bind(this, sender, anotherAccount, amount)]);
                });

                context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                    failedToPayInsufficientBalance(function () {
                        return this.token.contract.methods.increaseAllowance(anotherAccount, amount);
                    });
                });
            });

            context('when the spender had an approved amount before', function () {
                const previousAmount = '10';

                context('when the sender has enough gas tokens to pay the tx fees', function () {
                    beforeEach(async function () {
                        await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                        await this.token.contract.methods.approve(anotherAccount, previousAmount).send({ from: sender });
                    });

                    shouldBeRelayed(
                        sender,
                        function () { return this.token.contract.methods.increaseAllowance(anotherAccount, amount); },
                        [approveWasSuccessful.bind(this, sender, anotherAccount, new BN(amount).add(new BN(previousAmount)))]);
                });

                // TODO: need to figure out how to setup an initial allowance
                //       resulting in insufficient gas tokens remaining to
                //       process the increaseAllowance() call
                //
                // context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                //     failedToPayInsufficientBalance(function () {
                //         return this.token.contract.methods.increaseAllowance(anotherAccount, amount);
                //     });
                // });
            });
        });

        context('when the spender is the zero address', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            it('reverts', async function () {
                const call = this.token.contract.methods.increaseAllowance(ZERO_ADDRESS, amount).send({ from: sender });
                await expectRevert.unspecified(call);
            });
        });
    });

    describe('ERC20::decreaseAllowance()', function () {
        const amount = initialSupply.toString();

        context('when the spender is not the zero address', function () {
            context('when decreasing more than the current approved amount', function () {
                context('when the sender has enough gas tokens to pay the tx fees', function () {
                    beforeEach(async function () {
                        await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                    });

                    it('reverts', async function () {
                        const call = this.token.contract.methods.decreaseAllowance(anotherAccount, amount).send({ from: sender })
                        await expectRevert.unspecified(call);
                    });
                });

                context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                    failedToPayInsufficientBalance(function () {
                        return this.token.contract.methods.decreaseAllowance(anotherAccount, amount);
                    });
                });
            });

            context('when decreasing less than or equal to the current approved amount', function () {
                context('when the sender has enough gas tokens to pay the tx fees', function () {
                    beforeEach(async function () {
                        await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                        await this.token.contract.methods.approve(anotherAccount, amount).send({ from: sender });
                    });

                    shouldBeRelayed(
                        sender,
                        function () { return this.token.contract.methods.decreaseAllowance(anotherAccount, new BN(amount).subn(1).toString()); },
                        [approveWasSuccessful.bind(this, sender, anotherAccount, '1')]);
                });

                context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                    failedToPayInsufficientBalance(function () {
                        return this.token.contract.methods.decreaseAllowance(anotherAccount, '0');
                    });
                });
            });
        });

        context('when the spender is the zero address', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                await this.token.contract.methods.approve(anotherAccount, amount).send({ from: sender });
            });

            it('reverts', async function () {
                const call = this.token.contract.methods.decreaseAllowance(ZERO_ADDRESS, amount).send({ from: sender });
                await expectRevert.unspecified(call);
            });
        });
    });


    ///////////////////////////////// ERC20Detailed ////////////////////////////////


    describe('ERC20Detailed::name()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.name(); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.name();
            });
        });
    });

    describe('ERC20Detailed::symbol()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.symbol(); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.symbol();
            });
        });
    });

    describe('ERC20Detailed::decimals()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.decimals(); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.decimals();
            });
        });
    });


    ////////////////////////////////// ERC20Full ///////////////////////////////////


    describe('ERC20Full::anUrelayableFunction()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            failedToPayRestrictedMethod(function () {
                return this.token.contract.methods.anUnrelayableFunction();
            });
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayRestrictedMethod(function () {
                return this.token.contract.methods.anUnrelayableFunction();
            });
        });
    });


    ///////////////////////////// WhitelistedOperators /////////////////////////////


    describe('WhitelistedOperators::whitelistOperator()', function () {
        context('when called by owner', function () {
            it('must update the operator whitelist status', async function () {
                const isOperator = await this.token.contract.methods.isOperator(anotherAccount).call();
                await sendWithoutGSN(
                    this.token.contract.methods.whitelistOperator(anotherAccount, !isOperator),
                    initialHolder);
                const newOperatorStatus = await this.token.contract.methods.isOperator(anotherAccount).call();
                newOperatorStatus.should.be.equal(!isOperator);
            });
        });

        context('when called by non-owner', function () {
            context('when the sender has enough gas tokens to pay the tx fees', function () {
                beforeEach(async function () {
                    await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
                });

                it('reverts', async function () {
                    const isOperator = await this.token.contract.methods.isOperator(anotherAccount).call();
                    const call = sendWithoutGSN(
                        this.token.contract.methods.whitelistOperator(anotherAccount, !isOperator),
                        executor);
                    await expectRevert.unspecified(call);
                });
            });

            context('when the sender does not have enough gas tokens to pay the tx fees', function () {
                beforeEach(async function () {
                    this.isOperator = await this.token.contract.methods.isOperator(anotherAccount).call();
                });

                failedToPayInsufficientBalance(function () {
                    return this.token.contract.methods.whitelistOperator(anotherAccount, !this.isOperator);
                });
            });
        });
    });

    describe('WhitelistedOperators::isOperator()', function () {
        context('when the sender has enough gas tokens to pay the tx fees', function () {
            beforeEach(async function () {
                await this.ERC20.transfer(sender, initialSupplyGasToken, { from: initialHolder });
            });

            shouldBeRelayed(
                sender,
                function () { return this.token.contract.methods.isOperator(anotherAccount); },
                []);
        });

        context('when the sender does not have enough gas tokens to pay the tx fees', function () {
            failedToPayInsufficientBalance(function () {
                return this.token.contract.methods.isOperator(anotherAccount);
            });
        });
    });


    ////////////////////////////////////////////////////////////////////////////////


});
