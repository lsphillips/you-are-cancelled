'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CancellationToken          = require('./cancellationToken');
const CancellationTokenSource    = require('./cancellationTokenSource');
const OperationCancellationError = require('./operationCancellationError');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = {
	CancellationToken,
	CancellationTokenSource,
	OperationCancellationError
};
