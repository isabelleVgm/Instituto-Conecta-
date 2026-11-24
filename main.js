// Script das páginas institucionais (index, projeto, 404):
// menu mobile, ano no rodapé e ofensiva no header.

import { getProgress, formatDays } from './modules/ofensiva.js';

function setupMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.hidden = false;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('site-nav--open', open);
    if (open) {
      const firstLink = nav.querySelector('a');
      if (firstLink) firstLink.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });

  // Fecha ao escolher um link (âncoras na mesma página)
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && isOpen()) setOpen(false);
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  // Se a tela crescer para desktop com o menu aberto, reseta o estado
  const desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
}

function setupYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = year;
  });
}

function setupStreak() {
  const chip = document.querySelector('[data-streak-chip]');
  if (!chip) return;
  const { streak } = getProgress();
  if (streak < 1) return;

  const value = chip.querySelector('[data-streak-value]');
  if (value) value.textContent = String(streak);
  chip.setAttribute('aria-label', `Ofensiva de ${formatDays(streak)}. Fazer a lição do dia`);
  chip.hidden = false;
}

setupMenu();
setupYear();
setupStreak();
