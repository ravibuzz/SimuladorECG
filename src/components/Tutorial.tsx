import React, { useState } from 'react';
import { BookOpen, ArrowLeft, ArrowRight, Activity, Heart, Zap, Grid, Ruler, Layers, Search, AlertTriangle, RotateCw } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "O que é o ECG?",
      text: "O eletrocardiograma registra a atividade elétrica do coração ao longo do tempo. Ele não mede a força mecânica, mas sim os vetores elétricos que comandam a contração.",
      highlight: "all",
      icon: <Heart className="w-6 h-6 text-red-400" />,
      details: [
        { label: "Despolarização", value: "Ativação elétrica (contração)" },
        { label: "Repolarização", value: "Recuperação elétrica (relaxamento)" }
      ]
    },
    {
      title: "Sistema de Condução",
      text: "O impulso nasce no Nó Sinusal (SA), viaja pelos átrios, sofre um atraso no Nó AV, e desce rapidamente pelo Feixe de His e Fibras de Purkinje.",
      highlight: "p",
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      details: [
        { label: "Nó Sinusal", value: "Marcapasso natural (60-100 bpm)" },
        { label: "Nó AV", value: "Filtro e atraso fisiológico" }
      ]
    },
    {
      title: "Velocidade e Amplitude",
      text: "O ECG é impresso em papel milimetrado. A calibração padrão é essencial para medições corretas.",
      highlight: "grid",
      icon: <Grid className="w-6 h-6 text-emerald-400" />,
      details: [
        { label: "Velocidade Padrão", value: "25 mm/s (1mm = 40ms)" },
        { label: "Amplitude Padrão", value: "10 mm/mV (1mm = 0.1mV)" }
      ]
    },
    {
      title: "O Pulso de Calibração",
      text: "No início de cada traçado, há um retângulo que indica a calibração da máquina. Ele deve ter 10mm de altura (2 quadradões).",
      highlight: "calpulse",
      icon: <Ruler className="w-6 h-6 text-yellow-400" />,
      details: [
        { label: "Altura", value: "10 mm (1 mV)" },
        { label: "Largura", value: "Geralmente 5 mm (200 ms)" }
      ]
    },
    {
      title: "A Onda P",
      text: "A primeira onda do ciclo. Representa a despolarização (contração) dos átrios, iniciada pelo nó sinusal.",
      highlight: "p",
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      details: [
        { label: "Duração Normal", value: "< 120 ms (3 quadradinhos)" },
        { label: "Amplitude Normal", value: "< 2.5 mm" }
      ]
    },
    {
      title: "O Intervalo PR",
      text: "Mede o tempo desde o início da onda P até o início do QRS. Representa o atraso fisiológico no Nó AV para permitir o enchimento ventricular.",
      highlight: "pr_full",
      icon: <Activity className="w-6 h-6 text-orange-400" />,
      details: [
        { label: "Duração Normal", value: "120 a 200 ms (3 a 5 quadradinhos)" },
        { label: "Patologia", value: "> 200 ms indica Bloqueio AV" }
      ]
    },
    {
      title: "O Complexo QRS",
      text: "A maior onda do ECG. Representa a despolarização rápida e potente dos ventrículos.",
      highlight: "qrs",
      icon: <Zap className="w-6 h-6 text-red-400" />,
      details: [
        { label: "Duração Normal", value: "< 120 ms (3 quadradinhos)" },
        { label: "Morfologia", value: "Q (negativa), R (positiva), S (negativa)" }
      ]
    },
    {
      title: "O Ponto J e Segmento ST",
      text: "O Ponto J é onde o QRS termina e o ST começa. O Segmento ST deve ser plano (isoelétrico). Desníveis aqui indicam isquemia ou infarto.",
      highlight: "st",
      icon: <Activity className="w-6 h-6 text-rose-400" />,
      details: [
        { label: "Ponto J", value: "Junção QRS-ST" },
        { label: "Segmento ST", value: "Pausa antes da repolarização" }
      ]
    },
    {
      title: "A Onda T",
      text: "Representa a repolarização (relaxamento) dos ventrículos. Geralmente é assimétrica e segue a mesma direção do QRS.",
      highlight: "t",
      icon: <Heart className="w-6 h-6 text-purple-400" />,
      details: [
        { label: "Morfologia", value: "Assimétrica (sobe lento, desce rápido)" },
        { label: "Patologia", value: "Invertida ou apiculada (isquemia/potássio)" }
      ]
    },
    {
      title: "O Intervalo QT",
      text: "Mede todo o tempo de atividade ventricular (despolarização + repolarização). Varia de acordo com a frequência cardíaca.",
      highlight: "qt",
      icon: <Ruler className="w-6 h-6 text-pink-400" />,
      details: [
        { label: "Início e Fim", value: "Do início do QRS ao fim da onda T" },
        { label: "Fórmula de Bazett", value: "QTc = QT / √RR (em segundos)" },
        { label: "QT Corrigido (QTc)", value: "Normalmente < 440ms (homens) / < 460ms (mulheres)" }
      ]
    },
    {
      title: "Onda Isodifásica",
      text: "Uma onda isodifásica (ou bifásica) possui uma deflexão positiva e uma negativa de tamanhos semelhantes. A derivação onde o QRS é mais isodifásico é perpendicular ao eixo elétrico do coração.",
      highlight: "qrs",
      icon: <Activity className="w-6 h-6 text-indigo-400" />,
      details: [
        { label: "Eixo Elétrico", value: "A derivação isodifásica é a chave para encontrar o eixo no plano frontal." },
        { label: "Exemplo", value: "Se DIII é isodifásica, o eixo está em +30° (aVR) ou -150°." }
      ]
    },
    {
      title: "Overdrive Suppression",
      text: "A 'supressão por sobrecarga' é o mecanismo pelo qual o marcapasso mais rápido do coração (geralmente o nó sinusal) suprime a atividade de marcapassos subsidiários (mais lentos).",
      highlight: "p",
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      details: [
        { label: "Hierarquia", value: "Nó Sinusal (60-100 bpm) > Nó AV (40-60 bpm) > Fibras de Purkinje (20-40 bpm)." },
        { label: "Importância", value: "Garante que o coração bata em um ritmo único e coordenado." }
      ]
    },
    {
      title: "O Intervalo RR e Frequência",
      text: "A distância entre dois picos R determina a frequência cardíaca e a regularidade do ritmo.",
      highlight: "rr",
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      details: [
        { label: "Regra dos 300", value: "300 ÷ (Nº de quadradões entre R-R)" },
        { label: "Regra dos 1500", value: "1500 ÷ (Nº de quadradinhos entre R-R)" }
      ]
    },
    {
      title: "Derivações e Eixos",
      text: "As 12 derivações funcionam como câmeras posicionadas em diferentes pontos ao redor do coração, permitindo ver a eletricidade em 3D.",
      highlight: "all",
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      details: [
        { label: "Plano Frontal", value: "DI, DII, DIII, aVR, aVL, aVF" },
        { label: "Plano Horizontal", value: "V1 a V6 (Precordiais)" }
      ]
    },
    {
      title: "Ritmo Sinusal Normal",
      text: "Para ser considerado sinusal, o ritmo deve seguir regras estritas de condução.",
      highlight: "p",
      icon: <Heart className="w-6 h-6 text-emerald-400" />,
      details: [
        { label: "Onda P", value: "Positiva em DI, DII, aVF; negativa em aVR" },
        { label: "Frequência", value: "60 a 100 bpm com RR constante" }
      ]
    },
    {
      title: "Artefatos e Erros",
      text: "Ruídos externos podem simular arritmias graves. Sempre verifique o paciente e os cabos.",
      highlight: "none",
      icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
      details: [
        { label: "Tremor Muscular", value: "Simula fibrilação atrial" },
        { label: "Troca de Cabos", value: "Inverte ondas (ex: P negativa em DII)" }
      ]
    }
  ];

  const current = steps[step];

  const getStroke = (part: string) => {
    if (current.highlight === 'all') return '#10b981'; 
    if (current.highlight === part) {
      if (part==='p') return '#3b82f6'; 
      if (part==='pr_full') return '#f59e0b'; 
      if (part==='qrs') return '#ef4444'; 
      if (part==='st' || part==='jpoint') return '#f43f5e'; 
      if (part==='t') return '#8b5cf6'; 
      if (part==='u') return '#06b6d4'; 
      if (part==='qt') return '#ec4899'; 
      if (part==='tp' || part==='rr' || part==='calpulse') return '#10b981';
    }
    return '#475569'; 
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-4 font-sans text-slate-100">
      <div className="max-w-5xl w-full bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col min-h-[500px] sm:min-h-[600px]">
        {/* Header */}
        <div className="bg-slate-800/50 p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700">
              {current.icon}
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Passo {step + 1}</p>
              <h2 className="text-lg sm:text-xl font-black text-white">{current.title}</h2>
            </div>
          </div>
          <div className="text-right hidden xs:block">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Progresso</p>
            <p className="text-sm sm:text-lg font-black text-emerald-400">{step + 1} / {steps.length}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-6 sm:gap-12 items-center overflow-y-auto">
          <div className="flex-1 space-y-6 sm:space-y-8 w-full">
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-medium">
              {current.text}
            </p>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {current.details.map((det, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                  <span className="text-emerald-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">{det.label}</span>
                  <span className="text-white font-bold text-base sm:text-lg">{det.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Aid Placeholder */}
          <div className={`w-full md:w-80 aspect-[4/3] rounded-2xl sm:rounded-3xl border flex items-center justify-center relative overflow-hidden transition-all duration-700 shrink-0 ${current.highlight === 'grid' ? 'scale-105 border-red-400' : 'border-slate-700'}`} style={{ backgroundColor: current.highlight === 'grid' ? '#f87171' : '#1e293b', backgroundImage: current.highlight === 'grid' ? `linear-gradient(rgba(255,100,100,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,100,100,0.4) 1px, transparent 1px), linear-gradient(rgba(255,50,50,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,50,50,0.7) 1px, transparent 1px)` : 'none', backgroundSize: '15px 15px, 15px 15px, 75px 75px, 75px 75px', backgroundPosition: 'center' }}>
             <svg viewBox="0 -20 340 240" className="absolute inset-0 w-full h-full drop-shadow-md">
                 <path d="M 0 100 L 10 100 L 10 60 L 30 60 L 30 100 L 40 100" fill="none" stroke={getStroke('calpulse')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 40 100 C 50 85, 70 85, 80 100" fill="none" stroke={getStroke(current.highlight === 'pr_full' ? 'pr_full' : 'p')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 80 100 L 105 100" fill="none" stroke={getStroke(current.highlight === 'pr_full' ? 'pr_full' : 'pr')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 105 100 L 115 115 L 125 30 L 135 125 L 145 100" fill="none" stroke={getStroke('qrs')} strokeWidth="4" strokeLinejoin="round" />
                 <path d="M 145 100 L 170 100" fill="none" stroke={getStroke('st')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 170 100 C 185 65, 210 65, 220 100" fill="none" stroke={getStroke('t')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 220 100 L 225 100" fill="none" stroke={getStroke('none')} strokeWidth="3" strokeLinecap="round" />
                 <path d="M 225 100 C 235 90, 245 90, 255 100" fill="none" stroke={getStroke('u')} strokeWidth="4" strokeLinecap="round" />
                 <path d="M 255 100 L 320 100" fill="none" stroke={getStroke('tp')} strokeWidth="4" strokeLinecap="round" />
                 
                 {current.highlight === 'st' && ( <g className="animate-in fade-in"><circle cx="145" cy="100" r="5" fill="#f43f5e" stroke="#1e293b" strokeWidth="2" /><text x="145" y="85" fill="#f43f5e" fontSize="12" textAnchor="middle" fontWeight="bold">Ponto J</text><text x="157.5" y="125" fill="#f43f5e" fontSize="13" textAnchor="middle" fontWeight="bold">ST Isoelétrico</text></g> )}
                 {current.highlight === 't' && ( <g className="animate-in fade-in"><path d="M 170 125 L 170 130 L 220 130 L 220 125" fill="none" stroke="#8b5cf6" strokeWidth="2.5" /><text x="195" y="150" fill="#a78bfa" fontSize="13" textAnchor="middle" fontWeight="bold">Repolarização T</text></g> )}
                 {current.highlight === 'rr' && ( <g className="animate-in fade-in"><path d="M 125 20 L 125 10 L 320 10 L 320 20" fill="none" stroke="#10b981" strokeWidth="2.5" /><text x="222.5" y="35" fill="#34d399" fontSize="13" textAnchor="middle" fontWeight="bold">Intervalo RR</text></g> )}
                 {current.highlight === 'qt' && ( <g className="animate-in fade-in"><path d="M 105 150 L 105 155 L 220 155 L 220 150" fill="none" stroke="#ec4899" strokeWidth="2.5" /><text x="162.5" y="175" fill="#f472b6" fontSize="14" textAnchor="middle" fontWeight="bold">Intervalo QT</text></g> )}
             </svg>

             {/* Sugestão de Paisagem para Mobile */}
             <div className="absolute bottom-3 right-3 z-20 sm:hidden">
               <div className="bg-slate-800/80 backdrop-blur-sm text-white p-2 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                 <RotateCw className="w-4 h-4 animate-spin-slow" />
                 <span className="text-[10px] font-bold">Deite o celular</span>
               </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-800/30 border-t border-slate-700 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center w-full">
            <button 
              onClick={() => setStep(Math.max(0, step - 1))} 
              disabled={step === 0}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-0 transition-all text-xs sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Anterior</span>
            </button>

            <div className="flex gap-1 sm:gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-emerald-400 w-4 sm:w-6' : 'bg-slate-700 w-1 sm:w-1.5'}`}
                />
              ))}
            </div>

            {step < steps.length - 1 ? (
              <div className="flex gap-2 sm:gap-4 items-center">
                <button 
                  onClick={onComplete}
                  className="text-slate-400 font-bold hover:text-white transition-colors text-[10px] sm:text-sm hidden xs:block"
                >
                  Pular
                </button>
                <button 
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs sm:text-base"
                >
                  Próximo <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onComplete}
                className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all animate-pulse active:scale-95 text-xs sm:text-base"
              >
                Começar <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          <div className="text-center text-[10px] sm:text-xs text-slate-500 font-medium">
            Desenvolvido por Theo e Thales Báccaro (T7A)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
