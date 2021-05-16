export default class OperationCancellationError extends Error
{
	constructor (message = 'The operation was cancelled.')
	{
		super(message);

		Object.defineProperty(this, 'name', {
			configurable : true, writable : true, value : 'OperationCancellationError'
		});
	}
}
