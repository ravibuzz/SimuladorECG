export const bump = (t: number, center: number, width: number, height: number) => {
  const dt = Math.abs(t - center);
  if (dt > width) return 0;
  return height * Math.cos((dt / width) * (Math.PI / 2));
};

export const gauss = (t: number, mu: number, sigma: number, amp: number) => {
    return amp * Math.exp(-0.5 * Math.pow((t - mu) / sigma, 2));
};

export const hermite = (t: number, t0: number, t1: number, y0: number, y1: number, m0: number, m1: number) => {
    let x = (t - t0) / (t1 - t0);
    x = Math.max(0, Math.min(1, x));
    const h00 = 2 * x * x * x - 3 * x * x + 1;
    const h10 = x * x * x - 2 * x * x + x;
    const h01 = -2 * x * x * x + 3 * x * x;
    const h11 = x * x * x - x * x;
    return h00 * y0 + h10 * (t1 - t0) * m0 + h01 * y1 + h11 * (t1 - t0) * m1;
};

export const getSpike = (time: number, center: number) => {
  // Each phase 10ms to ensure it's captured by the 10ms/pixel sampling
  if (time >= center - 20 && time < center - 10) return 1.2;
  if (time >= center - 10 && time < center) return -1.2;
  return 0;
};

export const getIschemicComplex = (tMs: number, qCenter: number, tCenter: number, elevation: number, type: 'happy' | 'sad' | 'strain', rAmp: number = 1.5, qAmp: number = -0.15, sAmp: number = -0.25, tAmpMod: number = 1.0) => {
    // 1. QRS Complex (Depolarization)
    // Using narrow Gaussians for a natural, slightly angled appearance
    const q = gauss(tMs, qCenter - 12, 4, qAmp);
    const r = gauss(tMs, qCenter, 5, rAmp);
    
    let currentSAmp = sAmp;
    if (type === 'sad' || type === 'strain') {
        currentSAmp = 0; // Obliterate S wave in STEMI, Infra ST, and Strain for cleaner J-point
    }
    const s = gauss(tMs, qCenter + 14, 4.5, currentSAmp);
    
    let y = q + r + s;

    // 2. ST-T Complex (Repolarization)
    // Modeled as a continuous superposition of action potentials
    let st_t = 0;

    if (type === 'sad') {
        const fall = 1 - sigmoid(tMs, tCenter + 15, 0.12); 
        
        // Plateau (Reto)
        const jLevel = elevation * 0.4;
        const plateau = jLevel * fall;
        
        // Dome (Morro) - Shifted left to create "morro then reto"
        // For Infra ST (elevation < 0), this naturally becomes a "vale"
        const domeAmp = elevation * 0.8;
        const dome = gauss(tMs, qCenter + 24, 16, domeAmp) * fall;
        
        // Mask to ensure ST segment only appears after QRS
        const stMask = sigmoid(tMs, qCenter + 4, 0.8);
        const stSegment = (plateau + dome) * stMask;
        
        if (elevation > 0) {
            // Smoothly fuse R wave and ST segment using LogSumExp
            // This completely eliminates the "double line" and creates a perfect J-point
            y -= r;
            const k = 12; // Smoothness factor
            const fused = Math.log(Math.exp(k * r) + Math.exp(k * stSegment)) / k;
            
            y += fused;
            st_t = 0; 
        } else {
            // For Infra ST, simply adding the negative ST segment to the QRS works perfectly
            st_t = stSegment;
        }
    } else if (type === 'strain') {
        // Strain (HVE) - Modified to look like Infra ST but with symmetric T wave
        // 1. Use the "Infra ST" base (Vale + Plateau) logic
        const fall = 1 - sigmoid(tMs, tCenter + 15, 0.12); 
        const jLevel = elevation * 0.3; // Base depression
        const plateau = jLevel * fall;
        
        const domeAmp = elevation * 0.3;
        const dome = gauss(tMs, qCenter + 24, 16, domeAmp) * fall; // The "Vale"
        
        const stMask = sigmoid(tMs, qCenter + 4, 0.8);
        const infraBase = (plateau + dome) * stMask;

        // 2. Add a distinct Symmetric Inverted T Wave
        // Centered at tCenter, symmetric (Gaussian)
        const tWave = gauss(tMs, tCenter + 10, 22, elevation * 0.9);

        st_t = infraBase + tWave;
    } else if (type === 'happy') {
        // Pericarditis (Concave / Happy smile)
        const rise = sigmoid(tMs, qCenter + 15, 0.4);
        const fall = 1 - sigmoid(tMs, tCenter + 25, 0.15);
        
        // J-point step (starts higher)
        const jLevel = elevation * 0.5; 
        const jStep = jLevel * rise * fall;
        
        // Concave ST segment (Smile) - using power of 1.5 and a slight dip for a more rounded hammock
        const stProgress = Math.max(0, Math.min(1, (tMs - (qCenter + 15)) / (tCenter - (qCenter + 15))));
        const dip = Math.sin(stProgress * Math.PI) * (elevation * -0.2);
        const smile = (Math.pow(stProgress, 1.5) * (elevation * 0.8) + dip) * fall;
        
        // Distinct, wider (less pointy) T-wave, scaled by tAmpMod
        const tWave = gauss(tMs, tCenter + 5, 30, elevation * 1.0 * tAmpMod) * rise;
        
        st_t = jStep + smile + tWave;
    }

    return y + st_t;
};

export const sigmoid = (t: number, center: number, steepness: number) => {
  return 1 / (1 + Math.exp(-(t - center) * steepness));
};

export const smoothstep = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export const getST = (t: number, tJ: number, tST_end: number, tT_peak: number, elevation: number, type: 'happy' | 'sad') => {
    let st_val = 0;
    if (t >= tJ && t <= tST_end) {
        let m0 = type === 'happy' ? 0.5 * elevation : 3.5 * elevation; 
        let m1 = type === 'happy' ? 0.0 : -2.5 * elevation;  
        let x = (t - tJ) / (tST_end - tJ);
        const h10 = x * x * x - 2 * x * x + x;
        const h01 = -2 * x * x * x + 3 * x * x;
        const h11 = x * x * x - x * x;
        st_val = h10 * m0 + h01 * elevation + h11 * m1;
    } else if (t > tST_end) {
        st_val = elevation;
    }

    let blend_start = tST_end - 10;
    let blend_end = tT_peak + 40;
    if (t > blend_start) {
        let w = smoothstep((t - blend_start) / (blend_end - blend_start));
        st_val = st_val * (1 - w);
    }
    
    return st_val;
};

export const spike = (tMs: number, lastTMs: number, center: number, height: number) => {
  if (lastTMs <= center && tMs > center) return height;
  return 0;
};

export const getAxisVectorValue = (tMs: number, lead: string, axisDeg: number) => {
  const rad = axisDeg * (Math.PI / 180);
  const angles: Record<string, number> = { 'DI': 0, 'DII': 60, 'DIII': 120, 'aVR': -150, 'aVL': -30, 'aVF': 90 };
  const leadRad = angles[lead] * (Math.PI / 180);
  const qRad = rad + Math.PI * 0.7;
  const rRad = rad;
  const sRad = rad - Math.PI * 0.8;
  const pAmp = Math.cos(rad - leadRad) * 0.15;
  const tAmp = Math.cos(rad - leadRad) * 0.3;
  const qAmp = Math.cos(qRad - leadRad) * 0.25;
  const rAmp = Math.cos(rRad - leadRad) * 1.5;
  const sAmp = Math.cos(sRad - leadRad) * 0.4;
  const p = bump(tMs, 100, 35, pAmp);
  const q = bump(tMs, 235, 12, qAmp);
  const rWave = bump(tMs, 250, 16, rAmp);
  const s = bump(tMs, 265, 14, sAmp);
  const t = bump(tMs, 420, 75, tAmp);
  return p + q + rWave + s + t;
};

export const getClinicalECGValue = (
  tMs: number,
  lastTMs: number,
  r: string,
  b: number,
  lead: string,
  absTimeMs: number,
  isPVC: boolean,
  beatIndex: number
) => {
  let y = 0;
  let ann: string | null = null;
  const crossed = (center: number) => lastTMs < center && tMs >= center;
  const isPAC = r === 'pac' && beatIndex % 5 === 3;

  // 1. RITMOS DE PARADA E CAÓTICOS
  if (r === 'vfib') return { y: (Math.sin(tMs / 80) + Math.cos(tMs / 50) + (Math.random() - 0.5)) * 0.4, ann: null };
  if (r === 'vflutter') return { y: Math.sin(tMs / 40) * 1.5, ann: null };
  if (r === 'asystole') return { y: (Math.random() - 0.5) * 0.03, ann: null };

  y += (Math.random() - 0.5) * 0.01;

  const currentRR = b > 0 ? 60000 / b : 1000;
  const scale = currentRR < 450 ? currentRR / 450 : 1.0;

  // 4. LÓGICA DE ONDA P
  let pCenter = 100 * scale;
  let qCenter = 250 * scale;
  let drawQRS = true;
  let drawP = !isPVC && !['afib', 'aflutter', 'svt', 'avnrt', 'junctional', 'pm_ventricular', 'vtach_mono', 'vfib', 'vflutter', 'asystole', 'aivr', 'torsades'].includes(r);

  // 2. FIBRILAÇÃO E FLUTTER ATRIAL
  if (r === 'afib') {
    y += Math.sin(absTimeMs / 25) * 0.04 + Math.sin(absTimeMs / 12) * 0.03 + (Math.random() - 0.5) * 0.02;
  }
  if (r === 'svt' || r === 'avnrt') {
    // SVT usually has no visible P wave or it's buried
    drawP = false;
  }
  if (r === 'avnrt') {
    // Pseudo r' in V1, pseudo S in II
    if (lead === 'V1') {
        y += bump(tMs, qCenter + 25, 12, 0.4);
    } else if (['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
        y -= bump(tMs, qCenter + 25, 12, 0.4);
    }
  }
  if (r === 'aflutter') {
    const fPhase = (absTimeMs % 240) / 240; 
    const sawtooth = -0.15 * Math.sin(fPhase * Math.PI * 2) - 0.075 * Math.sin(fPhase * Math.PI * 4);
    
    let qrsMask = 1.0;
    const distToQRS = Math.abs(tMs - qCenter);
    if (distToQRS < 30) {
        qrsMask = smoothstep(distToQRS / 30);
    }

    if (['II', 'DII', 'DIII', 'aVF'].includes(lead)) y += sawtooth * qrsMask;
    else if (['V1', 'V2'].includes(lead)) y += Math.sin(fPhase * Math.PI * 2) * 0.15 * qrsMask;
    else y += sawtooth * 0.15 * qrsMask;
  }

  // 3. MODULADORES ESPECÍFICOS
  let torsadesModulator = 1.0;
  if (r === 'torsades') {
    torsadesModulator = Math.sin(absTimeMs / 800) * 1.5;
    isPVC = true;
  }

  let pTime = tMs;

  if (r === 'bav1') {
    pCenter = 60 * scale;
    qCenter = 360 * scale; // Prolonged PR interval (~300ms)
  } else if (r === 'bav2m1') {
    pCenter = (100 - ((beatIndex % 4) * 45)) * scale;
    if (beatIndex % 4 === 3) drawQRS = false;
  } else if (r === 'bav2m2') {
    if (beatIndex % 3 === 2) drawQRS = false;
  } else if (r === 'bav2_21') {
    if (beatIndex % 2 === 1) drawQRS = false;
  } else if (r === 'bav_avancado') {
    if (beatIndex % 3 !== 0) drawQRS = false;
  } else if (r === 'bav3') {
    // BAV3: Atrial rhythm is independent and usually faster than ventricular escape
    // Using a non-round period (approx 97 bpm) to ensure it "drifts" and looks dissociated
    const atrialPeriod = 615; 
    pTime = absTimeMs % atrialPeriod;
    pCenter = atrialPeriod / 2; 
    drawP = true;
  } else if (r === 'pac') pCenter = 120 * scale;
  else if (r === 'wpw') pCenter = 170 * scale;
  else if (r === 'lgl') pCenter = 170 * scale;
  else if (r === 'pm_fail_cap') {
    if (beatIndex % 3 === 2) {
      drawP = false;
      drawQRS = false;
    }
  }

  if (drawP) {
    let pAmp = 0.12;
    let pWidth = 45;
    if (r === 'sad' || r === 'cor_pulmonale') { pAmp = 0.35; pWidth = 35; }
    if (r === 'at_focal') {
        // Ectopic focus, e.g., low atrial: inverted in inferior leads
        if (['II', 'DII', 'DIII', 'aVF'].includes(lead)) pAmp = -0.15;
        else if (['aVR'].includes(lead)) pAmp = -0.15; // will become positive due to y -=
        else pAmp = 0.1;
        pWidth = 30; // narrower
    }
    if (r === 'at_multi') {
        const pMorph = Math.sin(beatIndex * 137) * 0.5 + 0.5;
        pAmp = 0.05 + pMorph * 0.15;
        pWidth = 20 + pMorph * 30;
        const pSign = (Math.sin(beatIndex * 97) > 0) ? 1 : -1;
        pAmp *= pSign;
    }
    if (r === 'sae') { 
        if (['II', 'DII'].includes(lead)) {
            // Notched P wave (P Mitrale) typical in DII - widened
            y += bump(pTime, pCenter - 20, 30, 0.15) + bump(pTime, pCenter + 25, 30, 0.15);
            pAmp = 0;
        } else if (['V1'].includes(lead)) {
            // Biphasic P wave in V1 (Morris index)
            y += bump(pTime, pCenter - 15, 20, 0.12) - bump(pTime, pCenter + 20, 25, 0.2);
            pAmp = 0;
        } else {
            // Normal P wave for other leads in SAE
            pAmp = 0.12;
            pWidth = 45;
        }
    }
    if (r === 'sad' || r === 'cor_pulmonale') {
        if (['II', 'DII'].includes(lead)) {
            pAmp = 0.4; // Tall peaked P wave (P Pulmonale)
            pWidth = 35;
        }
    }
    if (r === 'biatrial') {
        if (['II', 'DII'].includes(lead)) {
            // Alargado ainda mais para simular fielmente a imagem (> 3.5 quadradinhos)
            // Primeiro pico (AD) alto e pontiagudo, segundo pico (AE) mais largo e arredondado
            y += bump(pTime, pCenter - 25, 40, 0.4) + bump(pTime, pCenter + 25, 55, 0.25);
            pAmp = 0;
        } else if (['V1'].includes(lead)) {
            // Alargado proporcionalmente em V1
            y += bump(pTime, pCenter - 20, 35, 0.3) - bump(pTime, pCenter + 30, 55, 0.3);
            pAmp = 0;
        }
    }
    
    if (pAmp !== 0) {
        if (['II', 'DII', 'DI', 'aVF', 'V4', 'V5', 'V6'].includes(lead)) y += bump(pTime, pCenter, pWidth, pAmp);
        else if (['aVR'].includes(lead)) y -= bump(pTime, pCenter, pWidth, pAmp);
        else y += bump(pTime, pCenter, 30, 0.08) - bump(pTime, pCenter + 20, 25, 0.05);
    }

    if (crossed(pCenter) && lead === 'II') {
        if (r === 'sad' || r === 'cor_pulmonale') ann = "P Pulmonale";
        else if (r === 'sae') ann = "P Mitrale";
        else if (r === 'biatrial') ann = "P Biatrial";
        else ann = "P";
    }
  }

  // Spike de Marcapasso (Symmetric, Biphasic, Thick line)
  if (['pm_atrial', 'pm_dual'].includes(r)) {
    y += getSpike(tMs, pCenter - 25);
    if (crossed(pCenter - 25)) ann = "Espícula (A)";
  }
  if (['pm_ventricular', 'pm_dual'].includes(r)) {
    y += getSpike(tMs, qCenter - 25);
    if (crossed(qCenter - 25)) ann = "Espícula (V)";
  }

  // 5. LÓGICA DE QRS
  if (drawQRS) {
    if (crossed(qCenter) && lead === 'II') ann = "QRS";
    if (isPVC && r !== 'torsades' && crossed(qCenter)) ann = "Extrassístole Ventricular (EV)";
    if (isPAC && crossed(pCenter)) ann = "Extrassístole Supraventricular (ESV)";
    
    let qrsW = 12;
    let isBRE = ['bre', 'pm_ventricular', 'pm_dual', 'bav3'].includes(r);
    let isBRD = ['brd', 'bifascicular'].includes(r);

    if (isPVC || r === 'vtach_mono' || r === 'torsades' || r === 'aivr') qrsW = 40;
    else if (isBRE || isBRD) qrsW = 45; // Wider QRS for blocks (> 120ms)
    else if (r === 'hyperkalemia' || r === 'tca_tox') qrsW = 25;

    // Ajuste do tempo da onda T baseado na Frequência Cardíaca (encurtamento do QT)
    let tCenter = qCenter + Math.min(200, currentRR * 0.3);
    if (r === 'hypercalcemia' || r === 'short_qt') tCenter = qCenter + 90;
    if (r === 'hypocalcemia' || r === 'long_qt' || r === 'hypokalemia') tCenter = qCenter + 450;

    // Ensure T wave fits within the beat
    if (tCenter > currentRR - 40) {
        tCenter = currentRR - 40;
    }

    if (crossed(tCenter) && lead === 'II') {
        if (!ann) ann = "T";
    }

    const stWidth = tCenter - qCenter;

    // Onda Delta (WPW)
    if (r === 'wpw') {
        if (['aVR', 'V1'].includes(lead)) {
            y -= bump(tMs, qCenter - 15, 25, 0.3);
            if (crossed(qCenter - 15)) ann = "Onda Delta";
        } else {
            y += bump(tMs, qCenter - 15, 25, 0.4);
            if (crossed(qCenter - 15)) ann = "Onda Delta";
        }
    }

    if (isPVC || r.includes('vtach') || r === 'torsades' || r === 'aivr') {
        // VT / PVC Morphology
        let vtPol = 1;
        // Concordance/Discordance based on lead (typical right bundle branch block-like or left bundle-like)
        // Let's make it a typical LBBB-like VT (negative in V1, positive in V6/I/aVL)
        if (['aVR', 'V1', 'V2', 'V3'].includes(lead)) vtPol = -1;
        
        // Torsades modulator oscillates amplitude and polarity
        const mod = torsadesModulator;
        
        // Very wide, rounded QRS (using Gaussian for smoother curves)
        // Scale width based on currentRR to make it continuous at high rates
        const isContinuousVT = ['vtach_mono', 'torsades', 'aivr'].includes(r);
        const vtWidth = isContinuousVT ? currentRR * 0.2 : qrsW * 1.2;
        const tOffset = isContinuousVT ? currentRR * 0.5 : qrsW * 2.5;
        
        const ampMod = isPVC && !isContinuousVT ? 0.8 : 0.6; // Lower amplitude
        y += gauss(tMs, qCenter, vtWidth, 1.5 * vtPol * mod * ampMod);
        
        // Discordant, wide ST-T wave
        y += gauss(tMs, qCenter + tOffset, vtWidth * 1.2, -1.2 * vtPol * mod * ampMod);
        
    } else {
        // Morfologia por Lead
        if (['II', 'DII', 'DIII', 'aVF', 'DI', 'aVL'].includes(lead)) {
            // ST e T
            if (r === 'stemi_inf' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.7, 'sad', 0.9, -0.15, -0.2);
                if (crossed(qCenter + 30)) ann = "Supra ST (Inf)";
            } else if (r === 'stemi_inf' && ['DI', 'aVL'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.4, 'strain', 0.5, -0.15, -0.2);
                if (crossed(qCenter + 30)) ann = "Infra ST (Recíproco)";
            } else if (r === 'stemi_lat' && ['DI', 'aVL'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.7, 'sad', 0.9, -0.15, -0.2);
                if (crossed(qCenter + 30)) ann = "Supra ST (Lat)";
            } else if (r === 'stemi_lat' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.4, 'strain', 0.5, -0.15, -0.2);
                if (crossed(qCenter + 30)) ann = "Infra ST (Recíproco)";
            } else if (r === 'stemi_ant' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.3, 'strain', 0.4, -0.15, -0.2);
                if (crossed(qCenter + 30)) ann = "Infra ST (Recíproco)";
            } else if (r === 'pericarditis' && !['aVR', 'V1'].includes(lead)) {
                const tMod = ['II', 'DII'].includes(lead) ? 0.8 : 0.4;
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.6, 'happy', 1.2, -0.15, -0.2, tMod);
                y -= bump(tMs, pCenter + 40, 30, 0.15); // PR depression
                if (crossed(qCenter + 30)) ann = "Supra ST (Difuso)";
            } else if (r === 'hyperkalemia') {
                y += bump(tMs, qCenter - 15, 20, 0.02); // very flat P
                y += bump(tMs, qCenter, 35, 0.6); // Small wide R
                y -= bump(tMs, qCenter + 25, 35, 0.8); // Wide S
                y += bump(tMs, tCenter, 50, 1.2); // T wave tall and symmetric
                if (crossed(tCenter)) ann = "T em Tenda";
            } else if (r === 'hypokalemia') {
                y += bump(tMs, qCenter, 15, 1.0);
                y += bump(tMs, tCenter, 45, 0.15); // Flat T
                y += bump(tMs, tCenter + 140, 70, 0.25); // Prominent U wave
                if (crossed(tCenter+140)) ann = "Onda U";
            } else if (r === 'hve' && ['DI', 'aVL'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.6, 'strain', 3.0, -0.15, -0.2); // Strain
            } else if ((r === 'hvd' || r === 'cor_pulmonale') && lead === 'DI') {
                // Right Axis Deviation: Small R, Deep S
                y += bump(tMs, qCenter, 12, 0.3); // Small R
                y -= bump(tMs, qCenter + 15, 15, 1.8); // Deep S
                y += bump(tMs, tCenter, 80, 0.2); // Normal T
                if (crossed(qCenter)) ann = "Desvio Eixo Direita (QRS Negativo)";
            } else if ((r === 'hvd' || r === 'cor_pulmonale') && lead === 'aVL') {
                y += bump(tMs, qCenter, 12, 0.5);
                y -= bump(tMs, qCenter + 15, 15, 1.0);
                y += bump(tMs, tCenter, 80, 0.2);
            } else if ((r === 'hvd' || r === 'cor_pulmonale') && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += bump(tMs, qCenter, 15, 2.0); // Tall R
                y += bump(tMs, tCenter, 80, 0.25); // Normal T
                if (lead === 'aVF' && crossed(qCenter)) ann = "QRS Positivo (Eixo Direita)";
            } else if (r === 'biventricular' && ['DI', 'aVL'].includes(lead)) {
                // Right Axis Deviation in BVH
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.4, 'strain', 0.3, -0.1, -1.5);
            } else if (r === 'biventricular' && ['II', 'DIII', 'aVF'].includes(lead)) {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.6, 'strain', 2.0, -0.15, -0.2); // Strain
            } else if (r === 's1q3t3' || r === 'cor_pulmonale') {
                if (lead === 'DI') {
                    y += bump(tMs, qCenter, 12, 0.6); // Small R wave
                    y -= bump(tMs, qCenter + 15, 15, 1.5); // Deep S wave (S1)
                    y += bump(tMs, tCenter, 80, 0.2);
                    if (crossed(qCenter + 15)) ann = "S1";
                } else if (lead === 'DIII') {
                    if (r === 's1q3t3') {
                        y -= bump(tMs, qCenter - 10, 15, 0.8); // Deep Q wave (Q3)
                        y += bump(tMs, qCenter + 10, 15, 0.8); // R wave
                        y -= bump(tMs, tCenter, 60, 0.6); // Inverted T (T3)
                        if (crossed(qCenter - 10)) ann = "Q3T3";
                    } else {
                        y += bump(tMs, qCenter, qrsW, 1.5); // Tall R in inferior leads (RAD)
                        y += bump(tMs, tCenter, 80, 0.2);
                    }
                } else if (lead === 'aVF') {
                    y += bump(tMs, qCenter, qrsW, 1.5); // Tall R (RAD)
                    y += bump(tMs, tCenter, 80, 0.2);
                } else {
                    y += bump(tMs, qCenter, qrsW, 1.0);
                    y += bump(tMs, tCenter, 80, 0.2);
                }
            } else if (r === 'osborn') {
                y -= bump(tMs, qCenter - 12, 8, 0.15);
                y += bump(tMs, qCenter, qrsW, 1.2);
                y -= bump(tMs, qCenter + 15, 10, 0.2);
                y += bump(tMs, qCenter + 25, 15, 0.6); // Osborn J-wave
                y += bump(tMs, tCenter, 80, 0.2);
                if (crossed(qCenter + 25)) ann = "Onda J (Osborn)";
            } else if (r === 'digitalis') {
                y -= bump(tMs, qCenter - 12, 8, 0.15);
                y += bump(tMs, qCenter, qrsW, 1.2);
                y -= bump(tMs, qCenter + 15, 10, 0.2);
                y -= bump(tMs, qCenter + 45, 40, 0.35); // Scooped ST
                y += bump(tMs, tCenter + 10, 60, 0.15); // Biphasic/flat T
                if (crossed(qCenter + 45)) ann = "Pá Digitálica";
            } else if (r === 'stemi_hyper' && ['DI', 'II', 'DII', 'aVF'].includes(lead)) {
                y += bump(tMs, qCenter, qrsW, 1.2);
                y += gauss(tMs, tCenter - 20, 40, 1.2);
                if (crossed(tCenter - 20)) ann = "T Hiperaguda";
            } else if (r === 'ischemia_t' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += bump(tMs, qCenter, qrsW, 1.2);
                y -= gauss(tMs, tCenter, 35, 0.8);
                if (crossed(tCenter)) ann = "T Invertida (Isquemia Inferior)";
            } else if (r === 'stemi_sub' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y -= bump(tMs, qCenter, 25, 1.2); // Pathological Q wave
                y += bump(tMs, qCenter + 15, 15, 0.4); // Small R
                y -= gauss(tMs, tCenter, 40, 0.6); // Inverted T
                if (crossed(qCenter)) ann = "Onda Q Patológica + T Invertida";
            } else if (r === 'stemi_old' && ['DI', 'II', 'DII', 'aVF'].includes(lead)) {
                y -= bump(tMs, qCenter, 25, 1.2); // Pathological Q wave
                y += bump(tMs, qCenter + 15, 15, 0.4); // Small R
                y += bump(tMs, tCenter, 80, 0.25); // Normal T
                if (crossed(qCenter)) ann = "Onda Q Patológica (IAM Antigo)";
            } else if (r === 'sgarbossa' && ['DI', 'aVL'].includes(lead)) {
                y += bump(tMs, qCenter, 30, 1.5); // Broad R
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.8, 'sad', 0, 0, 0); // Concordant STE
                if (crossed(qCenter + 30)) ann = "STE Concordante";
            } else if (isBRE && ['DI', 'aVL'].includes(lead)) {
                y += bump(tMs, qCenter, 45, 0.9); // Broad R
                y += bump(tMs, qCenter + 25, 30, 0.7); // Notched
                y -= bump(tMs, tCenter, 80, 0.4); // Inverted T (discordant)
            } else if (isBRE && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y -= bump(tMs, qCenter, 45, 1.0); // Deep QS
                y += bump(tMs, tCenter, 80, 0.4); // Upright T (discordant)
            } else if (r === 'bifascicular' && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += bump(tMs, qCenter - 10, 10, 0.4); // small r
                y -= bump(tMs, qCenter + 15, 40, 1.4); // Deep S (LAFB)
                y += bump(tMs, tCenter, 80, 0.2);
            } else if (isBRD && ['DI', 'aVL'].includes(lead)) {
                if (r === 'bifascicular') y -= bump(tMs, qCenter - 12, 8, 0.3); // q wave (LAFB)
                y += bump(tMs, qCenter, 15, 1.0); // R wave
                y -= bump(tMs, qCenter + 30, 45, 0.6); // Wide S wave
                y += bump(tMs, tCenter, 80, 0.2); // Upright T
            } else if (isBRD && ['II', 'DII', 'DIII', 'aVF'].includes(lead)) {
                y += bump(tMs, qCenter, 15, 0.8); // R wave
                y -= bump(tMs, qCenter + 30, 45, 0.6); // Wide S wave
                y += bump(tMs, tCenter, 80, 0.2); // Upright T
            } else {
                y -= bump(tMs, qCenter - 12, 8, 0.15); // Small q wave
                y += bump(tMs, qCenter, qrsW, 1.2); // R wave
                y -= bump(tMs, qCenter + 15, 10, 0.2); // Small s wave
                y += bump(tMs, tCenter, 80, 0.25);
            }
        } else if (['aVR'].includes(lead)) {
            if (r === 'pericarditis') {
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.4, 'happy', 0.2, -1.0, -0.2, 0.5);
                y += bump(tMs, pCenter + 40, 30, 0.1); // PR elevation
                if (crossed(qCenter + 30)) ann = "Infra ST (Recíproco)";
            } else if (r === 'tca_tox') {
                y -= bump(tMs, qCenter - 10, 15, 0.4); // initial negative
                y += bump(tMs, qCenter + 15, 25, 0.8); // Terminal tall R wave
                y -= bump(tMs, tCenter, 80, 0.2);
                if (crossed(qCenter + 15)) ann = "R terminal > 3mm";
            } else if (isBRD) {
                y -= bump(tMs, qCenter - 10, 15, 0.8); // initial negative
                y += bump(tMs, qCenter + 20, 25, 0.6); // Terminal R wave
                y -= bump(tMs, tCenter, 80, 0.2);
            } else {
                y -= bump(tMs, qCenter, qrsW, 1.2); // QRS negativo
                y -= bump(tMs, tCenter, 80, 0.25); // T negativa
            }
        } else if (['V1', 'V2', 'V3'].includes(lead)) {
        if (isBRD) {
            y += bump(tMs, qCenter - 15, 15, 0.6); // r
            y -= bump(tMs, qCenter, 15, 0.8); // S
            y += bump(tMs, qCenter + 25, 35, 1.1); // Taller and wider R'
            y -= bump(tMs, tCenter, 60, 0.4); // Inverted T (discordant)
            if (crossed(qCenter+25)) ann = "rsR'";
        } else if (isBRE) {
            y -= bump(tMs, qCenter, 45, 1.0); // Deeper and wider QS
            y += bump(tMs, tCenter, 80, 0.5); // Taller discordant T
        } else {
            if (r === 'stemi_ant') {
                if (lead === 'V3') {
                    y += getIschemicComplex(tMs, qCenter, tCenter, 0.8, 'sad', 0.3, -0.1, -1.2);
                    if (crossed(qCenter + 30)) ann = "Supra ST (Ant)";
                } else {
                    y += getIschemicComplex(tMs, qCenter, tCenter, 0.2, 'sad', 0.1, -0.1, -1.2);
                }
            } else if (r === 'stemi_post') {
                // Tall R wave (reciprocal to posterior Q wave)
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.8, 'sad', 2.0, 0, -0.2);
                if (crossed(qCenter + 30)) ann = "Infra ST (Post)";
            } else if (r === 'hve') {
                if (lead === 'V1' || lead === 'V2') {
                    y += bump(tMs, qCenter - 5, 12, 0.4); // small r
                    y -= bump(tMs, qCenter + 15, 25, 3.5); // Deep S (Sokolow)
                    y += bump(tMs, tCenter, 80, 0.4);
                } else { // V3
                    y += bump(tMs, qCenter - 5, 12, 0.6); // small r
                    y -= bump(tMs, qCenter + 15, 25, 3.0); // Deep S (Cornell)
                    y += bump(tMs, tCenter, 80, 0.4);
                }
            } else if (r === 'hvd' || r === 'cor_pulmonale' || r === 'sad') {
                if (r === 'sad' && lead === 'V1') {
                    y += bump(tMs, qCenter - 5, 10, 0.2); // very small r
                    y -= bump(tMs, qCenter + 10, 20, 0.5); // small S
                    y += bump(tMs, tCenter, 80, 0.1);
                } else if (r === 'sad' && lead === 'V2') {
                    y += bump(tMs, qCenter, 20, 2.0); // abrupt large R
                    y -= bump(tMs, qCenter + 15, 20, 0.5); // S
                    y += bump(tMs, tCenter, 80, 0.2);
                    if (crossed(qCenter)) ann = "Peñaloza-Tranchesi (R V2 > 3x V1: Aumento abrupto da voltagem de V1 para V2)";
                } else if (r !== 'sad' && (lead === 'V1' || lead === 'V2')) {
                    y += getIschemicComplex(tMs, qCenter, tCenter, -0.8, 'strain', 2.0, -0.1, -0.2); // Strain
                } else if (r !== 'sad') {
                    y += bump(tMs, qCenter, qrsW, 1.2);
                    y += bump(tMs, tCenter, 80, 0.15);
                } else {
                    y += bump(tMs, qCenter, qrsW, 1.2);
                    y += bump(tMs, tCenter, 80, 0.15);
                }
            } else if (r === 'biventricular') {
                if (lead === 'V1') {
                    y += bump(tMs, qCenter - 5, 15, 1.5); // Tall R (HVD)
                    y -= bump(tMs, qCenter + 10, 20, 2.0); // Deep S (HVE)
                    y += getIschemicComplex(tMs, qCenter, tCenter, -0.5, 'strain', 0, 0, 0);
                } else if (['V2', 'V3', 'V4'].includes(lead)) {
                    // Katz-Wachtel: Large RS complexes
                    y += bump(tMs, qCenter - 5, 25, 3.5); // Large R
                    y -= bump(tMs, qCenter + 20, 25, 3.5); // Large S
                    y += bump(tMs, tCenter, 80, 0.2);
                    if (crossed(qCenter)) ann = "Sinal de Katz-Wachtel (BVH)";
                } else { // V5, V6
                    y += getIschemicComplex(tMs, qCenter, tCenter, -0.8, 'strain', 3.0, -0.2, -0.2);
                }
            } else if (r === 'pericarditis') {
                if (lead === 'V1') {
                    y += getIschemicComplex(tMs, qCenter, tCenter, -0.3, 'happy', 0.3, -0.1, -1.0, 0.5);
                    y += bump(tMs, pCenter + 40, 30, 0.1); // PR elevation
                } else {
                    const tMod = ['V2', 'V3'].includes(lead) ? 0.4 : 0.8;
                    y += getIschemicComplex(tMs, qCenter, tCenter, 0.6, 'happy', 0.6, -0.1, -0.8, tMod);
                    y -= bump(tMs, pCenter + 40, 30, 0.15); // PR depression
                    if (crossed(qCenter + 30)) ann = "Supra ST (Difuso)";
                }
            } else if (r === 'dewinter') {
                y += bump(tMs, qCenter, 15, 1.0);
                y -= bump(tMs, qCenter + 15, 15, 0.8);
                y -= bump(tMs, qCenter + 30, 20, 0.4); // Upsloping ST depression
                y += gauss(tMs, tCenter, 35, 1.5); // Tall symmetric T wave
                if (crossed(qCenter + 30)) ann = "Padrão De Winter";
            } else if (r === 'sgarbossa') {
                y -= bump(tMs, qCenter, 30, 2.0); // Deep QS
                y += getIschemicComplex(tMs, qCenter, tCenter, 1.5, 'sad', 0, 0, 0); // Excessive discordant STE > 5mm (simulated as 1.5)
                if (crossed(qCenter + 30)) ann = "STE Discordante > 5mm";
            } else {
                // R wave amplitude adjustment
                // "Deixa a onda R do mesmo tamanho da segunda corcova (a maior)" for Type 2
                let rAmp = 0.3;
                if (r === 'brugada_2') rAmp = 1.1; 
                
                y += bump(tMs, qCenter - 10, 10, rAmp); 
                
                if (r === 'brugada_1' || r === 'brugada_2') {
                    // Brugada usually has RBBB-like pattern (rSR') in V1-V2
                    // We reduce the deep S to a small notch to allow the high takeoff of the ST segment (R')
                    y -= bump(tMs, qCenter + 5, 8, 0.3); 
                } else {
                    y -= bump(tMs, qCenter, 15, 1.2); // Normal S wave
                }

                if (r === 'brugada_1') {
                    // Type 1: Coved (Bull Terrier / Dolphin Fin)
                    // "Alargue um pouco mais o dorso do golfinho"
                    
                    // 1. The "Fin" - Starts later to separate from the small r
                    const rise = sigmoid(tMs, qCenter + 25, 0.3);
                    // Wider (85) and lower (1.1)
                    const fin = gauss(tMs, qCenter + 60, 85, 1.1) * rise;
                    
                    // 2. Inverted T wave
                    const invT = -gauss(tMs, tCenter + 30, 45, 0.5);
                    
                    y += fin + invT;
                    
                    if (crossed(qCenter + 15)) ann = "Tipo 1 (Coved)";
                } else if (r === 'brugada_2') {
                    // Type 2: Saddle-back
                    // "Deixa a onda R do mesmo tamanho da segunda corcova"
                    // "Alargue um pouco mais" (interpreted as widening the humps)
                    
                    // 1. R' (First hump) - Shifted right, wider, lower amplitude (0.8 < 1.1)
                    const rPrime = gauss(tMs, qCenter + 35, 25, 0.8);
                    
                    // 2. Saddle (Bridge)
                    const bridgeStart = qCenter + 35;
                    const bridgeEnd = tCenter + 10;
                    const smoothBridge = 0.4 * sigmoid(tMs, bridgeStart, 0.1) * (1 - sigmoid(tMs, bridgeEnd, 0.1));
                    
                    // 3. Upright T wave (Second hump) - Wider, same height as R wave (1.1)
                    const tWave = gauss(tMs, tCenter + 20, 55, 1.1);
                    
                    y += rPrime + smoothBridge + tWave;
                    
                    if (crossed(qCenter + 15)) ann = "Tipo 2 (Saddle)";
                } else if (r !== 'hvd' && r !== 'cor_pulmonale') {
                    y += bump(tMs, tCenter, 80, 0.15);
                }
            }
        }
    } else if (['V4', 'V5', 'V6'].includes(lead)) {
        if (r === 'hve') {
            y += getIschemicComplex(tMs, qCenter, tCenter, -0.8, 'strain', 4.0, -0.2, -0.2); // Strain
        } else if (r === 'hvd' || r === 'cor_pulmonale') {
            y += bump(tMs, qCenter, 12, 0.8); // Small R wave
            y -= bump(tMs, qCenter + 20, 25, 1.5); // Deep S wave
            y += bump(tMs, tCenter, 80, 0.2);
        } else if (r === 'biventricular') {
            if (lead === 'V4') {
                y += bump(tMs, qCenter - 5, 20, 2.5);
                y -= bump(tMs, qCenter + 15, 20, 2.5);
                y += bump(tMs, tCenter, 80, 0.2);
            } else { // V5, V6
                y += getIschemicComplex(tMs, qCenter, tCenter, -0.8, 'strain', 3.0, -0.2, -0.2);
            }
        } else if (r === 'stemi_lat') {
            y += getIschemicComplex(tMs, qCenter, tCenter, 0.6, 'sad', 0.8, -0.2, -0.2);
            if (crossed(qCenter + 30)) ann = "Supra ST (Lat)";
        } else if (r === 'stemi_ant') {
            if (lead === 'V4') {
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.7, 'sad', 0.8, -0.2, -0.2);
                if (crossed(qCenter + 30)) ann = "Supra ST (Ant)";
            } else {
                y += getIschemicComplex(tMs, qCenter, tCenter, 0.1, 'sad', 0.3, -0.2, -0.2);
            }
        } else if (r === 'pericarditis') {
            const tMod = ['V5', 'V6'].includes(lead) ? 0.8 : 0.4;
            y += getIschemicComplex(tMs, qCenter, tCenter, 0.6, 'happy', 1.2, -0.2, -0.2, tMod);
            y -= bump(tMs, pCenter + 40, 30, 0.15); // PR depression
            if (crossed(qCenter + 30)) ann = "Supra ST (Difuso)";
        } else if (r === 'sgarbossa') {
            y += bump(tMs, qCenter, 30, 1.5); // Broad R
            y += getIschemicComplex(tMs, qCenter, tCenter, 0.8, 'sad', 0, 0, 0); // Concordant STE
            if (crossed(qCenter + 30)) ann = "STE Concordante";
        } else if (r === 'osborn') {
            y += bump(tMs, qCenter, 15, 1.2);
            y += bump(tMs, qCenter + 25, 15, 0.6); // Osborn J-wave
            y += bump(tMs, tCenter, 80, 0.2);
            if (crossed(qCenter + 25)) ann = "Onda J (Osborn)";
        } else if (r === 'digitalis') {
            y += bump(tMs, qCenter, 15, 1.2);
            y -= bump(tMs, qCenter + 45, 40, 0.35); // Scooped ST
            y += bump(tMs, tCenter + 10, 60, 0.15);
            if (crossed(qCenter + 45)) ann = "Pá Digitálica";
        } else if (isBRE) {
            y += bump(tMs, qCenter, 45, 0.9); // Broad R
            y += bump(tMs, qCenter + 25, 30, 0.7); // Notched R wave (M shape)
            y -= bump(tMs, tCenter, 80, 0.4); // Inverted T (discordant)
            if (crossed(qCenter + 25)) ann = "Onda R Entalhada";
        } else if (isBRD) {
            y -= bump(tMs, qCenter - 12, 8, 0.2); // q wave
            y += bump(tMs, qCenter, 15, 1.0); // R wave
            y -= bump(tMs, qCenter + 30, 45, 0.6); // Wide S wave
            y += bump(tMs, tCenter, 80, 0.2); // Upright T
        } else {
            y -= bump(tMs, qCenter - 12, 8, 0.2); // Small q wave
            y += bump(tMs, qCenter, 15, 1.2); // Normal R wave
            y -= bump(tMs, qCenter + 15, 10, 0.2); // Small s wave
            y += bump(tMs, tCenter, 80, 0.2);
        }
        } else {
            y += bump(tMs, qCenter, 12, 0.8);
            y += bump(tMs, tCenter, 80, 0.2);
        }
    }
  }

  return { y, ann };
};
