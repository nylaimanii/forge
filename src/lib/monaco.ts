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
				// rule foregrounds: NO `#` prefix
				{ token: '',           foreground: 'e2e8f0' },
				{ token: 'keyword',    foreground: '4f8ef7', fontStyle: 'bold' },
				{ token: 'string',     foreground: 'a78bfa' },
				{ token: 'number',     foreground: 'fb7185' },
				{ token: 'comment',    foreground: '4f8ef755', fontStyle: 'italic' },
				{ token: 'operator',   foreground: '38bdf8' },
				{ token: 'identifier', foreground: 'e2e8f0' },
			],
			colors: {
				// colors values: DO have `#` prefix
				'editor.foreground':                '#e2e8f0',
				'editor.background':                '#0d0d14',
				'editorCursor.foreground':          '#4f8ef7',
				'editor.selectionBackground':       '#4f8ef722',
				'editor.lineHighlightBackground':   '#ffffff08',
				'editorLineNumber.foreground':      '#4f8ef755',
				'editorLineNumber.activeForeground':'#4f8ef7',
			},
		});

		// activate forge-dark as the default theme for all editor instances
		monaco.editor.setTheme('forge-dark');
	}

	return monaco.editor.create(container, { theme: 'forge-dark', ...options });
}

// re-apply a named theme to all live editors. used to recover from
// theme flips that monaco occasionally performs after a layout shift.
export function setMonacoTheme(name: string) {
	monacoInstance?.editor.setTheme(name);
}
