// Página licao.html: carrega o arquivo de dados da lição e liga o motor à ofensiva.
// Lição padrão: precificacao. Outras lições: licao.html?licao=<nome>
// (procura js/data/licao-<nome>.js).

import { createLesson } from './modules/licao-engine.js';
import { getProgress, registerCompletion } from './modules/ofensiva.js';

const root = document.querySelector('[data-lesson-root]');

async function loadLesson() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('licao') || root.dataset.lesson || 'precificacao';
  // Só letras minúsculas, números e hífen: evita carregar caminhos arbitrários
  const slug = /^[a-z0-9-]+$/.test(requested) ? requested : 'precificacao';
  const module = await import(`./data/licao-${slug}.js`);
  return module.default;
}

function showLoadError() {
  const stage = root.querySelector('[data-stage]');
  const footer = root.querySelector('[data-footer]');
  footer.hidden = true;
  const box = document.createElement('section');
  box.className = 'screen';
  const title = document.createElement('h2');
  title.className = 'screen__title';
  title.textContent = 'Não encontramos essa lição.';
  const link = document.createElement('a');
  link.className = 'btn btn--primary btn--lg';
  link.href = 'licao.html';
  link.textContent = 'Fazer a lição de precificação';
  box.append(title, link);
  stage.replaceChildren(box);
}

async function start() {
  if (!root) return;
  try {
    const lesson = await loadLesson();
    const titleTarget = document.querySelector('[data-lesson-title]');
    if (titleTarget) titleTarget.textContent = `Lição: ${lesson.title}`;

    createLesson({
      root,
      lesson,
      getStreak: () => getProgress().streak,
      onFinish: ({ xp }) => registerCompletion(xp),
    });
  } catch (error) {
    showLoadError();
  }
}

start();
