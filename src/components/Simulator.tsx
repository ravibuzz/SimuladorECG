import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { 
  Activity, Play, Pause, RefreshCw, HeartPulse, BookOpen, Sliders, 
  Target, Type, Compass, ArrowRight, ArrowLeft, GraduationCap, 
  Info, CheckCircle, Download, Clipboard, Heart, Bookmark, Stethoscope, ListChecks, PenTool, Eraser, Maximize2, Minimize2, X, RotateCw
} from 'lucide-react';
import { RHYTHMS, INFO_CONTENT, getGuidelines, CLINICAL_CASES, DIFFERENTIAL_DIAGNOSIS } from '../constants';
import { getAxisVectorValue, getClinicalECGValue, getSpike } from '../utils/ecgMath';

interface SimulatorProps {
  onBackToTutorial: () => void;
}

const Simulator: React.FC<SimulatorProps> = ({ onBackToTutorial }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const containerRef = useRef<HTMLDivElement>(null); 
  const compassRef = useRef<HTMLDivElement>(null);
  
  const [rhythm, setRhythm] = useState('nsr'); 
  const [bpm, setBpm] = useState(60); 
  const [isPlaying, setIsPlaying] = useState(true); 
  const [theme, setTheme] = useState<'monitor' | 'paper'>('monitor');
  const [activeTab, setActiveTab] = useState('controls'); 
  const [multiLead, setMultiLead] = useState('3');
  const [singleLead, setSingleLead] = useState('DII');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawTool, setDrawTool] = useState<'pen' | 'text' | 'arrow'>('pen');
  
  type DrawingElement = {type: 'path', points: {x:number, y:number}[], color: string, width: number} | {type: 'text', text: string, x: number, y: number, color: string} | {type: 'arrow', start: {x:number, y:number}, end: {x:number, y:number}, color: string, width: number};
  const drawingPathsRef = useRef<DrawingElement[]>([]);
  const currentPathRef = useRef<{x:number, y:number}[] | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [electricAxis, setElectricAxis] = useState(60); 
  const [isDraggingCompass, setIsDraggingCompass] = useState(false);
  const [showAxisHelp, setShowAxisHelp] = useState(false);
  const [showTabReminder, setShowTabReminder] = useState(false);

  const [quizActive, setQuizActive] = useState(false); 
  const [quizTarget, setQuizTarget] = useState('');
  const [quizAnswer, setQuizAnswer] = useState(''); 
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [axisQuizActive, setAxisQuizActive] = useState(false); 
  const [secretAxis, setSecretAxis] = useState(60);
  const [axisQuizFeedback, setAxisQuizFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0); 
  const [caseFeedback, setCaseFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [shockFlash, setShockFlash] = useState(false);

  const isAxisMode = activeTab === 'axis';
  
  let leads = [singleLead];
  if (isAxisMode) leads = ['DI', 'DII', 'DIII', 'aVR', 'aVL', 'aVF'];
  else if (multiLead === '3') leads = ['II', 'V1', 'V6'];
  else if (multiLead === '12') leads = ['DI', 'DII', 'DIII', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'II'];

  const [textPrompt, setTextPrompt] = useState<{x: number, y: number} | null>(null);
  const [textInput, setTextInput] = useState("");
  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showQuizWarning, setShowQuizWarning] = useState(true);
  const [showCaseWarning, setShowCaseWarning] = useState(true);
  const [showHyperWarning, setShowHyperWarning] = useState(true);
  const ecgScreenRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await ecgScreenRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const actualRenderAxis = axisQuizActive ? secretAxis : electricAxis;

  const stateRef = useRef({ rhythm, bpm, isPlaying, leads, showAnnotations, actualRenderAxis, isAxisMode, multiLead, singleLead });
  const dataRef = useRef<{
    points: Record<string, (number | undefined)[]>;
    annotations: Record<string, (string | null)[]>;
    beatTime: (number | undefined)[];
    absTime: (number | undefined)[];
    currentIndex: number;
    timeMs: number;
    lastTime: number;
    currentRR: number;
    beatTimer: number;
    beatIndex: number;
    isNextPVC: boolean;
    canvasWidth: number;
    canvasHeight: number;
    displayedBpm: number;
  }>({
    points: { DI: [], DII: [], DIII: [], aVR: [], aVL: [], aVF: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], II: [] },
    annotations: { DI: [], DII: [], DIII: [], aVR: [], aVL: [], aVF: [], V1: [], V2: [], V3: [], V4: [], V5: [], V6: [], II: [] },
    beatTime: [], absTime: [], currentIndex: 0, timeMs: 0, lastTime: 0, currentRR: 1000,
    beatTimer: 0, beatIndex: 0, isNextPVC: false, canvasWidth: 0, canvasHeight: 0, displayedBpm: 60
  });

  const WIPE_GAP_PX = 40;

  useEffect(() => {
    stateRef.current = { rhythm, bpm, isPlaying, leads, showAnnotations, actualRenderAxis, isAxisMode, multiLead, singleLead };
  }, [rhythm, bpm, isPlaying, leads, showAnnotations, actualRenderAxis, isAxisMode, multiLead, singleLead]);

  const clearScreen = useCallback((clearDrawings = true) => {
    const w = dataRef.current.canvasWidth; 
    if (!w || w <= 0) return;
    dataRef.current.points = { 
      DI: new Array(w).fill(undefined), DII: new Array(w).fill(undefined), DIII: new Array(w).fill(undefined), 
      aVR: new Array(w).fill(undefined), aVL: new Array(w).fill(undefined), aVF: new Array(w).fill(undefined), 
      V1: new Array(w).fill(undefined), V2: new Array(w).fill(undefined), V3: new Array(w).fill(undefined), 
      V4: new Array(w).fill(undefined), V5: new Array(w).fill(undefined), V6: new Array(w).fill(undefined), 
      II: new Array(w).fill(undefined)
    };
    dataRef.current.annotations = {
      DI: new Array(w).fill(null), DII: new Array(w).fill(null), DIII: new Array(w).fill(null), 
      aVR: new Array(w).fill(null), aVL: new Array(w).fill(null), aVF: new Array(w).fill(null), 
      V1: new Array(w).fill(null), V2: new Array(w).fill(null), V3: new Array(w).fill(null), 
      V4: new Array(w).fill(null), V5: new Array(w).fill(null), V6: new Array(w).fill(null), 
      II: new Array(w).fill(null)
    };
    dataRef.current.beatTime = new Array(w).fill(undefined); 
    dataRef.current.absTime = new Array(w).fill(undefined); 
    dataRef.current.currentIndex = 0;
    if (clearDrawings) {
      drawingPathsRef.current = [];
    }
  }, []);

  useLayoutEffect(() => {
    let lastW = 0; let lastH = 0;
    const resizeCanvas = () => {
      const canvas = canvasRef.current; const container = containerRef.current; if (!canvas || !container) return;
      const w = container.clientWidth; 
      let h = container.clientHeight;
      if (isAxisMode) h = Math.max(h, 850); // Increased height for better lead spacing in Axis Mode
      
      if (w === lastW && h === lastH) return; 
      const widthChanged = w !== lastW;
      lastW = w; lastH = h; canvas.width = w; canvas.height = h; dataRef.current.canvasWidth = w; dataRef.current.canvasHeight = h;
      if (widthChanged) clearScreen(false);
    };
    const observer = new ResizeObserver(resizeCanvas); if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', resizeCanvas); 
    resizeCanvas(); // Call immediately
    setTimeout(resizeCanvas, 50); 
    return () => { observer.disconnect(); window.removeEventListener('resize', resizeCanvas); };
  }, [clearScreen, multiLead, isAxisMode, isFullscreen]); 

  const calculateAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!compassRef.current) return electricAxis;
    const rect = compassRef.current.getBoundingClientRect(); 
    const centerX = rect.left + rect.width / 2; 
    const centerY = rect.top + rect.height / 2;
    let deg = Math.round(Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI));
    deg = Math.round(deg / 5) * 5; if (deg === -180) deg = 180; return deg;
  }, [electricAxis]);

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => { 
       if (isDraggingCompass) { 
          const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          setElectricAxis(calculateAngleFromEvent(cX, cY)); 
       } 
    };
    const handlePointerUp = () => setIsDraggingCompass(false);
    
    if (isDraggingCompass) { 
       window.addEventListener('mousemove', handlePointerMove); 
       window.addEventListener('touchmove', handlePointerMove, { passive: false }); 
       window.addEventListener('mouseup', handlePointerUp); 
       window.addEventListener('touchend', handlePointerUp); 
    }
    return () => { 
       window.removeEventListener('mousemove', handlePointerMove); 
       window.removeEventListener('touchmove', handlePointerMove); 
       window.removeEventListener('mouseup', handlePointerUp); 
       window.removeEventListener('touchend', handlePointerUp); 
    };
  }, [isDraggingCompass, calculateAngleFromEvent]);

  useEffect(() => {
     if (activeTab === 'cases') {
        const c = CLINICAL_CASES[currentCaseIndex];
        if (c && RHYTHMS[c.targetRhythm]) {
           setRhythm(c.targetRhythm); setBpm(RHYTHMS[c.targetRhythm].defaultBpm || 70);
           setIsPlaying(true); setMultiLead('3'); setCaseFeedback(null); clearScreen();
        }
     }
  }, [activeTab, currentCaseIndex, clearScreen]);

  const handleRhythmChange = (newRhythm: string) => {
    setRhythm(newRhythm); setIsPlaying(true); setShowAnnotations(false);
    if (RHYTHMS[newRhythm]) setBpm(RHYTHMS[newRhythm].defaultBpm || 60);
    dataRef.current.beatTimer = 0; dataRef.current.currentRR = (RHYTHMS[newRhythm] && (RHYTHMS[newRhythm].defaultBpm || 60) > 0) ? 60000 / (RHYTHMS[newRhythm].defaultBpm || 60) : 1000;
    
    setShowTabReminder(true);
    setTimeout(() => setShowTabReminder(false), 5000);
  };

  const startQuiz = () => {
    const keys = Object.keys(RHYTHMS); const rnd = keys[Math.floor(Math.random() * keys.length)];
    setQuizTarget(rnd); setRhythm(rnd); setBpm(RHYTHMS[rnd].defaultBpm || 60);
    setQuizActive(true); setShowQuizWarning(true); setQuizAnswer(''); setQuizFeedback(null); setIsPlaying(true); clearScreen();
  };

  const checkQuiz = () => {
    if (quizAnswer === quizTarget) setQuizFeedback({ correct: true, text: "Diagnóstico Clínico Impecável!" });
    else setQuizFeedback({ correct: false, text: `Incorreto. A patologia era: ${RHYTHMS[quizTarget] ? RHYTHMS[quizTarget].name : 'Desconhecida'}.` });
  };

  const checkCase = (selectedId: string) => {
     const c = CLINICAL_CASES[currentCaseIndex];
     if (selectedId === c.correct) setCaseFeedback({ correct: true, text: c.feedback });
     else setCaseFeedback({ correct: false, text: `Erro Clínico. A leitura das deflexões não coincide. Tente de novo.` });
  };

  const startAxisQuiz = () => {
     let rndAngle = (Math.floor(Math.random() * 36) - 17) * 10; if (rndAngle === -180) rndAngle = 180;
     setSecretAxis(rndAngle); setAxisQuizActive(true); setAxisQuizFeedback(null); setElectricAxis(0); setIsPlaying(true); clearScreen();
  };

  const checkAxisQuiz = () => {
     const diff = Math.abs(secretAxis - electricAxis); const shortestDiff = diff > 180 ? 360 - diff : diff;
     if (shortestDiff <= 15) setAxisQuizFeedback({ correct: true, text: `Perfeito! O eixo era de ${secretAxis}°. (${electricAxis}° está ótimo).`});
     else if (shortestDiff <= 35) setAxisQuizFeedback({ correct: true, text: `Muito perto! O eixo real era ${secretAxis}°. Aceitável.`});
     else setAxisQuizFeedback({ correct: false, text: `Erro de Vetor! Era ${secretAxis}°. Dica: Procure a derivação isodifásica.`});
     setElectricAxis(secretAxis);
  };

  const handleDownloadECG = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const tempCanvas = document.createElement('canvas'); tempCanvas.width = canvas.width; tempCanvas.height = canvas.height; const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    if (theme === 'monitor') {
      ctx.fillStyle = '#030a03'; ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)'; ctx.lineWidth = 1;
      for(let i=0; i<tempCanvas.width; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,tempCanvas.height); ctx.stroke(); }
      for(let i=0; i<tempCanvas.height; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(tempCanvas.width,i); ctx.stroke(); }
    } else {
      ctx.fillStyle = '#fffafb'; ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'; ctx.lineWidth = 1;
      for(let i=0; i<tempCanvas.width; i+=4) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,tempCanvas.height); ctx.stroke(); }
      for(let i=0; i<tempCanvas.height; i+=4) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(tempCanvas.width,i); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
      for(let i=0; i<tempCanvas.width; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,tempCanvas.height); ctx.stroke(); }
      for(let i=0; i<tempCanvas.height; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(tempCanvas.width,i); ctx.stroke(); }
    }
    ctx.drawImage(canvas, 0, 0); const link = document.createElement('a');
    const safeName = isAxisMode ? `eixo-${actualRenderAxis}g` : (RHYTHMS[rhythm] ? RHYTHMS[rhythm].name.replace(/\s+/g, '-').toLowerCase() : 'tracado');
    link.download = `Holter-${safeName}.png`; link.href = tempCanvas.toDataURL('image/png'); link.click();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (drawTool === 'text') {
      const clickedIdx = drawingPathsRef.current.findIndex(el => el.type === 'text' && Math.abs(el.x - x) < 50 && Math.abs(el.y - y) < 20);
      if (clickedIdx !== -1) {
        setDraggingElement(clickedIdx);
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
      setTextPrompt({ x, y });
      return;
    }
    
    currentPathRef.current = [{x, y}];
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingElement !== null) {
      const el = drawingPathsRef.current[draggingElement];
      if (el.type === 'text') {
        el.x = x;
        el.y = y;
      }
      return;
    }

    if (!currentPathRef.current || drawTool === 'text') return;
    
    if (drawTool === 'arrow') {
      currentPathRef.current[1] = {x, y};
    } else {
      currentPathRef.current.push({x, y});
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingElement !== null) {
      setDraggingElement(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }
    if (!isDrawingMode || !currentPathRef.current || drawTool === 'text') return;
    
    if (drawTool === 'arrow' && currentPathRef.current.length > 1) {
      drawingPathsRef.current.push({
        type: 'arrow',
        start: currentPathRef.current[0],
        end: currentPathRef.current[1],
        color: theme === 'monitor' ? '#ffff00' : '#0000ff',
        width: 2
      });
    } else if (drawTool === 'pen') {
      drawingPathsRef.current.push({
        type: 'path',
        points: [...currentPathRef.current],
        color: theme === 'monitor' ? '#ffff00' : '#0000ff',
        width: 2
      });
    }
    
    currentPathRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const animate = useCallback((timestamp: number) => {
    if (!dataRef.current.lastTime) dataRef.current.lastTime = timestamp;
    let dt = timestamp - dataRef.current.lastTime;
    if (dt > 100) dt = 16; 
    dataRef.current.lastTime = timestamp;

    const { rhythm: r, bpm: b, isPlaying: playing, leads: l, showAnnotations: ann_enabled, actualRenderAxis: axis, isAxisMode: axisM, multiLead: ml, singleLead: sl } = stateRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const d = dataRef.current;

    const isGrid12 = ml === '12' && !axisM;
    const maxCellWidth = 350; // Cap at 3.5 seconds per column
    const cellWidth = isGrid12 ? Math.min(Math.floor(d.canvasWidth / 4), maxCellWidth) : d.canvasWidth;
    const effectiveWidth = isGrid12 ? cellWidth * 4 : d.canvasWidth;

    if (playing && d.canvasWidth > 0 && ctx) {
      const sweepSpeed = 0.1; 
      const pixelsToAdd = dt * sweepSpeed;

      for (let i = 0; i < pixelsToAdd; i++) {
        d.timeMs += (1 / sweepSpeed);
        d.beatTimer += (1 / sweepSpeed);
        let t = d.beatTimer; let lastT = t - (1 / sweepSpeed);

        if (t >= d.currentRR) {
          d.beatIndex++; d.beatTimer = 0; t = 0; lastT = -1; 
          let nextRR = 60000 / b; const bi = d.beatIndex; d.isNextPVC = false;
          
          if (r === 'afib') nextRR *= (0.5 + Math.random() * 1.0);
          else if (r === 'sinus_arr') {
            const respPhase = Math.sin(d.timeMs / 1000 * (2 * Math.PI / 4.5));
            nextRR *= (1 + 0.25 * respPhase);
          }
          else if (r === 'pvc' && bi % 5 === 3) { nextRR *= 0.55; d.isNextPVC = true; } 
          else if (r === 'pvc' && bi % 5 === 4) { nextRR *= 1.45; } 
          else if (r === 'pac' && bi % 5 === 3) { nextRR *= 0.65; } 
          else if (r === 'pac' && bi % 5 === 4) { nextRR *= 1.2; } 
          else if (r === 'bigeminy') { if (bi % 2 === 1) { nextRR *= 0.55; d.isNextPVC = true; } else { nextRR *= 1.45; } }
          else if (r === 'trigeminy') { if (bi % 3 === 0) { nextRR *= 0.55; d.isNextPVC = true; } else if (bi % 3 === 1) { nextRR *= 1.45; } }
          
          d.currentRR = nextRR;
        }

        const idx = Math.floor(d.currentIndex);
        l.forEach(lead => { if (d.annotations[lead]) d.annotations[lead][idx] = null; });
        d.beatTime[idx] = t;
        d.absTime[idx] = d.timeMs;

        if (!axisM) {
            l.forEach(lead => {
                const res = getClinicalECGValue(t, lastT, r, b, lead, d.timeMs, d.isNextPVC, d.beatIndex);
                if (d.points[lead]) d.points[lead][idx] = res.y;
                if (res.ann && d.annotations[lead]) d.annotations[lead][idx] = res.ann;
            });
        } else {
            const scale = d.currentRR < 450 ? d.currentRR / 450 : 1.0;
            const pCenter = 150 * scale;
            const qCenter = 250 * scale;
            
            if (lastT < qCenter && t >= qCenter) {
                if (d.annotations['DI']) d.annotations['DI'][idx] = 'QRS';
            }
            
            // Add spike annotations for Axis Mode
            if (['pm_atrial', 'pm_dual'].includes(r)) {
                if (t >= pCenter - 25 && lastT < pCenter - 25) {
                    if (d.annotations['DI']) d.annotations['DI'][idx] = 'Espícula (A)';
                }
            }
            if (['pm_ventricular', 'pm_dual'].includes(r)) {
                if (t >= qCenter - 15 && lastT < qCenter - 15) {
                    if (d.annotations['DI']) d.annotations['DI'][idx] = 'Espícula (V)';
                }
            }
        }

        d.currentIndex = (d.currentIndex + 1) % effectiveWidth;
      }
    }

    if (d.canvasWidth > 0 && ctx) {
        ctx.clearRect(0, 0, d.canvasWidth, d.canvasHeight);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        
        const currIdx = Math.floor(d.currentIndex);
        const numLeads = l.length;
        
        const rows = isGrid12 ? 4 : numLeads;
        const cols = isGrid12 ? 4 : 1;
        
        const hOffset = isGrid12 ? (d.canvasWidth - (cellWidth * cols)) / 2 : 0;
        const availableHeight = d.canvasHeight - 40;
        const rawCellHeight = availableHeight / rows;
        const isHypertrophy = RHYTHMS[r]?.cat === '11. Sobrecargas e Hipertrofias';
        const maxCellHeight = rows === 1 ? 300 : (axisM ? 220 : (isHypertrophy ? 180 : 140));
        const cellHeight = Math.min(rawCellHeight, maxCellHeight);
        const vOffset = 20 + (availableHeight - (cellHeight * rows)) / 2;
        const gap = WIPE_GAP_PX;

        // Draw calibration pulse (1mV = 10mm = 40px) at the very beginning of the screen
        const drawCalibrationPulse = (startX: number, centerY: number, color: string) => {
          ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(startX + 5, centerY);
          ctx.lineTo(startX + 10, centerY);
          ctx.lineTo(startX + 10, centerY - 40); // 1mV height
          ctx.lineTo(startX + 25, centerY - 40); // 0.2s width
          ctx.lineTo(startX + 25, centerY);
          ctx.lineTo(startX + 30, centerY);
          ctx.stroke();
        };

        const drawnAnnotations = new Set<string>();

        l.forEach((lead, index) => {
          let col = 0;
          let row = index;
          let actualCellWidth = cellWidth;
          
          if (isGrid12) {
            if (index < 12) {
              col = Math.floor(index / 3);
              row = index % 3;
            } else {
              col = 0;
              row = 3;
              actualCellWidth = cellWidth * 4;
            }
          }
          
          const startX = hOffset + (col * cellWidth);
          const topY = vOffset + (row * cellHeight);
          const centerY = topY + (cellHeight / 2);
          
          // Draw cell border for clarity
          if (isGrid12) {
            ctx.strokeStyle = theme === 'monitor' ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(startX, topY, actualCellWidth, cellHeight);
          }
          
          let leadColor = theme === 'monitor' ? '#00ff41' : '#000000';
          if (axisM && theme === 'monitor') {
             const colors = ['#00ff41', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];
             leadColor = colors[index % colors.length];
          } else if (axisM && theme === 'paper') {
             const colors = ['#0f172a', '#1d4ed8', '#6d28d9', '#b91c1c', '#b45309', '#047857'];
             leadColor = colors[index % colors.length];
          }

          ctx.save();
          ctx.beginPath();
          ctx.rect(startX, topY - 15, actualCellWidth, cellHeight + 30);
          ctx.clip();
          
          // Draw lead name background for better visibility
          ctx.fillStyle = theme === 'monitor' ? 'rgba(3, 10, 3, 0.7)' : 'rgba(255, 250, 251, 0.7)';
          ctx.fillRect(startX + 5, topY + 5, 30, 20);
          ctx.fillStyle = leadColor; ctx.font = 'bold 12px sans-serif'; ctx.fillText(lead === 'II' && isGrid12 && index === 12 ? 'DII longa' : lead, startX + 10, topY + 18);
          
          if (currIdx > 40 && col === 0) drawCalibrationPulse(startX, centerY, theme === 'monitor' ? 'rgba(0,255,65,0.3)' : 'rgba(0,0,0,0.2)');

          ctx.strokeStyle = leadColor; ctx.lineWidth = theme === 'monitor' ? (numLeads === 1 ? 2.2 : 2.5) : 1.2; ctx.shadowBlur = theme === 'monitor' ? (numLeads === 1 ? 6 : 10) : 0; ctx.shadowColor = theme === 'monitor' ? leadColor : 'transparent';

          // Standard Calibration: 10mm/mV. Since 4px = 1mm, 1mV = 40px.
          const PIXELS_PER_MV = 40;

          const drawSegment = (start: number, end: number) => {
            ctx.beginPath();
            let started = false;
            for (let i = start; i < end; i++) {
              let valY = 0;

              if (axisM) {
                  const tMs = d.beatTime[i];
                  if (tMs === undefined) continue;
                  const noise = (Math.sin((d.absTime[i] || 0) * 0.05) * 0.005) + (Math.random()-0.5)*0.01;
                  valY = getAxisVectorValue(tMs, lead, axis) + noise;
                  
                  // Add spikes to Axis Mode waveform
                  const scale = d.currentRR < 450 ? d.currentRR / 450 : 1.0;
                  const pCenter = 150 * scale;
                  const qCenter = 250 * scale;
                  if (['pm_atrial', 'pm_dual'].includes(r)) valY += getSpike(tMs, pCenter - 25);
                  if (['pm_ventricular', 'pm_dual'].includes(r)) valY += getSpike(tMs, qCenter - 15);
              } else {
                  if (d.points[lead] === undefined || d.points[lead][i] === undefined || isNaN(d.points[lead][i] as number)) continue;
                  valY = d.points[lead][i] as number;
              }

              const px = startX + (i - (col * cellWidth));
              const py = centerY - (valY * PIXELS_PER_MV);
              
              if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
            }
            ctx.stroke();

            // Draw annotations in a separate pass to avoid breaking the path
            if (!playing && ann_enabled) {
              let lastAnnX = -1000;
              let annYOffset = 0;
              for (let i = start; i < end; i++) {
                const annLead = axisM ? 'DI' : lead;
                if (d.annotations[annLead] && d.annotations[annLead][i]) {
                  const txt = d.annotations[annLead][i] as string;
                  const valY = axisM ? getAxisVectorValue(d.beatTime[i]!, lead, axis) : (d.points[lead][i] as number);
                  const px = startX + (i - (col * cellWidth));
                  const py = centerY - (valY * PIXELS_PER_MV);
                  
                  if (px - lastAnnX < 60) {
                    annYOffset = annYOffset === 0 ? 15 : 0;
                  } else {
                    annYOffset = 0;
                  }
                  
                  if (txt.includes('Peñaloza')) {
                    if (drawnAnnotations.has('Peñaloza')) continue;
                    drawnAnnotations.add('Peñaloza');
                  }
                  
                  lastAnnX = px;

                  ctx.save();
                  const isAlert = txt === 'X' || txt.includes('ES') || txt.includes('Retro') || txt.includes('Junc') || txt.includes('PM') || txt === 'V' || txt.includes('Supra');
                  ctx.fillStyle = isAlert ? '#ef4444' : (theme === 'monitor' ? '#facc15' : '#4338ca');
                  ctx.strokeStyle = ctx.fillStyle;
                  ctx.font = 'bold 11px sans-serif';
                  ctx.shadowBlur = 0;
                  const textWidth = ctx.measureText(txt).width;
                  ctx.fillText(txt, px - textWidth/2, topY + 30 - annYOffset);
                  ctx.beginPath(); ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
                  ctx.moveTo(px, topY + 35 - annYOffset); ctx.lineTo(px, py - 5); ctx.stroke();
                  ctx.setLineDash([]); ctx.beginPath(); ctx.arc(px, py, 2, 0, 2 * Math.PI); ctx.fill();
                  ctx.restore();
                }
              }
            }
          };

          let drawStart = isGrid12 && index < 12 ? col * cellWidth : 0;
          let drawEnd = isGrid12 && index < 12 ? (col + 1) * cellWidth : effectiveWidth;
          
          if (currIdx >= drawStart && currIdx < drawEnd) {
             drawSegment(currIdx + gap, drawEnd);
             drawSegment(drawStart, currIdx);
          } else {
             drawSegment(drawStart, drawEnd);
          }
          
          ctx.restore(); // Remove clip

          if (index > 0) {
             ctx.beginPath(); ctx.strokeStyle = theme === 'monitor' ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.05)';
             ctx.lineWidth = 1; 
             // Vertical line for grid
             if (isGrid12 && index % 3 === 0 && index > 0 && index < 12) {
                ctx.moveTo(startX, vOffset); ctx.lineTo(startX, vOffset + (cellHeight * 3));
             }
             // Horizontal line
             if (isGrid12 && index === 12) {
                ctx.moveTo(hOffset, topY); ctx.lineTo(hOffset + (cellWidth * 4), topY); 
             } else if (!isGrid12 || index % 3 !== 0) {
                ctx.moveTo(startX, topY); ctx.lineTo(startX + actualCellWidth, topY); 
             }
             ctx.stroke();
          }
        });
        
        // Draw user annotations
        drawingPathsRef.current.forEach(element => {
          if (element.type === 'path') {
            if (element.points.length === 0) return;
            ctx.beginPath();
            ctx.strokeStyle = element.color;
            ctx.lineWidth = element.width;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          } else if (element.type === 'text') {
            ctx.fillStyle = element.color;
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(element.text, element.x, element.y);
          } else if (element.type === 'arrow') {
            const dx = element.end.x - element.start.x;
            const dy = element.end.y - element.start.y;
            const angle = Math.atan2(dy, dx);
            const headlen = 10;
            
            ctx.strokeStyle = element.color;
            ctx.lineWidth = element.width;
            ctx.beginPath();
            ctx.moveTo(element.start.x, element.start.y);
            ctx.lineTo(element.end.x, element.end.y);
            ctx.lineTo(element.end.x - headlen * Math.cos(angle - Math.PI / 6), element.end.y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(element.end.x, element.end.y);
            ctx.lineTo(element.end.x - headlen * Math.cos(angle + Math.PI / 6), element.end.y - headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
        });

        if (currentPathRef.current && currentPathRef.current.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = theme === 'monitor' ? '#ffff00' : '#0000ff';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.moveTo(currentPathRef.current[0].x, currentPathRef.current[0].y);
          
          if (drawTool === 'arrow' && currentPathRef.current.length > 1) {
            const end = currentPathRef.current[1];
            const dx = end.x - currentPathRef.current[0].x;
            const dy = end.y - currentPathRef.current[0].y;
            const angle = Math.atan2(dy, dx);
            const headlen = 10;
            ctx.lineTo(end.x, end.y);
            ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
          } else if (drawTool === 'pen') {
            for (let i = 1; i < currentPathRef.current.length; i++) {
              ctx.lineTo(currentPathRef.current[i].x, currentPathRef.current[i].y);
            }
          }
          ctx.stroke();
        }
        
        if (playing && RHYTHMS[r] && RHYTHMS[r].hasBpm) {
            const instBpm = r === 'vfib' || r === 'asystole' ? 0 : (60000 / d.currentRR);
            d.displayedBpm = (d.displayedBpm * 0.9) + (instBpm * 0.1);
            const bpmDisplay = document.getElementById('realtime-bpm');
            if (bpmDisplay) bpmDisplay.innerText = Math.round(d.displayedBpm).toString();
        }
    }
  }, [theme, multiLead]);

  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = (timestamp: number) => {
       animate(timestamp);
       animationFrameId = requestAnimationFrame(renderLoop);
    };
    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [animate]);

  const categories = Array.from(new Set(Object.values(RHYTHMS).map(r => r.cat))).sort((a,b) => a.localeCompare(b));

  const getAxisExplanation = (axis: number) => {
    let classe = ""; let corClasse = "";
    if (axis >= -30 && axis <= 90) { classe = "Eixo Normal"; corClasse = "text-emerald-700 bg-emerald-50 border-emerald-200"; }
    else if (axis > 90 && axis <= 180) { classe = "Desvio à Direita"; corClasse = "text-amber-700 bg-amber-50 border-amber-200"; }
    else if (axis >= -90 && axis < -30) { classe = "Desvio à Esquerda"; corClasse = "text-orange-700 bg-orange-50 border-orange-200"; }
    else { classe = "Desvio Extremo (Noroeste)"; corClasse = "text-red-700 bg-red-50 border-red-200"; }

    const leadsAngles = [{ name: 'DI', angle: 0 }, { name: 'DII', angle: 60 }, { name: 'DIII', angle: 120 }, { name: 'aVR', angle: -150 }, { name: 'aVL', angle: -30 }, { name: 'aVF', angle: 90 }];
    const projections = leadsAngles.map(l => ({ ...l, proj: Math.cos((axis - l.angle) * (Math.PI / 180)), absProj: Math.abs(Math.cos((axis - l.angle) * (Math.PI / 180))) }));

    const maxPos = projections.reduce((prev, curr) => (prev.proj > curr.proj) ? prev : curr);
    const isodiphasic = projections.reduce((prev, curr) => (prev.absProj < curr.absProj) ? prev : curr);
    const maxNeg = projections.reduce((prev, curr) => (prev.proj < curr.proj) ? prev : curr);

    return { classe, corClasse, maxPos, isodiphasic, maxNeg };
  };

  const axisInfo = getAxisExplanation(electricAxis);
  const currentInfo = INFO_CONTENT[rhythm] || { title: RHYTHMS[rhythm]?.name || "Desconhecido", desc: "Informação clínica em atualização.", points: ["Em atualização."] };
  const currentGuidelines = getGuidelines(rhythm) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-hidden">
      {textPrompt && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-80">
            <h3 className="font-bold text-lg mb-2">Adicionar Texto</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Digite sua anotação..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textInput.trim()) {
                  drawingPathsRef.current.push({
                    type: 'text',
                    text: textInput.trim(),
                    x: textPrompt.x,
                    y: textPrompt.y,
                    color: theme === 'monitor' ? '#ffff00' : '#0000ff'
                  });
                  setTextPrompt(null);
                  setTextInput("");
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setTextPrompt(null); setTextInput(""); }}
                className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (textInput.trim()) {
                    drawingPathsRef.current.push({
                      type: 'text',
                      text: textInput.trim(),
                      x: textPrompt.x,
                      y: textPrompt.y,
                      color: theme === 'monitor' ? '#ffff00' : '#0000ff'
                    });
                    setTextPrompt(null);
                    setTextInput("");
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .bg-ecg-paper { background-color: #fffafb; background-image: linear-gradient(rgba(255, 100, 100, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 100, 100, 0.3) 1px, transparent 1px), linear-gradient(rgba(255, 50, 50, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 50, 50, 0.5) 1px, transparent 1px); background-size: 4px 4px, 4px 4px, 20px 20px, 20px 20px; }
        .bg-ecg-monitor { background-color: #030a03; background-image: linear-gradient(rgba(0, 255, 65, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.08) 1px, transparent 1px); background-size: 20px 20px, 20px 20px; }
        .custom-scroll::-webkit-scrollbar { width: 6px; } .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes heartPulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <header className="bg-slate-900 text-white p-2 sm:p-3 shadow-md flex flex-wrap justify-between items-center z-10 gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Activity className="text-rose-500 w-6 h-6 sm:w-8 sm:h-8" />
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-lg font-bold leading-tight">Simulador ECG TT</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Um simulador completo</p>
          </div>
        </div>
        
        <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto no-scrollbar max-w-full">
          <button onClick={onBackToTutorial} className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-colors bg-slate-800 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"><GraduationCap className="w-3 h-3 sm:w-4 sm:h-4"/> <span className="hidden xs:inline">Tutorial</span></button>
          <div className="w-px bg-slate-700 h-6 shrink-0"></div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800 p-0.5 sm:p-1 rounded-lg shrink-0">
            <button onClick={() => setMultiLead('1')} disabled={isAxisMode} className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-colors ${multiLead === '1' && !isAxisMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'} disabled:opacity-50`}>1</button>
            {multiLead === '1' && !isAxisMode && (
              <select 
                value={singleLead} 
                onChange={(e) => setSingleLead(e.target.value)}
                className="bg-slate-700 text-white text-[10px] sm:text-xs font-bold py-1 sm:py-1.5 px-1 sm:px-2 rounded-md outline-none border-none cursor-pointer"
              >
                {['DI', 'DII', 'DIII', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'].map(l => (
                  <option key={l} value={l}>{l.replace('D', '')}</option>
                ))}
              </select>
            )}
            <button onClick={() => setMultiLead('3')} disabled={isAxisMode} className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-colors ${multiLead === '3' && !isAxisMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'} disabled:opacity-50`}>3</button>
            <button onClick={() => setMultiLead('12')} disabled={isAxisMode} className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-colors ${multiLead === '12' && !isAxisMode ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'} disabled:opacity-50`}>12</button>
          </div>
          <div className="w-px bg-slate-700 h-6 hidden sm:block shrink-0"></div>
          <button onClick={() => setTheme('monitor')} className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-colors ${theme === 'monitor' ? 'bg-slate-700 text-green-400' : 'bg-slate-800 text-slate-400 hover:text-white'} shrink-0`}>Monit.</button>
          <button onClick={() => setTheme('paper')} className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-colors ${theme === 'paper' ? 'bg-white text-rose-600' : 'bg-slate-800 text-slate-400 hover:text-white'} shrink-0`}>Papel</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4 w-full mx-auto overflow-hidden">
        <div ref={ecgScreenRef} className={`flex-1 flex flex-col bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden min-h-[250px] sm:min-h-[400px] ${isFullscreen ? 'rounded-none border-none h-full w-full' : ''}`}>
          <div className="px-2 py-1.5 sm:px-4 sm:py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5 sm:gap-2 justify-between items-center z-10 relative shrink-0">
             <div className="flex items-center gap-2 sm:gap-3">
                <HeartPulse className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-700 text-[10px] sm:text-sm hidden xs:block">{isAxisMode ? 'Sistema Hexaxial' : (multiLead === '12' ? 'ECG 12 Deriv.' : 'Monitorização')}</span>
             </div>
             <div className="flex gap-1 sm:gap-2 items-center">
                <button onClick={() => setShowAnnotations(!showAnnotations)} disabled={isPlaying} title={isPlaying ? 'Pause o ecrã para ativar as setas didáticas' : 'Mostrar marcações'} className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border transition-all ${isPlaying ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : (showAnnotations ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-white text-slate-600 border-slate-200')}`}><Type className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{isPlaying ? 'Pausar p/ Setas' : 'Marcações'}</span><span className="sm:hidden">Setas</span></button>
                <div className="w-px bg-slate-200 mx-0.5 sm:mx-1"></div>
                {isDrawingMode && (
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg mr-1 sm:mr-2">
                    <button onClick={() => setDrawTool('pen')} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold rounded ${drawTool === 'pen' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Caneta</button>
                    <button onClick={() => setDrawTool('arrow')} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold rounded ${drawTool === 'arrow' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Seta</button>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setIsDrawingMode(!isDrawingMode);
                  }} 
                  className={`flex items-center gap-1 p-1 sm:p-1.5 px-2 sm:px-3 border rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${isDrawingMode ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  title="Modo Desenho"
                >
                  <PenTool className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Anotar</span>
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-1 p-1 sm:p-1.5 px-2 sm:px-3 border rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${!isPlaying ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                   {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                   <span className="hidden sm:inline">{isPlaying ? 'Pausar' : 'Retomar'}</span>
                </button>
                <button onClick={handleDownloadECG} title="Exportar PNG" className="p-1 sm:p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-100"><Download className="w-3 h-3 sm:w-4 sm:h-4" /></button>
             </div>
          </div>
          
          <div ref={containerRef} className={`flex-1 w-full relative ${isAxisMode ? 'overflow-y-auto' : 'overflow-hidden'} ${theme === 'monitor' ? 'bg-ecg-monitor' : 'bg-ecg-paper'} ${isFullscreen ? 'rounded-none' : ''}`}>
            {shockFlash && <div className="absolute inset-0 bg-white z-50 animate-pulse"></div>}
            <canvas 
              ref={canvasRef} 
              className={`absolute inset-0 block ${isDrawingMode ? 'cursor-crosshair touch-none' : 'pointer-events-none'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            
            {RHYTHMS[rhythm] && RHYTHMS[rhythm].hasBpm && !isAxisMode && !quizActive && (
               <div className={`fixed top-24 right-8 p-3 px-4 rounded-xl border shadow-lg flex items-center gap-3 transition-colors z-20 ${theme === 'monitor' ? 'bg-[#030a03]/90 border-green-500/50' : 'bg-white/95 border-slate-300'}`}>
                  <HeartPulse className="w-6 h-6 text-rose-500" style={{ animation: `heartPulse ${60/bpm}s infinite ease-in-out` }} />
                  <div className="flex flex-col">
                     <span id="realtime-bpm" className={`font-mono font-black text-2xl leading-none ${theme === 'monitor' ? 'text-green-400' : 'text-slate-800'}`}>{Math.round(bpm)}</span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'monitor' ? 'text-green-600' : 'text-slate-400'}`}>BPM</span>
                  </div>
               </div>
            )}
            
            {showTabReminder && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-bounce">
                Explore as abas 'Aula' e 'Conduta' para saber mais sobre este ritmo!
              </div>
            )}

            {quizActive && showQuizWarning && (
               <div className="absolute top-4 left-4 bg-indigo-600/95 backdrop-blur text-white px-4 py-3 rounded-xl shadow-lg border border-indigo-400 animate-bounce z-20 flex items-start gap-3">
                 <div>
                   <div className="flex items-center gap-2 font-bold text-sm"><Target className="w-5 h-5"/> MODO QUIZ ATIVO</div>
                   <div className="text-xs text-indigo-100 mt-1">Analise e responda no painel inferior!</div>
                 </div>
                 <button onClick={() => setShowQuizWarning(false)} className="text-indigo-200 hover:text-white"><X className="w-4 h-4" /></button>
               </div>
            )}
            
            {activeTab === 'cases' && showCaseWarning && (
               <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                 <div className="bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-xl shadow-lg border border-red-500 flex items-center gap-2 font-bold text-sm">
                   <Activity className="w-5 h-5 animate-pulse" /> EMERGÊNCIA MÉDICA! Leia o caso abaixo.
                   <button onClick={() => setShowCaseWarning(false)} className="text-red-200 hover:text-white ml-2"><X className="w-4 h-4" /></button>
                 </div>
               </div>
            )}

            {RHYTHMS[rhythm]?.cat === '11. Sobrecargas e Hipertrofias' && showHyperWarning && !isFullscreen && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-600/95 backdrop-blur text-white px-4 py-3 rounded-xl shadow-lg border border-amber-400 z-20 flex items-start gap-3 animate-in slide-in-from-top-4">
                 <div>
                   <div className="flex items-center gap-2 font-bold text-sm"><Maximize2 className="w-5 h-5"/> DICA DE VISUALIZAÇÃO</div>
                   <div className="text-xs text-amber-100 mt-1">Coloque em tela cheia para ver melhor as ondas grandes!</div>
                 </div>
                 <button onClick={() => setShowHyperWarning(false)} className="text-amber-200 hover:text-white"><X className="w-4 h-4" /></button>
               </div>
            )}

            {showHint && (
              <div className="absolute bottom-4 left-4 z-20 flex items-start gap-2 bg-slate-800/80 backdrop-blur text-slate-100 px-3 py-2 rounded-lg shadow border border-slate-700 max-w-xs">
                 <span className="text-xs font-medium">💡 Dica: Você pode alterar a quantidade de derivações e o tipo de papel (monitor/impresso) a qualquer momento no menu superior direito.</span>
                 <button onClick={() => setShowHint(false)} className="text-slate-400 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
              </div>
            )}

            <button 
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 bg-slate-800/50 hover:bg-slate-700/80 text-white rounded-lg backdrop-blur transition-colors"
              title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Sugestão de Paisagem para Mobile */}
            <div className="absolute bottom-2 right-2 z-20 sm:hidden">
              <div className="bg-slate-800/60 backdrop-blur-sm text-white p-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                <RotateCw className="w-3 h-3 animate-spin-slow" />
                <span className="text-[9px] font-medium">Deite o celular</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] sm:h-[400px] bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden shrink-0">
          
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-0.5 sm:gap-1 p-1 sm:p-1.5 border-b border-slate-200 bg-slate-100 shrink-0">
            <button onClick={() => {setActiveTab('controls'); setQuizActive(false); setAxisQuizActive(false); clearScreen();}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'controls' && !quizActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Sliders className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Ritmos</button>
            <button onClick={() => {setActiveTab('info'); setQuizActive(false); setAxisQuizActive(false); clearScreen();}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'info' && !quizActive ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Aula</button>
            <button onClick={() => {setActiveTab('guidelines'); setQuizActive(false); setAxisQuizActive(false); clearScreen();}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'guidelines' && !quizActive ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Conduta</button>
            <button onClick={() => {setActiveTab('diff_diag'); setQuizActive(false); setAxisQuizActive(false); clearScreen();}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'diff_diag' && !quizActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><ListChecks className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Diferencial</button>
            
            <button onClick={() => {setActiveTab('axis'); setQuizActive(false); clearScreen();}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'axis' && !quizActive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Compass className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Eixo</button>
            <button onClick={() => {setActiveTab('cases'); setQuizActive(false); setAxisQuizActive(false);}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeTab === 'cases' && !quizActive ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Heart className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Casos</button>
            <button onClick={() => {setActiveTab('quiz'); startQuiz(); setAxisQuizActive(false);}} className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${(quizActive && activeTab === 'quiz') ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Target className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Quiz</button>
            <button onClick={onBackToTutorial} className="py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider text-slate-500 hover:bg-slate-200"><GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" /> Tutorial</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto custom-scroll relative bg-slate-50">
            
            {activeTab === 'controls' && !quizActive && (
              <div className="space-y-5 animate-in fade-in pb-10">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-bold text-slate-800">Frequência Base (BPM)</span>
                     <span className="px-3 py-1 bg-slate-900 text-green-400 font-mono font-bold rounded-md">{RHYTHMS[rhythm] && RHYTHMS[rhythm].hasBpm ? Math.round(bpm) : '---'}</span>
                  </div>
                  <input type="range" min="20" max="220" value={bpm} onChange={(e) => {setBpm(Number(e.target.value)); setIsPlaying(true); setShowAnnotations(false);}} disabled={!RHYTHMS[rhythm] || !RHYTHMS[rhythm].hasBpm} className="w-full accent-blue-600" />
                </div>
                <div className="space-y-4">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">{cat.substring(3)}</h4>
                      <div className="grid grid-cols-1 gap-1.5">
                        {Object.values(RHYTHMS).filter(r => r.cat === cat).map(r => (
                          <button key={r.id} onClick={() => handleRhythmChange(r.id)} className={`text-left px-3 py-2.5 rounded-lg text-[13px] border transition-all ${rhythm === r.id ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                            {r.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'axis' && !quizActive && (
              <div className="space-y-4 animate-in fade-in">
                 
                 {!showAxisHelp ? (
                    <div className="flex gap-2">
                       <button onClick={() => {setAxisQuizActive(false); setAxisQuizFeedback(null);}} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${!axisQuizActive ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>Bússola Viva</button>
                       <button onClick={startAxisQuiz} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${axisQuizActive ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}><Target className="w-4 h-4 inline-block mr-1 -mt-0.5" /> Quiz do Eixo</button>
                       <button onClick={() => setShowAxisHelp(true)} className="py-2 px-3 text-xs font-bold rounded-lg border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-sm" title="Aprender a Calcular o Eixo"><Bookmark className="w-4 h-4"/></button>
                    </div>
                 ) : (
                    <div className="bg-blue-600 text-white p-5 rounded-xl shadow-lg animate-in slide-in-from-right-4 relative">
                       <button onClick={() => setShowAxisHelp(false)} className="absolute top-4 right-4 p-1.5 bg-blue-700 hover:bg-blue-800 rounded-full"><ArrowLeft className="w-4 h-4"/></button>
                       <h3 className="font-bold text-lg mb-3">Como calcular o eixo de cabeça?</h3>
                       <div className="space-y-3 text-sm leading-relaxed text-blue-50">
                          <p><b>Passo 1: Quadrantes Mágicos (DI e aVF).</b><br/>Olhe só para estas duas. Se o QRS é POSITIVO (para cima) em DI, o eixo vai para a Esquerda. Se é POSITIVO em aVF, vai para Baixo. Ambas positivas = Eixo Normal (0 a 90°).</p>
                          <p><b>Passo 2: A Derivação Isodifásica.</b><br/>Procure nas 6 frontais o QRS onde o tamanho para cima é IGUAL ao tamanho para baixo (Onda R ≈ S). O vetor elétrico cruza essa derivação a exatos 90 graus perpendiculares!</p>
                          <p><b>Passo 3: Juntar tudo.</b><br/>Se a Isodifásica for aVF (que está nos 90°), o eixo tem que estar a 0° ou a 180°. Como o DI era positivo no Passo 1, a resposta final é 0 graus exatos!</p>
                       </div>
                    </div>
                 )}

                 {!showAxisHelp && (
                    <div className={`p-5 rounded-xl border shadow-sm flex flex-col items-center select-none ${axisQuizActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                       {axisQuizActive ? <h3 className="font-bold text-indigo-900 uppercase text-xs mb-1 text-center">Rode a bússola para o Eixo correto!</h3> : <h3 className="font-bold text-slate-500 uppercase text-xs mb-1">Arraste a Bússola Hexaxial</h3>}
                       
                       <div ref={compassRef} className="relative w-56 h-56 rounded-full border-4 border-slate-200 my-4 flex items-center justify-center bg-slate-50 shadow-inner cursor-pointer touch-none" onPointerDown={(e) => { setIsDraggingCompass(true); const cX = 'touches' in e ? e.touches[0].clientX : e.clientX; const cY = 'touches' in e ? e.touches[0].clientY : e.clientY; setElectricAxis(calculateAngleFromEvent(cX, cY)); }}>
                          <div className="absolute inset-0 pointer-events-none">
                             {[
                               { name: 'DI', angle: 0 },
                               { name: 'DII', angle: 60 },
                               { name: 'aVF', angle: 90 },
                               { name: 'DIII', angle: 120 },
                               { name: 'aVR', angle: -150 },
                               { name: 'aVL', angle: -30 },
                               { name: '±180°', angle: 180 },
                               { name: '-90°', angle: -90 }
                             ].map(lead => (
                               <div key={lead.name} className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center" style={{ transform: `rotate(${lead.angle}deg) translateX(92px) rotate(${-lead.angle}deg)` }}>
                                 <span className="text-[10px] font-bold text-slate-600 bg-slate-50/80 px-1 rounded whitespace-nowrap shadow-sm border border-slate-200/50">
                                    {lead.name === '±180°' || lead.name === '-90°' ? lead.name : `${lead.name} (${lead.angle > 0 ? '+' : ''}${lead.angle}°)`}
                                 </span>
                               </div>
                             ))}
                          </div>
                          <div className="absolute w-full h-px bg-slate-300 pointer-events-none"></div><div className="absolute w-full h-px bg-slate-300 pointer-events-none" style={{ transform: 'rotate(60deg)' }}></div><div className="absolute w-full h-px bg-slate-300 pointer-events-none" style={{ transform: 'rotate(-60deg)' }}></div><div className="absolute h-full w-px bg-slate-300 pointer-events-none"></div><div className="absolute w-full h-px bg-slate-300 pointer-events-none" style={{ transform: 'rotate(30deg)' }}></div><div className="absolute w-full h-px bg-slate-300 pointer-events-none" style={{ transform: 'rotate(-30deg)' }}></div>
                          
                          <div className="absolute w-full h-1.5 bg-transparent origin-center pointer-events-none transition-transform duration-75" style={{ transform: `rotate(${electricAxis}deg)` }}>
                             <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-2.5 rounded-full flex justify-end items-center shadow-md ${axisQuizActive ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                <div className={`w-3.5 h-3.5 rotate-45 border-t-2 border-r-2 translate-x-1 ${axisQuizActive ? 'bg-indigo-700 border-indigo-700' : 'bg-emerald-700 border-emerald-700'}`}></div>
                             </div>
                          </div>
                       </div>
                       <div className={`text-3xl font-mono font-black ${axisQuizActive ? 'text-indigo-800' : 'text-slate-800'}`}>{electricAxis > 0 ? '+' : ''}{electricAxis}°</div>
                    </div>
                 )}

                 {!axisQuizActive && !showAxisHelp ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in">
                       <div className={`p-4 border-b font-bold text-center text-lg ${axisInfo.corClasse}`}>{axisInfo.classe}</div>
                       <div className="p-4 space-y-4">
                          <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">+</div><div><p className="text-sm font-bold text-slate-800">Mais Positiva (Vetor aponta)</p><p className="text-xs text-slate-600">QRS mais alto na derivação <b>{axisInfo.maxPos.name}</b>.</p></div></div>
                          <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold">~</div><div><p className="text-sm font-bold text-slate-800">Isodifásica (R ≈ S)</p><p className="text-xs text-slate-600">A derivação <b>{axisInfo.isodiphasic.name}</b> corta o vetor a 90°.</p></div></div>
                          <div className="flex items-start gap-3"><div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">-</div><div><p className="text-sm font-bold text-slate-800">Mais Negativa (Vetor foge)</p><p className="text-xs text-slate-600">O eixo foge de <b>{axisInfo.maxNeg.name}</b>.</p></div></div>
                       </div>
                    </div>
                 ) : ( axisQuizActive && !showAxisHelp &&
                    <div className="animate-in zoom-in space-y-3">
                       {!axisQuizFeedback ? (
                         <button onClick={checkAxisQuiz} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Confirmar Eixo!</button>
                       ) : (
                         <button onClick={startAxisQuiz} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"><ArrowRight className="w-5 h-5" /> Próximo Eixo</button>
                       )}
                       {axisQuizFeedback && <div className={`p-4 rounded-xl border text-sm font-bold text-center animate-in zoom-in shadow-sm ${axisQuizFeedback.correct ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>{axisQuizFeedback.text}</div>}
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'info' && !quizActive && (
              <div className="space-y-5 animate-in fade-in pb-10">
                 <div className="bg-white border-l-4 border-rose-500 p-5 rounded-r-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-900 text-xl">{currentInfo.title}</h3>
                       <button onClick={() => setActiveTab('guidelines')} className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-md uppercase hover:bg-violet-200 transition-colors">Ver Conduta</button>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{currentInfo.desc}</p>
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Critérios Diagnósticos</h4>
                    {currentInfo.points.map((pt, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-700 bg-white shadow-sm p-4 rounded-xl border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</span>
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'guidelines' && !quizActive && (
              <div className="space-y-5 animate-in fade-in pb-10">
                <div className={`border-l-4 p-5 rounded-r-xl shadow-sm ${getGuidelines(rhythm).urgency === 'high' ? 'bg-red-50 border-red-500' : (getGuidelines(rhythm).urgency === 'medium' ? 'bg-orange-50 border-orange-500' : 'bg-emerald-50 border-emerald-500')}`}>
                   <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className={`w-6 h-6 ${getGuidelines(rhythm).urgency === 'high' ? 'text-red-600' : (getGuidelines(rhythm).urgency === 'medium' ? 'text-orange-600' : 'text-emerald-600')}`} />
                      <h3 className={`font-bold text-lg ${getGuidelines(rhythm).urgency === 'high' ? 'text-red-900' : (getGuidelines(rhythm).urgency === 'medium' ? 'text-orange-900' : 'text-emerald-900')}`}>Conduta Clínica</h3>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getGuidelines(rhythm).urgency === 'high' ? 'bg-red-200 text-red-800' : (getGuidelines(rhythm).urgency === 'medium' ? 'bg-orange-200 text-orange-800' : 'bg-emerald-200 text-emerald-800')}`}>
                        Urgência: {getGuidelines(rhythm).urgency === 'high' ? 'Alta' : (getGuidelines(rhythm).urgency === 'medium' ? 'Média' : 'Baixa')}
                      </span>
                      {getGuidelines(rhythm).benign && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-200 text-blue-800">Padrão Benigno</span>}
                   </div>
                   <p className="text-slate-700 text-sm">Diretrizes recomendadas para <b>{RHYTHMS[rhythm] ? RHYTHMS[rhythm].name : 'Desconhecido'}</b>.</p>
                </div>

                <div className="space-y-3">
                   {getGuidelines(rhythm).steps.map((step, i) => (
                     <div key={i} className="flex gap-3 text-sm text-slate-800 bg-white shadow-sm p-4 rounded-xl border border-slate-200">
                       <CheckCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                       <span className="leading-relaxed font-medium">{step}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'diff_diag' && !quizActive && (
              <div className="space-y-6 animate-in fade-in pb-10">
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl shadow-sm">
                   <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2"><ListChecks className="w-5 h-5"/> Diagnóstico Diferencial</h3>
                   <p className="text-emerald-700 text-xs mt-1">Compare padrões semelhantes para evitar erros diagnósticos.</p>
                </div>
                
                {DIFFERENTIAL_DIAGNOSIS.map((group, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">{group.pattern}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {group.options.map((opt, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors">
                          <p className="font-bold text-slate-800 text-sm">{opt.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{opt.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cases' && !quizActive && (
               <div className="space-y-5 animate-in fade-in pb-10">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
                     <span className="font-bold text-slate-600 text-sm">Caso {currentCaseIndex + 1} de {CLINICAL_CASES.length}</span>
                     <div className="flex gap-2">
                        <button onClick={() => {setCurrentCaseIndex(Math.max(0, currentCaseIndex - 1)); setCaseFeedback(null);}} disabled={currentCaseIndex === 0} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ArrowLeft className="w-5 h-5"/></button>
                        <button onClick={() => {setCurrentCaseIndex(Math.min(CLINICAL_CASES.length - 1, currentCaseIndex + 1)); setCaseFeedback(null);}} disabled={currentCaseIndex === CLINICAL_CASES.length - 1} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ArrowRight className="w-5 h-5"/></button>
                     </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-sm">
                     <h3 className="font-bold text-red-800 text-lg mb-2">{CLINICAL_CASES[currentCaseIndex].title}</h3>
                     <p className="text-red-900 text-sm leading-relaxed">{CLINICAL_CASES[currentCaseIndex].vignette}</p>
                  </div>

                  {!caseFeedback ? (
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-6 mb-4">Qual é o diagnóstico exato?</h4>
                        <div className="grid grid-cols-1 gap-2">
                           {CLINICAL_CASES[currentCaseIndex].options.map(optId => (
                              <button key={optId} onClick={() => checkCase(optId)} className="p-4 text-left bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 font-bold text-slate-700 transition-colors shadow-sm text-sm">
                                 {RHYTHMS[optId] ? RHYTHMS[optId].name : optId}
                              </button>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className={`p-5 rounded-xl border shadow-sm animate-in zoom-in ${caseFeedback.correct ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                        <div className={`font-black text-lg mb-2 flex items-center gap-2 ${caseFeedback.correct ? 'text-green-700' : 'text-orange-700'}`}>
                           {caseFeedback.correct ? <CheckCircle className="w-6 h-6"/> : <Type className="w-6 h-6"/>}
                           {caseFeedback.correct ? 'Correto!' : 'Ops!'}
                        </div>
                        <p className={`text-sm leading-relaxed ${caseFeedback.correct ? 'text-green-900' : 'text-orange-900'}`}>{caseFeedback.text}</p>
                        
                        {caseFeedback.correct && currentCaseIndex < CLINICAL_CASES.length - 1 && (
                           <button onClick={() => {setCurrentCaseIndex(currentCaseIndex + 1); setCaseFeedback(null);}} className="mt-4 w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition-colors">Avançar para o Próximo Caso</button>
                        )}
                        {caseFeedback.correct && currentCaseIndex === CLINICAL_CASES.length - 1 && (
                           <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                             <h4 className="font-bold text-green-800 mb-2">Parabéns! Você concluiu todos os casos!</h4>
                             <p className="text-sm text-green-700 mb-4">Você demonstrou excelente raciocínio clínico.</p>
                             <button onClick={() => {setActiveTab('quiz'); setQuizActive(true);}} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors">Ir para o Quiz Rápido</button>
                           </div>
                        )}
                        {!caseFeedback.correct && (
                           <button onClick={() => setCaseFeedback(null)} className="mt-4 w-full py-3 bg-orange-200 text-orange-800 font-bold rounded-lg shadow-sm hover:bg-orange-300 transition-colors">Tentar Novamente</button>
                        )}
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'quiz' && quizActive && !isAxisMode && (
              <div className="space-y-6 animate-in fade-in pb-10">
                <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl text-center shadow-sm">
                   <Target className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                   <h3 className="font-bold text-indigo-900 text-xl">Quiz Rápido às Cegas</h3>
                   <p className="text-indigo-700 text-sm mt-2">Sem casos, sem dicas. O monitor mostra um ritmo oculto. Consegue adivinhar?</p>
                </div>
                <div className="space-y-3 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                   <label className="text-xs font-bold text-slate-500 uppercase">A sua Hipótese Médica</label>
                   <select value={quizAnswer} onChange={(e) => setQuizAnswer(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold focus:border-indigo-500 text-sm cursor-pointer outline-none">
                      <option value="">-- Selecione o Diagnóstico --</option>
                      {categories.map(cat => (
                         <optgroup key={cat} label={cat.substring(3)}>
                            {Object.values(RHYTHMS).filter(r => r.cat === cat).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                         </optgroup>
                      ))}
                   </select>
                </div>
                <div className="flex gap-3 shrink-0">
                   {!quizFeedback ? (
                     <button onClick={checkQuiz} disabled={!quizAnswer} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-colors">Confirmar</button>
                   ) : (
                     <button onClick={startQuiz} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"><ArrowRight className="w-5 h-5" /> Próximo Quiz</button>
                   )}
                   <button onClick={startQuiz} title="Gerar Novo Paciente" className="py-4 px-5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"><RefreshCw className="w-5 h-5"/></button>
                </div>
                {quizFeedback && (
                  <div className={`p-5 rounded-xl border text-sm font-bold text-center animate-in zoom-in shadow-sm shrink-0 ${quizFeedback.correct ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {quizFeedback.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Simulator;
