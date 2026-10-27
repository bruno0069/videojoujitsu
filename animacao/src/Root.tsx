import React from 'react';
import {Composition, Still} from 'remotion';
import {CAIO_DEMO_DURATION, CaioDemo} from './scenes/demo/CaioDemo';
import {CaioModelSheet} from './scenes/demo/CaioModelSheet';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="CaioDemo"
			component={CaioDemo}
			durationInFrames={CAIO_DEMO_DURATION}
			fps={30}
			width={1080}
			height={1920}
		/>
		<Still id="CaioFolhaDeModelo" component={CaioModelSheet} width={1920} height={1080} />
	</>
);
