import CancellationToken          from './cancellation-token.js';
import OperationCancellationError from './operation-cancellation-error.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class CancellationTokenSource
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
}
