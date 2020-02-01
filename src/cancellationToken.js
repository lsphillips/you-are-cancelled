'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const OperationCancellationError = require('./operationCancellationError');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class CancellationToken
{
	constructor (source = null)
	{
		Object.defineProperty(this, 'source', {
			value : source
		});

		Object.defineProperty(this, 'callbacks', {
			value : []
		});

		Object.defineProperty(this, 'promise', {
			value : new Promise((resolve, reject) => this.register(reject))
		});

		this.promise.catch(() =>
		{
			// Here to prevent unhandled rejections.
		});
	}

	get canBeCancelled ()
	{
		return this.source !== null;
	}

	get isCancellationRequested ()
	{
		return this.canBeCancelled && this.source.isCancellationRequested;
	}

	register (callback)
	{
		if (this.canBeCancelled)
		{
			if (this.isCancellationRequested)
			{
				callback();
			}
			else
			{
				this.callbacks.push(callback);
			}
		}
	}

	deregister (callback)
	{
		const i = this.callbacks.indexOf(callback);

		if (i >= 0)
		{
			this.callbacks.splice(i, 1);
		}
	}

	throwIfCancellationRequested ()
	{
		if (this.isCancellationRequested)
		{
			throw new OperationCancellationError();
		}
	}

	then (onFulfilled, onRejected)
	{
		if (this.canBeCancelled)
		{
			return this.promise.then(onFulfilled, onRejected); // eslint-disable-line promise/prefer-await-to-then
		}

		return this;
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

CancellationToken.None = new CancellationToken();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = CancellationToken;
