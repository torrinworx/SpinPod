import { defineConfig, loadEnv } from 'vite';
import assertRemove from 'destam-dom/transform/assertRemove';
import compileHTMLLiteral from 'destam-dom/transform/htmlLiteral';

const createTransform = (name, transform, jsx, options) => ({
	name,
	transform(code, id) {
		if (id.endsWith('.js') || (jsx && id.endsWith('.jsx'))) {
			const transformed = transform(code, {
				sourceFileName: id,
				plugins: id.endsWith('.jsx') ? ['jsx'] : [],
				...options,
			});
			return {
				code: transformed.code,
				map: transformed.map,
			};
		}
	}
});

const plugins = [];

plugins.push(createTransform('transform-literal-html', compileHTMLLiteral, true, {
	jsx_auto_import: {
		h: 'destamatic-ui',
		'mark': 'destamatic-ui',

		raw: {
			name: 'h',
			location: 'destam-dom'
		}
	},
}));

if (process.env.ENV === 'production') {
	plugins.push(createTransform('assert-remove', assertRemove));
}

export default ({ mode }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
	return defineConfig({
		server: {
			port: process.env.PORT ? process.env.PORT : 3000,
		},
		root: './frontend',
		plugins,
		esbuild: {
			jsx: 'preserve',
		},
		base: '',
		resolve: {
			extensions: ['.js', '.ts', '.tsx', '.jsx'],
		},
		build: {
			outDir: '../build/dist',
		},
	})
};
