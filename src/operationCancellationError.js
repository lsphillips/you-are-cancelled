'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const DefaultErrorMessage = 'The operation was cancelled.';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = class OperationCancellationError extends Error
{
	constructor (message = DefaultErrorMessage)
	{
		super(message);
	}
};
