import OperationCancellationError from './operation-cancellation-error.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function tryToMakeAbortController ()
{
	return typeof AbortController === 'function' ? new AbortController() : null;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const Cancel = Symbol('Cancel');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class CancellationToken
{
	static None = new CancellationToken({
		isCancelable : false
	});

	#reason                  = null;
	#isCancelable            = false;
	#isCancellationRequested = false;
	#callbacks               = [];
	#promise                 = null;
	#aborter                 = tryToMakeAbortController();

	constructor ({
		isCancelable = true
	} = {})
	{
		this.#isCancelable = isCancelable;

		this.#promise = new Promise((resolve, reject) =>
		{
			this.register(reject);
		});

		this.#promise.catch(() =>
		{
			// Prevent unhandled rejections.
		});
	}

	get reason ()
	{
		return this.#reason;
	}

	get isCancelable ()
	{
		return this.#isCancelable;
	}

	get isCancellationRequested ()
	{
		return this.#isCancellationRequested;
	}

	register (callback)
	{
		if (this.#isCancelable)
		{
			if (this.#isCancellationRequested)
			{
				callback(
					new OperationCancellationError(this.#reason)
				);
			}
			else
			{
				this.#callbacks.push(callback);
			}
		}

		return callback;
	}

	deregister (callback)
	{
		const i = this.#callbacks.indexOf(callback);

		if (i >= 0)
		{
			this.#callbacks.splice(i, 1);
		}
	}

	throwIfCancellationRequested ()
	{
		if (this.#isCancellationRequested)
		{
			throw new OperationCancellationError(this.#reason);
		}
	}

	toAbortSignal ()
	{
		return this.#aborter ? this.#aborter.signal : null;
	}

	then (onFulfilled, onRejected)
	{
		if (this.#isCancelable)
		{
			return this.#promise.then(onFulfilled, onRejected);
		}

		return this;
	}

	[Cancel] (reason)
	{
		if (!this.#isCancellationRequested)
		{
			this.#isCancellationRequested = true;
			this.#reason                  = reason;

			this.#callbacks.splice(0).forEach(callback => callback(
				new OperationCancellationError(this.#reason)
			));

			if (this.#aborter)
			{
				this.#aborter.abort(reason);
			}
		}
	}
}
