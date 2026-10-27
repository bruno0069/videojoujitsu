import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Caio, caioExpressions} from '../../characters/caio';
import {Marlene, MestreJorge, SeuAldo} from '../../characters/supporting/characters';
import {Bill} from '../../props/Boleto';
import {Calculadora, Cinturao, DiplomaShape, Energetico, PaoFrances, Papel, Salario, VassouraShape} from '../../props/Objects';

// Folha de referência do elenco e objetos do EP01 (para revisão rápida).
export const Elenco: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#F4F1EA'}}>
		<Marlene x={260} y={900} scale={0.9} expression={caioExpressions.preocupado} armRight={{shoulder: 20, elbow: -26}} holdRight={<VassouraShape angle={10} />} />
		<MestreJorge x={700} y={900} scale={0.9} expression={caioExpressions.confiante} />
		<Caio x={1180} y={1040} scale={0.75} outfit="formatura" expression="feliz" arms="comemorando" holdRight={<DiplomaShape />} />
		<SeuAldo x={1380} y={900} scale={0.9} expression={caioExpressions.feliz} armRight={{shoulder: 40, elbow: -100}} />
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
