import { FormulaDefinition, CalculationResult } from '../../types/laboratory';

export const HEMATOLOGY_CALCULATORS: FormulaDefinition[] = [
  {
    id: 'indices_hematimetricos',
    category: 'hematologia',
    name: 'Hemograma Completo & Índices Hematimétricos (VCM, HCM, CHCM, Mentzer)',
    shortName: 'Hemograma / VCM / HCM / CHCM',
    formulaEquation: 'VCM = (Hto × 10) / GR | HCM = (Hb × 10) / GR | CHCM = (Hb × 100) / Hto | Mentzer = Hto / GR',
    formulaDisplay: 'VCM = (Hto % × 10) / GR (10⁶/µL)\nHCM = (Hb g/dL × 10) / GR (10⁶/µL)\nCHCM = (Hb g/dL × 100) / Hto %\nMentzer = Hto % / GR (10⁶/µL)\nRegla de 3 = Hto ≈ Hb × 3',
    description: 'Resuelve el análisis completo de la serie roja del hemograma: tamaño celular (VCM), contenido de hemoglobina (HCM), concentración celular (CHCM), concordancia biológica (Regla de Tres) e Índice de Mentzer para diagnóstico diferencial.',
    clinicalSignificance: 'Permite la clasificación etiológica y morfológica de las anemias en microcítica (<80 fL), normocítica (80-100 fL) o macrocítica (>100 fL); hipocrómica (<27 pg) o normocrómica. En microcitosis, el índice de Mentzer (<13 vs ≥13) orienta con alta precisión entre Rasgo de Beta-Talasemia y Anemia Ferropénica.',
    tags: ['hemograma', 'hematimetria', 'vcm', 'hcm', 'chcm', 'mentzer', 'anemia', 'eritrocitos', 'hematocrito', 'hemoglobina'],
    inputs: [
      { id: 'hb', name: 'Hemoglobina (Hb)', symbol: 'Hb', unit: 'g/dL', defaultValue: 14.0, min: 2, max: 25, step: 0.1 },
      { id: 'hto', name: 'Hematocrito (Hto)', symbol: 'Hto', unit: '%', defaultValue: 42.0, min: 5, max: 75, step: 0.1 },
      { id: 'gr', name: 'Glóbulos Rojos (Eritrocitos)', symbol: 'GR', unit: '×10⁶/µL (millones/mm³)', defaultValue: 4.80, min: 0.5, max: 10, step: 0.01 },
      { id: 'rdw', name: 'Anisocitosis / RDW-CV (Opcional)', symbol: 'RDW', unit: '%', defaultValue: 13.0, min: 8, max: 35, step: 0.1 }
    ],
    calculate: (inputs) => {
      try {
        const rawHb = inputs.hb;
        const rawHto = inputs.hto;
        const rawGr = inputs.gr;
        const rawRdw = inputs.rdw;

        const hb = typeof rawHb === 'number' ? rawHb : parseFloat(String(rawHb ?? '').replace(',', '.'));
        const hto = typeof rawHto === 'number' ? rawHto : parseFloat(String(rawHto ?? '').replace(',', '.'));
        let gr = typeof rawGr === 'number' ? rawGr : parseFloat(String(rawGr ?? '').replace(',', '.'));
        const rdw = typeof rawRdw === 'number' ? rawRdw : parseFloat(String(rawRdw ?? '').replace(',', '.'));

        const validHb = !isNaN(hb) && hb > 0;
        const validHto = !isNaN(hto) && hto > 0;
        let validGr = !isNaN(gr) && gr > 0;

        // If user is currently typing and both Hb & Hto are valid but GR is pending, estimate GR with Rule of Three so the UI NEVER collapses or blanks out
        let isGrEstimated = false;
        if (validHb && validHto && !validGr) {
          gr = Number(((hto / 3) / 3.0).toFixed(2));
          if (gr <= 0) gr = 4.5;
          validGr = true;
          isGrEstimated = true;
        } else if (validHb && !validHto && !validGr) {
          // If only Hb is typed so far
          return {
            results: [
              { id: 'hb_val', name: 'Hemoglobina ingresada', value: hb, unit: 'g/dL', referenceRange: '12.0 - 16.0 g/dL', status: hb < 12 ? 'low' : hb > 16.5 ? 'high' : 'normal' },
              { id: 'hto_est', name: 'Hematocrito estimado (Regla de 3)', value: Number((hb * 3).toFixed(1)), unit: '% (estimado)', referenceRange: '36.0 - 48.0 %', status: 'normal', statusLabel: 'Estimado' },
              { id: 'gr_est', name: 'Eritrocitos estimados', value: Number((hb / 3).toFixed(2)), unit: '×10⁶/µL (estimado)', referenceRange: '4.0 - 5.5 ×10⁶/µL', status: 'normal', statusLabel: 'Estimado' }
            ],
            interpretation: `Hemoglobina: ${hb} g/dL. Complete los campos de Hematocrito (%) y Glóbulos Rojos (×10⁶/µL) para calcular los índices VCM, HCM, CHCM y Mentzer exactos.`,
            steps: [
              `Hto estimado por Regla de Tres = ${hb} × 3 = ${(hb * 3).toFixed(1)} %`,
              `GR estimado = ${(hb / 3).toFixed(2)} ×10⁶/µL`
            ]
          };
        } else if (!validHb && !validHto && !validGr) {
          return {
            results: [
              { id: 'vcm_def', name: 'Volumen Corpuscular Medio (VCM)', value: 87.5, unit: 'fL', referenceRange: '80.0 - 100.0 fL', status: 'normal', statusLabel: 'Valor de Referencia' },
              { id: 'hcm_def', name: 'Hemoglobina Corpuscular Media (HCM)', value: 29.2, unit: 'pg', referenceRange: '27.0 - 33.0 pg', status: 'normal', statusLabel: 'Valor de Referencia' },
              { id: 'chcm_def', name: 'Concentración de Hb Corpuscular Media (CHCM)', value: 33.3, unit: 'g/dL', referenceRange: '32.0 - 36.0 g/dL', status: 'normal', statusLabel: 'Valor de Referencia' }
            ],
            interpretation: 'Ingrese los valores de Hemoglobina, Hematocrito y Glóbulos Rojos del paciente para calcular los índices en tiempo real.'
          };
        }

        const safeHb = validHb ? hb : (validHto ? Number((hto / 3).toFixed(1)) : 14.0);
        const safeHto = validHto ? hto : (validHb ? Number((hb * 3).toFixed(1)) : 42.0);
        const safeGr = validGr ? gr : 4.80;

        const vcm = Number(((safeHto * 10) / safeGr).toFixed(1));
        const hcm = Number(((safeHb * 10) / safeGr).toFixed(1));
        const chcm = Number(((safeHb * 100) / safeHto).toFixed(1));
        const mentzer = Number((safeHto / safeGr).toFixed(2));
        const expectedHtoFromHb = Number((safeHb * 3).toFixed(1));
        const ruleOfThreeDiff = Number(Math.abs(safeHto - expectedHtoFromHb).toFixed(1));

        let vcmStatus: 'low' | 'normal' | 'high' = 'normal';
        let vcmLabel = 'Normocitosis (80 - 100 fL)';
        if (vcm < 80) { vcmStatus = 'low'; vcmLabel = 'Microcitosis (< 80 fL)'; }
        else if (vcm > 100) { vcmStatus = 'high'; vcmLabel = 'Macrocitosis (> 100 fL)'; }

        let hcmStatus: 'low' | 'normal' | 'high' = 'normal';
        let hcmLabel = 'Normocromía (27 - 33 pg)';
        if (hcm < 27) { hcmStatus = 'low'; hcmLabel = 'Hipocromía (< 27 pg)'; }
        else if (hcm > 33) { hcmStatus = 'high'; hcmLabel = 'Hipercromía (> 33 pg)'; }

        let chcmStatus: 'low' | 'normal' | 'high' = 'normal';
        let chcmLabel = 'Normal (32 - 36 g/dL)';
        if (chcm < 32) { chcmStatus = 'low'; chcmLabel = 'Hipocromía (< 32 g/dL)'; }
        else if (chcm > 36) { chcmStatus = 'high'; chcmLabel = 'Esferocitosis / Crioaglutininas (> 36 g/dL)'; }

        let mentzerNote = '';
        let mentzerDiagnosis = '';
        if (vcm < 80) {
          if (mentzer < 13) {
            mentzerDiagnosis = 'Rasgo de Beta-Talasemia Menor';
            mentzerNote = `\n• Índice de Mentzer = ${mentzer} (< 13): Orienta fuertemente a Rasgo de Beta-Talasemia Menor (microcitosis con abundante número de hematíes).`;
          } else {
            mentzerDiagnosis = 'Anemia Ferropénica';
            mentzerNote = `\n• Índice de Mentzer = ${mentzer} (≥ 13): Orienta fuertemente a Anemia Ferropénica (déficit de hierro).`;
          }
        }

        let ruleOfThreeNote = '';
        if (ruleOfThreeDiff > 3.0) {
          ruleOfThreeNote = `\n• Alerta de Regla de Tres: Hto (${safeHto}%) difiere en ${ruleOfThreeDiff}% del esperado por Hb×3 (${expectedHtoFromHb}%). Descartar crioaglutininas, lipemia o error de pipeteo.`;
        } else {
          ruleOfThreeNote = `\n• Regla de Tres (Hb × 3 ≈ Hto): Cumplida adecuadamente (Hto esperado: ${expectedHtoFromHb}%, concordancia analítica óptima).`;
        }

        let rdwNote = '';
        if (!isNaN(rdw) && rdw > 0) {
          if (rdw > 15.0) {
            rdwNote = `\n• RDW/ADE = ${rdw}% (Elevado): Anisocitosis marcada (población eritrocitaria heterogénea, apoya ferropenia o respuesta a tratamiento).`;
          } else {
            rdwNote = `\n• RDW/ADE = ${rdw}% (Normal): Población eritrocitaria homogénea.`;
          }
        }

        let conclusion = '';
        if (safeHb < 12.0) {
          if (vcm < 80 && hcm < 27) {
            conclusion = `Anemia Microcítica Hipocrómica: Sugiere Anemia Ferropénica, Talasemia Menor o Anemia de Enfermedades Crónicas.${mentzerNote}${rdwNote}${ruleOfThreeNote}`;
          } else if (vcm < 80) {
            conclusion = `Anemia Microcítica Normocrómica.${mentzerNote}${rdwNote}${ruleOfThreeNote}`;
          } else if (vcm > 100) {
            conclusion = `Anemia Macrocítica: Sugiere déficit de Vitamina B12 o Ácido Fólico (Megaloblástica), hepatopatía crónica, hipotiroidismo o reticulocitosis intensa.${rdwNote}${ruleOfThreeNote}`;
          } else {
            conclusion = `Anemia Normocítica Normocrómica: Sugiere anemia de trastornos crónicos, hemorragia aguda, anemia hemolítica o aplasia medular.${rdwNote}${ruleOfThreeNote}`;
          }
        } else if (vcm < 80) {
          conclusion = `Microcitosis sin Anemia manifiesta: Rasgo talasémico o ferropenia incipiente latente.${mentzerNote}${rdwNote}${ruleOfThreeNote}`;
        } else if (vcm > 100) {
          conclusion = `Macrocitosis sin Anemia: Consumo de alcohol, tabaquismo, hipotiroidismo o efecto farmacológico (hidroxiurea, antirretrovirales).${rdwNote}${ruleOfThreeNote}`;
        } else {
          conclusion = `Índices de Serie Roja dentro de rangos normales de referencia biológica.${ruleOfThreeNote}${rdwNote}`;
        }

        if (isGrEstimated) {
          conclusion = `[Nota: Glóbulos rojos estimados provisionalmente a ${gr} ×10⁶/µL mientras ingresa el recuento exacto]\n` + conclusion;
        }

        const results: CalculationResult[] = [
          { id: 'vcm', name: 'Volumen Corpuscular Medio (VCM)', value: vcm, unit: 'fL', referenceRange: '80.0 - 100.0 fL', status: vcmStatus, statusLabel: vcmLabel },
          { id: 'hcm', name: 'Hemoglobina Corpuscular Media (HCM)', value: hcm, unit: 'pg', referenceRange: '27.0 - 33.0 pg', status: hcmStatus, statusLabel: hcmLabel },
          { id: 'chcm', name: 'Concentración de Hb Corpuscular Media (CHCM)', value: chcm, unit: 'g/dL', referenceRange: '32.0 - 36.0 g/dL', status: chcmStatus, statusLabel: chcmLabel }
        ];

        if (vcm < 80) {
          results.push({
            id: 'mentzer',
            name: 'Índice de Mentzer (Hto/GR)',
            value: mentzer,
            unit: 'índice',
            referenceRange: '< 13: Talasemia | ≥ 13: Ferropenia',
            status: mentzer < 13 ? 'normal' : 'low',
            statusLabel: mentzerDiagnosis || (mentzer < 13 ? 'Probable Talasemia (< 13)' : 'Probable Ferropenia (≥ 13)')
          });
        }

        results.push({
          id: 'rule3',
          name: 'Concordancia Regla de Tres (Hb×3)',
          value: expectedHtoFromHb,
          unit: '% esperado',
          referenceRange: `${safeHto - 3}% - ${safeHto + 3}%`,
          status: ruleOfThreeDiff <= 3.0 ? 'normal' : 'high',
          statusLabel: ruleOfThreeDiff <= 3.0 ? 'Concordante (±3%)' : `Discrepancia ${ruleOfThreeDiff}%`
        });

        const steps = [
          `VCM = (${safeHto} % × 10) / ${safeGr} = ${vcm} fL`,
          `HCM = (${safeHb} g/dL × 10) / ${safeGr} = ${hcm} pg`,
          `CHCM = (${safeHb} g/dL × 100) / ${safeHto} % = ${chcm} g/dL`,
          `Regla de 3 = ${safeHb} g/dL × 3 = ${expectedHtoFromHb} % (Hto observado: ${safeHto} %)`
        ];

        if (vcm < 80) {
          steps.push(`Índice de Mentzer = ${safeHto} % / ${safeGr} = ${mentzer} (${mentzer < 13 ? 'Orienta a Beta-Talasemia' : 'Orienta a Ferropenia'})`);
        }

        return {
          results,
          interpretation: conclusion,
          steps
        };
      } catch (err) {
        return {
          results: [
            { id: 'vcm_def', name: 'Volumen Corpuscular Medio (VCM)', value: 87.5, unit: 'fL', referenceRange: '80.0 - 100.0 fL', status: 'normal', statusLabel: 'Normal' },
            { id: 'hcm_def', name: 'Hemoglobina Corpuscular Media (HCM)', value: 29.2, unit: 'pg', referenceRange: '27.0 - 33.0 pg', status: 'normal', statusLabel: 'Normal' },
            { id: 'chcm_def', name: 'Concentración de Hb Corpuscular Media (CHCM)', value: 33.3, unit: 'g/dL', referenceRange: '32.0 - 36.0 g/dL', status: 'normal', statusLabel: 'Normal' }
          ],
          interpretation: 'Ingrese valores numéricos válidos en los campos de entrada.'
        };
      }
    }
  },
  {
    id: 'formula_leucocitaria_completa',
    category: 'hematologia',
    name: 'Fórmula Leucocitaria Completa & Recuentos Absolutos',
    shortName: 'Fórmula Leucocitaria',
    formulaEquation: 'Recuento Absoluto (/µL) = (Leucocitos Totales × % Célula) / 100 | NLR = Neutrófilos / Linfocitos',
    formulaDisplay: 'Neutrófilos Absolutos = (WBC × % Segmentados) / 100\nLinfocitos Absolutos = (WBC × % Linfocitos) / 100\nMonocitos Absolutos = (WBC × % Monocitos) / 100\nEosinófilos Absolutos = (WBC × % Eosinófilos) / 100\nBasófilos Absolutos = (WBC × % Basófilos) / 100',
    description: 'Calcula los recuentos absolutos (/µL) para cada subpoblación de la serie blanca a partir de los leucocitos totales y la fórmula diferencial porcentual.',
    clinicalSignificance: 'El recuento absoluto es el único criterio diagnóstico válido para neutrofilia (>7500/µL), neutropenia (<1500/µL), agranulocitosis (<500/µL), linfocitosis (>4000/µL), linfopenia (<1000/µL) y eosinofilia (>500/µL).',
    tags: ['leucocitos', 'formula leucocitaria', 'neutrofilos', 'linfocitos', 'monocitos', 'eosinofilos', 'basofilos', 'absolutos'],
    inputs: [
      { id: 'wbc', name: 'Leucocitos Totales', symbol: 'WBC', unit: '/µL', defaultValue: 7500, min: 200, max: 300000, step: 100 },
      { id: 'seg_pct', name: 'Neutrófilos Segmentados', symbol: '% Seg', unit: '%', defaultValue: 60.0, min: 0, max: 100, step: 0.5 },
      { id: 'band_pct', name: 'Neutrófilos en Cayado / Bandas', symbol: '% Cay', unit: '%', defaultValue: 2.0, min: 0, max: 50, step: 0.5 },
      { id: 'linf_pct', name: 'Linfocitos', symbol: '% Linf', unit: '%', defaultValue: 30.0, min: 0, max: 100, step: 0.5 },
      { id: 'mono_pct', name: 'Monocitos', symbol: '% Mono', unit: '%', defaultValue: 5.0, min: 0, max: 30, step: 0.5 },
      { id: 'eos_pct', name: 'Eosinófilos', symbol: '% Eos', unit: '%', defaultValue: 2.5, min: 0, max: 50, step: 0.5 },
      { id: 'baso_pct', name: 'Basófilos', symbol: '% Baso', unit: '%', defaultValue: 0.5, min: 0, max: 20, step: 0.1 }
    ],
    calculate: (inputs) => {
      try {
        const parseNum = (v: any, fallback: number) => {
          if (typeof v === 'number') return v;
          const p = parseFloat(String(v ?? '').replace(',', '.'));
          return !isNaN(p) ? p : fallback;
        };

        const wbc = parseNum(inputs.wbc, 7500);
        const segPct = parseNum(inputs.seg_pct, 60.0);
        const bandPct = parseNum(inputs.band_pct, 2.0);
        const linfPct = parseNum(inputs.linf_pct, 30.0);
        const monoPct = parseNum(inputs.mono_pct, 5.0);
        const eosPct = parseNum(inputs.eos_pct, 2.5);
        const basoPct = parseNum(inputs.baso_pct, 0.5);

        const totalPct = Number((segPct + bandPct + linfPct + monoPct + eosPct + basoPct).toFixed(1));
        const segAbs = Math.round((wbc * segPct) / 100);
        const bandAbs = Math.round((wbc * bandPct) / 100);
        const neuTotalAbs = segAbs + bandAbs;
        const linfAbs = Math.round((wbc * linfPct) / 100);
        const monoAbs = Math.round((wbc * monoPct) / 100);
        const eosAbs = Math.round((wbc * eosPct) / 100);
        const basoAbs = Math.round((wbc * basoPct) / 100);

        const nlr = linfAbs > 0 ? Number((neuTotalAbs / linfAbs).toFixed(2)) : 0;

        const findings: string[] = [];
        if (wbc > 11000) findings.push('Leucocitosis (>11,000/µL)');
        else if (wbc < 4500) findings.push('Leucopenia (<4,500/µL)');

        if (neuTotalAbs > 7500) findings.push('Neutrofilia absoluta (>7,500/µL)');
        else if (neuTotalAbs < 1500 && neuTotalAbs >= 500) findings.push('Neutropenia moderada (500-1500/µL)');
        else if (neuTotalAbs < 500) findings.push('⚠️ Agranulocitosis Crítica (<500/µL, alto riesgo infeccioso)');

        if (bandPct > 5.0 || bandAbs > 500) findings.push('Desviación a la izquierda (Cayados > 5%, infección bacteriana aguda o sepsis)');
        if (linfAbs > 4000) findings.push('Linfocitosis absoluta (>4,000/µL, virosis, síndrome mononucleósico, LLC)');
        else if (linfAbs < 1000) findings.push('Linfopenia (<1,000/µL, inmunodeficiencia, estrés agudo, corticoterapia)');

        if (eosAbs > 500) findings.push('Eosinofilia (>500/µL, alergias, parasitosis tisular, asma, DRESS)');
        if (monoAbs > 1000) findings.push('Monocitosis (>1,000/µL, procesos crónicos, TBC, endocarditis)');

        let conclusion = findings.length > 0 
          ? `Hallazgos Clínicos: ${findings.join(' • ')}.`
          : 'Fórmula leucocitaria cuantitativa y diferencial dentro de los límites biológicos de referencia.';

        if (Math.abs(totalPct - 100) > 2) {
          conclusion += `\n⚠️ Advertencia analítica: La suma porcentual es ${totalPct}%. Se recomienda que la suma de la diferencial sea exactamente 100%.`;
        }

        return {
          results: [
            { id: 'wbc_tot', name: 'Leucocitos Totales', value: wbc, unit: '/µL', referenceRange: '4,500 - 11,000 /µL', status: wbc > 11000 ? 'high' : wbc < 4500 ? 'low' : 'normal' },
            { id: 'neu_abs', name: 'Neutrófilos Totales Absolutos (Seg + Cay)', value: neuTotalAbs, unit: '/µL', referenceRange: '1,800 - 7,500 /µL', status: neuTotalAbs > 7500 ? 'high' : neuTotalAbs < 1500 ? 'low' : 'normal' },
            { id: 'band_abs', name: 'Cayados / Bandas Absolutos', value: bandAbs, unit: '/µL', referenceRange: '0 - 500 /µL', status: bandPct > 5 ? 'high' : 'normal', statusLabel: bandPct > 5 ? 'Desviación Izquierda' : 'Normal' },
            { id: 'linf_abs', name: 'Linfocitos Absolutos', value: linfAbs, unit: '/µL', referenceRange: '1,000 - 4,000 /µL', status: linfAbs > 4000 ? 'high' : linfAbs < 1000 ? 'low' : 'normal' },
            { id: 'mono_abs', name: 'Monocitos Absolutos', value: monoAbs, unit: '/µL', referenceRange: '200 - 1,000 /µL', status: monoAbs > 1000 ? 'high' : 'normal' },
            { id: 'eos_abs', name: 'Eosinófilos Absolutos', value: eosAbs, unit: '/µL', referenceRange: '50 - 500 /µL', status: eosAbs > 500 ? 'high' : 'normal' },
            { id: 'baso_abs', name: 'Basófilos Absolutos', value: basoAbs, unit: '/µL', referenceRange: '10 - 100 /µL', status: basoAbs > 100 ? 'high' : 'normal' },
            { id: 'nlr_val', name: 'Relación Neutrófilo / Linfocito (NLR)', value: nlr, unit: 'ratio', referenceRange: '1.0 - 3.0', status: nlr > 3 ? 'high' : 'normal', statusLabel: nlr > 6 ? 'Inflamación Severa' : nlr > 3 ? 'Inflamación Moderada' : 'Normal' }
          ],
          interpretation: conclusion,
          steps: [
            `Neutrófilos Absolutos = (${wbc} × ${segPct + bandPct}%) / 100 = ${neuTotalAbs} /µL`,
            `Linfocitos Absolutos = (${wbc} × ${linfPct}%) / 100 = ${linfAbs} /µL`,
            `Monocitos Absolutos = (${wbc} × ${monoPct}%) / 100 = ${monoAbs} /µL`,
            `Eosinófilos Absolutos = (${wbc} × ${eosPct}%) / 100 = ${eosAbs} /µL`,
            `Basófilos Absolutos = (${wbc} × ${basoPct}%) / 100 = ${basoAbs} /µL`,
            `Índice NLR = ${neuTotalAbs} / ${linfAbs} = ${nlr}`
          ]
        };
      } catch (err) {
        return {
          results: [],
          interpretation: 'Ingrese valores numéricos válidos en la fórmula leucocitaria.'
        };
      }
    }
  },
  {
    id: 'reticulocitos_ipr',
    category: 'hematologia',
    name: 'Reticulocitos Corregidos e Índice de Producción Reticulocitaria (IPR)',
    shortName: 'IPR / Retic Corregidos',
    formulaEquation: 'Retic Corregido = %Retic × (Hto / Hto Normal) | IPR = Retic Corregido / Factor de Maduración',
    formulaDisplay: '% Retic Corregido = % Reticulocitos observados × (Hto paciente / 45)\nIPR = % Retic Corregido / Tiempo de Maduración (días)',
    description: 'Evalúa la respuesta regenerativa efectiva de la médula ósea ante un estado anémico.',
    clinicalSignificance: 'IPR > 2.0 indica respuesta medular adecuada y regenerativa (hemólisis, hemorragia). IPR < 2.0 en presencia de anemia indica respuesta hipoproliferativa o arregenerativa (falla medular, ferropenia, déficit vitamínico).',
    tags: ['reticulocitos', 'ipr', 'anemia regenerativa', 'eritropoyesis'],
    inputs: [
      { id: 'retic_pct', name: 'Reticulocitos observados', symbol: '% Retic', unit: '%', defaultValue: 1.5, min: 0.1, max: 30, step: 0.1 },
      { id: 'hto', name: 'Hematocrito del paciente', symbol: 'Hto', unit: '%', defaultValue: 30.0, min: 5, max: 65, step: 0.5 },
      { id: 'hto_normal', name: 'Hematocrito normal de referencia', symbol: 'Hto Ref', unit: '%', defaultValue: 45.0, min: 35, max: 50, step: 1 }
    ],
    calculate: (inputs) => {
      try {
        const reticPct = typeof inputs.retic_pct === 'number' ? inputs.retic_pct : parseFloat(String(inputs.retic_pct ?? '').replace(',', '.'));
        const hto = typeof inputs.hto === 'number' ? inputs.hto : parseFloat(String(inputs.hto ?? '').replace(',', '.'));
        const htoNormal = (typeof inputs.hto_normal === 'number' ? inputs.hto_normal : parseFloat(String(inputs.hto_normal ?? '').replace(',', '.'))) || 45;

        if (isNaN(reticPct) || isNaN(hto) || reticPct <= 0 || hto <= 0 || htoNormal <= 0) {
          return {
            results: [
              { id: 'retic_def', name: 'Reticulocitos Corregidos', value: 1.0, unit: '%', referenceRange: '1.0 - 2.0 %', status: 'normal' },
              { id: 'ipr_def', name: 'Índice de Producción Reticulocitaria (IPR)', value: 1.0, unit: 'índice', referenceRange: '> 2.0 en anemia', status: 'normal' }
            ],
            interpretation: 'Complete los datos de reticulocitos y hematocrito para evaluar la regeneración medular.'
          };
        }

        const reticCorregido = Number((reticPct * (hto / htoNormal)).toFixed(2));

        let factorMaduracion = 1.0;
        if (hto >= 36) factorMaduracion = 1.0;
        else if (hto >= 26) factorMaduracion = 1.5;
        else if (hto >= 16) factorMaduracion = 2.0;
        else factorMaduracion = 2.5;

        const ipr = Number((reticCorregido / factorMaduracion).toFixed(2));

        let iprStatus: 'low' | 'normal' | 'high' = 'normal';
        let iprLabel = '';
        let interpretation = '';

        if (ipr >= 2.0) {
          iprStatus = 'high';
          iprLabel = 'Anemia Regenerativa (IPR ≥ 2.0)';
          interpretation = 'Médula ósea con excelente respuesta hiperproliferativa. Típico de hemorragia aguda reciente o hemólisis activa.';
        } else {
          iprStatus = 'low';
          iprLabel = 'Anemia Arregenerativa / Hipoproliferativa (IPR < 2.0)';
          interpretation = 'Respuesta eritropoyética medular inadecuada para el grado de anemia. Sugiere ferropenia, déficit de B12/folato, aplasia medular, síndrome mielodisplásico o insuficiencia renal (déficit de EPO).';
        }

        return {
          results: [
            { id: 'retic_corr', name: 'Reticulocitos Corregidos', value: reticCorregido, unit: '%', referenceRange: '1.0 - 2.0 %', status: reticCorregido < 1 ? 'low' : 'normal' },
            { id: 'maduracion', name: 'Tiempo de Maduración en sangre periférica', value: factorMaduracion, unit: 'días', referenceRange: '1.0 - 2.5 días' },
            { id: 'ipr', name: 'Índice de Producción Reticulocitaria (IPR)', value: ipr, unit: 'índice', referenceRange: '> 2.0 en anemia', status: iprStatus, statusLabel: iprLabel }
          ],
          interpretation,
          steps: [
            `% Retic Corregido = ${reticPct}% × (${hto}% / ${htoNormal}%) = ${reticCorregido}%`,
            `Factor de maduración para Hto ${hto}% = ${factorMaduracion} días`,
            `IPR = ${reticCorregido}% / ${factorMaduracion} = ${ipr}`
          ]
        };
      } catch (err) {
        return { results: [], interpretation: 'Ingrese valores numéricos válidos.' };
      }
    }
  },
  {
    id: 'correccion_leucocitos_eritroblastos',
    category: 'hematologia',
    name: 'Corrección de Leucocitos por Eritroblastos (Normoblastos)',
    shortName: 'Leucocitos Corregidos',
    formulaEquation: 'Leucocitos Corregidos = (Leucocitos contados × 100) / (100 + Eritroblastos / 100 leucos)',
    formulaDisplay: 'Leucocitos Corregidos (/µL) = [ Leucocitos Automatizados (/µL) × 100 ] / [ 100 + Nº Eritroblastos contados en 100 leucocitos ]',
    description: 'Corrige el recuento de leucocitos cuando los analizadores automatizados cuentan los eritroblastos nucleados como glóbulos blancos.',
    clinicalSignificance: 'Obligatorio cuando se observan ≥5 eritroblastos por cada 100 leucocitos en el frotis de sangre periférica, para evitar pseudoleucocitosis.',
    tags: ['leucocitos', 'eritroblastos', 'normoblastos', 'frotis', 'leucocitosis'],
    inputs: [
      { id: 'leucos_raw', name: 'Leucocitos contados (analizador)', symbol: 'WBC', unit: '/µL', defaultValue: 18500, min: 500, max: 200000, step: 100 },
      { id: 'eritroblastos', name: 'Eritroblastos (por 100 leucocitos en frotis)', symbol: 'NRBC/100 WBC', unit: '/100 leucos', defaultValue: 15, min: 1, max: 300, step: 1 }
    ],
    calculate: (inputs) => {
      try {
        const raw = typeof inputs.leucos_raw === 'number' ? inputs.leucos_raw : parseFloat(String(inputs.leucos_raw ?? '').replace(',', '.'));
        const nrbc = typeof inputs.eritroblastos === 'number' ? inputs.eritroblastos : parseFloat(String(inputs.eritroblastos ?? '').replace(',', '.'));

        if (isNaN(raw) || isNaN(nrbc) || raw <= 0 || nrbc < 0) {
          return { results: [], interpretation: 'Ingrese el recuento automatizado y el número de eritroblastos.' };
        }

        const corrected = Math.round((raw * 100) / (100 + nrbc));
        const difference = raw - corrected;

        return {
          results: [
            { id: 'corrected_wbc', name: 'Leucocitos Reales Corregidos', value: corrected, unit: '/µL', referenceRange: '4,500 - 11,000 /µL', status: corrected > 11000 ? 'high' : corrected < 4500 ? 'low' : 'normal' },
            { id: 'excess', name: 'Glóbulos nucleados sobreestimados', value: difference, unit: '/µL', status: 'normal', statusLabel: 'Células descontadas' }
          ],
          interpretation: `El recuento real del paciente es de ${corrected.toLocaleString()} leucocitos/µL. El analizador estaba sobreestimando ${difference.toLocaleString()} células/µL debido a la presencia de eritroblastos nucleados en sangre periférica.`,
          steps: [
            `Leucocitos Corregidos = (${raw} × 100) / (100 + ${nrbc}) = ${corrected} /µL`
          ]
        };
      } catch (err) {
        return { results: [], interpretation: 'Ingrese valores numéricos válidos.' };
      }
    }
  },
  {
    id: 'camara_neubauer',
    category: 'hematologia',
    name: 'Cámara de Neubauer (Recuento Celular en Hemocitómetro)',
    shortName: 'Cámara de Neubauer',
    formulaEquation: 'Células/µL = (Células contadas × Dilución) / (Nº Cuadrantes × 0.1 mm³)',
    formulaDisplay: 'Células/µL = [ Total de células contadas × Factor de Dilución ] / [ Nº de cuadrantes grandes × 0.1 mm³ de volumen ]',
    description: 'Cálculo de concentración celular para sangre, LCR, líquido sinovial, pleural, ascítico o peritoneal usando la cámara de Neubauer estándar (profundidad 0.1 mm).',
    clinicalSignificance: 'Procedimiento estándar en hematología y citología de líquidos biológicos para conteo de eritrocitos, leucocitos, plaquetas o espermatozoides.',
    tags: ['neubauer', 'hemocitometro', 'lcr', 'liquido sinovial', 'celulas'],
    inputs: [
      { id: 'cells_counted', name: 'Total de células contadas', symbol: 'N', unit: 'células', defaultValue: 120, min: 1, max: 2000, step: 1 },
      { id: 'squares', name: 'Número de cuadrantes grandes contados (1 mm² c/u)', symbol: 'Cuadrantes', unit: 'cuadrantes', defaultValue: 4, min: 1, max: 9, step: 1 },
      { id: 'dilution', name: 'Factor de Dilución (ej. 1:20 = 20, directa = 1)', symbol: 'FD', unit: 'dilución', defaultValue: 20, min: 1, max: 1000, step: 1 }
    ],
    calculate: (inputs) => {
      try {
        const count = typeof inputs.cells_counted === 'number' ? inputs.cells_counted : parseFloat(String(inputs.cells_counted ?? '').replace(',', '.'));
        const squares = typeof inputs.squares === 'number' ? inputs.squares : parseFloat(String(inputs.squares ?? '').replace(',', '.'));
        const dilution = typeof inputs.dilution === 'number' ? inputs.dilution : parseFloat(String(inputs.dilution ?? '').replace(',', '.'));

        if (isNaN(count) || isNaN(squares) || isNaN(dilution) || count < 0 || squares <= 0 || dilution <= 0) {
          return { results: [], interpretation: 'Complete los parámetros de la cámara de Neubauer.' };
        }

        const concentration = Math.round((count * dilution) / (squares * 0.1));
        const concentrationSI = Number((concentration / 1000).toFixed(2));

        return {
          results: [
            { id: 'concentration_ul', name: 'Concentración Celular', value: concentration, unit: 'células/µL (o mm³)', status: 'normal', statusLabel: 'Recuento directo' },
            { id: 'concentration_l', name: 'Concentración Celular (SI)', value: concentrationSI, unit: '×10⁶/L', status: 'normal', statusLabel: 'Sistema Internacional' }
          ],
          interpretation: `Concentración obtenida: ${concentration.toLocaleString()} células/µL (mm³). Recuerde verificar la regla de inclusión de bordes (contar células en bordes superior e izquierdo, omitir en inferior y derecho).`,
          steps: [
            `Volumen total evaluado = ${squares} cuadrantes × 0.1 mm³ = ${(squares * 0.1).toFixed(2)} mm³`,
            `Células/µL = (${count} × ${dilution}) / ${(squares * 0.1).toFixed(2)} = ${concentration.toLocaleString()} células/µL`
          ]
        };
      } catch (err) {
        return { results: [], interpretation: 'Ingrese valores numéricos válidos.' };
      }
    }
  },
  {
    id: 'relacion_neutrofilo_linfocito',
    category: 'hematologia',
    name: 'Relación Neutrófilo/Linfocito (NLR) y Plaquetas/Linfocito (PLR)',
    shortName: 'NLR / PLR (Inflamación)',
    formulaEquation: 'NLR = Neutrófilos Absolutos / Linfocitos Absolutos | PLR = Plaquetas / Linfocitos',
    formulaDisplay: 'NLR = Neutrófilos Absolutos (/µL) / Linfocitos Absolutos (/µL)\nPLR = Plaquetas (/µL) / Linfocitos Absolutos (/µL)',
    description: 'Biomarcadores hematológicos costo-efectivos de inflamación sistémica, estrés fisiológico y pronóstico inmunológico.',
    clinicalSignificance: 'NLR > 3.0 se asocia con respuesta inflamatoria sistémica, sepsis, gravedad en infecciones bacterianas, COVID-19 y pronóstico oncológico desfavorable.',
    tags: ['nlr', 'plr', 'inflamacion', 'sepsis', 'covid', 'leucograma'],
    inputs: [
      { id: 'neutrophils', name: 'Neutrófilos absolutos (o %)', symbol: 'Neu', unit: '/µL (o %)', defaultValue: 6500, min: 100, max: 80000, step: 50 },
      { id: 'lymphocytes', name: 'Linfocitos absolutos (o %)', symbol: 'Linf', unit: '/µL (o %)', defaultValue: 1800, min: 50, max: 50000, step: 50 },
      { id: 'platelets', name: 'Plaquetas totales', symbol: 'PLT', unit: '/µL', defaultValue: 250000, min: 5000, max: 1500000, step: 1000 }
    ],
    calculate: (inputs) => {
      try {
        const neu = typeof inputs.neutrophils === 'number' ? inputs.neutrophils : parseFloat(String(inputs.neutrophils ?? '').replace(',', '.'));
        const linf = typeof inputs.lymphocytes === 'number' ? inputs.lymphocytes : parseFloat(String(inputs.lymphocytes ?? '').replace(',', '.'));
        const plt = typeof inputs.platelets === 'number' ? inputs.platelets : parseFloat(String(inputs.platelets ?? '').replace(',', '.'));

        if (isNaN(neu) || isNaN(linf) || neu < 0 || linf <= 0) {
          return { results: [], interpretation: 'Ingrese los neutrófilos y linfocitos.' };
        }

        const nlr = Number((neu / linf).toFixed(2));
        const plr = (!isNaN(plt) && plt > 0) ? Number((plt / linf).toFixed(1)) : 0;

        let nlrStatus: 'normal' | 'high' | 'critical-high' = 'normal';
        let nlrLabel = 'Normal (< 3.0)';
        let interp = '';

        if (nlr < 3.0) {
          nlrStatus = 'normal';
          interp = 'NLR normal: Sin evidencia de respuesta inflamatoria sistémica marcada.';
        } else if (nlr <= 6.0) {
          nlrStatus = 'high';
          nlrLabel = 'Inflamación Leve a Moderada (3.0 - 6.0)';
          interp = 'NLR moderadamente elevado: Sugiere estrés fisiológico, infección bacteriana o inflamación sistémica activa.';
        } else {
          nlrStatus = 'critical-high';
          nlrLabel = 'Inflamación Severa / Alto Riesgo (> 6.0)';
          interp = 'NLR marcadamente elevado: Alto riesgo de sepsis, tormenta de citoquinas o descompensación crítica.';
        }

        return {
          results: [
            { id: 'nlr', name: 'Relación Neutrófilo/Linfocito (NLR)', value: nlr, unit: 'ratio', referenceRange: '1.0 - 3.0', status: nlrStatus, statusLabel: nlrLabel },
            { id: 'plr', name: 'Relación Plaqueta/Linfocito (PLR)', value: plr, unit: 'ratio', referenceRange: '80 - 180', status: plr > 180 ? 'high' : 'normal', statusLabel: plr > 180 ? 'Elevado (> 180)' : 'Normal' }
          ],
          interpretation: interp,
          steps: [
            `NLR = ${neu} / ${linf} = ${nlr}`,
            `PLR = ${plt} / ${linf} = ${plr}`
          ]
        };
      } catch (err) {
        return { results: [], interpretation: 'Ingrese valores numéricos válidos.' };
      }
    }
  }
];
