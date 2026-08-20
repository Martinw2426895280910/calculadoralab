import { FormulaDefinition } from '../../types/laboratory';

export const HEMATOLOGY_CALCULATORS: FormulaDefinition[] = [
  {
    id: 'indices_hematimetricos',
    category: 'hematologia',
    name: 'Índices Hematimétricos Primarios (VCM, HCM, CHCM)',
    shortName: 'VCM / HCM / CHCM',
    formulaEquation: 'VCM = (Hto × 10) / GR | HCM = (Hb × 10) / GR | CHCM = (Hb × 100) / Hto',
    formulaDisplay: 'VCM = (Hto % × 10) / GR (10⁶/µL)\nHCM = (Hb g/dL × 10) / GR (10⁶/µL)\nCHCM = (Hb g/dL × 100) / Hto %',
    description: 'Calcula el tamaño (VCM), contenido de hemoglobina (HCM) y concentración media de hemoglobina (CHCM) por eritrocito.',
    clinicalSignificance: 'Permite la clasificación morfológica de las anemias en microcíticas (<80 fL), normocíticas (80-100 fL) o macrocíticas (>100 fL), e hipocrómicas o normocrómicas.',
    tags: ['hematimetria', 'vcm', 'hcm', 'chcm', 'anemia', 'eritrocitos'],
    inputs: [
      { id: 'hb', name: 'Hemoglobina (Hb)', symbol: 'Hb', unit: 'g/dL', defaultValue: 14.0, min: 2, max: 25, step: 0.1 },
      { id: 'hto', name: 'Hematocrito (Hto)', symbol: 'Hto', unit: '%', defaultValue: 42.0, min: 5, max: 75, step: 0.1 },
      { id: 'gr', name: 'Glóbulos Rojos (Eritrocitos)', symbol: 'GR', unit: '×10⁶/µL (millones/mm³)', defaultValue: 4.80, min: 0.5, max: 10, step: 0.01 }
    ],
    calculate: (inputs) => {
      try {
        const hb = typeof inputs.hb === 'number' ? inputs.hb : parseFloat(String(inputs.hb ?? '').replace(',', '.'));
        const hto = typeof inputs.hto === 'number' ? inputs.hto : parseFloat(String(inputs.hto ?? '').replace(',', '.'));
        const gr = typeof inputs.gr === 'number' ? inputs.gr : parseFloat(String(inputs.gr ?? '').replace(',', '.'));

        if (isNaN(hb) || isNaN(hto) || isNaN(gr) || hb <= 0 || hto <= 0 || gr <= 0) {
          return {
            results: [],
            interpretation: 'Ingrese valores numéricos válidos para Hemoglobina (g/dL), Hematocrito (%) y Glóbulos Rojos (×10⁶/µL).'
          };
        }

        const vcm = Number(((hto * 10) / gr).toFixed(1));
        const hcm = Number(((hb * 10) / gr).toFixed(1));
        const chcm = Number(((hb * 100) / hto).toFixed(1));
        const mentzer = Number((hto / gr).toFixed(2));

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
        if (vcm < 80) {
          if (mentzer < 13) {
            mentzerNote = `\n• Índice de Mentzer = ${mentzer} (< 13): Orienta fuertemente a Rasgo de Beta-Talasemia Menor (microcitosis con abundante número de hematíes).`;
          } else {
            mentzerNote = `\n• Índice de Mentzer = ${mentzer} (≥ 13): Orienta fuertemente a Anemia Ferropénica (déficit de hierro).`;
          }
        }

        let conclusion = '';
        if (vcm < 80 && hcm < 27) {
          conclusion = `Patrón Microcítico Hipocrómico: Sugiere Anemia Ferropénica, Talasemia Menor o Anemia de Procesos Crónicos.${mentzerNote}`;
        } else if (vcm < 80 && hcm >= 27) {
          conclusion = `Patrón Microcítico Normocrómico: Microcitosis temprana o rasgo hemoglobinopático.${mentzerNote}`;
        } else if (vcm > 100) {
          conclusion = 'Patrón Macrocítico: Sugiere déficit de Vitamina B12 o Ácido Fólico (Megaloblástica), hepatopatía crónica, hipotiroidismo, alcoholismo o reticulocitosis intensa.';
        } else if (hcm < 27) {
          conclusion = 'Patrón Normocítico Hipocrómico: Sugiere ferropenia incipiente o hemoglobinopatía heterocigota.';
        } else {
          conclusion = 'Patrón Normocítico Normocrómico: Índices eritrocitarios dentro de los rangos biológicos de referencia.';
        }

        const results = [
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
            statusLabel: mentzer < 13 ? 'Probable Talasemia (< 13)' : 'Probable Ferropenia (≥ 13)'
          });
        }

        return {
          results,
          interpretation: conclusion,
          steps: [
            `VCM = (${hto} × 10) / ${gr} = ${vcm} fL`,
            `HCM = (${hb} × 10) / ${gr} = ${hcm} pg`,
            `CHCM = (${hb} × 100) / ${hto} = ${chcm} g/dL`,
            ...(vcm < 80 ? [`Índice de Mentzer = ${hto} / ${gr} = ${mentzer}`] : [])
          ]
        };
      } catch (err) {
        return {
          results: [],
          interpretation: 'Ingrese valores numéricos válidos en los campos de entrada.'
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
          return { results: [], interpretation: 'Complete los datos de reticulocitos y hematocrito.' };
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
