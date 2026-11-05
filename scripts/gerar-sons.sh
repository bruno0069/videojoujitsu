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

# whoosh: ruído com envelope em sino e filtro subindo (transição curta nas pausas da fala)
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:sample_rate=$R:duration=0.6:seed=11" \
  -af "volume='pow(sin(PI*t/0.6),2)':eval=frame,highpass=f=300,lowpass=f=2600,afade=t=in:d=0.02,afade=t=out:st=0.55:d=0.05,volume=1.6" -ac 1 "$SFX/whoosh.wav"

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

# --- ep02 ---
# giro_globo: zumbido do globo de mesa girando (ruído filtrado pulsando + tique do eixo), loop de 2 s
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.6:sample_rate=$R:duration=2:seed=21" \
  -f lavfi -i "aevalsrc='0.35*exp(-mod(t,0.125)*90)*sin(2*PI*900*t)':s=$R:d=2" \
  -filter_complex "[0]bandpass=f=1100:width_type=h:w=900,tremolo=f=8:d=0.6[a];[1]volume=0.6[b];[a][b]amix=inputs=2:normalize=0" -ac 1 "$SFX/giro_globo.wav"
# sala_de_aula: burburinho baixo de sala (ruído marrom filtrado), loop de 8 s
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.7:sample_rate=$R:duration=8:seed=5" \
  -af "bandpass=f=650:width_type=h:w=600,tremolo=f=1.3:d=0.3,volume=1.6,afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/sala_de_aula.wav"
# vento_comeca: vento crescendo do nada (4 s)
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:sample_rate=$R:duration=4:seed=8" \
  -af "highpass=f=200,lowpass=f=1800,tremolo=f=0.6:d=0.4,afade=t=in:d=3,afade=t=out:st=3.6:d=0.4,volume=1.8" -ac 1 "$SFX/vento_comeca.wav"
# vento_forte: vendaval contínuo, loop de 6 s
gen -f lavfi -i "anoisesrc=color=pink:amplitude=1:sample_rate=$R:duration=6:seed=13" \
  -af "highpass=f=150,lowpass=f=2600,tremolo=f=0.45:d=0.5,volume=1.8,afade=t=in:d=0.05,afade=t=out:st=5.95:d=0.05" -ac 1 "$SFX/vento_forte.wav"
# agua_avancando: água correndo em ondas (4 s)
gen -f lavfi -i "anoisesrc=color=brown:amplitude=1:sample_rate=$R:duration=4:seed=17" \
  -af "lowpass=f=1000,highpass=f=90,tremolo=f=0.7:d=0.6,volume=2.2,afade=t=in:d=0.5,afade=t=out:st=3.2:d=0.8" -ac 1 "$SFX/agua_avancando.wav"
# sopro_vento: rajada curta (1,5 s)
gen -f lavfi -i "anoisesrc=color=pink:amplitude=1:sample_rate=$R:duration=1.5:seed=23" \
  -af "volume='pow(sin(PI*t/1.5),2)':eval=frame,bandpass=f=750:width_type=h:w=900,volume=2" -ac 1 "$SFX/sopro_vento.wav"
# deslize: arrasto rápido (0,9 s), chiado com tom descendo
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.5:sample_rate=$R:duration=0.9:seed=29" \
  -f lavfi -i "aevalsrc='0.25*sin(2*PI*(600*t-220*t*t))':s=$R:d=0.9" \
  -filter_complex "[0]highpass=f=1500,lowpass=f=4200[a];[a][1]amix=inputs=2:normalize=0,volume='pow(sin(PI*t/0.9),2)':eval=frame" -ac 1 "$SFX/deslize.wav"

# ep05
# zumbido_leve: zumbido baixo e contínuo do diagrama (dois senos com batimento lento), loop de 4 s
gen -f lavfi -i "aevalsrc='0.16*sin(2*PI*110*t)+0.1*sin(2*PI*111.5*t)+0.05*sin(2*PI*220*t)':s=$R:d=4" \
  -af "highpass=f=90,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/zumbido_leve.wav"
# agua_correndo: água escorrendo contínua (ruído marrom filtrado com ondulação), loop de 4 s
gen -f lavfi -i "anoisesrc=color=brown:amplitude=1:sample_rate=$R:duration=4:seed=31" \
  -af "lowpass=f=1400,highpass=f=120,tremolo=f=1.1:d=0.4,volume=2,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/agua_correndo.wav"

# ep03
# ziper: zíper de mala (0,8 s), cliques rápidos de ruído subindo de tom
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.6:sample_rate=$R:duration=0.8:seed=41" \
  -af "highpass=f=1800,lowpass=f=6000,volume='0.5+0.5*gt(sin(2*PI*(60*t+40*t*t)),0.2)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.7:d=0.1" -ac 1 "$SFX/ziper.wav"
# quarto_ambiente: quarto silencioso (ruído rosa bem baixo e abafado), loop de 8 s
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.35:sample_rate=$R:duration=8:seed=43" \
  -af "lowpass=f=700,highpass=f=80,afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/quarto_ambiente.wav"
# pulo: impulso de pulo (0,5 s), "boing" grave subindo
gen -f lavfi -i "aevalsrc='0.4*sin(2*PI*(140*t+500*t*t))*exp(-t*5)':s=$R:d=0.5" -ac 1 "$SFX/pulo.wav"

# ep03 longo
gen -f lavfi -i "aevalsrc='0.35*sin(2*PI*1320*t)*exp(-t*14)+0.3*sin(2*PI*1760*(t-0.12))*exp(-(t-0.12)*14)*gt(t,0.12)':s=$R:d=0.5" -ac 1 "$SFX/notificacao.wav"
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:sample_rate=$R:duration=0.5:seed=51" -af "lowpass=f=900,volume='exp(-t*9)':eval=frame,volume=2" -ac 1 "$SFX/mala_abrindo.wav"
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:sample_rate=$R:duration=6:seed=53" -af "lowpass=f=260,highpass=f=40,tremolo=f=6:d=0.2,volume=2,afade=t=in:d=0.05,afade=t=out:st=5.95:d=0.05" -ac 1 "$SFX/foguete_distante.wav"
gen -f lavfi -i "aevalsrc='0.4*sin(2*PI*220*t)*exp(-t*6)+(random(0)*2-1)*0.25*exp(-t*30)':s=$R:d=0.6" -ac 1 "$SFX/porta_metalica.wav"
gen -f lavfi -i "aevalsrc='0.45*sin(2*PI*90*t)*exp(-t*12)+(random(0)*2-1)*0.18*exp(-t*25)':s=$R:d=0.45" -ac 1 "$SFX/queda_leve.wav"
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.7:sample_rate=$R:duration=1.2:seed=57" -af "highpass=f=900,volume='exp(-t*3)':eval=frame,volume=1.6" -ac 1 "$SFX/porta_pressurizada.wav"
gen -f lavfi -i "aevalsrc='0.12*sin(2*PI*60*t)+0.06*sin(2*PI*180*t)':s=$R:d=4" -af "highpass=f=50,tremolo=f=2:d=0.2,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/maquinario.wav"
gen -f lavfi -i "aevalsrc='0.3*sin(2*PI*(600+900*t)*t)*exp(-t*6)':s=$R:d=0.5" -ac 1 "$SFX/envio_mensagem.wav"
gen -f lavfi -i "aevalsrc='0.22*sin(2*PI*880*t)*gt(sin(2*PI*3*t),0)*exp(-t*1.5)':s=$R:d=1.2" -ac 1 "$SFX/painel_alerta.wav"

# ep03 v4 — trilhas (síntese local, loops) e efeitos
# tensao_leve: pulso grave em semínimas com nota suspensa por cima, 8 s
gen -f lavfi -i "aevalsrc='0.28*exp(-mod(t,0.5)*6)*sin(2*PI*73.42*t)+0.12*(0.6+0.4*sin(2*PI*t/4))*sin(2*PI*293.66*t)+0.08*sin(2*PI*311.13*t)*(0.5+0.5*sin(2*PI*t/8))':s=$R:d=8" -ac 1 "$MUS/tensao_leve.wav"
# alegre_curta: arpejo maior saltitante (C, F, G, C), 4 s
AN="mod(floor(t*6),6)"
AK="if(eq($AN,0),0,if(eq($AN,1),4,if(eq($AN,2),7,if(eq($AN,3),12,if(eq($AN,4),7,4)))))"
AR="if(lt(mod(t,4),1),0,if(lt(mod(t,4),2),5,if(lt(mod(t,4),3),7,0)))"
gen -f lavfi -i "aevalsrc='0.3*exp(-mod(t,1/6)*10)*sin(2*PI*392*pow(2,($AR+$AK)/12)*t)+0.2*sin(2*PI*98*pow(2,($AR)/12)*t)*exp(-mod(t,0.5)*4)':s=$R:d=4" -ac 1 "$MUS/alegre_curta.wav"
# melancolica_suave: arpejo lento menor (Am, F, C, G), 16 s
MR="if(lt(mod(t,16),4),-3,if(lt(mod(t,16),8),-7,if(lt(mod(t,16),12),0,-5)))"
MN="mod(floor(t*2),4)"
MK="if(eq($MN,0),0,if(eq($MN,1),if(lt(mod(t,16),4),3,4),if(eq($MN,2),7,12)))"
gen -f lavfi -i "aevalsrc='0.26*exp(-mod(t,0.5)*3)*sin(2*PI*261.63*pow(2,($MR+$MK)/12)*t)+0.16*sin(2*PI*65.41*pow(2,($MR)/12)*t)':s=$R:d=16" -ac 1 "$MUS/melancolica_suave.wav"
gen -f lavfi -i "aevalsrc='0.25*sin(2*PI*1050*t)*lt(mod(t,0.18),0.09)*lt(t,0.45)':s=$R:d=0.5" -ac 1 "$SFX/painel_bip.wav"
gen -f lavfi -i "aevalsrc='0.3*sin(2*PI*(500+700*t)*t)*exp(-t*5)+0.2*sin(2*PI*1400*t)*exp(-(t-0.3)*12)*gt(t,0.3)':s=$R:d=0.6" -ac 1 "$SFX/controle_ligando.wav"

# ep04 — efeitos e trilhas (síntese local)
# passos_multidao: multidão andando (murmúrio grave + passos curtos aleatórios), loop de 4 s
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:sample_rate=$R:duration=4:seed=61" \
  -f lavfi -i "aevalsrc='0.5*sin(2*PI*80*t)*exp(-mod(t*7.3,1)*14)*gt(sin(2*PI*1.9*t+sin(5*t)),-0.3)':s=$R:d=4" \
  -filter_complex "[0]bandpass=f=420:width_type=h:w=500,tremolo=f=2.3:d=0.4,volume=1.6[a];[1]lowpass=f=300[b];[a][b]amix=inputs=2:normalize=0,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/passos_multidao.wav"
# rangido_balanca: rangido de metal (tom com vibrato lento), 1,2 s
gen -f lavfi -i "aevalsrc='0.3*sin(2*PI*(170+40*sin(2*PI*3*t))*t)*(0.5+0.5*sin(2*PI*9*t))*exp(-t*1.2)':s=$R:d=1.2" -af "afade=t=in:d=0.05,afade=t=out:st=1.0:d=0.2" -ac 1 "$SFX/rangido_balanca.wav"
# contagem: batida grave de suspense (um coração), 0,6 s
gen -f lavfi -i "aevalsrc='0.8*sin(2*PI*58*t)*exp(-t*9)+0.5*sin(2*PI*52*(t-0.16))*exp(-(t-0.16)*10)*gt(t,0.16)':s=$R:d=0.6" -ac 1 "$SFX/contagem.wav"
# pulo_massivo: impacto grave do pulo (varredura grave + ruído curto), 1,6 s
gen -f lavfi -i "aevalsrc='0.9*sin(2*PI*(70/0.9)*(1-exp(-0.9*t)))*exp(-t*2.2)+(random(0)*2-1)*0.25*exp(-t*18)':s=$R:d=1.6" -af "lowpass=f=900,afade=t=out:st=1.3:d=0.3" -ac 1 "$SFX/pulo_massivo.wav"
# pouso_massivo: pancada de bilhões de pés no chão (grave + ruído), 1,4 s
gen -f lavfi -i "aevalsrc='0.9*sin(2*PI*48*t)*exp(-t*3.5)+(random(0)*2-1)*0.45*exp(-t*9)':s=$R:d=1.4" -af "lowpass=f=700,afade=t=out:st=1.1:d=0.3" -ac 1 "$SFX/pouso_massivo.wav"
# impacto_grave: a Terra caindo no prato da balança, 1,2 s
gen -f lavfi -i "aevalsrc='0.9*sin(2*PI*40*t)*exp(-t*3)+0.4*sin(2*PI*120*t)*exp(-t*10)+(random(0)*2-1)*0.2*exp(-t*14)':s=$R:d=1.2" -af "lowpass=f=600" -ac 1 "$SFX/impacto_grave.wav"
# rabisco_sismografo: caneta riscando o papel (chiado agudo tremendo), 1 s
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.5:sample_rate=$R:duration=1:seed=67" -af "highpass=f=2500,lowpass=f=7000,tremolo=f=24:d=0.8,volume='exp(-t*2)':eval=frame,afade=t=out:st=0.85:d=0.15" -ac 1 "$SFX/rabisco_sismografo.wav"
# quica: pulinho do Nico pousando, 0,35 s
gen -f lavfi -i "aevalsrc='0.45*sin(2*PI*(220-260*t)*t)*exp(-t*12)':s=$R:d=0.35" -ac 1 "$SFX/quica.wav"
# micro_zoom: transição microscópica (tom subindo com brilho), 1,4 s
gen -f lavfi -i "aevalsrc='0.22*sin(2*PI*(500*t+700*t*t))*(0.6+0.4*sin(2*PI*14*t))*sin(PI*t/1.4)':s=$R:d=1.4" -ac 1 "$SFX/micro_zoom.wav"
# curiosidade_suave: notas soltas de pentatônica maior, 8 s em loop
CN="mod(floor(t*2),8)"
CK="if(eq($CN,0),0,if(eq($CN,1),4,if(eq($CN,2),7,if(eq($CN,3),9,if(eq($CN,4),12,if(eq($CN,5),9,if(eq($CN,6),7,2)))))))"
gen -f lavfi -i "aevalsrc='0.3*exp(-mod(t,0.5)*7)*sin(2*PI*392*pow(2,($CK)/12)*t)+0.1*sin(2*PI*98*t)*(0.6+0.4*sin(2*PI*t/4))':s=$R:d=8" -ac 1 "$MUS/curiosidade_suave.wav"
# crescendo_leve: arpejo que cresce em volume e densidade ao longo de 18 s
GN="mod(floor(t*(4+2*t/18)),4)"
GK="if(eq($GN,0),0,if(eq($GN,1),4,if(eq($GN,2),7,12)))"
GR="if(lt(mod(t,8),4),0,-3)"
gen -f lavfi -i "aevalsrc='(0.35+0.65*t/18)*(0.28*exp(-mod(t,0.25)*9)*sin(2*PI*261.63*pow(2,($GR+$GK)/12)*t)+0.14*sin(2*PI*65.41*pow(2,($GR)/12)*t))':s=$R:d=18" -ac 1 "$MUS/crescendo_leve.wav"
# leve_divertida: saltitante e curta (maior), 6 s em loop
LN="mod(floor(t*4),4)"
LK="if(eq($LN,0),0,if(eq($LN,1),7,if(eq($LN,2),4,12)))"
LR="if(lt(mod(t,6),3),0,5)"
gen -f lavfi -i "aevalsrc='0.28*exp(-mod(t,0.25)*12)*sin(2*PI*329.63*pow(2,($LR+$LK)/12)*t)+0.16*sin(2*PI*82.41*pow(2,($LR)/12)*t)*exp(-mod(t,0.5)*5)':s=$R:d=6" -ac 1 "$MUS/leve_divertida.wav"

# ep06 (episódio 5) — mar e Lua
# mar_calmo: arrebentação suave e lenta (ruído marrom com ondulação de 6 s), loop de 12 s
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:sample_rate=$R:duration=12:seed=71" -af "lowpass=f=900,highpass=f=80,volume='0.5+0.5*pow(sin(PI*t/6),2)':eval=frame,volume=1.4,afade=t=in:d=0.1,afade=t=out:st=11.9:d=0.1" -ac 1 "$SFX/mar_calmo.wav"
# onda_pequena: uma onda que sobe e recua (1,6 s)
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:sample_rate=$R:duration=1.6:seed=73" -af "lowpass=f=1600,highpass=f=150,volume='pow(sin(PI*t/1.6),2)':eval=frame,volume=1.6" -ac 1 "$SFX/onda_pequena.wav"
# crescer_lua: tom grave subindo devagar, com mola no fim (1,4 s)
gen -f lavfi -i "aevalsrc='0.3*sin(2*PI*(110*t+90*t*t))*(1-exp(-t*6))*exp(-t*1.2)':s=$R:d=1.4" -af "afade=t=out:st=1.2:d=0.2" -ac 1 "$SFX/crescer_lua.wav"
# encaixe: "toc" curto de uma esfera encaixando (0,25 s)
gen -f lavfi -i "aevalsrc='0.45*sin(2*PI*520*t)*exp(-t*28)+0.25*sin(2*PI*260*t)*exp(-t*20)':s=$R:d=0.25" -ac 1 "$SFX/encaixe.wav"

# ep06 v07 — clique de Lego, whoosh da Lua e trilha lo-fi espacial
# clique_lego: encaixe de plástico (estalo agudo curtinho + batida seca), 0,18 s
gen -f lavfi -i "aevalsrc='(random(0)*2-1)*0.7*exp(-t*260)+0.5*sin(2*PI*2400*t)*exp(-t*90)+0.35*sin(2*PI*320*t)*exp(-t*45)':s=$R:d=0.18" -af "highpass=f=180" -ac 1 "$SFX/clique_lego.wav"
# whoosh_grande: whoosh mais longo e encorpado (1 s), filtro subindo
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:sample_rate=$R:duration=1.0:seed=81" \
  -af "volume='pow(sin(PI*t/1.0),2)':eval=frame,highpass=f=180,lowpass=f=3200,afade=t=out:st=0.9:d=0.1,volume=1.8" -ac 1 "$SFX/whoosh_grande.wav"
# lofi_espacial: acordes suaves (Am7, Fmaj7, Cmaj7, G6) com batida lo-fi bem baixa, 16 s em loop
LR="if(lt(mod(t,16),4),-3,if(lt(mod(t,16),8),-7,if(lt(mod(t,16),12),0,-5)))"
PAD="0.07*(sin(2*PI*220*pow(2,($LR)/12)*t)+sin(2*PI*220*pow(2,($LR+7)/12)*t)+0.8*sin(2*PI*220*pow(2,($LR+10)/12)*t)+0.7*sin(2*PI*220*pow(2,($LR+16)/12)*t))*(0.75+0.25*sin(2*PI*t/4))"
BAIXO="0.16*sin(2*PI*55*pow(2,($LR)/12)*t)*(0.6+0.4*exp(-mod(t,2)*2))"
BATIDA="0.22*sin(2*PI*(60+40*exp(-mod(t,0.75)*30))*mod(t,0.75))*exp(-mod(t,0.75)*14)"
CHIADO="0.03*(random(0)*2-1)*exp(-mod(t+0.375,0.75)*40)"
gen -f lavfi -i "aevalsrc='$PAD+$BAIXO+$BATIDA+$CHIADO':s=$R:d=16" -af "lowpass=f=5000" -ac 1 "$MUS/lofi_espacial.wav"

# ep07 (episódio 6) — queda até o centro da Terra
# vento_queda: vento forte de queda (ruído rosa com passa-faixa oscilando), loop de 4 s
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:sample_rate=$R:duration=4:seed=91" -af "highpass=f=250,lowpass=f=2600,volume='0.75+0.25*sin(2*PI*t/2)':eval=frame,volume=1.3,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/vento_queda.wav"
# calor_chiado: chiado de calor (ruído branco agudo com crepitar), loop de 4 s
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.5:sample_rate=$R:duration=4:seed=93" -af "highpass=f=2500,volume='0.5+0.5*gt(sin(2*PI*7.3*t)*sin(2*PI*3.1*t),0.3)':eval=frame,volume=0.9,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/calor_chiado.wav"
# lava_borbulha: bolhas graves de metal líquido (blups com tom descendo), loop de 4 s
gen -f lavfi -i "aevalsrc='0.4*sin(2*PI*(180-120*mod(t*2.5,1))*t)*exp(-mod(t*2.5,1)*7)+0.3*sin(2*PI*(260-150*mod(t*3.7+0.3,1))*t)*exp(-mod(t*3.7+0.3,1)*8)':s=$R:d=4" -af "lowpass=f=1400,afade=t=in:d=0.05,afade=t=out:st=3.95:d=0.05" -ac 1 "$SFX/lava_borbulha.wav"
# apito_panela: apito de panela de pressão subindo (1,2 s)
gen -f lavfi -i "aevalsrc='0.22*sin(2*PI*(1800*t+500*t*t))*(0.6+0.4*sin(2*PI*14*t))*min(1,t*8)':s=$R:d=1.2" -af "afade=t=out:st=1.0:d=0.2" -ac 1 "$SFX/apito_panela.wav"
# puf: fumacinha cartunesca (ruído com envelope rápido e tom grave), 0,5 s
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:sample_rate=$R:duration=0.5:seed=95" -af "lowpass=f=1800,highpass=f=120,volume='exp(-t*9)':eval=frame,volume=2.2" -ac 1 "$SFX/puf.wav"
# falha: três notas descendo e a última tremendo ("fom fom fooom"), 1,6 s
gen -f lavfi -i "aevalsrc='0.3*(lt(t,0.3)*sin(2*PI*311*t)+between(t,0.32,0.62)*sin(2*PI*294*t)+gte(t,0.64)*sin(2*PI*(277+6*sin(2*PI*6*t))*t))*(1+0.4*sin(4*PI*277*t))/1.4':s=$R:d=1.6" -af "lowpass=f=2200,afade=t=out:st=1.3:d=0.3" -ac 1 "$SFX/falha.wav"
# recusado: dois toques graves de erro, 0,6 s
gen -f lavfi -i "aevalsrc='0.35*(lt(t,0.22)*sin(2*PI*220*t)+between(t,0.28,0.55)*sin(2*PI*165*t))*(1+0.5*sin(2*PI*660*t))/1.5':s=$R:d=0.6" -af "afade=t=out:st=0.5:d=0.1" -ac 1 "$SFX/recusado.wav"
# digitar: cliques de teclado irregulares, 1 s
gen -f lavfi -i "aevalsrc='(random(0)*2-1)*0.6*exp(-mod(t+0.03*sin(t*37),0.085)*300)':s=$R:d=1.0" -af "highpass=f=900,afade=t=out:st=0.9:d=0.1" -ac 1 "$SFX/digitar.wav"
# apagar: tecla de apagar repetida rápida, 0,5 s
gen -f lavfi -i "aevalsrc='(random(0)*2-1)*0.5*exp(-mod(t,0.05)*400)':s=$R:d=0.5" -af "highpass=f=1200,afade=t=out:st=0.4:d=0.1" -ac 1 "$SFX/apagar.wav"
# metro_chegando: sinal de duas notas (ding-dong) e um ding no fim, 1,6 s
gen -f lavfi -i "aevalsrc='0.35*(lt(t,0.5)*sin(2*PI*784*t)*exp(-t*3)+between(t,0.45,1.0)*sin(2*PI*659*t)*exp(-(t-0.45)*3)+gte(t,0.95)*sin(2*PI*1047*t)*exp(-(t-0.95)*3))':s=$R:d=1.6" -af "afade=t=out:st=1.4:d=0.2" -ac 1 "$SFX/metro_chegando.wav"
# flutua: arpejo suave subindo (sensação de leveza), 1,6 s
gen -f lavfi -i "aevalsrc='0.22*sin(2*PI*523*pow(2,floor(min(t,1.2)/0.3)*4/12)*t)*exp(-mod(t,0.3)*4)*(1-t/1.7)':s=$R:d=1.6" -af "afade=t=out:st=1.4:d=0.2" -ac 1 "$SFX/flutua.wav"
# suspense_grave: zumbido grave com pulso lento, loop de 8 s
gen -f lavfi -i "aevalsrc='(0.5+0.5*sin(2*PI*t/4))*(0.25*sin(2*PI*73*t)+0.15*sin(2*PI*110*t))':s=$R:d=8" -af "afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/suspense_grave.wav"
# conquista: fanfarrinha de três notas subindo, 1 s
gen -f lavfi -i "aevalsrc='0.28*(lt(t,0.15)*sin(2*PI*523*t)+between(t,0.15,0.3)*sin(2*PI*659*t)+gte(t,0.3)*sin(2*PI*784*t)*exp(-(t-0.3)*2.5))*(1+0.3*sin(4*PI*523*t))':s=$R:d=1.0" -af "afade=t=out:st=0.85:d=0.15" -ac 1 "$SFX/conquista.wav"
# torrada_pop: torrada pulando (mola + estalo), 0,4 s
gen -f lavfi -i "aevalsrc='0.4*sin(2*PI*(300+900*t)*t)*exp(-t*14)+(random(0)*2-1)*0.4*exp(-t*90)':s=$R:d=0.4" -ac 1 "$SFX/torrada_pop.wav"
# brilho: cintilar agudo (sininhos), 0,8 s
gen -f lavfi -i "aevalsrc='0.18*(sin(2*PI*2093*t)*exp(-t*6)+sin(2*PI*2637*t)*exp(-mod(t+0.1,0.8)*6)*gte(t,0.1)+sin(2*PI*3136*t)*exp(-mod(t+0.2,0.8)*6)*gte(t,0.2))':s=$R:d=0.8" -ac 1 "$SFX/brilho.wav"
# energia_queda: trilha animada (Lá menor, ~125 bpm): bumbo nos tempos, chimbal no contratempo,
# baixo em colcheias e um pluck baixinho; 7,68 s em loop (4 compassos)
EB="mod(t,0.48)"
EH="mod(t+0.24,0.48)"
EC="if(lt(mod(t,7.68),1.92),0,if(lt(mod(t,7.68),3.84),-4,if(lt(mod(t,7.68),5.76),-7,-2)))"
BUMBO="0.5*sin(2*PI*(50+70*exp(-$EB*35))*$EB)*exp(-$EB*12)"
CHIMBAL="0.05*(random(0)*2-1)*exp(-$EH*60)"
BAIXO="0.2*sin(2*PI*110*pow(2,($EC)/12)*t)*exp(-mod(t,0.24)*6)"
PLUCK="0.07*sin(2*PI*440*pow(2,($EC+if(lt(mod(t,0.96),0.48),0,if(lt(mod(t,0.96),0.72),7,12)))/12)*t)*exp(-mod(t,0.24)*10)"
gen -f lavfi -i "aevalsrc='$BUMBO+$CHIMBAL+$BAIXO+$PLUCK':s=$R:d=7.68" -af "lowpass=f=6000" -ac 1 "$MUS/energia_queda.wav"

# energia_queda_cauda: a própria trilha (com bumbo e baixo) decaindo até o silêncio em 4,5 s,
# para o rabo final do ep07 (sem voz, a trilha com passa-altas some)
gen -stream_loop 1 -i "$MUS/energia_queda.wav" -af "atrim=0:4.5,highpass=f=70,volume='exp(-t*0.9)':eval=frame,afade=t=out:st=4.0:d=0.5" -ac 1 "$SFX/energia_queda_cauda.wav"
# ep08 (episódio 7) — cantina e suspense
# cantina_ambiente: burburinho de cantina (ruído marrom em faixa de voz, com ondulação) e um
# tilintar de talher de vez em quando; loop de 8 s
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.7:sample_rate=$R:duration=8:seed=101" -af "highpass=f=300,lowpass=f=1800,volume='0.6+0.25*sin(2*PI*t/2.7)+0.15*sin(2*PI*t/1.3)':eval=frame,afade=t=in:d=0.05,afade=t=out:st=7.95:d=0.05" -ac 1 "$SFX/cantina_burburinho.wav"
gen -f lavfi -i "aevalsrc='0.25*sin(2*PI*3100*t)*exp(-mod(t,2.9)*30)*lt(mod(t,2.9),0.3)+0.18*sin(2*PI*2300*(t-1.7))*exp(-mod(t+1.2,4.1)*35)*lt(mod(t+1.2,4.1),0.25)':s=$R:d=8" -ac 1 "$SFX/cantina_talher.wav"
gen -i "$SFX/cantina_burburinho.wav" -i "$SFX/cantina_talher.wav" -filter_complex "amix=inputs=2:normalize=0" -ac 1 "$SFX/cantina_ambiente.wav"
rm -f "$SFX/cantina_burburinho.wav" "$SFX/cantina_talher.wav"
# batida_suspense: duas batidas graves de suspense (tum-tum), 1,2 s
gen -f lavfi -i "aevalsrc='0.6*sin(2*PI*(55+40*exp(-t*20))*t)*exp(-t*9)+0.5*sin(2*PI*(52+40*exp(-(t-0.32)*20))*(t-0.32))*exp(-(t-0.32)*8)*gte(t,0.32)':s=$R:d=1.2" -af "afade=t=out:st=1.0:d=0.2" -ac 1 "$SFX/batida_suspense.wav"
# Versões com passa-altas em 120 Hz (as que entram no vídeo): limpa o grave que embola com a voz
for m in base_suave suspensa_sem_batida tensao_leve alegre_curta melancolica_suave curiosidade_suave crescendo_leve leve_divertida lofi_espacial energia_queda; do
  gen -i "$MUS/$m.wav" -af "highpass=f=120" "$MUS/${m}_hp120.wav"
done

ls -la "$SFX" "$MUS"
