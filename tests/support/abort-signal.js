const NativeAbortController = AbortController;
const NativeAbortSignal     = AbortSignal;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function removeAbortSignalSupport ()
{
	global.AbortController = global.AbortSignal = undefined; // eslint-disable-line no-undefined
}

export function restoreAbortSignalSupport ()
{
	global.AbortController = NativeAbortController;
	global.AbortSignal     = NativeAbortSignal;
}
