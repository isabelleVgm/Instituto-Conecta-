// Leitura e escrita seguras no localStorage.
// Em aba anônima, armazenamento bloqueado ou cota cheia, o acesso pode lançar erro:
// nesses casos devolvemos o valor padrão e o site continua funcionando, só sem salvar.

const PREFIX = 'conecta:';

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}
