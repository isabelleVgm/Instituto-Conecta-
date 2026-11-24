# CLAUDE.md — regras do site App Conecta

Site estático do App Conecta (Instituto Conecta, OSCIP). Projeto Integrador A3 · Marketing de Conteúdo · 2026. Publicado no GitHub Pages em `usuario.github.io/nome-do-repo/`. O app ainda NÃO existe nas lojas.

## Stack (inegociável)
- HTML5 semântico + CSS3 + JavaScript puro (ES modules). Sem frameworks, sem npm, sem build, sem CDN. Só Google Fonts.
- Caminhos SEMPRE relativos (`css/base.css`, `assets/img/...`). Nunca começar com `/`. Exceção documentada: script de `<base>` no `404.html`.
- Arquivos em minúsculas, sem acento, sem espaço.
- Leve (público com dados pré-pagos): index < 500 KB no primeiro carregamento, imagens com width/height e `loading="lazy"` abaixo da dobra, ícones em SVG inline, sem autoplay.
- Fontes: Montserrat 700/800 (títulos, botões, rótulos) + Poppins 400/500/600 (corpo, mín. 16px).
- Um `<h1>` por página, `lang="pt-BR"`, meta description, OG, favicon. Sem `style=""` e sem `onclick` no HTML.
- CSS mobile-first (360 → 768 → 1024), BEM, cores SÓ via `css/tokens.css`, animações ≤ 300ms e desligadas em `prefers-reduced-motion`.
- JS: um módulo por responsabilidade, `addEventListener`, localStorage sempre via `js/modules/storage.js` (try/catch), sem `console.log`.
- index.html funciona sem JS; licao.html exige JS e tem `<noscript>`.
- Variáveis em inglês; comentários e textos em pt-BR.

## Paleta e contraste
Oficiais: `--azul-marinho #042550`, `--laranja #FF6412`, `--branco`, `--azul-claro #E6EFF7`, `--laranja-escuro #C94A06`, `--marinho-escuro #021A3A`, `--azul-claro-borda #C9D9EA`, `--texto-suave #4A5B78`, `--sucesso/--erro` (só no quiz).
- Laranja = SÓ destaque (CTA, ofensiva, progresso), no máximo ~10% da tela.
- NUNCA texto branco sobre laranja (2,96:1). Botão primário = fundo laranja + texto marinho + base `--laranja-escuro`.
- Laranja como texto em tamanho pequeno sobre fundo claro reprova AA: use `--laranja-texto #B84300`. `#FF6412` puro como texto só sobre marinho.

## Linguagem visual
Estilo de app gamificado (padrões de UX, NUNCA a marca Duolingo: sem coruja, sem o verde deles, sem fonte Feather). Botões 3D (raio 15px, Montserrat 800 caixa alta, base 4px que "afunda" no :active), cards com borda 2px + base 4px, barras de progresso grossas, nós circulares ligados por linha, ofensiva 🔥.
Assinatura da marca: marcador de dois quadradinhos (`.brand-mark`), rótulo de seção (`.section-label`), traço laranja 48×4 sob títulos (`.section-title`), pílulas numeradas 01/02/03, avatares com iniciais.
Emojis só nas seções para empreendedores; PROIBIDOS na seção de empresas.

## Tom de voz
Humano · Didático · Gamificado · Estratégico. Verbos de ação, celebrar progresso, protagonismo do empreendedor, dados SEMPRE com fonte.
NÃO: tom assistencialista, pessoas como vítimas, "ajuda/caridade/esmola", prometer ganho financeiro, jargão em inglês ("ofensiva", não "streak").

## Proibições de conteúdo
- Não inventar dados, depoimentos ou nomes. Faltou informação → `[A DEFINIR: ...]` visível.
- Números hipotéticos ("5.000 padeiros", "85% mantêm a ofensiva", "R$ 300 no caixa", "Salão do Zé") NUNCA na index; na projeto.html só rotulados como meta/exemplo/ilustrativo.
- Não citar concorrentes pelo nome na index.html.
- Rankings/perfis são sempre rotulados como exemplo.
- Equipe sem RA. Sem manifest.json nem service worker (fase futura).

## Estrutura
- `js/main.js` (páginas institucionais), `js/licao.js` (bootstrap da lição).
- `js/modules/`: `storage.js`, `ofensiva.js` (dias seguidos + XP), `licao-engine.js` (motor genérico), `calculadora.js` (funções puras).
- `js/data/licao-*.js`: conteúdo das lições. Nova lição = novo arquivo + `licao.html?licao=nome`.
- Teste obrigatório da calculadora: materiais 3, estrutura 7, hora 30, 40 min, margem 30% → R$ 39,00.
