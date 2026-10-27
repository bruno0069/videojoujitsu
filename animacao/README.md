# Vida de Atleta… Ou Não — animação (Remotion)

Base técnica dos personagens 2D da série. Remotion 4.0.535, React 19, TypeScript.

## Rodar

```bash
cd animacao
npm install
npm run dev            # Remotion Studio → composição "CaioDemo"
npm run render:demo    # gera out/caio-demo.mp4 (1080×1920, 30 fps, 10 s)
npm run typecheck
```

Se o Remotion não conseguir baixar o Chrome Headless Shell (rede bloqueada),
aponte para um Chromium local:

```bash
npx remotion render CaioDemo out/caio-demo.mp4 --browser-executable=/caminho/do/chrome-headless-shell
```

## Estrutura

```
src/
  characters/
    shared/        tipos (FaceParams, ArmAngles), misturas (mixFace, mixArm), estilo de contorno
    caio/
      Caio.tsx     monta o boneco a partir das props
      parts/       Head, Hair, Eyes, Eyebrows, Mouth, Torso(+Neck), Belt, Arm, Legs
      expressions.ts  confiante | surpreso | preocupado
      poses.ts        solto | guarda | comemorando | maosNaCintura | susto
      geometry.ts     pivôs (pescoço, quadril, ombros, pernas)
      palette.ts
  animation/       blinkAt (piscada automática), blendKeyframes (transição entre estados)
  scenes/
    backgrounds/Tatame.tsx
    camera/Camera.tsx
    demo/CaioDemo.tsx, CaioModelSheet.tsx
```

## Princípio

O personagem não conhece o tempo: `<Caio />` só desenha o estado recebido por
props. A cena calcula esse estado a cada frame (`useCurrentFrame`), por isso o
mesmo boneco serve para qualquer cena ou episódio.

```tsx
<Caio
  x={540} y={1720} scale={1.6}           // posição dos pés e tamanho
  expression="surpreso"                  // ou FaceParams (mixFace para transições)
  arms={{left: 'guarda', right: {shoulder: 40, elbow: -90}}}
  headTilt={-6} headNod={0}
  bodyLean={3} bodyBob={0}
  stance={1}                             // 0 em pé … 1 base de luta
  blink={blinkAt(frame, fps)}
  gaze={{x: 0.5, y: 0}}
/>
```

## Novos personagens

1. Copie `characters/caio/` para `characters/<nome>/`.
2. Troque `palette.ts`, os desenhos em `parts/` (cabelo, roupa etc.) e ajuste `geometry.ts`.
3. Reaproveite `shared/` (tipos, misturas, contorno) e `animation/` sem mudanças.
   Como `FaceParams` e `ArmAngles` são comuns, as mesmas timelines funcionam
   para qualquer personagem.
