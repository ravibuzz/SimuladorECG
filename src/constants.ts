export const RHYTHMS = {
  // 1. RITMOS SINUSAIS E BASE
  nsr: { id: 'nsr', name: 'Ritmo Sinusal Normal', cat: '1. Ritmos Sinusais e Base', defaultBpm: 60, hasBpm: true },
  brady: { id: 'brady', name: 'Bradicardia Sinusal', cat: '1. Ritmos Sinusais e Base', defaultBpm: 40, hasBpm: true },
  tachy: { id: 'tachy', name: 'Taquicardia Sinusal', cat: '1. Ritmos Sinusais e Base', defaultBpm: 120, hasBpm: true },
  sinus_arr: { id: 'sinus_arr', name: 'Arritmia Sinusal Respiratória', cat: '1. Ritmos Sinusais e Base', defaultBpm: 70, hasBpm: true },
  
  // 2. ARRITMIAS SUPRAVENTRICULARES
  afib: { id: 'afib', name: 'Fibrilação Atrial (FA)', cat: '2. Arritmias Supraventriculares', defaultBpm: 130, hasBpm: true },
  aflutter: { id: 'aflutter', name: 'Flutter Atrial', cat: '2. Arritmias Supraventriculares', defaultBpm: 150, hasBpm: true },
  svt: { id: 'svt', name: 'Taquicardia Supraventricular (TPSV)', cat: '2. Arritmias Supraventriculares', defaultBpm: 180, hasBpm: true },
  at_focal: { id: 'at_focal', name: 'Taquicardia Atrial Focal', cat: '2. Arritmias Supraventriculares', defaultBpm: 140, hasBpm: true },
  at_multi: { id: 'at_multi', name: 'Taquicardia Atrial Multifocal', cat: '2. Arritmias Supraventriculares', defaultBpm: 120, hasBpm: true },
  avnrt: { id: 'avnrt', name: 'TRN (Reentrada Nodal)', cat: '2. Arritmias Supraventriculares', defaultBpm: 190, hasBpm: true },
  junctional: { id: 'junctional', name: 'Ritmo Juncional', cat: '2. Arritmias Supraventriculares', defaultBpm: 45, hasBpm: true },

  // 3. ARRITMIAS VENTRICULARES
  pac: { id: 'pac', name: 'Extrassístole Atrial (ESA)', cat: '3. Arritmias Ventriculares', defaultBpm: 65, hasBpm: true },
  pvc: { id: 'pvc', name: 'Extrassístole Ventricular (ESV)', cat: '3. Arritmias Ventriculares', defaultBpm: 65, hasBpm: true },
  bigeminy: { id: 'bigeminy', name: 'Bigeminismo Ventricular', cat: '3. Arritmias Ventriculares', defaultBpm: 60, hasBpm: true },
  trigeminy: { id: 'trigeminy', name: 'Trigeminismo Ventricular', cat: '3. Arritmias Ventriculares', defaultBpm: 65, hasBpm: true },
  vtach_mono: { id: 'vtach_mono', name: 'TV Monomórfica', cat: '3. Arritmias Ventriculares', defaultBpm: 160, hasBpm: true },
  torsades: { id: 'torsades', name: 'Torsades de Pointes', cat: '3. Arritmias Ventriculares', defaultBpm: 220, hasBpm: false },
  vfib: { id: 'vfib', name: 'Fibrilação Ventricular (FV)', cat: '3. Arritmias Ventriculares', defaultBpm: 0, hasBpm: false },
  asystole: { id: 'asystole', name: 'Assistolia', cat: '3. Arritmias Ventriculares', defaultBpm: 0, hasBpm: false },

  // 4. BLOQUEIOS AV
  bav1: { id: 'bav1', name: 'Bloqueio AV 1º Grau', cat: '4. Bloqueios AV', defaultBpm: 65, hasBpm: true },
  bav2m1: { id: 'bav2m1', name: 'BAV 2º - Mobitz I (Wenckebach)', cat: '4. Bloqueios AV', defaultBpm: 70, hasBpm: true },
  bav2m2: { id: 'bav2m2', name: 'BAV 2º - Mobitz II', cat: '4. Bloqueios AV', defaultBpm: 50, hasBpm: true },
  bav2_21: { id: 'bav2_21', name: 'BAV 2:1', cat: '4. Bloqueios AV', defaultBpm: 45, hasBpm: true },
  bav_avancado: { id: 'bav_avancado', name: 'BAV Avançado', cat: '4. Bloqueios AV', defaultBpm: 40, hasBpm: true },
  bav3: { id: 'bav3', name: 'BAV 3º Grau (Total)', cat: '4. Bloqueios AV', defaultBpm: 40, hasBpm: false },

  // 5. BLOQUEIOS DE RAMO
  brd: { id: 'brd', name: 'Bloqueio de Ramo Direito (BRD)', cat: '5. Bloqueios de Ramo', defaultBpm: 70, hasBpm: true },
  bre: { id: 'bre', name: 'Bloqueio de Ramo Esquerdo (BRE)', cat: '5. Bloqueios de Ramo', defaultBpm: 70, hasBpm: true },

  // 6. PRÉ-EXCITAÇÃO
  wpw: { id: 'wpw', name: 'Wolff-Parkinson-White (Onda Delta)', cat: '6. Pré-excitação', defaultBpm: 75, hasBpm: true },

  // 7. ISQUEMIA E INFARTO
  ischemia_t: { id: 'ischemia_t', name: 'Isquemia (T Invertida)', cat: '7. Isquemia e Infarto', defaultBpm: 70, hasBpm: true },
  stemi_hyper: { id: 'stemi_hyper', name: 'IAM: Fase Hiperaguda (T Gigante)', cat: '7. Isquemia e Infarto', defaultBpm: 80, hasBpm: true },
  stemi_ant: { id: 'stemi_ant', name: 'IAM: Agudo (Anterior)', cat: '7. Isquemia e Infarto', defaultBpm: 80, hasBpm: true },
  stemi_inf: { id: 'stemi_inf', name: 'IAM: Agudo (Inferior)', cat: '7. Isquemia e Infarto', defaultBpm: 60, hasBpm: true },
  stemi_lat: { id: 'stemi_lat', name: 'IAM: Agudo (Lateral)', cat: '7. Isquemia e Infarto', defaultBpm: 75, hasBpm: true },
  stemi_post: { id: 'stemi_post', name: 'IAM: Posterior (V1-V3 Infra)', cat: '7. Isquemia e Infarto', defaultBpm: 70, hasBpm: true },
  stemi_sub: { id: 'stemi_sub', name: 'IAM: Subagudo (Q + T-)', cat: '7. Isquemia e Infarto', defaultBpm: 70, hasBpm: true },
  stemi_old: { id: 'stemi_old', name: 'IAM: Antigo (Onda Q Isolada)', cat: '7. Isquemia e Infarto', defaultBpm: 70, hasBpm: true },
  
  // 8. REPOLARIZAÇÃO E ESPECÍFICOS
  pericarditis: { id: 'pericarditis', name: 'Pericardite Aguda', cat: '8. Repolarização e Específicos', defaultBpm: 95, hasBpm: true },
  osborn: { id: 'osborn', name: 'Hipotermia (Onda Osborn)', cat: '8. Repolarização e Específicos', defaultBpm: 50, hasBpm: true },

  // 9. ELETRÓLITOS E DROGAS
  hyperkalemia: { id: 'hyperkalemia', name: 'Hipercalemia (K+ Alto)', cat: '9. Eletrólitos e Drogas', defaultBpm: 65, hasBpm: true },
  hypokalemia: { id: 'hypokalemia', name: 'Hipocalemia (Onda U)', cat: '9. Eletrólitos e Drogas', defaultBpm: 70, hasBpm: true },
  hypercalcemia: { id: 'hypercalcemia', name: 'Hipercalcemia (Ca2+ Alto)', cat: '9. Eletrólitos e Drogas', defaultBpm: 65, hasBpm: true },
  hypocalcemia: { id: 'hypocalcemia', name: 'Hipocalcemia (Ca2+ Baixo)', cat: '9. Eletrólitos e Drogas', defaultBpm: 65, hasBpm: true },
  tca_tox: { id: 'tca_tox', name: 'Intoxicação por ADT', cat: '9. Eletrólitos e Drogas', defaultBpm: 110, hasBpm: true },
  cocaine: { id: 'cocaine', name: 'Efeito de Cocaína', cat: '9. Eletrólitos e Drogas', defaultBpm: 130, hasBpm: true },

  // 10. CANALOPATIAS
  brugada_1: { id: 'brugada_1', name: 'Brugada Tipo 1', cat: '10. Canalopatias', defaultBpm: 70, hasBpm: true },
  brugada_2: { id: 'brugada_2', name: 'Brugada Tipo 2', cat: '10. Canalopatias', defaultBpm: 70, hasBpm: true },
  long_qt: { id: 'long_qt', name: 'Síndrome do QT Longo', cat: '10. Canalopatias', defaultBpm: 65, hasBpm: true },
  short_qt: { id: 'short_qt', name: 'Síndrome do QT Curto', cat: '10. Canalopatias', defaultBpm: 65, hasBpm: true },

  // 11. SOBRECARGAS E HIPERTROFIAS
  sad: { id: 'sad', name: 'Sobrecarga Atrial Direita (P Pulmonale)', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },
  sae: { id: 'sae', name: 'Sobrecarga Atrial Esquerda (P Mitrale)', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },
  biatrial: { id: 'biatrial', name: 'Sobrecarga Biatrial', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },
  hve: { id: 'hve', name: 'Hipertrofia Ventricular Esquerda', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },
  hvd: { id: 'hvd', name: 'Hipertrofia Ventricular Direita', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },
  biventricular: { id: 'biventricular', name: 'Sobrecarga Biventricular', cat: '11. Sobrecargas e Hipertrofias', defaultBpm: 75, hasBpm: true },

  // 12. DOENÇA PULMONAR
  s1q3t3: { id: 's1q3t3', name: 'Padrão S1Q3T3 (TEP)', cat: '12. Doença Pulmonar', defaultBpm: 115, hasBpm: true },
  cor_pulmonale: { id: 'cor_pulmonale', name: 'Cor Pulmonale', cat: '12. Doença Pulmonar', defaultBpm: 90, hasBpm: true },

  // 13. MARCAPASSO
  pm_atrial: { id: 'pm_atrial', name: 'Marcapasso Atrial (AAI)', cat: '13. Marcapassos', defaultBpm: 70, hasBpm: true },
  pm_ventricular: { id: 'pm_ventricular', name: 'Marcapasso Ventricular (VVI)', cat: '13. Marcapassos', defaultBpm: 70, hasBpm: true },
  pm_dual: { id: 'pm_dual', name: 'Marcapasso Dupla Câmara (DDD)', cat: '13. Marcapassos', defaultBpm: 70, hasBpm: true }
};

export const INFO_CONTENT = {
  nsr: { 
    title: "Ritmo Sinusal Normal", 
    desc: "O padrão ouro da condução cardíaca. O impulso nasce no nó SA e desce harmonicamente.", 
    points: [
      "Frequência: 60 a 100 bpm.",
      "Regra de sinusal: Onda P positiva em DI, DII e aVF. Negativa em aVR.",
      "Intervalo PR: Constante entre 120ms e 200ms.",
      "QRS: Estreito (< 120ms) e rítmico."
    ] 
  },
  brady: { 
    title: "Bradicardia Sinusal", 
    desc: "Ritmo sinusal lento. Comum em atletas ou por efeito vagal/medicamentoso.", 
    points: [
      "FC < 60 bpm.",
      "Morfologia de P e QRS preservada.",
      "Pode ser fisiológico no sono ou patológico (doença do nó sinusal)."
    ] 
  },
  tachy: { 
    title: "Taquicardia Sinusal", 
    desc: "Aceleração fisiológica do nó sinusal. Geralmente uma resposta a estímulos externos.", 
    points: [
      "FC > 100 bpm.",
      "Início e fim graduais (diferente das paroxísticas).",
      "Causas: Febre, dor, anemia, choque, ansiedade, exercício."
    ] 
  },
  afib: { 
    title: "Fibrilação Atrial (FA)", 
    desc: "Atividade atrial caótica. Múltiplos focos de reentrada impedem a contração atrial efetiva.", 
    points: [
      "Ausência de ondas P (substituídas por ondas 'f').",
      "Intervalos R-R irregularmente irregulares.",
      "Linha de base tremulante.",
      "Risco: Formação de trombos no apêndice atrial esquerdo (AVC)."
    ] 
  },
  aflutter: { 
    title: "Flutter Atrial", 
    desc: "Macro-reentrada organizada no átrio, geralmente no istmo cavotricuspídeo.", 
    points: [
      "Ondas F em 'dente de serra' (serrilhadas).",
      "Frequência atrial fixa (geralmente 300 bpm).",
      "Condução AV fixa (2:1, 3:1) ou variável.",
      "Ritmo ventricular costuma ser regular."
    ] 
  },
  svt: { 
    title: "Taquicardia Supraventricular (TPSV)", 
    desc: "Taquicardia paroxística de QRS estreito, geralmente por reentrada nodal.", 
    points: [
      "FC muito alta (150-250 bpm).",
      "Ritmo perfeitamente regular.",
      "Ondas P geralmente invisíveis ou retrógradas.",
      "Início e término súbitos."
    ] 
  },
  vtach_mono: { 
    title: "Taquicardia Ventricular Monomórfica", 
    desc: "Emergência médica. Ritmo originado nos ventrículos com morfologia única.", 
    points: [
      "QRS largo (> 120ms) e idênticos entre si.",
      "FC > 100 bpm (geralmente > 150).",
      "Dissociação AV (pode haver ondas P marchando independentes).",
      "Batimentos de captura ou fusão são patognomônicos."
    ] 
  },
  vfib: { 
    title: "Fibrilação Ventricular (FV)", 
    desc: "Colapso hemodinâmico total. O coração apenas treme, sem bombear sangue.", 
    points: [
      "Ondas caóticas de amplitude variável.",
      "Ausência de complexos QRS discerníveis.",
      "Morte súbita iminente se não houver desfibrilação.",
      "Ritmo de parada cardiorrespiratória."
    ] 
  },
  stemi_ant: { 
    title: "IAM com Supra de ST (Anterior)", 
    desc: "Oclusão da artéria descendente anterior (DA). Parede anterior do VE.", 
    points: [
      "Supra de ST em V1 a V4.",
      "Morfologia convexa (tombstone) é sinal de gravidade.",
      "Pode haver infra de ST (imagem em espelho) em DII, DIII e aVF.",
      "Alta mortalidade por insuficiência ventricular esquerda."
    ] 
  },
  bav3: { 
    title: "Bloqueio AV de 3º Grau (Total)", 
    desc: "Nenhum estímulo atrial chega aos ventrículos. Dissociação total.", 
    points: [
      "Ondas P marcham em sua própria frequência (PP constante).",
      "QRS marcham em sua própria frequência (RR constante).",
      "Não há relação entre P e QRS.",
      "Requer marcapasso definitivo."
    ] 
  },
  wpw: { 
    title: "Síndrome de Wolff-Parkinson-White", 
    desc: "Presença de via acessória (Feixe de Kent) que pula o nó AV.", 
    points: [
      "Intervalo PR curto (< 120ms).",
      "Onda Delta (empastamento inicial do QRS).",
      "QRS alargado por pré-excitação.",
      "Risco de taquiarritmias por reentrada."
    ] 
  },
  hyperkalemia: { 
    title: "Hipercalemia Grave", 
    desc: "Níveis elevados de potássio alteram a condutividade elétrica.", 
    points: [
      "Ondas T apiculadas e simétricas (em 'tenda').",
      "Achatamento e perda da onda P.",
      "Alargamento bizarro do QRS (padrão sinusoidal).",
      "Emergência dialítica/medicamentosa."
    ] 
  },
  sinus_arr: {
    title: "Arritmia Sinusal Respiratória",
    desc: "Variação fisiológica da frequência cardíaca com a respiração. Acelera na inspiração, desacelera na expiração.",
    points: [
      "Onda P normal precedendo cada QRS.",
      "Intervalo P-P varia com o ciclo respiratório.",
      "Comum em jovens e atletas saudáveis."
    ]
  },
  at_focal: {
    title: "Taquicardia Atrial Focal",
    desc: "Ritmo rápido originado de um único foco ectópico no átrio, diferente do nó sinusal.",
    points: [
      "FC > 100 bpm.",
      "Onda P com morfologia diferente da sinusal.",
      "Intervalo PR pode ser normal ou curto."
    ]
  },
  at_multi: {
    title: "Taquicardia Atrial Multifocal",
    desc: "Múltiplos focos atriais disparando. Muito comum em pacientes com DPOC grave.",
    points: [
      "FC > 100 bpm.",
      "Pelo menos 3 morfologias diferentes de onda P na mesma derivação.",
      "Intervalos P-P, P-R e R-R irregulares."
    ]
  },
  avnrt: {
    title: "Taquicardia por Reentrada Nodal (TRN)",
    desc: "A forma mais comum de TPSV. Um circuito de reentrada dentro do próprio nó AV.",
    points: [
      "FC 150-250 bpm, ritmo muito regular.",
      "QRS estreito.",
      "Ondas P geralmente escondidas no QRS ou logo após (pseudo r' em V1)."
    ]
  },
  junctional: {
    title: "Ritmo Juncional de Escape",
    desc: "O nó AV assume o comando quando o nó sinusal falha.",
    points: [
      "FC 40-60 bpm.",
      "QRS estreito.",
      "Onda P ausente, invertida (antes do QRS) ou logo após o QRS."
    ]
  },
  junctional_retro: {
    title: "Ritmo Juncional com P Retrógrada",
    desc: "O estímulo nasce na junção e sobe para os átrios de forma invertida.",
    points: [
      "Onda P invertida nas derivações inferiores (DII, DIII, aVF).",
      "Pode ocorrer antes, durante ou após o QRS."
    ]
  },
  pac: {
    title: "Extrassístole Atrial (ESA)",
    desc: "Batimento antecipado originado nos átrios.",
    points: [
      "Onda P prematura, com morfologia diferente da sinusal.",
      "QRS geralmente estreito.",
      "Pausa compensatória incompleta."
    ]
  },
  pvc: {
    title: "Extrassístole Ventricular (ESV)",
    desc: "Batimento antecipado originado nos ventrículos.",
    points: [
      "QRS largo e bizarro, prematuro.",
      "Ausência de onda P antes do QRS.",
      "Pausa compensatória completa."
    ]
  },
  bigeminy: {
    title: "Bigeminismo Ventricular",
    desc: "Padrão onde cada batimento normal é seguido por uma ESV.",
    points: [
      "Alternância 1:1 entre batimento sinusal e ESV.",
      "Pode causar pulso fraco (pulso bigeminado)."
    ]
  },
  trigeminy: {
    title: "Trigeminismo Ventricular",
    desc: "Padrão onde a cada dois batimentos normais ocorre uma ESV.",
    points: [
      "Alternância 2:1 entre batimentos sinusais e ESV.",
      "Indica irritabilidade miocárdica."
    ]
  },
  vtach_poly: {
    title: "Taquicardia Ventricular Polimórfica",
    desc: "TV com múltiplas morfologias de QRS. Muito instável.",
    points: [
      "QRS largo com morfologia e eixo variáveis.",
      "FC > 150 bpm.",
      "Pode degenerar rapidamente para Fibrilação Ventricular."
    ]
  },
  torsades: {
    title: "Torsades de Pointes",
    desc: "Tipo específico de TV polimórfica associada a QT longo.",
    points: [
      "QRS 'torce' em torno da linha de base.",
      "Ocorre no contexto de QT longo prévio.",
      "Tratamento específico com Sulfato de Magnésio."
    ]
  },

  asystole: {
    title: "Assistolia",
    desc: "Ausência total de atividade elétrica ventricular.",
    points: [
      "Linha reta (isoeletrica).",
      "Sempre checar 'Cagada' (Cabos, Ganho, Derivação).",
      "Ritmo de parada não chocável."
    ]
  },
  bav1: {
    title: "Bloqueio AV de 1º Grau",
    desc: "Atraso na condução do nó AV, mas todos os estímulos passam.",
    points: [
      "Intervalo PR prolongado (> 200 ms ou 5 quadradinhos).",
      "Toda onda P é seguida de QRS.",
      "Geralmente benigno."
    ]
  },
  bav2m1: {
    title: "BAV 2º Grau - Mobitz I (Wenckebach)",
    desc: "Atraso progressivo até que um batimento é bloqueado.",
    points: [
      "Aumento progressivo do intervalo PR.",
      "Até que uma onda P não conduz (falha o QRS).",
      "O ciclo se repete. Geralmente benigno."
    ]
  },
  bav2m2: {
    title: "BAV 2º Grau - Mobitz II",
    desc: "Bloqueio súbito da condução sem aviso prévio.",
    points: [
      "Intervalo PR constante (normal ou longo).",
      "Onda P subitamente bloqueada (sem QRS).",
      "Alto risco de progressão para BAV Total. Requer marcapasso."
    ]
  },
  bav2_21: {
    title: "BAV 2:1",
    desc: "A cada duas ondas P, uma é bloqueada e a outra conduz.",
    points: [
      "Duas ondas P para cada complexo QRS.",
      "Pode ser Mobitz I ou Mobitz II (difícil diferenciar no ECG de superfície).",
      "Avaliar necessidade de marcapasso."
    ]
  },
  bav_avancado: {
    title: "BAV Avançado (Alto Grau)",
    desc: "Duas ou mais ondas P consecutivas bloqueadas.",
    points: [
      "Padrão 3:1, 4:1, etc.",
      "Alto risco de assistolia.",
      "Indicação de marcapasso definitivo."
    ]
  },
  brd: {
    title: "Bloqueio de Ramo Direito (BRD)",
    desc: "Atraso na despolarização do ventrículo direito.",
    points: [
      "QRS largo (> 120ms).",
      "Padrão rsR' (orelha de coelho) em V1 e V2.",
      "Onda S alargada em DI, aVL, V5 e V6."
    ]
  },
  bre: {
    title: "Bloqueio de Ramo Esquerdo (BRE)",
    desc: "Atraso na despolarização do ventrículo esquerdo.",
    points: [
      "QRS largo (> 120ms).",
      "Onda R larga e entalhada em DI, aVL, V5, V6.",
      "Ausência de onda Q septal em V5-V6."
    ]
  },
  lafb: {
    title: "Hemibloqueio Anterior Esquerdo (HBAE)",
    desc: "Bloqueio do fascículo anterior do ramo esquerdo.",
    points: [
      "Desvio extremo do eixo para a esquerda (<-30°).",
      "Padrão qR em DI e aVL.",
      "Padrão rS em DII, DIII e aVF."
    ]
  },
  lpfb: {
    title: "Hemibloqueio Posterior Esquerdo (HBPE)",
    desc: "Bloqueio do fascículo posterior do ramo esquerdo (raro isolado).",
    points: [
      "Desvio do eixo para a direita (>+90°).",
      "Padrão rS em DI e aVL.",
      "Padrão qR em DII, DIII e aVF."
    ]
  },
  bifascicular: {
    title: "Bloqueio Bifascicular",
    desc: "Associação de BRD com um hemibloqueio (geralmente HBAE).",
    points: [
      "Padrão de BRD em V1-V2.",
      "Desvio de eixo compatível com o hemibloqueio.",
      "Risco aumentado de BAV Total."
    ]
  },
  lgl: {
    title: "Síndrome de Lown-Ganong-Levine",
    desc: "Pré-excitação por fibras de James (pula o nó AV, mas entra no His).",
    points: [
      "Intervalo PR curto (< 120ms).",
      "QRS normal (sem onda Delta).",
      "História de taquicardias."
    ]
  },
  ischemia_t: {
    title: "Isquemia Subepicárdica (Onda T Invertida)",
    desc: "Sinal de isquemia miocárdica aguda ou crônica.",
    points: [
      "Ondas T invertidas, simétricas e pontiagudas.",
      "Correlacionar com a clínica (dor torácica)."
    ]
  },
  stemi_hyper: {
    title: "IAM: Fase Hiperaguda",
    desc: "Primeiros minutos do infarto, antes do supra de ST.",
    points: [
      "Ondas T gigantes, simétricas e de base larga.",
      "Podem ser confundidas com hipercalemia."
    ]
  },
  stemi_inf: {
    title: "IAM com Supra de ST (Inferior)",
    desc: "Oclusão aguda da artéria Coronária Direita (CD) ou Circunflexa (Cx).",
    points: [
      "Supra de ST em DII, DIII e aVF.",
      "Imagem em espelho (infra ST) em DI e aVL.",
      "Atenção para possível acometimento de VD (V3R, V4R)."
    ]
  },
  stemi_lat: {
    title: "IAM com Supra de ST (Lateral)",
    desc: "Oclusão da artéria Circunflexa (Cx).",
    points: [
      "Supra de ST em DI, aVL, V5 e V6.",
      "Imagem em espelho em DIII e aVF."
    ]
  },
  stemi_post: {
    title: "IAM Posterior",
    desc: "Oclusão da Cx ou Coronária Direita afetando a parede posterior.",
    points: [
      "Infra de ST em V1-V3 (imagem em espelho do supra posterior).",
      "Ondas R altas em V1-V2.",
      "Fazer derivações V7-V9 para confirmar o supra."
    ]
  },
  stemi_sub: {
    title: "IAM Subagudo / Evoluído",
    desc: "Fase tardia do infarto (horas a dias).",
    points: [
      "Ondas Q patológicas (necrose).",
      "Ondas T invertidas e simétricas (isquemia).",
      "Segmento ST geralmente já retornou à linha de base."
    ]
  },
  stemi_old: {
    title: "IAM: Fase Antiga (Cicatriz)",
    desc: "Cicatriz de infarto prévio. A isquemia aguda passou, restando apenas o sinal de necrose tecidual.",
    points: [
      "Ondas Q patológicas persistentes (necrose).",
      "Segmento ST e onda T normalizados.",
      "Indica área inativa no miocárdio."
    ]
  },
  ber: {
    title: "Repolarização Precoce Benigna",
    desc: "Variante normal do ECG, comum em jovens e atletas.",
    points: [
      "Supra de ST côncavo, mais evidente em V2-V5.",
      "Entalhe (notch) ou empastamento no ponto J.",
      "Ondas T proeminentes e assimétricas."
    ]
  },
  pericarditis: {
    title: "Pericardite Aguda",
    desc: "Inflamação do pericárdio.",
    points: [
      "Supra de ST difuso, côncavo (formato de sorriso).",
      "Infra do segmento PR (patognomônico).",
      "Sem imagem em espelho (exceto aVR/V1)."
    ]
  },
  osborn: {
    title: "Onda de Osborn (Hipotermia)",
    desc: "Deflexão positiva no ponto J associada a frio extremo.",
    points: [
      "Onda J proeminente após o QRS.",
      "Bradicardia severa.",
      "Prolongamento de todos os intervalos."
    ]
  },
  hypokalemia: {
    title: "Hipocalemia",
    desc: "Níveis baixos de potássio.",
    points: [
      "Ondas T achatadas ou invertidas.",
      "Presença de Onda U proeminente (após a T).",
      "Aumento do intervalo QT."
    ]
  },
  hypercalcemia: {
    title: "Hipercalcemia",
    desc: "Níveis altos de cálcio.",
    points: [
      "Encurtamento do intervalo QT.",
      "Onda T pode iniciar logo após o QRS."
    ]
  },
  hypocalcemia: {
    title: "Hipocalcemia",
    desc: "Níveis baixos de cálcio.",
    points: [
      "Prolongamento do intervalo QT.",
      "Segmento ST longo e reto."
    ]
  },
  digitalis: {
    title: "Efeito Digitálico",
    desc: "Alteração benigna causada pelo uso de Digoxina.",
    points: [
      "Infra de ST em formato de 'colher' (scoop).",
      "Não indica intoxicação, apenas uso da droga."
    ]
  },
  tca_tox: {
    title: "Intoxicação por Tricíclicos",
    desc: "Overdose de antidepressivos tricíclicos (bloqueio de canais de sódio).",
    points: [
      "Taquicardia sinusal.",
      "QRS largo.",
      "Onda R proeminente em aVR (> 3mm)."
    ]
  },
  cocaine: {
    title: "Efeito de Cocaína",
    desc: "Vasoespasmo coronariano e hiperatividade simpática.",
    points: [
      "Taquicardia.",
      "Pode causar Supra de ST transitório (isquemia).",
      "Risco de arritmias ventriculares."
    ]
  },
  brugada_1: { 
    title: "Síndrome de Brugada (Tipo 1)", 
    desc: "Canalopatia de sódio com alto risco de morte súbita arrítmica.", 
    points: [
      "Padrão Pseudo-BRD em V1-V2.",
      "Supra de ST 'coved' (em sela/dorso de golfinho) ≥ 2mm.",
      "Onda T invertida em V1-V2.",
      "Indicação de CDI em casos de alto risco."
    ] 
  },
  brugada_2: { 
    title: "Síndrome de Brugada (Tipo 2)", 
    desc: "Padrão 'Saddle-back' (sela de cavalo) em V1-V2.", 
    points: [
      "Padrão Pseudo-BRD em V1-V2.",
      "Supra de ST ≥ 2mm no ponto J, mas desce mantendo-se ≥ 1mm (formato de sela).",
      "Onda T positiva ou bifásica em V1-V2.",
      "Pode converter para Tipo 1 com febre ou drogas."
    ] 
  },
  long_qt: {
    title: "Síndrome do QT Longo",
    desc: "Atraso na repolarização, congênito ou adquirido.",
    points: [
      "QTc > 440ms (homens) ou > 460ms (mulheres).",
      "Alto risco de Torsades de Pointes e síncope."
    ]
  },
  short_qt: {
    title: "Síndrome do QT Curto",
    desc: "Canalopatia rara com repolarização acelerada.",
    points: [
      "QTc < 340ms.",
      "Ondas T altas e apiculadas.",
      "Risco de Fibrilação Atrial e Ventricular."
    ]
  },
  sad: {
    title: "Sobrecarga Atrial Direita (P Pulmonale)",
    desc: "Aumento do átrio direito, comum em doenças pulmonares.",
    points: [
      "Onda P alta e apiculada (> 2.5mm) em DII, DIII, aVF."
    ]
  },
  sae: {
    title: "Sobrecarga Atrial Esquerda (P Mitrale)",
    desc: "Aumento do átrio esquerdo, comum em hipertensão e valvopatias.",
    points: [
      "Onda P larga (> 120ms) e bífida em DII.",
      "Componente negativo profundo de P em V1 (índice de Morris)."
    ]
  },
  biatrial: {
    title: "Sobrecarga Biatrial",
    desc: "Aumento simultâneo dos átrios direito e esquerdo, comum em valvopatias múltiplas ou miocardiopatias.",
    points: [
      "Critérios no ECG em DII:",
      "• P ≥ 2,5 mm (componente direito).",
      "• P ≥ 120 ms e bífida (componente esquerdo).",
      "Critérios no ECG em V1:",
      "• Componente inicial positivo alto (≥ 1,5 mm).",
      "• Porção final negativa profunda e larga (Índice de Morris)."
    ]
  },
  hve: {
    title: "Hipertrofia Ventricular Esquerda (HVE)",
    desc: "Aumento da massa do VE, geralmente por hipertensão.",
    points: [
      "Ondas R altas em V5-V6 e S profundas em V1-V2.",
      "Critério de Sokolow-Lyon: S(V1) + R(V5/V6) > 35mm.",
      "Critério de Cornell: R(aVL) + S(V3) > 28mm (homens) ou > 20mm (mulheres).",
      "Padrão de 'Strain' (infra ST e T invertida assimétrica) em V5-V6."
    ]
  },
  hvd: {
    title: "Hipertrofia Ventricular Direita (HVD)",
    desc: "Aumento da massa do VD, comum em hipertensão pulmonar.",
    points: [
      "Onda R > S em V1.",
      "Desvio do eixo para a direita.",
      "Padrão de Strain em V1-V3."
    ]
  },
  biventricular: {
    title: "Sobrecarga Biventricular",
    desc: "Aumento simultâneo de ambos os ventrículos. Os vetores podem se anular ou mostrar sinais de ambos.",
    points: [
      "Critérios de voltagem para HVE nas precordiais esquerdas (R altas em V5-V6).",
      "Eixo elétrico desviado para a direita (sugerindo HVD associada).",
      "Ondas R proeminentes em V1 e V2 com S profundas.",
      "Complexos QRS isodifásicos amplos (R+S > 50mm) nas precordiais médias (V3-V4) - Fenômeno de Katz-Wachtel."
    ]
  },
  s1q3t3: {
    title: "Padrão S1Q3T3 (TEP)",
    desc: "Sinal clássico (mas pouco sensível) de Tromboembolismo Pulmonar.",
    points: [
      "Onda S profunda em DI.",
      "Onda Q patológica em DIII.",
      "Onda T invertida em DIII.",
      "O achado mais comum no TEP é a Taquicardia Sinusal."
    ]
  },
  cor_pulmonale: {
    title: "Cor Pulmonale",
    desc: "Alteração cardíaca secundária a doença pulmonar crônica.",
    points: [
      "SAD (P pulmonale).",
      "HVD e desvio do eixo para a direita.",
      "BRD incompleto ou completo."
    ]
  },
  pm_atrial: {
    title: "Marcapasso Atrial",
    desc: "Estimulação artificial apenas no átrio.",
    points: [
      "Espícula (spike) antes da onda P.",
      "QRS normal (condução AV preservada)."
    ]
  },
  pm_ventricular: {
    title: "Marcapasso Ventricular",
    desc: "Estimulação artificial no ventrículo direito.",
    points: [
      "Espícula antes do QRS.",
      "QRS largo com morfologia de BRE (pois estimula o VD primeiro)."
    ]
  },
  pm_dual: {
    title: "Marcapasso Dupla Câmara",
    desc: "Estimulação em átrio e ventrículo.",
    points: [
      "Espícula antes da P e outra espícula antes do QRS.",
      "Sincronia AV artificial."
    ]
  },
  pm_fail_cap: {
    title: "Falha de Captura (Marcapasso)",
    desc: "O marcapasso dispara, mas o miocárdio não contrai.",
    points: [
      "Espícula visível, mas sem onda P ou QRS em seguida.",
      "Risco de assistolia se o paciente for dependente."
    ]
  },
  pm_fail_sense: {
    title: "Falha de Sensoriamento",
    desc: "O marcapasso não percebe o ritmo intrínseco e dispara no momento errado.",
    points: [
      "Espículas caindo sobre ondas P, QRS ou ondas T.",
      "Risco de fenômeno R-sobre-T e Fibrilação Ventricular."
    ]
  },
};

export const getGuidelines = (rhythmId: string) => {
  const dict: Record<string, { steps: string[], urgency: 'low' | 'medium' | 'high', benign: boolean }> = {
    nsr: { steps: ["Manter vigilância de rotina.", "Nenhuma intervenção necessária."], urgency: 'low', benign: true },
    brady: { steps: ["Avaliar sintomas (síncope, dispneia).", "Se estável: Observar.", "Se instável: Atropina 1mg IV, considerar marcapasso transcutâneo."], urgency: 'medium', benign: false },
    tachy: { steps: ["Tratar a causa base (febre, dor, desidratação).", "Beta-bloqueadores apenas se sintomático e causa tratada."], urgency: 'low', benign: true },
    sinus_arr: { steps: ["Variação normal com a respiração.", "Nenhuma intervenção necessária."], urgency: 'low', benign: true },
    afib: { steps: ["Controle de frequência (Beta-bloqueador ou BCC).", "Controle de ritmo (Amiodarona/Propafenona) se < 48h.", "Anticoagulação (CHA2DS2-VASc)."], urgency: 'medium', benign: false },
    aflutter: { steps: ["Controle de frequência.", "Anticoagulação.", "Cardioversão elétrica ou ablação por radiofrequência."], urgency: 'medium', benign: false },
    svt: { steps: ["Manobras vagais (Valsalva, massagem carotídea).", "Adenosina 6mg IV rápido (bolus).", "Cardioversão elétrica se instável."], urgency: 'high', benign: false },
    at_focal: { steps: ["Beta-bloqueadores ou BCC.", "Ablação se refratário."], urgency: 'low', benign: false },
    at_multi: { steps: ["Tratar doença pulmonar de base (DPOC).", "Evitar beta-bloqueadores se asma/DPOC grave.", "Verapamil ou Diltiazem."], urgency: 'medium', benign: false },
    avnrt: { steps: ["Manobras vagais.", "Adenosina IV.", "Ablação da via lenta (cura)."], urgency: 'high', benign: false },
    junctional: { steps: ["Tratar causa base (isquemia, drogas).", "Atropina se bradicardia sintomática."], urgency: 'medium', benign: false },
    pac: { steps: ["Geralmente benignas.", "Reduzir cafeína, estresse, álcool."], urgency: 'low', benign: true },
    pvc: { steps: ["Investigar doença estrutural se frequentes.", "Beta-bloqueadores se sintomático."], urgency: 'low', benign: true },
    bigeminy: { steps: ["Monitorar.", "Investigar isquemia ou distúrbios eletrolíticos."], urgency: 'medium', benign: false },
    trigeminy: { steps: ["Monitorar.", "Investigar isquemia ou distúrbios eletrolíticos."], urgency: 'medium', benign: false },
    vtach_mono: { steps: ["Se estável: Amiodarona 150mg IV.", "Se instável: Cardioversão elétrica sincronizada.", "Se sem pulso: Desfibrilação (protocolo de PCR)."], urgency: 'high', benign: false },
    torsades: { steps: ["Sulfato de Magnésio 2g IV.", "Desfibrilação se instável.", "Acelerar FC (Isoprenalina ou Marcapasso)."], urgency: 'high', benign: false },
    vfib: { steps: ["Protocolo de PCR (ACLS).", "Desfibrilação imediata (360J mono ou 200J bi).", "RCP de alta qualidade e Adrenalina."], urgency: 'high', benign: false },
    asystole: { steps: ["Protocolo de PCR (ACLS).", "RCP e Adrenalina.", "Checar protocolo 'Cagada' (Cabos, Ganho, Derivação).", "Tratar causas reversíveis (5Hs e 5Ts)."], urgency: 'high', benign: false },
    bav1: { steps: ["Nenhuma intervenção específica.", "Ajustar drogas cronotrópicas negativas se necessário."], urgency: 'low', benign: true },
    bav2m1: { steps: ["Observação se assintomático.", "Atropina se bradicardia sintomática."], urgency: 'low', benign: true },
    bav2m2: { steps: ["Internação.", "Marcapasso transcutâneo de espera.", "Indicação de Marcapasso Definitivo."], urgency: 'high', benign: false },
    bav2_21: { steps: ["Internação.", "Avaliar necessidade de marcapasso."], urgency: 'high', benign: false },
    bav_avancado: { steps: ["Internação em UTI.", "Marcapasso transcutâneo de espera.", "Implante de marcapasso definitivo."], urgency: 'high', benign: false },
    bav3: { steps: ["Internação em UTI.", "Marcapasso transcutâneo de espera.", "Implante de marcapasso definitivo."], urgency: 'high', benign: false },
    brd: { steps: ["Investigar doença pulmonar ou congênita.", "Nenhum tratamento específico para o bloqueio."], urgency: 'low', benign: true },
    bre: { steps: ["Avaliar isquemia se novo.", "Ecocardiograma para avaliar função VE."], urgency: 'medium', benign: false },
    wpw: { steps: ["Evitar bloqueadores do nó AV (Adenosina, BCC) se FA pré-excitada.", "Ablação da via acessória."], urgency: 'medium', benign: false },
    lgl: { steps: ["Ablação se taquicardias frequentes."], urgency: 'low', benign: false },
    ischemia_t: { steps: ["Marcadores de necrose miocárdica.", "Aspirina, anticoagulação.", "Estratificação invasiva."], urgency: 'high', benign: false },
    stemi_hyper: { steps: ["Emergência cardiológica!", "Ativar protocolo de IAM.", "Preparar para angioplastia."], urgency: 'high', benign: false },
    stemi_ant: { steps: ["Emergência cardiológica!", "Aspirina 300mg + Clopidogrel/Ticagrelor.", "Cineangiocoronariografia (Angioplastia primária) < 90 min."], urgency: 'high', benign: false },
    stemi_inf: { steps: ["Emergência cardiológica!", "Aspirina 300mg + Clopidogrel.", "Cineangiocoronariografia urgente.", "CUIDADO: Evitar nitratos se houver suspeita de infarto de VD."], urgency: 'high', benign: false },
    stemi_lat: { steps: ["Emergência cardiológica!", "Protocolo IAM com supra.", "Angioplastia primária."], urgency: 'high', benign: false },
    stemi_post: { steps: ["Emergência cardiológica!", "Protocolo IAM com supra.", "Angioplastia primária."], urgency: 'high', benign: false },
    stemi_sub: { steps: ["Tratamento clínico otimizado.", "Ecocardiograma.", "Estratificação."], urgency: 'medium', benign: false },
    stemi_old: { steps: ["Avaliar função ventricular.", "Tratamento de insuficiência cardíaca se presente.", "Prevenção secundária (AAS, Estatina)."], urgency: 'low', benign: true },
    pericarditis: { steps: ["AINEs (Ibuprofeno) + Colchicina.", "Ecocardiograma para descartar derrame."], urgency: 'medium', benign: false },
    osborn: { steps: ["Aquecimento ativo e passivo.", "Monitorização contínua."], urgency: 'high', benign: false },
    hyperkalemia: { steps: ["Gluconato de Cálcio 10% IV (estabiliza membrana).", "Insulina + Glicose (shift intracelular).", "Furosemida ou Hemodiálise."], urgency: 'high', benign: false },
    hypokalemia: { steps: ["Reposição de Potássio (oral ou IV lento).", "Corrigir Magnésio associado."], urgency: 'medium', benign: false },
    hypercalcemia: { steps: ["Hidratação venosa vigorosa.", "Furosemida.", "Bifosfonatos."], urgency: 'medium', benign: false },
    hypocalcemia: { steps: ["Reposição de Cálcio IV se sintomático."], urgency: 'medium', benign: false },
    digitalis: { steps: ["Monitorar níveis séricos.", "Suspender se sinais de intoxicação (arritmias)."], urgency: 'low', benign: true },
    tca_tox: { steps: ["Bicarbonato de Sódio IV se QRS > 100ms.", "Suporte intensivo."], urgency: 'high', benign: false },
    brugada_1: { steps: ["Evitar drogas desencadeantes.", "Tratar febre agressivamente.", "Avaliar indicação de CDI."], urgency: 'medium', benign: false },
    brugada_2: { steps: ["Evitar drogas desencadeantes.", "Tratar febre agressivamente.", "Monitorar conversão para Tipo 1."], urgency: 'low', benign: false },
    long_qt: { steps: ["Evitar drogas que prolongam QT.", "Beta-bloqueadores.", "Avaliar CDI."], urgency: 'medium', benign: false },
    short_qt: { steps: ["Avaliação por arritmologista.", "Considerar CDI."], urgency: 'medium', benign: false },
    sad: { steps: ["Tratar doença pulmonar de base."], urgency: 'low', benign: false },
    sae: { steps: ["Controlar pressão arterial.", "Avaliar valvopatia mitral."], urgency: 'low', benign: false },
    biatrial: { steps: ["Ecocardiograma para avaliar função e válvulas.", "Tratar causa base (ex: valvopatia, IC)."], urgency: 'low', benign: false },
    hve: { steps: ["Controle rigoroso da Hipertensão.", "Ecocardiograma."], urgency: 'low', benign: false },
    hvd: { steps: ["Investigar Hipertensão Pulmonar.", "Ecocardiograma."], urgency: 'low', benign: false },
    biventricular: { steps: ["Ecocardiograma completo.", "Manejo da insuficiência cardíaca e causas subjacentes."], urgency: 'low', benign: false },
    s1q3t3: { steps: ["AngioTC de tórax se suspeita clínica de TEP.", "Anticoagulação se confirmado."], urgency: 'high', benign: false },
    cor_pulmonale: { steps: ["Oxigenoterapia.", "Tratar doença pulmonar."], urgency: 'medium', benign: false },
    pm_atrial: { steps: ["Avaliação de rotina do dispositivo."], urgency: 'low', benign: true },
    pm_ventricular: { steps: ["Avaliação de rotina do dispositivo."], urgency: 'low', benign: true },
    pm_dual: { steps: ["Avaliação de rotina do dispositivo."], urgency: 'low', benign: true },
    pm_fail_cap: { steps: ["Aumentar energia de saída (output).", "Revisão de eletrodo urgente."], urgency: 'high', benign: false },
    pm_fail_sense: { steps: ["Ajustar sensibilidade.", "Revisão do dispositivo."], urgency: 'high', benign: false }
  };
  
  return dict[rhythmId] || { 
    steps: ["Avaliação clínica detalhada.", "Monitorização contínua.", "Investigar causas reversíveis."], 
    urgency: 'medium', 
    benign: false 
  };
};

export const DIFFERENTIAL_DIAGNOSIS = [
  {
    pattern: "Taquicardia Regular QRS Estreito",
    options: [
      { name: "Taquicardia Sinusal", tip: "Ondas P visíveis, início gradual." },
      { name: "Flutter Atrial 2:1", tip: "Ondas em dente de serra a 300 bpm (atrial)." },
      { name: "TPSV (AVNRT)", tip: "Início súbito, P retrógrada ou invisível." },
      { name: "Taquicardia Atrial", tip: "Onda P com morfologia diferente da sinusal." }
    ]
  },
  {
    pattern: "Elevação do Segmento ST",
    options: [
      { name: "IAM (STEMI)", tip: "Convexo (tombstone), imagem em espelho, evolução temporal." },
      { name: "Pericardite", tip: "Côncavo (sorriso), difuso, infra de PR." },
      { name: "Repolarização Precoce", tip: "Entalhe no ponto J, estável, jovens." },
      { name: "Brugada", tip: "V1-V2, descida em 'sela' ou 'golfinho'." }
    ]
  },
  {
    pattern: "QRS Largo (> 120ms)",
    options: [
      { name: "Bloqueio de Ramo (BRD/BRE)", tip: "Morfologia típica, rítmico." },
      { name: "Taquicardia Ventricular", tip: "Dissociação AV, extrema gravidade." },
      { name: "Hipercalemia", tip: "T apiculada, perda de P, sinusoidal." },
      { name: "Marcapasso", tip: "Presença de espículas elétricas." }
    ]
  }
];

export const CLINICAL_CASES = [
  { id: 1, title: "Dor Torácica Típica", vignette: "Homem, 58 anos, hipertenso e diabético. Queixa-se de dor em aperto no peito com irradiação para o braço esquerdo há 1 hora. Sudorese fria associada.", targetRhythm: 'stemi_ant', options: ['stemi_ant', 'stemi_inf', 'pericarditis', 'nsr'], correct: 'stemi_ant', feedback: "Correto! O ECG mostra supradesnivelamento do segmento ST nas derivações anteriores (V1-V4), indicando um Infarto Agudo do Miocárdio (IAMCSST) de parede anterior." },
  { id: 2, title: "Falta de Ar e Palpitações", vignette: "Mulher, 72 anos. Recorreu ao serviço de urgência por palpitações irregulares e cansaço aos pequenos esforços que iniciaram há 2 dias.", targetRhythm: 'afib', options: ['tachy', 'afib', 'aflutter', 'svt'], correct: 'afib', feedback: "Exato! Fibrilação Atrial. Note a ausência de ondas P organizadas e o ritmo ventricular irregularmente irregular." },
  { id: 3, title: "Síncope sem Aviso", vignette: "Homem, 81 anos. Trazido após desmaio em casa. Refere tonturas frequentes nos últimos dias. Ao exame, pulso muito lento.", targetRhythm: 'bav3', options: ['brady', 'bav1', 'bav2m1', 'bav3'], correct: 'bav3', feedback: "Muito bem. Bloqueio Atrioventricular Total (3º Grau). As ondas P e os complexos QRS batem de forma completamente independente." },
  { id: 4, title: "Palpitações na Jovem", vignette: "Mulher, 24 anos, sem antecedentes. Refere início súbito de coração muito acelerado enquanto bebia café. Sente o coração 'na garganta'.", targetRhythm: 'svt', options: ['tachy', 'svt', 'afib', 'vtach_mono'], correct: 'svt', feedback: "Perfeito! Taquicardia Supraventricular (TSV). Ritmo regular, rápido e com QRS estreito, sem ondas P visíveis." },
  { id: 5, title: "Dor que Piora ao Respirar", vignette: "Homem, 35 anos. Dor no peito há 2 dias que piora ao deitar e ao inspirar fundo. Teve uma infecção viral na semana passada.", targetRhythm: 'pericarditis', options: ['stemi_ant', 'stemi_inf', 'pericarditis', 'nsr'], correct: 'pericarditis', feedback: "Excelente! Pericardite Aguda. O ECG mostra supradesnivelamento de ST difuso (em várias paredes) e infradesnivelamento do intervalo PR." },
  { id: 6, title: "Fraqueza Muscular Extrema", vignette: "Mulher, 60 anos, com doença renal crônica em diálise. Faltou às últimas duas sessões. Apresenta fraqueza nas pernas e formigamento.", targetRhythm: 'hyperkalemia', options: ['hypokalemia', 'hyperkalemia', 'stemi_hyper', 'bav3'], correct: 'hyperkalemia', feedback: "Diagnóstico vital! Hipercalemia. Ondas T apiculadas ('em tenda') e base estreita. Se agravar, o QRS alarga." },
  { id: 7, title: "Dor Epigástrica e Náuseas", vignette: "Homem, 65 anos. Refere 'azia' forte e náuseas há 3 horas, sem alívio com antiácidos. Diabético.", targetRhythm: 'stemi_inf', options: ['stemi_ant', 'stemi_inf', 'nsr', 'bav1'], correct: 'stemi_inf', feedback: "Correto! IAM de Parede Inferior. Supra de ST em DII, DIII e aVF. Sempre suspeite de IAM em diabéticos com sintomas atípicos." },
  { id: 8, title: "Palpitações Regulares", vignette: "Homem, 70 anos, com DPOC. Queixa-se de palpitações rápidas. O pulso é regular a cerca de 150 bpm.", targetRhythm: 'aflutter', options: ['svt', 'afib', 'aflutter', 'tachy'], correct: 'aflutter', feedback: "Isso mesmo! Flutter Atrial. Ondas 'F' em dente de serra, bem visíveis em DII, DIII e aVF." },
  { id: 9, title: "Parada Cardíaca Testemunhada", vignette: "Homem, 55 anos. Caiu inanimado na rua. Iniciada RCP por transeuntes. O monitor do desfibrilador mostra este ritmo.", targetRhythm: 'vfib', options: ['asystole', 'vfib', 'vtach_mono', 'torsades'], correct: 'vfib', feedback: "Ação rápida necessária! Fibrilação Ventricular. Ritmo caótico, sem QRS. Indicação de choque imediato!" },
  { id: 10, title: "DESAFIO: O Jovem Atleta", vignette: "Homem, 19 anos, jogador de futebol. Assintomático, ECG feito em exame de rotina para o clube. Nega desmaios ou histórico familiar de morte súbita.", targetRhythm: 'wpw', options: ['brugada_1', 'wpw', 'hyperkalemia', 'nsr'], correct: 'wpw', feedback: "Desafio superado! Síndrome de Wolff-Parkinson-White (WPW). Note o intervalo PR curto e a onda Delta (empastamento inicial do QRS)." }
];
