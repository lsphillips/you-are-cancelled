import { use, expect }                                                            from 'chai';
import asPromised                                                                 from 'chai-as-promised';
import { spy, assert, match }                                                     from 'sinon';
import * as AbortControllerSimulator                                              from './support/abort-controller-simulator.js';
import { CancellationToken, CancellationTokenSource, OperationCancellationError } from '../src/you-are-cancelled.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('You Are Cancelled', function ()
{
	before(function ()
	{
		use(asPromised);
	});

	describe('when I create a cancellation token source', function ()
	{
		it('I should initially see that no cancellation has been requested', function ()
		{
			expect(new CancellationTokenSource().isCancellationRequested).to.be.false;
		});

		it('I should see that a cancellation has been requested after I have requested it', function ()
		{
			// Setup.
			const source = new CancellationTokenSource();

			// Act.
			source.cancel();

			// Assert.
			expect(source.isCancellationRequested).to.be.true;
		});

		describe('I should have access to a token', function ()
		{
			it('that is a `CancellationToken`', function ()
			{
				expect(new CancellationTokenSource().token).to.be.instanceOf(CancellationToken);
			});

			it('that is cancellable', function ()
			{
				expect(new CancellationTokenSource().token.isCancelable).to.be.true;
			});

			it('that initially tells me that no cancellation has been requested', function ()
			{
				expect(new CancellationTokenSource().token.isCancellationRequested).to.be.false;
			});

			it('that initially tells me no reason for cancellation', function ()
			{
				expect(new CancellationTokenSource().token.reason).to.be.null;
			});

			describe('that is `thenable`', function ()
			{
				it('and will be rejected with an `OperationCancellationError` when a cancellation has been requested', async function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel();

					// Assert.
					await expect(source.token).to.eventually.be.rejectedWith(OperationCancellationError, 'The operation was cancelled.');
				});

				it('and will be rejected with an `OperationCancellationError` with a message matching the cancellation reason', async function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel('This a test error message.');

					// Assert.
					await expect(source.token).to.eventually.be.rejectedWith(OperationCancellationError, 'This a test error message.');
				});

				it('and can be raced against another promise', async function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const race = Promise.race([
						new Promise(() =>
						{
							// This will never resolve.
						}),
						source.token
					]);

					// Act.
					source.cancel();

					// Assert.
					await expect(race).to.to.eventually.be.rejectedWith(OperationCancellationError);
				});
			});

			describe('that allows me to register a callback', function ()
			{
				it('that will be executed when a cancellation has been requested', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const a = source.token.register(spy());
					const b = source.token.register(spy());

					// Act.
					source.cancel();

					// Assert.
					assert.called(a);
					assert.called(b);
				});

				it('that will be executed with an `OperationCancellationError`', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(spy());

					// Act.
					source.cancel();

					// Assert.
					assert.calledWithMatch(onCancel, match.instanceOf(
						OperationCancellationError
					));

					// Assert.
					assert.calledWithMatch(onCancel, match.has(
						'message', 'The operation was cancelled.'
					));
				});

				it('that will be executed with an `OperationCancellationError` with a message matching the cancellation reason', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(spy());

					// Act.
					source.cancel('This a test error message.');

					// Assert.
					assert.calledWithMatch(onCancel, match.instanceOf(
						OperationCancellationError
					));

					// Assert.
					assert.calledWithMatch(onCancel, match.has(
						'message', 'This a test error message.'
					));
				});

				it('that I can later deregister', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const a = source.token.register(spy());
					const b = source.token.register(spy());

					// Act.
					source.token.deregister(a);

					// Act.
					source.cancel();

					// Assert.
					assert.notCalled(a);

					// Assert.
					assert.called(b);
				});

				it('that will execute immediately if a cancellation has already been requested', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel();

					// Act.
					const onCancel = source.token.register(spy());

					// Assert.
					assert.called(onCancel);
				});

				it('that will only execute once', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(spy());

					// Act.
					source.cancel();
					source.cancel();

					// Assert.
					assert.callCount(onCancel, 1);
				});
			});

			it('that can throw an error if a cancellation has already been requested', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Setup.
				source.cancel();

				// Act & Assert.
				expect(() =>
				{
					source.token.throwIfCancellationRequested();
				}).to.throw(OperationCancellationError);
			});

			it('that will not throw an error if a cancellation has not already been requested', function ()
			{
				expect(() =>
				{
					new CancellationTokenSource().token.throwIfCancellationRequested();

				}).to.not.throw(OperationCancellationError);
			});

			it('that tells me that a cancellation has been requested after I have requested it', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Act.
				source.cancel();

				// Assert.
				expect(source.token.isCancellationRequested).to.be.true;
			});

			it('that tells me the reason for cancellation that I gave when requesting it', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Act.
				source.cancel('This a test error message.');

				// Assert.
				expect(source.token.reason).to.equal('This a test error message.');
			});

			describe('that can be converted into an `AbortSignal` object if the environment supports it', function ()
			{
				before(async function ()
				{
					await AbortControllerSimulator.simulate({
						supported : true
					});
				});

				after(async function ()
				{
					await AbortControllerSimulator.restore();
				});

				it('that has not yet emitted an abort signal', function ()
				{
					// Act.
					const signal = new CancellationTokenSource().token.toAbortSignal();

					// Assert.
					expect(signal).to.be.instanceOf(AbortSignal);

					// Assert.
					expect(signal.aborted).to.be.false;
				});

				it('that will be the same abort signal each time', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act & Assert.
					expect(
						source.token.toAbortSignal()
					).to.equal(
						source.token.toAbortSignal()
					);
				});

				it('that will emit an abort signal when the cancellation token is aborted', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel();

					// Assert.
					expect(source.token.toAbortSignal().aborted).to.be.true;
				});
			});

			describe('that cannot be converted into an `AbortSignal` object when the environment does not support it', function ()
			{
				before(async function ()
				{
					await AbortControllerSimulator.simulate({
						supported : false
					});
				});

				after(async function ()
				{
					await AbortControllerSimulator.restore();
				});

				it('so will result in `undefined` when a conversion is attempted', function ()
				{
					expect(
						new CancellationTokenSource().token.toAbortSignal()
					).to.be.undefined;
				});
			});
		});
	});

	describe('I should have access to a default (a.k.a. dummy) cancellation token', function ()
	{
		it('that is a `CancellationToken`', function ()
		{
			expect(CancellationToken.None).to.be.instanceOf(CancellationToken);
		});

		it('that is not cancellable', function ()
		{
			expect(CancellationToken.None.isCancelable).to.be.false;
		});

		it('that tells me that no cancellation has been requested', function ()
		{
			expect(CancellationToken.None.isCancellationRequested).to.be.false;
		});
	});
});
