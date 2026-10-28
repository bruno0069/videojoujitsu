#!/usr/bin/env bash
# Gera todos os efeitos e as músicas do canal localmente com ffmpeg (síntese pura).
# Nenhum arquivo de terceiros. Uso: npm run sons
set -euo pipefail
cd "$(dirname "$0")/.."
SFX=public/audio/sfx
MUS=public/audio/music
mkdir -p "$SFX" "$MUS"
R=44100
gen() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# estalo: rajada curta de ruído + "pop" grave
gen -f lavfi -i "aevalsrc='(random(0)*2-1)*exp(-t*70)*0.5+sin(2*PI*170*t)*exp(-t*22)*0.42':s=$R:d=0.35" -ac 1 "$SFX/estalo.wav"

# recreio: murmúrio de pátio (ruído marrom filtrado com variação lenta)
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.9:sample_rate=$R:duration=8:seed=7" \
  -af "bandpass=f=550:width_type=h:w=700,tremolo=f=1.7:d=0.35,volume=2.2,afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/recreio.wav"

# grilo: trinados agudos espaçados
gen -f lavfi -i "aevalsrc='0.28*sin(2*PI*4600*t)*gt(sin(2*PI*30*t),0)*lt(mod(t,0.9),0.24)':s=$R:d=3.6" -ac 1 "$SFX/grilo.wav"

# tique_taque: cliques alternados a cada 0,5 s
gen -f lavfi -i "aevalsrc='0.8*exp(-mod(t,0.5)*140)*sin(2*PI*if(lt(mod(t,1),0.5),2100,1500)*t)':s=$R:d=2" -ac 1 "$SFX/tique_taque.wav"

# queda_graves: varredura grave descendente
gen -f lavfi -i "aevalsrc='0.9*exp(-t*0.9)*sin(2*PI*(150/0.7)*(1-exp(-0.7*t)))':s=$R:d=3" \
  -af "afade=t=in:d=0.03,afade=t=out:st=2.6:d=0.4" -ac 1 "$SFX/queda_graves.wav"

# vento_frio: ruído rosa filtrado, com rajadas lentas
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:sample_rate=$R:duration=8:seed=3" \
  -af "highpass=f=250,lowpass=f=1400,tremolo=f=0.25:d=0.7,volume=1.4,afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/vento_frio.wav"

# base_suave: arpejo dedilhado (C, Am, F, G), 8 s em loop
ROOT="if(lt(mod(t,8),2),0,if(lt(mod(t,8),4),-3,if(lt(mod(t,8),6),-7,-5)))"
THIRD="if(between(mod(t,8),2,4),3,4)"
N="mod(floor(t*4),8)"
K="if(eq($N,0),0,if(eq($N,1),$THIRD,if(eq($N,2),7,if(eq($N,3),12,if(eq($N,4),7,if(eq($N,5),$THIRD,if(eq($N,6),7,12)))))))"
F="261.63*pow(2,($ROOT+$K)/12)"
ENV="exp(-mod(t,0.25)*9)"
BASS="0.25*sin(2*PI*65.41*pow(2,($ROOT)/12)*t)*(0.6+0.4*exp(-mod(t,2)*1.5))"
gen -f lavfi -i "aevalsrc='0.32*$ENV*(sin(2*PI*$F*t)+0.25*sin(4*PI*$F*t))+$BASS':s=$R:d=8" -ac 1 "$MUS/base_suave.wav"

# suspensa_sem_batida: bordão grave que respira, 16 s em loop
gen -f lavfi -i "aevalsrc='(0.55+0.45*sin(2*PI*t/8))*(0.3*sin(2*PI*110*t)+0.2*sin(2*PI*165*t)+0.12*sin(2*PI*220.5*t))':s=$R:d=16" -ac 1 "$MUS/suspensa_sem_batida.wav"

# Versões com passa-altas em 120 Hz (as que entram no vídeo): limpa o grave que embola com a voz
for m in base_suave suspensa_sem_batida; do
  gen -i "$MUS/$m.wav" -af "highpass=f=120" "$MUS/${m}_hp120.wav"
done

ls -la "$SFX" "$MUS"
