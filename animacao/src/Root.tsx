import React from 'react';
import './fonts';
import {Composition, Still} from 'remotion';
import {CAIO_DEMO_DURATION, CaioDemo} from './scenes/demo/CaioDemo';
import {CaioModelSheet} from './scenes/demo/CaioModelSheet';
import {Elenco} from './episodes/ep01/Elenco';
import {Episode01} from './episodes/ep01/Episode01';
import {DURATION_IN_FRAMES, FPS} from './episodes/ep01/timing';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="EP01-OMataLeaoEAContaDeLuz"
			component={Episode01}
			durationInFrames={DURATION_IN_FRAMES}
			fps={FPS}
			width={1080}
			height={1920}
		/>
		<Composition
			id="CaioDemo"
			component={CaioDemo}
			durationInFrames={CAIO_DEMO_DURATION}
			fps={30}
			width={1080}
			height={1920}
		/>
		<Still id="CaioFolhaDeModelo" component={CaioModelSheet} width={1920} height={1080} />
		<Still id="EP01Elenco" component={Elenco} width={1920} height={1080} />
	</>
);
