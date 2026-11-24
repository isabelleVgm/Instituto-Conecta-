# App Conecta · Instituto Conecta

Site do **App Conecta**, o app gratuito do Instituto Conecta (OSCIP e edtech social sem fins lucrativos) que ensina gestão e marketing digital para microempreendedores de periferia em lições de 5 minutos por dia, no celular, com ofensiva diária, pontos, níveis e ranking.

> O app ainda não existe nas lojas. O site apresenta a proposta e deixa a pessoa experimentar uma lição.

Projeto Integrador A3 · Marketing de Conteúdo · 2026.

**Site publicado:** [A DEFINIR depois de publicar]

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal (empreendedores, voluntários, empresas ESG) |
| `licao.html` | Lição demo jogável: “Seu corte dá lucro?” |
| `projeto.html` | Bastidores do projeto (plano de marketing, para avaliadores) |
| `404.html` | Página de erro |

## Como rodar localmente

O site usa ES modules, então **não funciona abrindo o arquivo direto** (`file://`). Use um servidor local:

1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.

Sem VS Code: `python3 -m http.server` na pasta e abra `http://localhost:8000`.

## Como publicar no GitHub Pages

1. Crie um repositório **público** e envie todos os arquivos para a branch `main` (a raiz do repositório deve conter o `index.html`).
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: **main**, pasta: **/(root)** → **Save**.
4. Em 1 a 2 minutos o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Estrutura

```
/
├── index.html, licao.html, projeto.html, 404.html
├── css/
│   ├── reset.css, tokens.css (cores e medidas), base.css, components.css
│   └── index.css, licao.css, projeto.css
├── js/
│   ├── main.js            menu mobile, ano, ofensiva no header
│   ├── licao.js           inicia a lição (carrega os dados + motor)
│   ├── modules/           storage, ofensiva, licao-engine, calculadora
│   └── data/              conteúdo das lições (um arquivo por lição)
└── assets/
    ├── img/               logos e ícones
    └── video/             Reels da campanha
```

### Criar uma lição nova

1. Copie `js/data/licao-precificacao.js` para `js/data/licao-NOME.js` e troque o conteúdo.
2. Abra `licao.html?licao=NOME`.

Tipos de tela disponíveis: `explicacao`, `multipla-escolha`, `completar`, `ordenar`, `calculadora`.

## Tecnologia

HTML, CSS e JavaScript puros. Sem frameworks, sem npm, sem build. Única dependência externa: Google Fonts (Montserrat e Poppins). O progresso da lição (ofensiva e XP) fica salvo só no navegador de quem joga (localStorage).

## Créditos

Evelyn Q. Laura · Adriana A. H. Gamarra · Isabelle V. G. de Moura · Victor D. T. Toscano · Davi M. de J. Machado · Isadora C. F. Costa
