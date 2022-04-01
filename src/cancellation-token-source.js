import CancellationToken, { Cancel } from './cancellation-token.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class CancellationTokenSource
{
	#token = new CancellationToken({
		canBeCancelled : true
	});

	get token ()
	{
		return this.#token;
	}

	get isCancellationRequested ()
	{
		return this.#token.isCancellationRequested;
	}

	cancel (reason)
	{
		this.token[Cancel](reason);
	}
}
