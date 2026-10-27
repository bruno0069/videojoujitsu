import React from 'react';
import {AbsoluteFill} from 'remotion';
import {caioExpressions} from '../../characters/caio';
import {Marlene, MestreJorge, SeuAldo} from '../../characters/supporting/characters';
import {Bill} from '../../props/Boleto';
import {Calculadora, Cinturao, Energetico, PaoFrances, Papel, Salario} from '../../props/Objects';

// Folha de referência do elenco e objetos do EP01 (para revisão rápida).
export const Elenco: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#F4F1EA'}}>
		<Marlene x={260} y={900} scale={0.9} expression={caioExpressions.preocupado} />
		<MestreJorge x={700} y={900} scale={0.9} expression={caioExpressions.confiante} />
		<SeuAldo x={1140} y={900} scale={0.9} expression={caioExpressions.feliz} armRight={{shoulder: 40, elbow: -100}} />
		<Bill x={1500} y={260} width={200} icon="luz" />
		<Bill x={1740} y={260} width={200} icon="agua" mood="entediado" />
		<Bill x={1500} y={580} width={200} icon="internet" mood="debochado" />
		<Bill x={1740} y={580} width={200} icon="boleto" mood="derrotado" />
		<PaoFrances x={1600} y={880} width={360} />
		<Energetico x={1840} y={900} width={110} />
		<Cinturao x={420} y={1000} width={300} shine={1} />
		<Calculadora x={820} y={990} width={140} display="NEGATIVO" displayColor="#D62828" />
		<Papel x={1020} y={990} width={140} title="PLANEJAMENTO" cobweb />
		<Salario x={1240} y={1000} width={200} />
	</AbsoluteFill>
);
