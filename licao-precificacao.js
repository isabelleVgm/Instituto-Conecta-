// Conteúdo da lição "Seu corte dá lucro?" (trilha Barbearia).
// Para criar uma lição nova, copie este arquivo, troque o conteúdo
// e abra licao.html?licao=<nome-do-arquivo-sem-"licao-">.
//
// Tipos de tela aceitos pelo motor (js/modules/licao-engine.js):
// "explicacao", "multipla-escolha", "completar", "ordenar", "calculadora".
// Nas perguntas, "answer" é o índice (começando em 0) da opção certa.

export default {
  id: 'precificacao',
  title: 'Seu corte dá lucro?',
  track: 'Barbearia',
  xpReward: 10,
  screens: [
    {
      type: 'explicacao',
      label: 'Trilha Barbearia · Lição 1',
      emoji: '✂️',
      title: 'Seu corte dá lucro?',
      paragraphs: [
        'Agenda cheia não é a mesma coisa que lucro.',
        'Hoje você vai aprender a calcular o preço do seu corte em 3 passos.',
      ],
    },
    {
      type: 'multipla-escolha',
      question: 'Agenda cheia significa que a barbearia está dando lucro?',
      options: ['Sim, sempre', 'Não necessariamente', 'Só no fim de semana'],
      answer: 1,
      explanation: 'Faturamento é o que entra; lucro é o que sobra depois de pagar todos os custos. Atender muito ≠ lucrar muito.',
    },
    {
      type: 'explicacao',
      label: 'Passo 1 · Custos',
      title: 'Quanto custa fazer um corte?',
      paragraphs: ['Some três tipos de custo:'],
      items: [
        { title: 'Materiais', text: 'Lâmina, produtos, toalha.' },
        { title: 'Estrutura', text: 'Aluguel, luz e água divididos pelos cortes do mês.' },
        { title: 'Equipamentos', text: 'Manutenção e reposição de máquina e tesoura.' },
      ],
    },
    {
      type: 'multipla-escolha',
      question: 'Qual destes é um custo de ESTRUTURA?',
      options: ['Lâmina descartável', 'Aluguel do ponto', 'Gel de cabelo', 'Gorjeta do cliente'],
      answer: 1,
      explanation: 'O aluguel do ponto entra na estrutura: ele é dividido pelos cortes do mês.',
    },
    {
      type: 'explicacao',
      label: 'Passo 2',
      title: 'Seu tempo tem valor',
      paragraphs: ['Defina quanto vale 1 hora do seu trabalho e calcule a parte do corte.'],
      example: {
        label: 'Exemplo',
        text: 'Se a sua hora vale R$ 30 e o corte leva 40 minutos, o seu tempo nesse corte vale R$ 20.',
      },
    },
    {
      type: 'completar',
      question: 'Complete a frase',
      before: 'Se a minha hora vale R$ 30 e o corte leva 30 minutos, meu tempo vale R$',
      after: '.',
      options: ['10', '15', '30', '60'],
      answer: 1,
      explanation: 'R$ 30 × 30 minutos ÷ 60 = R$ 15. Meia hora vale metade da sua hora.',
    },
    {
      type: 'explicacao',
      label: 'Passo 3',
      title: 'Margem de lucro',
      paragraphs: [
        'Custo total = materiais + estrutura + seu tempo.',
        'Depois some a margem de lucro.',
      ],
      example: {
        label: 'Exemplo (valores fictícios)',
        text: 'R$ 3 + R$ 7 + R$ 20 = R$ 30 de custo. Com 30% de lucro: R$ 30 × 1,3 = R$ 39.',
      },
    },
    {
      type: 'ordenar',
      question: 'Coloque os passos na ordem',
      steps: [
        'Somar os custos de materiais e estrutura',
        'Calcular o valor do seu tempo',
        'Somar a margem de lucro',
      ],
      // Ordem em que os passos aparecem embaralhados (índices de "steps")
      shuffled: [2, 0, 1],
    },
    {
      type: 'calculadora',
      label: 'Desafio prático',
      title: 'Agora com os SEUS números',
      fields: [
        { id: 'materials', label: 'Materiais por corte', unit: 'R$', placeholder: '3,00' },
        { id: 'structure', label: 'Estrutura por corte', unit: 'R$', placeholder: '7,00' },
        { id: 'hourValue', label: 'Valor da sua hora', unit: 'R$', placeholder: '30,00' },
        { id: 'minutes', label: 'Minutos por corte', unit: 'min', placeholder: '40', max: 600 },
        { id: 'margin', label: 'Margem de lucro', unit: '%', defaultValue: '30', max: 1000 },
      ],
      notice: 'Esta é uma estimativa para te ajudar a pensar no preço. Compare também com os preços da sua região.',
    },
  ],
};
