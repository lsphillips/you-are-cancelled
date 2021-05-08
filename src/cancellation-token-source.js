'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CancellationToken          = require('./cancellation-token');
const OperationCancellationError = require('./operation-cancellation-error');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = class CancellationTokenSource
{
	constructor ()
	{
		Object.defineProperty(this, 'isCancellationRequested', {
			value : false, writable : true
		});

		Object.defineProperty(this, 'token', {
			value : new CancellationToken(this)
		});
	}

	cancel (reason)
	{
		if (this.isCancellationRequested)
		{
			return;
		}

		this.isCancellationRequested = true;

		this.token.callbacks.forEach(callback => callback(
			new OperationCancellationError(reason)
		));
	}
};
