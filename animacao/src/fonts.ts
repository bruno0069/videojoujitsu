import {continueRender, delayRender, staticFile} from 'remotion';

// Fonte da série embutida no projeto (Inter, licença SIL OFL), para o render
// sair igual em qualquer máquina, sem depender de fontes do sistema.
export const FONT = "'Serie Display', 'Arial Black', Arial, sans-serif";
export const FONT_TEXT = "'Serie Text', Arial, sans-serif";

const load = (family: string, file: string) => {
	if (typeof document === 'undefined') return;
	const handle = delayRender(`fonte ${family}`);
	const face = new FontFace(family, `url('${staticFile(file)}') format('opentype')`);
	face
		.load()
		.then((f) => {
			document.fonts.add(f);
			continueRender(handle);
		})
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};

load('Serie Display', 'fonts/Inter-Black.otf');
load('Serie Text', 'fonts/Inter-ExtraBold.otf');
