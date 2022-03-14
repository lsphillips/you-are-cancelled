import { use, expect }                                                            from 'chai';
import asPromised                                                                 from 'chai-as-promised';
import { spy, assert, match }                                                     from 'sinon';
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
		beforeEach(function ()
		{
			this.cancellationTokenSource = new CancellationTokenSource();
		});

		it('I should see that no cancellation has been requested', function ()
		{
			expect(this.cancellationTokenSource.isCancellationRequested).to.be.false;
		});

		describe('and I request a cancellation', function ()
		{
			beforeEach(function ()
			{
				this.cancellationTokenSource.cancel();
			});

			it('then I should see that a cancellation has been requested', function ()
			{
				expect(this.cancellationTokenSource.isCancellationRequested).to.be.true;
			});
		});

		describe('I should have access to a token', function ()
		{
			beforeEach(function ()
			{
				this.token = this.cancellationTokenSource.token;
			});

			it('that is a `CancellationToken`', function ()
			{
				expect(this.token).to.be.instanceOf(CancellationToken);
			});

			it('that is cancellable', function ()
			{
				expect(this.token.canBeCancelled).to.be.true;
			});

			it('that initially tells me that no cancellation has been requested', function ()
			{
				expect(this.token.isCancellationRequested).to.be.false;
			});

			describe('that is `thenable`', function ()
			{
				it('and will be rejected with an `OperationCancellationError` when a cancellation has been requested', async function ()
				{
					// Act.
					this.cancellationTokenSource.cancel();

					// Assert.
					await expect(this.token).to.eventually.be.rejectedWith(OperationCancellationError, 'The operation was cancelled.');
				});

				it('and will be rejected with an `OperationCancellationError` with a message matching the cancellation reason', async function ()
				{
					// Act.
					this.cancellationTokenSource.cancel('This a test error message.');

					// Assert.
					await expect(this.token).to.eventually.be.rejectedWith(OperationCancellationError, 'This a test error message.');
				});

				it('and can be raced against another promise', async function ()
				{
					// Setup.
					const race = Promise.race([
						new Promise(() =>
						{
							// This will never resolve.
						}),
						this.token
					]);

					// Act.
					this.cancellationTokenSource.cancel();

					// Assert.
					await expect(race).to.to.eventually.be.rejectedWith(OperationCancellationError);
				});
			});

			describe('that allows me to register a callback', function ()
			{
				it('that will be executed when a cancellation has been requested', function ()
				{
					const a = spy();
					const b = spy();

					// Setup.
					this.token.register(a);
					this.token.register(b);

					// Act.
					this.cancellationTokenSource.cancel();

					// Assert.
					assert.called(a);
					assert.called(b);
				});

				it('that will be executed with an `OperationCancellationError`', function ()
				{
					const onCancel = spy();

					// Setup.
					this.token.register(onCancel);

					// Act.
					this.cancellationTokenSource.cancel();

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
					const onCancel = spy();

					// Setup.
					this.token.register(onCancel);

					// Act.
					this.cancellationTokenSource.cancel('This a test error message.');

					// Assert.
					assert.calledWithMatch(onCancel, match.instanceOf(
						OperationCancellationError
					));

					// Assert.
					assert.calledWithMatch(onCancel, match.has(
						'message', 'This a test error message.'
					));
				});

				it('that I can later deregiser', function ()
				{
					const a = spy();
					const b = spy();

					// Setup.
					this.token.register(a);
					this.token.register(b);

					// Act.
					this.token.deregister(a);

					// Act.
					this.cancellationTokenSource.cancel();

					// Assert.
					assert.notCalled(a);

					// Assert.
					assert.called(b);
				});

				it('that I can later deregiser even during a cancellation request', function ()
				{
					const onCancel = spy();

					// Setup.
					this.token.register(() =>
					{
						this.token.deregister(onCancel);
					});

					// Setup.
					this.token.register(onCancel);

					// Act.
					this.cancellationTokenSource.cancel();

					// Assert.
					assert.notCalled(onCancel);
				});

				it('that will execute immediately if a cancellation has already been requested', function ()
				{
					const onCancel = spy();

					// Setup.
					this.cancellationTokenSource.cancel();

					// Act.
					this.token.register(onCancel);

					// Assert.
					assert.called(onCancel);
				});

				it('that will only execute once', function ()
				{
					const onCancel = spy();

					// Setup.
					this.token.register(onCancel);

					// Act.
					this.cancellationTokenSource.cancel();
					this.cancellationTokenSource.cancel();

					// Assert.
					assert.callCount(onCancel, 1);
				});
			});

			it('that can throw if a cancellation has already been requested', function ()
			{
				// Setup.
				this.cancellationTokenSource.cancel();

				// Act & Assert.
				expect(() =>
				{
					this.token.throwIfCancellationRequested();
				}).to.throw(OperationCancellationError);
			});

			it('that will not throw if a cancellation has not already been requested', function ()
			{
				expect(() =>
				{
					this.token.throwIfCancellationRequested();

				}).to.not.throw(OperationCancellationError);
			});

			it('that tells me that a cancellation has been requested', function ()
			{
				// Act.
				this.cancellationTokenSource.cancel();

				// Assert.
				expect(this.token.isCancellationRequested).to.be.true;
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
			expect(CancellationToken.None.canBeCancelled).to.be.false;
		});

		it('that tells me that no cancellation has been requested (and never will)', function ()
		{
			expect(CancellationToken.None.isCancellationRequested).to.be.false;
		});
	});
});
