import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  RotateCcw,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { PatientRecord, CalculationResult } from '../types/laboratory';

interface ClinicalInterpreterViewProps {
  patient: PatientRecord;
  onAddToReport: (formulaName: string, results: CalculationResult[], interpretation: string, inputsSummary: Record<string, any>) => void;
}

export const ClinicalInterpreterView: React.FC<ClinicalInterpreterViewProps> = ({
  patient,
  onAddToReport
}) => {
  // Clinical panel inputs (stored with safe string/number flexibility)
  const [data, setData] = useState<Record<string, any>>({
    glucose: 110,
    creatinine: 1.1,
    urea: 35,
    sodium: 140,
    potassium: 4.2,
    chloride: 102,
    bicarbonate: 24,
    ph: 7.40,
    pco2: 40,
    ast: 28,
    alt: 32,
    totalCholesterol: 195,
    hdl: 48,
    triglycerides: 150,
    hemoglobin: 14.5,
    leukocytes: 7200,
    platelets: 240,
    albumin: 4.2
  });

  const handleInputChange = (field: string, rawVal: any) => {
    setData(prev => ({
      ...prev,
      [field]: rawVal
    }));
  };

  const getNum = (field: string, defaultFallback = 0): number => {
    const v = data[field];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const normalized = v.trim().replace(',', '.');
      const parsed = parseFloat(normalized);
      return !isNaN(parsed) ? parsed : defaultFallback;
    }
    return defaultFallback;
  };

  // Pre-load clinical cases
  const loadPreset = (preset: string) => {
    switch (preset) {
      case 'cetoacidosis':
        setData({
          glucose: 480,
          creatinine: 2.1,
          urea: 68,
          sodium: 128,
          potassium: 5.6,
          chloride: 94,
          bicarbonate: 10,
          ph: 7.18,
          pco2: 24,
          ast: 45,
          alt: 38,
          totalCholesterol: 240,
          hdl: 38,
          triglycerides: 380,
          hemoglobin: 16.2,
          leukocytes: 14500,
          platelets: 310,
          albumin: 3.8
        });
        break;
      case 'hepatopatia_alcohol':
        setData({
          glucose: 95,
          creatinine: 1.0,
          urea: 28,
          sodium: 134,
          potassium: 3.6,
          chloride: 100,
          bicarbonate: 25,
          ph: 7.42,
          pco2: 39,
          ast: 185,
          alt: 65,
          totalCholesterol: 160,
          hdl: 32,
          triglycerides: 210,
          hemoglobin: 11.2,
          leukocytes: 6100,
          platelets: 115,
          albumin: 2.8
        });
        break;
      case 'anemia_ferropenica':
        setData({
          glucose: 88,
          creatinine: 0.8,
          urea: 24,
          sodium: 141,
          potassium: 4.0,
          chloride: 103,
          bicarbonate: 24,
          ph: 7.41,
          pco2: 40,
          ast: 22,
          alt: 19,
          totalCholesterol: 180,
          hdl: 52,
          triglycerides: 95,
          hemoglobin: 8.4,
          leukocytes: 6800,
          platelets: 420,
          albumin: 4.1
        });
        break;
      case 'erc_avanzada':
        setData({
          glucose: 125,
          creatinine: 4.5,
          urea: 140,
          sodium: 136,
          potassium: 5.8,
          chloride: 104,
          bicarbonate: 16,
          ph: 7.30,
          pco2: 32,
          ast: 26,
          alt: 24,
          totalCholesterol: 230,
          hdl: 36,
          triglycerides: 260,
          hemoglobin: 9.1,
          leukocytes: 7800,
          platelets: 190,
          albumin: 3.4
        });
        break;
      default:
        setData({
          glucose: 90,
          creatinine: 0.9,
          urea: 30,
          sodium: 140,
          potassium: 4.1,
          chloride: 102,
          bicarbonate: 24,
          ph: 7.40,
          pco2: 40,
          ast: 25,
          alt: 28,
          totalCholesterol: 185,
          hdl: 50,
          triglycerides: 120,
          hemoglobin: 14.0,
          leukocytes: 6500,
          platelets: 250,
          albumin: 4.3
        });
    }
  };

  // Perform Multi-organ Diagnosis safely
  const runDiagnosticEngine = () => {
    const findings: { category: string; severity: 'normal' | 'warning' | 'critical'; title: string; description: string }[] = [];

    const sodium = getNum('sodium', 140);
    const chloride = getNum('chloride', 102);
    const bicarbonate = getNum('bicarbonate', 24);
    const albumin = getNum('albumin', 4.0);
    const ph = getNum('ph', 7.40);
    const pco2 = getNum('pco2', 40);
    const glucose = getNum('glucose', 90);
    const creatinine = getNum('creatinine', 1.0);
    const urea = getNum('urea', 30);
    const ast = getNum('ast', 25);
    const alt = getNum('alt', 25);
    const hemoglobin = getNum('hemoglobin', 14.0);
    const platelets = getNum('platelets', 250);
    const potassium = getNum('potassium', 4.0);

    // 1. Ácido-Base & Anion Gap
    const anionGap = Number((sodium - (chloride + bicarbonate)).toFixed(1));
    const agCorr = Number((anionGap + 2.5 * (4.0 - albumin)).toFixed(1));

    if (ph < 7.35) {
      if (bicarbonate < 22) {
        if (agCorr > 12) {
          findings.push({
            category: 'Equilibrio Ácido-Base',
            severity: 'critical',
            title: 'Acidosis Metabólica con Anion Gap Elevado (HAGMA)',
            description: `pH ${ph} con HCO3⁻ ${bicarbonate} mEq/L y Anion Gap Corregido = ${agCorr} mEq/L (> 12). Sugiere acumulación de cetoácidos (CAD), lactato (shock/sepsis), uremia o toxinas.`
          });
        } else {
          findings.push({
            category: 'Equilibrio Ácido-Base',
            severity: 'warning',
            title: 'Acidosis Metabólica Hiperclorémica (Anion Gap Normal)',
            description: `pH ${ph} con Cloro elevado (${chloride} mEq/L) y Anion Gap normal (${agCorr} mEq/L). Sugiere pérdidas gastrointestinales (diarrea) o acidosis tubular renal.`
          });
        }
      } else if (pco2 > 45) {
        findings.push({
          category: 'Equilibrio Ácido-Base',
          severity: 'warning',
          title: 'Acidosis Respiratoria',
          description: `pCO2 elevada (${pco2} mmHg) con pH ${ph}. Retención de CO2 por hipoventilación o EPOC.`
        });
      }
    } else if (ph > 7.45) {
      findings.push({
        category: 'Equilibrio Ácido-Base',
        severity: 'warning',
        title: bicarbonate > 26 ? 'Alcalosis Metabólica' : 'Alcalosis Respiratoria',
        description: `pH ${ph}. Evaluación de volemia y electrólitos requerida.`
      });
    }

    // 2. Glucemia & Sodio
    if (glucose > 180) {
      const naKatz = Number((sodium + 0.016 * (glucose - 100)).toFixed(1));
      findings.push({
        category: 'Metabolismo Glúcido & Electrolitos',
        severity: glucose > 300 ? 'critical' : 'warning',
        title: `Hiperglucemia Marcada (${glucose} mg/dL) con Sodio Corregido = ${naKatz} mEq/L`,
        description: `La hiperglucemia genera un artefacto osmótico de dilución sobre el sodio sérico. Sodio real corregido: ${naKatz} mEq/L.`
      });
    }

    // 3. Función Renal & Uremia
    const bun = Number((urea / 2.14).toFixed(1));
    const bunCrRatio = creatinine > 0 ? Number((bun / creatinine).toFixed(1)) : 0;
    if (creatinine > 1.3) {
      findings.push({
        category: 'Función Renal',
        severity: creatinine > 3.0 ? 'critical' : 'warning',
        title: `Insuficiencia Renal (Creatinina: ${creatinine} mg/dL) | Ratio BUN/Cr: ${bunCrRatio}`,
        description: bunCrRatio > 20 
          ? `Ratio BUN/Cr = ${bunCrRatio} (> 20:1). Sugiere componente Prerrenal / Deshidratación / Hipovolemia.` 
          : `Ratio BUN/Cr = ${bunCrRatio} (< 15:1). Sugiere daño intrínseco parenquimatoso renal (Necrosis Tubular Aguda o ERC establecida).`
      });
    }

    // 4. Perfil Hepático (De Ritis)
    if (ast > 40 || alt > 40) {
      const deRitis = alt > 0 ? Number((ast / alt).toFixed(2)) : 0;
      findings.push({
        category: 'Función Hepática',
        severity: 'warning',
        title: `Elevación de Transaminasas (De Ritis AST/ALT = ${deRitis})`,
        description: deRitis > 2.0 
          ? `Relación AST/ALT de ${deRitis} (> 2.0). Sugestivo de hepatopatía alcohólica o cirrosis (daño mitocondrial).` 
          : `Relación AST/ALT de ${deRitis} (< 1.0). Sugestivo de esteatosis hepática / hígado graso no alcohólico o hepatitis viral.`
      });
    }

    // 5. Hematología
    if (hemoglobin < 12.0) {
      findings.push({
        category: 'Hematología',
        severity: hemoglobin < 8.0 ? 'critical' : 'warning',
        title: `Síndrome Anémico (Hemoglobina: ${hemoglobin} g/dL)`,
        description: platelets > 400 
          ? `Trombocitosis reactiva (${platelets} k/µL) concurrente con anemia, orienta a déficit de hierro (ferropenia).`
          : `Anemia documentada. Correlacionar con constantes corpusculares (VCM, HCM).`
      });
    }

    // 6. Electrolitos críticos
    if (potassium > 5.5) {
      findings.push({
        category: 'Electrolitos Críticos',
        severity: 'critical',
        title: `⚠️ Hiperpotasemia / Hiperkalemia Crítica (K+ = ${potassium} mEq/L)`,
        description: `Riesgo inminente de arritmias ventriculares letales. Solicitar ECG urgente (ondas T picudas, ensanchamiento de QRS) e iniciar gluconato de calcio si hay cambios en el ECG.`
      });
    } else if (potassium < 3.5) {
      findings.push({
        category: 'Electrolitos Críticos',
        severity: 'warning',
        title: `Hipopotasemia / Hipokalemia (K+ = ${potassium} mEq/L)`,
        description: 'Riesgo de debilidad muscular, íleo paralítico y arritmias. Reponer potasio por vía oral o IV.'
      });
    }

    // Default if normal
    if (findings.length === 0) {
      findings.push({
        category: 'Evaluación Global',
        severity: 'normal',
        title: 'Perfil Metabólico y Bioquímico en Rangos de Normalidad',
        description: 'Todos los parámetros ingresados se encuentran dentro de los intervalos biológicos de referencia fisiológicos.'
      });
    }

    return findings;
  };

  const diagnosticFindings = runDiagnosticEngine();

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Intérprete Clínico Multisistémico de Laboratorio
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Motor de correlación patológica que integra simultáneamente el perfil metabólico, renal, hepático, hematológico y gasométrico del paciente.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold mr-1">Casos Tipo:</span>
            <button
              onClick={() => loadPreset('cetoacidosis')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              CAD Diabética
            </button>
            <button
              onClick={() => loadPreset('erc_avanzada')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              Falla Renal
            </button>
            <button
              onClick={() => loadPreset('hepatopatia_alcohol')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              Hepatopatía
            </button>
            <button
              onClick={() => loadPreset('normal')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              Normal
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Entry Left, Instant Multi-System Diagnosis Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Panel de Laboratorio del Paciente
            </h3>
            <span className="text-[11px] text-slate-500">Valores analíticos</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Glucosa (mg/dL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.glucose !== undefined ? data.glucose : ''}
                onChange={(e) => handleInputChange('glucose', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Creatinina (mg/dL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.creatinine !== undefined ? data.creatinine : ''}
                onChange={(e) => handleInputChange('creatinine', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Urea (mg/dL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.urea !== undefined ? data.urea : ''}
                onChange={(e) => handleInputChange('urea', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Sodio Na+ (mEq/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.sodium !== undefined ? data.sodium : ''}
                onChange={(e) => handleInputChange('sodium', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Potasio K+ (mEq/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.potassium !== undefined ? data.potassium : ''}
                onChange={(e) => handleInputChange('potassium', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Cloro Cl- (mEq/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.chloride !== undefined ? data.chloride : ''}
                onChange={(e) => handleInputChange('chloride', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Bicarbonato (mEq/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.bicarbonate !== undefined ? data.bicarbonate : ''}
                onChange={(e) => handleInputChange('bicarbonate', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">pH Arterial</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.ph !== undefined ? data.ph : ''}
                onChange={(e) => handleInputChange('ph', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">pCO2 (mmHg)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.pco2 !== undefined ? data.pco2 : ''}
                onChange={(e) => handleInputChange('pco2', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Albúmina (g/dL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.albumin !== undefined ? data.albumin : ''}
                onChange={(e) => handleInputChange('albumin', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">AST / GOT (UI/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.ast !== undefined ? data.ast : ''}
                onChange={(e) => handleInputChange('ast', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">ALT / GPT (UI/L)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.alt !== undefined ? data.alt : ''}
                onChange={(e) => handleInputChange('alt', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Hemoglobina (g/dL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.hemoglobin !== undefined ? data.hemoglobin : ''}
                onChange={(e) => handleInputChange('hemoglobin', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Plaquetas (k/µL)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={data.platelets !== undefined ? data.platelets : ''}
                onChange={(e) => handleInputChange('platelets', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: Real-time Multi-system Diagnostic Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Diagnósticos e Inferencias Patológicas Automatizadas
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
              {diagnosticFindings.length} hallazgos
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {diagnosticFindings.map((finding, idx) => {
              const isCrit = finding.severity === 'critical';
              const isWarn = finding.severity === 'warning';
              const isNorm = finding.severity === 'normal';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isCrit 
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/50' 
                      : isWarn 
                      ? 'bg-amber-950/25 border-amber-500/40' 
                      : 'bg-slate-950/60 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {finding.category}
                    </span>
                    {isCrit ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Alarma Crítica
                      </span>
                    ) : isWarn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Info className="w-3 h-3" /> Alteración Relevante
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Normal
                      </span>
                    )}
                  </div>

                  <h4 className={`text-sm font-bold ${isCrit ? 'text-rose-200' : isWarn ? 'text-amber-200' : 'text-emerald-200'}`}>
                    {finding.title}
                  </h4>
                  
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {finding.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
