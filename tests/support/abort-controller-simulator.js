const NativeAbortController = global.AbortController;
const NativeAbortSignal     = global.AbortSignal;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function simulate ({
	supported
})
{
	if (supported)
	{
		await import('abort-controller/polyfill.js');
	}
	else
	{
		global.AbortController = global.AbortSignal = undefined; // eslint-disable-line no-undefined
	}
}

export async function restore ()
{
	global.AbortController = NativeAbortController;
	global.AbortSignal     = NativeAbortSignal;
}
