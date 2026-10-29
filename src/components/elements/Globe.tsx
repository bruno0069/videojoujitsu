import React, { useId } from "react";
import { colors, sombra } from "../../theme";
import { useInk } from "../Ink";

// Globo terrestre chapado que gira de verdade: continentes em (longitude, latitude) projetados
// numa esfera (ortográfica). `lon` = longitude no centro da face visível, em graus.
// `noite` (0..1) escurece a metade direita (globo metade dia, metade noite).

type LonLat = [number, number];

// Contornos simplificados (graus). Só precisam ler como "continentes" no estilo do canal.
export const CONTINENTES: LonLat[][] = [
  // América do Norte
  [[-165, 64], [-130, 70], [-95, 72], [-62, 58], [-66, 45], [-80, 32], [-82, 25], [-97, 18], [-106, 23], [-118, 34], [-125, 46], [-140, 58]],
  // América do Sul
  [[-80, 10], [-62, 11], [-50, 0], [-35, -6], [-39, -16], [-48, -27], [-58, -38], [-68, -54], [-74, -46], [-71, -18], [-81, -4]],
  // Europa + África
  [[-17, 15], [-10, 30], [-8, 43], [5, 50], [12, 57], [30, 62], [40, 48], [35, 33], [44, 13], [51, 11], [40, -15], [32, -28], [20, -35], [12, -18], [9, 4], [-8, 5]],
  // Ásia
  [[40, 48], [30, 62], [60, 72], [100, 76], [140, 70], [160, 62], [142, 46], [122, 32], [120, 22], [106, 10], [100, 4], [80, 8], [72, 20], [58, 24], [48, 30]],
  // Austrália
  [[114, -22], [130, -12], [142, -11], [153, -26], [148, -38], [136, -34], [116, -34]],
];

const RAD = Math.PI / 180;

// Projeta um contorno na esfera e recorta pelo hemisfério visível: onde o contorno passa
// para trás da esfera, ele é cortado no limbo e a borda segue o arco do círculo (nunca uma
// reta atravessando o globo).
const project = (poly: LonLat[], lon0: number, r: number) => {
  const dense: LonLat[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 6));
    for (let k = 0; k < n; k++) dense.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  });
  // coordenadas na esfera unitária (x para a direita, y para baixo, z para a câmera)
  const pts = dense.map(([lo, la]) => {
    const d = (lo - lon0) * RAD;
    const c = Math.cos(la * RAD);
    return { x: c * Math.sin(d), y: -Math.sin(la * RAD), z: c * Math.cos(d) };
  });
  const first = pts.findIndex((p) => p.z >= 0);
  if (first < 0) return null;
  const ring = [...pts.slice(first), ...pts.slice(0, first)];
  const out: [number, number][] = [[ring[0].x, ring[0].y]];
  const onLimb = (p: (typeof ring)[number], q: (typeof ring)[number]) => {
    const t = p.z / (p.z - q.z);
    const x = p.x + (q.x - p.x) * t;
    const y = p.y + (q.y - p.y) * t;
    const len = Math.hypot(x, y) || 1;
    return [x / len, y / len] as [number, number];
  };
  let exit: number | null = null;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    const pv = p.z >= 0;
    const qv = q.z >= 0;
    if (pv && qv) out.push([q.x, q.y]);
    else if (pv && !qv) {
      const e = onLimb(p, q);
      out.push(e);
      exit = Math.atan2(e[1], e[0]);
    } else if (!pv && qv) {
      const e = onLimb(p, q);
      const entry = Math.atan2(e[1], e[0]);
      if (exit !== null) {
        let delta = entry - exit;
        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        const steps = Math.ceil(Math.abs(delta) / (4 * RAD));
        for (let k = 1; k < steps; k++) out.push([Math.cos(exit + (delta * k) / steps), Math.sin(exit + (delta * k) / steps)]);
      }
      out.push(e, [q.x, q.y]);
      exit = null;
    }
  }
  return `M ${out.map((p) => `${(p[0] * r).toFixed(1)} ${(p[1] * r).toFixed(1)}`).join(" L ")} Z`;
};

export const Globe: React.FC<{
  x: number;
  y: number;
  r: number;
  lon: number;
  tilt?: number; // inclinação do eixo (graus)
  noite?: number;
  grade?: boolean; // equador e meridianos
  equador?: boolean; // equador destacado em amarelo
}> = ({ x, y, r, lon, tilt = 0, noite = 0, grade = true, equador = false }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const meridians = grade
    ? [0, 45, 90, 135].map((m) => {
        const d = (((m - lon) % 180) + 180) % 180; // meridianos a cada 45°, repetidos a cada 180°
        const rx = Math.abs(r * Math.cos(d * RAD));
        return <ellipse key={m} cx={0} cy={0} rx={rx} ry={r} fill="none" stroke={colors.creme} strokeWidth={ink * 0.35} opacity={0.35} />;
      })
    : null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <clipPath id={`globo-${id}`}>
        <circle r={r} />
      </clipPath>
      <circle r={r} fill={colors.ceu} />
      <g clipPath={`url(#globo-${id})`}>
        {CONTINENTES.map((c, i) => {
          const d = project(c, lon, r);
          return d ? <path key={i} d={d} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" /> : null;
        })}
        {meridians}
        {grade ? <ellipse cx={0} cy={0} rx={r} ry={r * 0.06} fill="none" stroke={colors.creme} strokeWidth={ink * 0.35} opacity={0.35} /> : null}
        {equador ? <path d={`M ${-r} 0 L ${r} 0`} stroke={colors.amarelo} strokeWidth={ink * 0.9} strokeDasharray={`${ink * 1.6} ${ink * 1.2}`} /> : null}
        {/* sombra chapada de um tom (luz do alto à esquerda) */}
        <path d={`M ${r * 0.2} ${-r * 1.2} A ${r} ${r} 0 0 1 ${r * 0.2} ${r * 1.2} L ${r * 1.3} ${r * 1.3} L ${r * 1.3} ${-r * 1.3} Z`} fill={sombra(colors.ceu)} opacity={0.35 * (1 - noite)} />
        {noite > 0 ? <rect x={0} y={-r * 1.1} width={r * 1.2} height={r * 2.2} fill={colors.noiteEscura} opacity={0.78 * noite} /> : null}
      </g>
      {noite > 0 ? <path d={`M 0 ${-r} L 0 ${r}`} stroke={colors.amarelo} strokeWidth={ink * 0.6} opacity={0.8 * noite} /> : null}
      <circle r={r} fill="none" stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};
