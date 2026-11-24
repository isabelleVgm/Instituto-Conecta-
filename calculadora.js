// Calculadora de preço (funções puras, sem DOM).
// custo total = materiais + estrutura + (valor da hora × minutos ÷ 60)
// preço sugerido = custo total × (1 + margem ÷ 100)

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatBRL(value) {
  return brl.format(value);
}

export function formatNumber(value) {
  return decimal.format(value);
}

// Aceita "3", "3,50", "3.50", "R$ 1.234,56" e "30%".
export function parseNumber(raw) {
  if (typeof raw !== 'string') return NaN;
  let text = raw.trim().replace(/R\$|%|\s/gi, '');
  if (text === '') return NaN;
  if (text.includes(',') && text.includes('.')) {
    text = text.replace(/\./g, '').replace(',', '.'); // 1.234,56 → 1234.56
  } else {
    text = text.replace(',', '.');
  }
  if (!/^-?\d*\.?\d+$/.test(text)) return NaN;
  return Number(text);
}

// Valida um campo. Devolve { value } ou { error } com mensagem amigável.
export function validateField(raw, { max } = {}) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { error: 'Preencha este campo para ver o cálculo.' };
  }
  const value = parseNumber(raw);
  if (Number.isNaN(value)) {
    return { error: 'Use só números, por exemplo 3,50.' };
  }
  if (value < 0) {
    return { error: 'O valor não pode ser negativo.' };
  }
  if (typeof max === 'number' && value > max) {
    return { error: `Use um valor de até ${formatNumber(max)}.` };
  }
  return { value };
}

// Arredonda em centavos para evitar 39,000000001
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computePrice({ materials, structure, hourValue, minutes, margin }) {
  const timeCost = roundCents((hourValue * minutes) / 60);
  const totalCost = roundCents(materials + structure + timeCost);
  const multiplier = 1 + margin / 100;
  const price = roundCents(totalCost * multiplier);
  return { timeCost, totalCost, multiplier, price };
}
