import {
	describe,
	it,
	before,
	after
} from 'node:test';
import assert from 'node:assert';
import {
	removeAbortSignalSupport,
	restoreAbortSignalSupport
} from './support/abort-signal.js';
import {
	CancellationToken,
	CancellationTokenSource,
	OperationCancellationError
} from '../src/you-are-cancelled.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('You Are Cancelled', function ()
{
	describe('when I create a cancellation token source', function ()
	{
		it('I should initially see that no cancellation has been requested', function ()
		{
			assert.strictEqual(new CancellationTokenSource().isCancellationRequested, false);
		});

		it('I should see that a cancellation has been requested after I have requested it', function ()
		{
			// Setup.
			const source = new CancellationTokenSource();

			// Act.
			source.cancel();

			// Assert.
			assert.strictEqual(source.isCancellationRequested, true);
		});

		describe('I should have access to a token', function ()
		{
			it('that is a `CancellationToken`', function ()
			{
				assert.ok(new CancellationTokenSource().token instanceof CancellationToken);
			});

			it('that is cancellable', function ()
			{
				assert.strictEqual(new CancellationTokenSource().token.isCancelable, true);
			});

			it('that initially tells me that no cancellation has been requested', function ()
			{
				assert.strictEqual(new CancellationTokenSource().token.isCancellationRequested, false);
			});

			it('that initially tells me no reason for cancellation', function ()
			{
				assert.strictEqual(new CancellationTokenSource().token.reason, null);
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
					await assert.rejects(async () => await source.token, OperationCancellationError);
				});

				it('and will be rejected with an `OperationCancellationError` with a message matching the cancellation reason', async function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel('This a test error message.');

					// Assert.
					await assert.rejects(async () => await source.token, OperationCancellationError);
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
					await assert.rejects(race, OperationCancellationError);
				});
			});

			describe('that allows me to register a callback', function ()
			{
				it('that will be executed when a cancellation has been requested', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const a = source.token.register(mock.fn());
					const b = source.token.register(mock.fn());

					// Act.
					source.cancel();

					// Assert.
					assert.strictEqual(a.mock.callCount(), 1);
					assert.strictEqual(b.mock.callCount(), 1);
				});

				it('that will be executed with an `OperationCancellationError`', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(mock.fn());

					// Act.
					source.cancel();

					// Assert.
					const error = onCancel.mock.calls[0].arguments[0];

					// Assert.
					assert.ok(error instanceof OperationCancellationError);

					// Assert.
					assert.strictEqual(error.message, 'The operation was cancelled.');
				});

				it('that will be executed with an `OperationCancellationError` with a message matching the cancellation reason', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(mock.fn());

					// Act.
					source.cancel('This a test error message.');

					// Assert.
					const error = onCancel.mock.calls[0].arguments[0];

					// Assert.
					assert.ok(error instanceof OperationCancellationError);

					// Assert.
					assert.strictEqual(error.message, 'This a test error message.');
				});

				it('that I can later deregister', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const a = source.token.register(mock.fn());
					const b = source.token.register(mock.fn());

					// Act.
					source.token.deregister(a);

					// Act.
					source.cancel();

					// Assert.
					assert.strictEqual(a.mock.callCount(), 0);
					assert.strictEqual(b.mock.callCount(), 1);
				});

				it('that will execute immediately if a cancellation has already been requested', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act.
					source.cancel();

					// Act.
					const onCancel = source.token.register(mock.fn());

					// Assert.
					assert.strictEqual(onCancel.mock.callCount(), 1);
				});

				it('that will only execute once', function ({
					mock
				})
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Setup.
					const onCancel = source.token.register(mock.fn());

					// Act.
					source.cancel();
					source.cancel();

					// Assert.
					assert.strictEqual(onCancel.mock.callCount(), 1);
				});
			});

			it('that can throw an error if a cancellation has already been requested', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Setup.
				source.cancel();

				// Act & Assert.
				assert.throws(() =>
				{
					source.token.throwIfCancellationRequested();

				}, OperationCancellationError);
			});

			it('that will not throw an error if a cancellation has not already been requested', function ()
			{
				new CancellationTokenSource().token.throwIfCancellationRequested();
			});

			it('that tells me that a cancellation has been requested after I have requested it', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Act.
				source.cancel();

				// Assert.
				assert.strictEqual(source.token.isCancellationRequested, true);
			});

			it('that tells me the reason for cancellation that I gave when requesting it', function ()
			{
				// Setup.
				const source = new CancellationTokenSource();

				// Act.
				source.cancel('This a test error message.');

				// Assert.
				assert.strictEqual(source.token.reason, 'This a test error message.');
			});

			describe('that can be converted into an `AbortSignal` object if the environment supports it', function ()
			{
				it('that has not yet emitted an abort signal', function ()
				{
					// Act.
					const signal = new CancellationTokenSource().token.toAbortSignal();

					// Assert.
					assert.ok(signal instanceof AbortSignal);

					// Assert.
					assert.strictEqual(signal.aborted, false);
				});

				it('that will be the same abort signal each time', function ()
				{
					// Setup.
					const source = new CancellationTokenSource();

					// Act & Assert.
					assert.strictEqual(
						source.token.toAbortSignal(),
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
					assert.strictEqual(source.token.toAbortSignal().aborted, true);
				});
			});

			describe('that cannot be converted into an `AbortSignal` object when the environment does not support it', function ()
			{
				before(function ()
				{
					removeAbortSignalSupport();
				});

				after(function ()
				{
					restoreAbortSignalSupport();
				});

				it('so will result in `null` when a conversion is attempted', function ()
				{
					assert.strictEqual(
						new CancellationTokenSource().token.toAbortSignal(), null
					);
				});
			});
		});
	});

	describe('I should have access to a default (a.k.a. dummy) cancellation token', function ()
	{
		it('that is a `CancellationToken`', function ()
		{
			assert.ok(CancellationToken.None instanceof CancellationToken);
		});

		it('that is not cancellable', function ()
		{
			assert.strictEqual(CancellationToken.None.isCancelable, false);
		});

		it('that tells me that no cancellation has been requested', function ()
		{
			assert.strictEqual(CancellationToken.None.isCancellationRequested, false);
		});
	});
});
