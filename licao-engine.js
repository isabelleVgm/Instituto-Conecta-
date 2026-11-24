// Motor genérico de lições.
// Lê um objeto { title, xpReward, screens: [...] } e desenha uma tela por vez.
// Tipos de tela: "explicacao", "multipla-escolha", "completar", "ordenar", "calculadora".
// A tela de conclusão é gerada pelo motor no fim.
//
// Não conhece localStorage: quem salva a ofensiva é quem chama (js/licao.js),
// através do callback onFinish.

import { validateField, computePrice, formatBRL, formatNumber } from './calculadora.js';

const CORRECT_TITLES = ['Mandou bem!', 'Isso aí!', 'Perfeito!'];
const QUESTION_TYPES = new Set(['multipla-escolha', 'completar', 'ordenar']);

// ---------- Utilitário para criar elementos com segurança (textContent) ----------
function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([name, value]) => {
      if (value !== undefined && value !== null && value !== false) node.setAttribute(name, String(value));
    });
  }
  children.filter(Boolean).forEach((child) => node.append(child));
  return node;
}

function screenHeader({ label, title, emoji }) {
  const header = el('div', { className: 'screen__header' });
  if (emoji) header.append(el('span', { className: 'screen__emoji', text: emoji, attrs: { 'aria-hidden': 'true' } }));
  if (label) header.append(el('p', { className: 'screen__label', text: label }));
  header.append(el('h2', { className: 'screen__title', text: title, attrs: { tabindex: '-1' } }));
  return header;
}

// ======================================================================
// Telas
// Cada fábrica devolve um "controller":
// { element, isQuestion, canCheck(), check() → { correct, answerText },
//   lock(), selectByIndex(i), actionLabel, onAction() }
// ======================================================================

function buildExplanation(screen) {
  const element = el('section', { className: 'screen screen--explicacao' });
  element.append(screenHeader(screen));

  (screen.paragraphs || []).forEach((text) => {
    element.append(el('p', { className: 'screen__text', text }));
  });

  if (screen.items && screen.items.length) {
    const list = el('ul', { className: 'concept-list' });
    screen.items.forEach((item, index) => {
      list.append(
        el('li', { className: 'concept' }, [
          el('span', { className: 'concept__num', text: String(index + 1).padStart(2, '0'), attrs: { 'aria-hidden': 'true' } }),
          el('div', {}, [
            el('p', { className: 'concept__title', text: item.title }),
            el('p', { className: 'concept__text', text: item.text }),
          ]),
        ]),
      );
    });
    element.append(list);
  }

  if (screen.example) {
    element.append(
      el('div', { className: 'example' }, [
        el('p', { className: 'example__label', text: screen.example.label }),
        el('p', { className: 'example__text', text: screen.example.text }),
      ]),
    );
  }

  return { element, isQuestion: false, actionLabel: 'Continuar' };
}

// Grupo de opções em rádio (múltipla escolha e completar)
function buildRadioGroup({ name, options, legend, variant, onSelect }) {
  const fieldset = el('fieldset', { className: `options options--${variant}` });
  fieldset.append(el('legend', { className: 'visually-hidden', text: legend }));

  const inputs = options.map((text, index) => {
    const input = el('input', {
      className: 'option__input visually-hidden',
      attrs: { type: 'radio', name, value: String(index) },
    });
    const label = el('label', { className: 'option' }, [
      input,
      el('span', { className: 'option__box' }, [
        el('span', { className: 'option__key', text: String(index + 1), attrs: { 'aria-hidden': 'true' } }),
        el('span', { className: 'option__text', text }),
      ]),
    ]);
    fieldset.append(label);
    input.addEventListener('change', () => onSelect(index));
    return input;
  });

  return { fieldset, inputs };
}

function buildMultipleChoice(screen, ctx) {
  const element = el('section', { className: 'screen screen--pergunta' });
  element.append(screenHeader({ label: screen.label || 'Escolha a resposta certa', title: screen.question }));

  let selected = null;
  const { fieldset, inputs } = buildRadioGroup({
    name: `q-${ctx.index}`,
    options: screen.options,
    legend: screen.question,
    variant: 'lista',
    onSelect: (index) => {
      selected = index;
      ctx.refresh();
    },
  });
  element.append(fieldset);

  return {
    element,
    isQuestion: true,
    canCheck: () => selected !== null,
    selectByIndex(index) {
      const input = inputs[index];
      if (!input || input.disabled) return;
      input.checked = true;
      input.focus();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    check() {
      const correct = selected === screen.answer;
      inputs[screen.answer].closest('.option').classList.add('option--certa');
      if (!correct) inputs[selected].closest('.option').classList.add('option--errada');
      return { correct, answerText: screen.options[screen.answer], explanation: screen.explanation };
    },
    lock() {
      fieldset.disabled = true;
    },
  };
}

function buildFillBlank(screen, ctx) {
  const element = el('section', { className: 'screen screen--pergunta' });
  element.append(screenHeader({ label: screen.label || 'Escolha a palavra que falta', title: screen.question }));

  const blank = el('span', { className: 'blank', text: '____' });
  const sentence = el('p', { className: 'sentence' }, [
    document.createTextNode(`${screen.before} `),
    blank,
    document.createTextNode(screen.after || ''),
  ]);
  element.append(sentence);

  let selected = null;
  const { fieldset, inputs } = buildRadioGroup({
    name: `q-${ctx.index}`,
    options: screen.options,
    legend: 'Opções para a lacuna',
    variant: 'chips',
    onSelect: (index) => {
      selected = index;
      blank.textContent = screen.options[index];
      blank.classList.add('blank--cheia');
      ctx.refresh();
    },
  });
  element.append(fieldset);

  return {
    element,
    isQuestion: true,
    canCheck: () => selected !== null,
    selectByIndex(index) {
      const input = inputs[index];
      if (!input || input.disabled) return;
      input.checked = true;
      input.focus();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    check() {
      const correct = selected === screen.answer;
      blank.classList.add(correct ? 'blank--certa' : 'blank--errada');
      inputs[screen.answer].closest('.option').classList.add('option--certa');
      if (!correct) inputs[selected].closest('.option').classList.add('option--errada');
      const answerText = `${screen.before} ${screen.options[screen.answer]}${screen.after || ''}`;
      return { correct, answerText, explanation: screen.explanation };
    },
    lock() {
      fieldset.disabled = true;
    },
  };
}

function buildOrdering(screen, ctx) {
  const element = el('section', { className: 'screen screen--pergunta' });
  element.append(screenHeader({ label: screen.label || 'Toque nos passos na ordem certa', title: screen.question }));

  const order = Array.isArray(screen.shuffled) && screen.shuffled.length === screen.steps.length
    ? screen.shuffled
    : screen.steps.map((_, index) => index).reverse();

  const answerList = el('ol', { className: 'order-answer', attrs: { 'aria-label': 'Sua ordem' } });
  const emptyHint = el('p', { className: 'order-answer__empty', text: 'Toque nos passos abaixo para montar a ordem.' });
  const answerBox = el('div', { className: 'order-box' }, [answerList, emptyHint]);
  const pool = el('div', { className: 'order-pool', attrs: { role: 'group', 'aria-label': 'Passos disponíveis' } });
  const status = el('p', { className: 'visually-hidden', attrs: { 'aria-live': 'polite' } });

  const chosen = []; // índices de steps na ordem escolhida
  let locked = false;

  const poolButtons = order.map((stepIndex) => {
    const button = el('button', {
      className: 'order-chip',
      text: screen.steps[stepIndex],
      attrs: { type: 'button' },
    });
    button.dataset.step = String(stepIndex);
    button.addEventListener('click', () => pick(stepIndex));
    pool.append(button);
    return button;
  });

  function render() {
    answerList.replaceChildren(
      ...chosen.map((stepIndex, position) => {
        const button = el('button', {
          className: 'order-chip order-chip--escolhido',
          attrs: { type: 'button', 'aria-label': `${position + 1}º: ${screen.steps[stepIndex]}. Toque para remover` },
        }, [
          el('span', { className: 'order-chip__pos', text: String(position + 1), attrs: { 'aria-hidden': 'true' } }),
          el('span', { text: screen.steps[stepIndex] }),
        ]);
        button.disabled = locked;
        button.addEventListener('click', () => unpick(stepIndex));
        return el('li', {}, [button]);
      }),
    );
    emptyHint.hidden = chosen.length > 0;
    poolButtons.forEach((button) => {
      button.hidden = chosen.includes(Number(button.dataset.step));
    });
    ctx.refresh();
  }

  function focusNext() {
    const next = poolButtons.find((button) => !button.hidden);
    if (next) next.focus();
    else ctx.focusAction();
  }

  function pick(stepIndex) {
    if (locked || chosen.includes(stepIndex)) return;
    chosen.push(stepIndex);
    render();
    status.textContent = `${chosen.length}º passo: ${screen.steps[stepIndex]}`;
    focusNext();
  }

  function unpick(stepIndex) {
    if (locked) return;
    chosen.splice(chosen.indexOf(stepIndex), 1);
    render();
    status.textContent = `Removido: ${screen.steps[stepIndex]}`;
    focusNext();
  }

  element.append(answerBox, pool, status);
  render();

  return {
    element,
    isQuestion: true,
    canCheck: () => chosen.length === screen.steps.length,
    selectByIndex(index) {
      const visible = poolButtons.filter((button) => !button.hidden);
      if (visible[index]) pick(Number(visible[index].dataset.step));
    },
    check() {
      const correct = chosen.every((stepIndex, position) => stepIndex === position);
      answerBox.classList.add(correct ? 'order-box--certa' : 'order-box--errada');
      const answerText = screen.steps.map((step, index) => `${index + 1}) ${step}`).join(' · ');
      return { correct, answerText, explanation: screen.explanation };
    },
    lock() {
      locked = true;
      render();
    },
  };
}

function buildCalculator(screen, ctx) {
  const element = el('section', { className: 'screen screen--calculadora' });
  element.append(screenHeader(screen));
  element.append(el('p', { className: 'screen__text', text: 'Preencha com os valores da sua barbearia. O cálculo aparece na hora.' }));

  const form = el('form', { className: 'calc', attrs: { novalidate: '' } });
  const fields = {};

  screen.fields.forEach((field) => {
    const inputId = `calc-${field.id}`;
    const errorId = `${inputId}-erro`;
    const input = el('input', {
      className: 'calc__input',
      attrs: {
        id: inputId,
        type: 'text',
        inputmode: 'decimal',
        autocomplete: 'off',
        placeholder: field.placeholder ? `ex.: ${field.placeholder}` : undefined,
        'aria-describedby': errorId,
      },
    });
    if (field.defaultValue) input.value = field.defaultValue;

    const isPrefix = field.unit === 'R$';
    const unit = el('span', { className: `calc__unit calc__unit--${isPrefix ? 'pre' : 'pos'}`, text: field.unit, attrs: { 'aria-hidden': 'true' } });
    const control = el('div', { className: 'calc__control' }, isPrefix ? [unit, input] : [input, unit]);
    const error = el('p', { className: 'calc__error', attrs: { id: errorId } });
    const labelText = field.unit === 'R$' ? `${field.label} (R$)` : `${field.label} (${field.unit})`;

    form.append(
      el('div', { className: 'calc__field' }, [
        el('label', { className: 'calc__label', text: labelText, attrs: { for: inputId } }),
        control,
        error,
      ]),
    );

    fields[field.id] = { input, error, config: field, touched: Boolean(field.defaultValue) };
  });

  // Passo a passo do cálculo
  const rows = {
    materials: el('span', { className: 'calc-steps__value', text: '—' }),
    structure: el('span', { className: 'calc-steps__value', text: '—' }),
    time: el('span', { className: 'calc-steps__value', text: '—' }),
    timeDetail: el('span', { className: 'calc-steps__detail', text: 'valor da hora × minutos ÷ 60' }),
    total: el('span', { className: 'calc-steps__value', text: '—' }),
    marginDetail: el('span', { className: 'calc-steps__detail', text: 'custo total × (1 + margem ÷ 100)' }),
    price: el('span', { className: 'calc-steps__price', text: '—' }),
  };

  const row = (op, label, value, detail, modifier = '') => el('li', { className: `calc-steps__row ${modifier}` }, [
    el('span', { className: 'calc-steps__op', text: op, attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'calc-steps__label' }, [document.createTextNode(label), detail]),
    value,
  ]);

  const steps = el('div', { className: 'calc-steps' }, [
    el('p', { className: 'calc-steps__title', text: 'Seu cálculo, passo a passo' }),
    el('ol', { className: 'calc-steps__list' }, [
      row('', 'Materiais', rows.materials),
      row('+', 'Estrutura', rows.structure),
      row('+', 'Seu tempo', rows.time, rows.timeDetail),
      row('=', 'Custo total', rows.total, null, 'calc-steps__row--total'),
    ]),
    el('div', { className: 'calc-steps__result' }, [
      el('p', { className: 'calc-steps__result-label' }, [document.createTextNode('Preço sugerido'), rows.marginDetail]),
      rows.price,
    ]),
  ]);

  const live = el('p', { className: 'visually-hidden', attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' } });
  const notice = el('p', { className: 'calc__notice', text: screen.notice });

  element.append(form, steps, live, notice);

  function readAll({ showErrors }) {
    const values = {};
    let firstInvalid = null;
    Object.entries(fields).forEach(([id, field]) => {
      const result = validateField(field.input.value, { max: field.config.max });
      const show = showErrors || field.touched;
      if (result.error) {
        if (!firstInvalid) firstInvalid = field.input;
        field.error.textContent = show ? result.error : '';
        field.input.setAttribute('aria-invalid', show ? 'true' : 'false');
      } else {
        values[id] = result.value;
        field.error.textContent = '';
        field.input.setAttribute('aria-invalid', 'false');
      }
    });
    return { values, firstInvalid };
  }

  function update({ announce = false } = {}) {
    const { values } = readAll({ showErrors: false });
    const has = (id) => typeof values[id] === 'number';

    rows.materials.textContent = has('materials') ? formatBRL(values.materials) : '—';
    rows.structure.textContent = has('structure') ? formatBRL(values.structure) : '—';

    if (has('hourValue') && has('minutes')) {
      const timeCost = (values.hourValue * values.minutes) / 60;
      rows.time.textContent = formatBRL(Math.round(timeCost * 100) / 100);
      rows.timeDetail.textContent = `${formatBRL(values.hourValue)} × ${formatNumber(values.minutes)} min ÷ 60`;
    } else {
      rows.time.textContent = '—';
      rows.timeDetail.textContent = 'valor da hora × minutos ÷ 60';
    }

    const complete = ['materials', 'structure', 'hourValue', 'minutes', 'margin'].every(has);
    if (complete) {
      const result = computePrice(values);
      rows.total.textContent = formatBRL(result.totalCost);
      rows.marginDetail.textContent = `${formatBRL(result.totalCost)} × ${formatNumber(result.multiplier)} (margem de ${formatNumber(values.margin)}%)`;
      rows.price.textContent = formatBRL(result.price);
      if (announce) live.textContent = `Custo total ${formatBRL(result.totalCost)}. Preço sugerido ${formatBRL(result.price)}.`;
    } else {
      rows.total.textContent = has('materials') && has('structure') && has('hourValue') && has('minutes')
        ? formatBRL(computePrice({ ...values, margin: 0 }).totalCost)
        : '—';
      rows.marginDetail.textContent = 'custo total × (1 + margem ÷ 100)';
      rows.price.textContent = '—';
    }
  }

  Object.values(fields).forEach((field) => {
    field.input.addEventListener('input', () => update());
    field.input.addEventListener('change', () => {
      field.touched = true;
      update({ announce: true });
    });
    field.input.addEventListener('blur', () => {
      field.touched = true;
      readAll({ showErrors: false });
    });
  });

  // O formulário nunca recarrega a página (o Enter é tratado pelo motor)
  form.addEventListener('submit', (event) => event.preventDefault());

  update();

  return {
    element,
    isQuestion: false,
    actionLabel: 'Concluir lição',
    onAction() {
      const { firstInvalid } = readAll({ showErrors: true });
      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }
      return true;
    },
  };
}

const BUILDERS = {
  explicacao: buildExplanation,
  'multipla-escolha': buildMultipleChoice,
  completar: buildFillBlank,
  ordenar: buildOrdering,
  calculadora: buildCalculator,
};

// ======================================================================
// Motor
// ======================================================================

export function createLesson({ root, lesson, onFinish, getStreak }) {
  const stage = root.querySelector('[data-stage]');
  const footer = root.querySelector('[data-footer]');
  const actionButton = root.querySelector('[data-action]');
  const feedback = root.querySelector('[data-feedback]');
  const feedbackTitle = root.querySelector('[data-feedback-title]');
  const feedbackText = root.querySelector('[data-feedback-text]');
  const progressBar = root.querySelector('[data-progress]');
  const progressFill = root.querySelector('[data-progress-fill]');
  const streakValue = root.querySelector('[data-streak-value]');
  const streakChip = root.querySelector('[data-streak-chip]');

  const screens = lesson.screens.filter((screen) => BUILDERS[screen.type]);
  const totalQuestions = screens.filter((screen) => QUESTION_TYPES.has(screen.type)).length;

  let index = 0;
  let phase = 'answering'; // 'answering' | 'feedback' | 'done'
  let controller = null;
  let correctCount = 0;

  function setStreak(value) {
    if (streakValue) streakValue.textContent = String(value);
    if (streakChip) {
      streakChip.classList.toggle('streak-chip--ativa', value > 0);
      streakChip.setAttribute('aria-label', `Ofensiva atual: ${value} ${value === 1 ? 'dia' : 'dias'}`);
    }
  }

  function setProgress(done) {
    const percent = Math.round((done / screens.length) * 100);
    progressFill.style.setProperty('--progresso', `${percent}%`);
    progressBar.setAttribute('aria-valuenow', String(percent));
  }

  function setFooterState(state) {
    footer.classList.remove('lesson-footer--certo', 'lesson-footer--errado');
    actionButton.classList.remove('btn--sucesso', 'btn--erro');
    actionButton.classList.add('btn--primary');
    if (state === 'certo' || state === 'errado') {
      footer.classList.add(`lesson-footer--${state}`);
      actionButton.classList.remove('btn--primary');
      actionButton.classList.add(state === 'certo' ? 'btn--sucesso' : 'btn--erro');
    }
  }

  function clearFeedback() {
    feedback.hidden = true;
    feedbackTitle.textContent = '';
    feedbackText.textContent = '';
  }

  function refresh() {
    if (phase !== 'answering' || !controller) return;
    if (controller.isQuestion) {
      actionButton.textContent = 'Verificar';
      actionButton.disabled = !controller.canCheck();
    } else {
      actionButton.textContent = controller.actionLabel || 'Continuar';
      actionButton.disabled = false;
    }
  }

  function focusAction() {
    if (!actionButton.disabled) actionButton.focus();
  }

  function mount(element, { focus }) {
    element.classList.add('screen--entrando');
    stage.replaceChildren(element);
    stage.scrollTop = 0;
    window.scrollTo(0, 0);
    if (focus) {
      const heading = element.querySelector('[tabindex="-1"]');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  function showScreen(position, { focus = true } = {}) {
    index = position;
    phase = 'answering';
    const screen = screens[index];
    const ctx = { index, refresh, focusAction, runAction };
    controller = BUILDERS[screen.type](screen, ctx);

    footer.hidden = false;
    setFooterState('neutro');
    clearFeedback();
    setProgress(index);
    mount(controller.element, { focus });
    refresh();
  }

  function check() {
    const result = controller.check();
    controller.lock();
    phase = 'feedback';

    if (result.correct) {
      correctCount += 1;
      feedbackTitle.textContent = CORRECT_TITLES[(correctCount - 1) % CORRECT_TITLES.length];
      feedbackText.textContent = result.explanation || '';
      setFooterState('certo');
    } else {
      feedbackTitle.textContent = 'Quase!';
      feedbackText.textContent = `Resposta certa: ${result.answerText}${result.explanation ? `. ${result.explanation}` : ''}`;
      setFooterState('errado');
    }

    feedback.hidden = false;
    setProgress(index + 1);
    actionButton.textContent = 'Continuar';
    actionButton.disabled = false;
    actionButton.focus();
  }

  function next() {
    if (index + 1 < screens.length) showScreen(index + 1);
    else finish();
  }

  function runAction() {
    if (phase === 'done' || actionButton.disabled) return;
    if (phase === 'feedback') {
      next();
      return;
    }
    if (controller.isQuestion) {
      if (controller.canCheck()) check();
      return;
    }
    if (controller.onAction && controller.onAction() === false) return;
    next();
  }

  function finish() {
    phase = 'done';
    setProgress(screens.length);
    const xp = lesson.xpReward || 0;
    const result = onFinish ? onFinish({ xp, correct: correctCount, total: totalQuestions }) : null;
    const streak = result ? result.streak : 0;
    setStreak(streak);
    footer.hidden = true;
    clearFeedback();
    mount(buildCompletion({ xp, streak, totalXp: result ? result.xp : xp, saved: result ? result.saved : false }), { focus: true });
  }

  function buildCompletion({ xp, streak, totalXp, saved }) {
    const element = el('section', { className: 'screen screen--conclusao' });

    const confetti = el('div', { className: 'confetti', attrs: { 'aria-hidden': 'true' } });
    for (let i = 0; i < 28; i += 1) confetti.append(el('span', { className: 'confetti__piece' }));
    element.append(confetti);

    element.append(el('div', { className: 'trophy', attrs: { 'aria-hidden': 'true' } }, [el('span', { text: '🏆' })]));
    element.append(el('p', { className: 'screen__label', text: 'Lição concluída' }));
    element.append(el('h2', { className: 'screen__title screen__title--center', text: 'Mais uma lição concluída!', attrs: { tabindex: '-1' } }));

    const streakText = `Ofensiva de ${streak} ${streak === 1 ? 'dia' : 'dias'}!`;
    element.append(
      el('ul', { className: 'results' }, [
        el('li', { className: 'result result--xp' }, [
          el('span', { className: 'result__label', text: 'Pontos' }),
          el('span', { className: 'result__value', text: `+${xp} XP` }),
        ]),
        el('li', { className: 'result' }, [
          el('span', { className: 'result__label', text: 'Acertos' }),
          el('span', { className: 'result__value', text: `${correctCount} de ${totalQuestions}` }),
        ]),
        el('li', { className: 'result result--streak' }, [
          el('span', { className: 'result__label', text: 'Ofensiva' }),
          el('span', { className: 'result__value' }, [document.createTextNode(`${streakText} `), el('span', { text: '🔥', attrs: { 'aria-hidden': 'true' } })]),
        ]),
      ]),
    );

    element.append(el('p', { className: 'results__total', text: saved ? `XP total: ${totalXp}` : 'Seu navegador não deixou salvar o progresso, mas a lição valeu do mesmo jeito.' }));

    const restart = el('button', { className: 'btn btn--secondary btn--lg', text: 'Refazer lição', attrs: { type: 'button' } });
    restart.addEventListener('click', () => {
      correctCount = 0;
      showScreen(0);
    });
    const tracks = el('a', { className: 'btn btn--primary btn--lg', text: 'Conhecer as outras trilhas', attrs: { href: 'index.html#trilhas' } });
    element.append(el('div', { className: 'btn-row results__actions' }, [restart, tracks]));

    return element;
  }

  // ---------- Teclado ----------
  function onKeydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (phase === 'done') return;
    const target = event.target;
    const inTextField = target instanceof HTMLInputElement && target.type === 'text';

    // Teclas 1 a 9 escolhem a opção correspondente
    if (/^[1-9]$/.test(event.key) && !inTextField && phase === 'answering' && controller.selectByIndex) {
      event.preventDefault();
      controller.selectByIndex(Number(event.key) - 1);
      return;
    }

    if (event.key === 'Enter') {
      // Botões e links já respondem ao Enter sozinhos
      if (target.closest('button, a, summary')) return;
      event.preventDefault();
      runAction();
    }
  }

  actionButton.addEventListener('click', runAction);
  document.addEventListener('keydown', onKeydown);

  setStreak(getStreak ? getStreak() : 0);
  showScreen(0, { focus: false });
}
