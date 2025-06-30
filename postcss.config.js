import postcssPresetEnv from 'postcss-preset-env';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		postcssPresetEnv({
			browsers: ['Chrome >= 90', 'iOS >= 15', '> 0.5%'],
		}),
	],
};

export default config;
