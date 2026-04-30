import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, Loader2, Target, HeartPulse, ExternalLink, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface ECGAnalyzerProps {
  onBack: () => void;
}

interface Diagnosis {
  name: string;
  confidence: number;
  reasoning: string;
}

interface AnalysisResponse {
  diagnoses: Diagnosis[];
  findings: string[];
  rate: string;
}

export default function ECGAnalyzer({ onBack }: ECGAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG).');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG).');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage(evt.target?.result as string);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeECG = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    // MOCK RESPONSE PARA LAYOUT (A API será reintegrada depois)
    try {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulando tempo de rede "fake"
      
      setResults({
        diagnoses: [
          {
            name: "Fibrilação Atrial (Exemplo Simulado)",
            confidence: 94,
            reasoning: "Ausência de ondas P visíveis, associada a resposta ventricular irregular (intervalos RR variáveis). Linha de base com aspecto tremulado."
          },
          {
            name: "Sobrecarga Ventricular Esquerda",
            confidence: 76,
            reasoning: "Amplitude de QRS aumentada (critério de Sokolow-Lyon não fidedigno em uma derivação única, mas sugerido pelo aumento de voltagem)."
          }
        ],
        findings: [
          "Ausência de onda P",
          "Intervalo RR irregular",
          "Complexo QRS estreito (< 120ms)",
          "Eixo elétrico simulado normal"
        ],
        rate: "Aprox. 110 bpm"
      });
      
    } catch (err: any) {
      setError('Erro simulado ao analisar imagem.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-3 shadow-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <HeartPulse className="text-rose-500 w-8 h-8" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Analisador IA de ECG</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Visão Computacional e Reconhecimento de Padrões</p>
          </div>
        </div>
        
        <button 
          onClick={onBack} 
          className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4"/> 
          <span>Voltar ao Simulador</span>
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto w-full">
        <div className="mb-8 text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Análise de ECG por IA</h2>
          <p className="text-slate-600">
            Envie uma foto de um traçado eletrocardiográfico real (12 derivações ou DII longo). 
            Nossa Inteligência Artificial analisará as deflexões, segmentos ST e regularidade 
            para sugerir diagnósticos compatíveis.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
            <span className="font-bold">Aviso:</span> O modelo Gemini foi treinado em bases de dados médicas públicas de ECG.
            Este é um protótipo educacional. Não deve substituir avaliação médica.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Coluna da Imagem */}
          <div className="flex flex-col gap-4">
            <div 
              className={`relative border-2 border-dashed rounded-xl overflow-hidden bg-white min-h-[300px] flex flex-col items-center justify-center transition-colors cursor-pointer group ${selectedImage ? 'border-indigo-400' : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageUpload} 
              />
              
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 group-hover:opacity-90 transition-opacity">
                  <img src={selectedImage} alt="ECG selecionado" className="max-w-full max-h-[400px] object-contain rounded" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                      <ImageIcon className="w-5 h-5" /> Trocar imagem
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 pointer-events-none">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-700 mb-1">Clique ou Arraste o seu ECG</h3>
                  <p className="text-sm text-slate-500">Suporta JPEG, PNG e WEBP</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              disabled={!selectedImage || isAnalyzing}
              onClick={analyzeECG}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Iniciar Análise de Padrões
                </>
              )}
            </button>
          </div>

          {/* Coluna de Resultados */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
              <h3 className="font-bold text-lg border-b pb-3 mb-4 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-indigo-500" />
                Relatório da IA
              </h3>

              {!results && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[250px]">
                  <FileImage className="w-12 h-12 mb-3 opacity-20" />
                  <p>Envie uma imagem e inicie a análise para ver o laudo preliminar.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-500 min-h-[250px] gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-ping absolute opacity-50"></div>
                    <div className="w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin relative z-10"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700 animate-pulse">Lendo derivações...</p>
                    <p className="text-sm text-slate-500">Calculando eixos, intervalos e morfologia da onda P</p>
                  </div>
                </div>
              )}

              {results && !isAnalyzing && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Taxa */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-500">Freq. Estimada:</span>
                    <span className="font-bold text-slate-800">{results.rate}</span>
                  </div>

                  {/* Diagnósticos */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Diagnósticos Compatíveis</h4>
                    <div className="space-y-3">
                      {results.diagnoses.map((diag, idx) => (
                        <div key={idx} className="bg-white border hover:border-indigo-300 transition-colors rounded-lg overflow-hidden relative">
                          <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                          <div className="p-4 pl-5">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-slate-800">{diag.name}</h5>
                              <div className="flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                                {diag.confidence}% Compatibilidade
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{diag.reasoning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achados */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Achados Secundários</h4>
                    <ul className="grid gap-2">
                      {results.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
