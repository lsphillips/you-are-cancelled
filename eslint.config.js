import protectMeFromMyStupidity from 'eslint-config-protect-me-from-my-stupidity';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default [
	{
		ignores : [
			'you-are-cancelled.js',
			'you-are-cancelled.cjs',
			'you-are-cancelled.es5.js',
			'you-are-cancelled.es5.cjs'
		]
	},
	{
		languageOptions :
		{
			globals : {
				'AbortController' : 'writable',
				'AbortSignal'     : 'writable'
			}
		}
	},
	{
		files : [
			'tests/support/abort-signal.js'
		],

		languageOptions :
		{
			globals : {
				'global' : false
			}
		}
	},
	...protectMeFromMyStupidity()
];
