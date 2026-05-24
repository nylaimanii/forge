import loader from '@monaco-editor/loader';

let initialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let monacoInstance: any = null;

export async function initMonaco(container: HTMLElement, options: object) {
	const monaco = await loader.init();
	monacoInstance = monaco;

	if (!initialized) {
		initialized = true;

		// register forge dark theme
		monaco.editor.defineTheme('forge-dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [
				{ token: 'keyword',  foreground: '6c63ff', fontStyle: 'bold' },
				{ token: 'string',   foreground: '00f5d4' },
				{ token: 'comment',  foreground: '6b6b8a', fontStyle: 'italic' },
				{ token: 'number',   foreground: 'ffb84d' },
			],
			colors: {
				'editor.background':             '#0d0d14',
				'editor.foreground':             '#f0f0ff',
				'editorLineNumber.foreground':   '#6b6b8a',
				'editor.selectionBackground':    '#6c63ff30',
				'editorCursor.foreground':       '#6c63ff',
				'editor.lineHighlightBackground':'#ffffff05',
			},
		});
	}

	return monaco.editor.create(container, { theme: 'forge-dark', ...options });
}

// re-apply a named theme to all live editors. used to recover from
// theme flips that monaco occasionally performs after a layout shift.
export function setMonacoTheme(name: string) {
	monacoInstance?.editor.setTheme(name);
}
