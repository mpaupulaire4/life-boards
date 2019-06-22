import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import postcss from 'postcss'
import tailwind from 'tailwindcss'
import postcss_plugin from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import cssnano from 'cssnano'
import purgecss from '@fullhuman/postcss-purgecss';

const production = !process.env.ROLLUP_WATCH;

const postcss_plugins = [
	tailwind(),
]

if (production) {
	postcss_plugins.push(...[
		purgecss({
			// Specify the paths to all of the template files in your project
			content: [
				'./src/**/*.html',
				'./src/**/*.svelte',
			],
			// Include any special characters you're using in this regular expression
			defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
		}),
		cssnano({
			preset: 'default',
		})
	])
}

export default {
	input: 'src/index.js',
	output: {
		sourcemap: true,
		format: 'cjs',
		name: 'app',
		dir: 'dist/'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			preprocess: {
				style: async ({ content, filename }) => {
					const { css } = await postcss([
						tailwind
					]).process(content, { from: filename})
					return {code: css}
				}
			},
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write('dist/app.css');
			}
		}),
		postcss_plugin({
			extract: true,
      plugins: postcss_plugins
    }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve(),
		// commonjs(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		// !production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		copy({
			targets: [
				{src: 'src/index.html', dest: 'dist'}
			],
			copyOnce: !production
		})
	],
	watch: {
		clearScreen: true
	}
};
