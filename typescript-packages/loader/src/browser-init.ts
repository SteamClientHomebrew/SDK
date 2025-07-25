import { Millennium } from './millennium-api';

function addStyleSheetFromText(document: Document, innerStyle: string, id?: string) {
	if (document.querySelectorAll(`style[id='${id}']`).length) return;

	document.head.appendChild(Object.assign(document.createElement('style'), { id: id })).innerText = innerStyle;
}

type SystemColors = Record<string, string>;

export async function appendAccentColor() {
	const systemColors: SystemColors = JSON.parse(await Millennium.callServerMethod('core', 'GetSystemColors'));

	const entries = Object.entries(systemColors)
		.map(([key, value]) => {
			const formattedKey = formatCssVarKey(key);
			return `--SystemAccentColor${formattedKey}: ${value};`;
		})
		.join('\n');

	addStyleSheetFromText(document, `:root {\n${entries}\n}`, 'SystemAccentColorInject');
}

export async function addPluginDOMBreadCrumbs(enabledPlugins: string[] = []) {
	document.documentElement.setAttribute('data-millennium-plugin', enabledPlugins.join(' '));
}

function formatCssVarKey(key: string) {
	// Capitalize first letter and convert "Rgb" to "-RGB"
	return key.replace(/Rgb$/, '-RGB').replace(/^./, (c) => c.toUpperCase());
}
