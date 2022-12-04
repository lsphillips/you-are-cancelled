import { babel } from '@rollup/plugin-babel';
import terser    from '@rollup/plugin-terser';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function bundle (output, {
	transpile = false
} = {})
{
	const plugins = [
		terser()
	];

	if (transpile)
	{
		plugins.unshift(babel({
			babelHelpers : 'bundled'
		}));
	}

	return {
		output, plugins, input : 'src/you-are-cancelled.js'
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default
[
	bundle({
		file : 'you-are-cancelled.es5.js',
		format : 'esm'
	}, {
		transpile : true
	}),

	bundle({
		file : 'you-are-cancelled.es5.cjs',
		format : 'umd',
		name : 'you-are-cancelled',
		exports : 'named'
	}, {
		transpile : true
	}),

	bundle({
		file : 'you-are-cancelled.cjs',
		format : 'cjs',
		exports : 'named'
	}),

	bundle({
		file : 'you-are-cancelled.js',
		format : 'esm'
	})
];
