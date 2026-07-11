// ==========================================================================
// 1. SELEÇÃO DE ELEMENTOS
// ==========================================================================

const contadorDiasEl = document.getElementById('contadorDias');
const contadorDetalheEl = document.getElementById('contadorDetalhe');

const tarefaInput = document.getElementById('tarefa');
const diaSelect = document.getElementById('dia');
const horaInput = document.getElementById('hora');
const btnAdicionar = document.getElementById('btnAdicionar');

const listaTarefasEl = document.getElementById('listaTarefas');
const listaConcluidasEl = document.getElementById('listaConcluidas');
const contadorPendentesEl = document.getElementById('contadorPendentes');
const contadorConcluidasEl = document.getElementById('contadorConcluidas');
const mensagemVaziaPendentesEl = document.getElementById('mensagemVaziaPendentes');
const mensagemVaziaConcluidasEl = document.getElementById('mensagemVaziaConcluidas');

const observacoesDiasEl = document.getElementById('observacoesDias');

const calTituloMesEl = document.getElementById('calTituloMes');
const calDiasSemanaEl = document.getElementById('calDiasSemana');
const calGradeEl = document.getElementById('calGrade');
const btnMesAnterior = document.getElementById('btnMesAnterior');
const btnMesSeguinte = document.getElementById('btnMesSeguinte');

const calPopupEl = document.getElementById('calPopup');
const calPopupTituloEl = document.getElementById('calPopupTitulo');
const calPopupEmojisEl = document.getElementById('calPopupEmojis');
const calPopupRemoverEl = document.getElementById('calPopupRemover');
const calPopupFecharEl = document.getElementById('calPopupFechar');
const calLegendaEl = document.getElementById('calLegenda');

const DIAS_SEMANA = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
];

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// Data selecionada no momento no popup do calendário (formato "AAAA-MM-DD")
let dataSelecionadaPopup = null;


// ==========================================================================
// 2. CONTADOR DE DIAS
// ==========================================================================

function atualizarContador() {
  const dataInicial = new Date(2005, 9, 7);
  const hoje = new Date();

  dataInicial.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  const diffMs = hoje - dataInicial;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  contadorDiasEl.textContent = diffDias.toLocaleString('pt-BR');

  const anos = Math.floor(diffDias / 365.25);
  contadorDetalheEl.textContent = `Aproximadamente ${anos} anos`;
}


// ==========================================================================
// 3. OBSERVAÇÕES DA SEMANA (persistidas no localStorage)
// ==========================================================================

function carregarObservacoes() {
  const salvas = JSON.parse(localStorage.getItem('observacoesSemana') || '{}');

  observacoesDiasEl.innerHTML = '';

  DIAS_SEMANA.forEach(dia => {
    const wrapper = document.createElement('div');
    wrapper.className = 'observacao-dia';

    const label = document.createElement('label');
    label.className = 'observacao-dia__label';
    label.textContent = dia;
    label.setAttribute('for', `obs-${dia}`);

    const textarea = document.createElement('textarea');
    textarea.className = 'observacao-dia__texto';
    textarea.id = `obs-${dia}`;
    textarea.placeholder = 'Escreva uma observação...';
    textarea.value = salvas[dia] || '';

    textarea.addEventListener('input', () => {
      const atuais = JSON.parse(localStorage.getItem('observacoesSemana') || '{}');
      atuais[dia] = textarea.value;
      localStorage.setItem('observacoesSemana', JSON.stringify(atuais));
    });

    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    observacoesDiasEl.appendChild(wrapper);
  });
}


// ==========================================================================
// 4. TAREFAS (adicionar, concluir, remover)
// ==========================================================================

function carregarTarefas() {
  return JSON.parse(localStorage.getItem('tarefas') || '[]');
}

function salvarTarefas(tarefas) {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function renderizarTarefas() {
  const tarefas = carregarTarefas();
  const pendentes = tarefas.filter(t => !t.concluida);
  const concluidas = tarefas.filter(t => t.concluida);

  listaTarefasEl.innerHTML = '';
  contadorPendentesEl.textContent = pendentes.length;
  mensagemVaziaPendentesEl.classList.toggle('oculto', pendentes.length > 0);

  pendentes.forEach(tarefa => {
    listaTarefasEl.appendChild(criarElementoTarefa(tarefa));
  });

  listaConcluidasEl.innerHTML = '';
  contadorConcluidasEl.textContent = concluidas.length;
  mensagemVaziaConcluidasEl.classList.toggle('oculto', concluidas.length > 0);

  concluidas.forEach(tarefa => {
    listaConcluidasEl.appendChild(criarElementoTarefa(tarefa));
  });
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement('li');
  li.className = `tarefa-item${tarefa.concluida ? ' tarefa-item--concluida' : ''}`;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'tarefa-item__check';
  check.checked = tarefa.concluida;
  check.addEventListener('change', () => alternarConclusao(tarefa.id));

  const conteudo = document.createElement('div');
  conteudo.className = 'tarefa-item__conteudo';

  const texto = document.createElement('p');
  texto.className = 'tarefa-item__texto';
  texto.textContent = tarefa.texto;

  const meta = document.createElement('p');
  meta.className = 'tarefa-item__meta';
  const partesMeta = [];
  if (tarefa.dia) partesMeta.push(tarefa.dia);
  if (tarefa.hora) partesMeta.push(tarefa.hora);
  meta.textContent = partesMeta.join(' · ');

  conteudo.appendChild(texto);
  if (partesMeta.length > 0) conteudo.appendChild(meta);

  const btnRemover = document.createElement('button');
  btnRemover.className = 'tarefa-item__remover';
  btnRemover.setAttribute('aria-label', 'Remover tarefa');
  btnRemover.textContent = '✕';
  btnRemover.addEventListener('click', () => removerTarefa(tarefa.id));

  li.appendChild(check);
  li.appendChild(conteudo);
  li.appendChild(btnRemover);

  return li;
}

function adicionarTarefa() {
  const texto = tarefaInput.value.trim();

  if (texto === '') {
    tarefaInput.focus();
    return;
  }

  const tarefas = carregarTarefas();

  tarefas.push({
    id: Date.now(),
    texto,
    dia: diaSelect.value,
    hora: horaInput.value,
    concluida: false,
  });

  salvarTarefas(tarefas);
  renderizarTarefas();

  tarefaInput.value = '';
  diaSelect.value = '';
  horaInput.value = '';
  tarefaInput.focus();
}

function alternarConclusao(id) {
  const tarefas = carregarTarefas();
  const tarefa = tarefas.find(t => t.id === id);
  if (tarefa) tarefa.concluida = !tarefa.concluida;
  salvarTarefas(tarefas);
  renderizarTarefas();
}

function removerTarefa(id) {
  const tarefas = carregarTarefas().filter(t => t.id !== id);
  salvarTarefas(tarefas);
  renderizarTarefas();
}

btnAdicionar.addEventListener('click', adicionarTarefa);

tarefaInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') adicionarTarefa();
});


// ==========================================================================
// 5. MINI CALENDÁRIO COM EVENTOS (aniversários e datas marcadas)
// ==========================================================================

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

/**
 * Formata uma data como "AAAA-MM-DD", usada como chave no localStorage.
 * Fazemos isso na mão (sem toISOString) pra evitar bugs de fuso horário.
 */
function formatarChaveData(ano, mes, dia) {
  const mesFormatado = String(mes + 1).padStart(2, '0');
  const diaFormatado = String(dia).padStart(2, '0');
  return `${ano}-${mesFormatado}-${diaFormatado}`;
}

function carregarEventos() {
  return JSON.parse(localStorage.getItem('calendarioEventos') || '{}');
}

function salvarEventos(eventos) {
  localStorage.setItem('calendarioEventos', JSON.stringify(eventos));
}

function renderizarCalendario() {
  calTituloMesEl.textContent = `${MESES[mesAtual]} de ${anoAtual}`;

  const abreviacoes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  calDiasSemanaEl.innerHTML = '';
  abreviacoes.forEach(letra => {
    const span = document.createElement('span');
    span.textContent = letra;
    calDiasSemanaEl.appendChild(span);
  });

  calGradeEl.innerHTML = '';

  const eventos = carregarEventos();
  const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1);
  const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0);
  const diaSemanaInicio = primeiroDiaDoMes.getDay();
  const totalDiasNoMes = ultimoDiaDoMes.getDate();

  const hoje = new Date();
  const ehMesAtual = hoje.getMonth() === mesAtual && hoje.getFullYear() === anoAtual;

  const ultimoDiaMesAnterior = new Date(anoAtual, mesAtual, 0).getDate();
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    calGradeEl.appendChild(criarCelulaDia(ultimoDiaMesAnterior - i, true, false, null));
  }

  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    const ehHoje = ehMesAtual && dia === hoje.getDate();
    const chave = formatarChaveData(anoAtual, mesAtual, dia);
    calGradeEl.appendChild(criarCelulaDia(dia, false, ehHoje, chave, eventos[chave]));
  }

  const totalCelulas = diaSemanaInicio + totalDiasNoMes;
  const restante = (7 - (totalCelulas % 7)) % 7;
  for (let dia = 1; dia <= restante; dia++) {
    calGradeEl.appendChild(criarCelulaDia(dia, true, false, null));
  }

  renderizarLegenda(eventos);
}

function criarCelulaDia(numero, ehOutroMes, ehHoje, chave, emoji) {
  const div = document.createElement('div');
  div.className = 'cal-dia';
  if (ehOutroMes) div.classList.add('cal-dia--outro-mes');
  if (ehHoje) div.classList.add('cal-dia--hoje');
  div.textContent = numero;

  if (emoji) {
    div.classList.add('cal-dia--evento');
    div.setAttribute('data-emoji', emoji);
  }

  // Só dias do mês atual (não os "fantasmas") podem ser clicados
  if (!ehOutroMes && chave) {
    div.addEventListener('click', () => abrirPopupDia(chave, numero));
  }

  return div;
}

function renderizarLegenda(eventos) {
  calLegendaEl.innerHTML = '';

  const chavesDoMes = Object.keys(eventos)
    .filter(chave => chave.startsWith(`${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}`))
    .sort();

  chavesDoMes.forEach(chave => {
    const dia = parseInt(chave.split('-')[2], 10);
    const item = document.createElement('div');
    item.className = 'cal-legenda__item';

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'cal-legenda__emoji';
    emojiSpan.textContent = eventos[chave];

    const textoSpan = document.createElement('span');
    textoSpan.textContent = `Dia ${dia}`;

    item.appendChild(emojiSpan);
    item.appendChild(textoSpan);
    calLegendaEl.appendChild(item);
  });
}

function abrirPopupDia(chave, numeroDia) {
  dataSelecionadaPopup = chave;
  calPopupTituloEl.textContent = `Marcar dia ${numeroDia} de ${MESES[mesAtual]}`;
  calPopupEl.classList.remove('oculto');
}

function fecharPopup() {
  calPopupEl.classList.add('oculto');
  dataSelecionadaPopup = null;
}

// Clique num emoji do popup: salva o evento naquele dia
calPopupEmojisEl.addEventListener('click', (event) => {
  const botao = event.target.closest('.cal-popup__emoji');
  if (!botao || !dataSelecionadaPopup) return;

  const eventos = carregarEventos();
  eventos[dataSelecionadaPopup] = botao.dataset.emoji;
  salvarEventos(eventos);

  fecharPopup();
  renderizarCalendario();
});

// Remove a marcação do dia selecionado
calPopupRemoverEl.addEventListener('click', () => {
  if (!dataSelecionadaPopup) return;

  const eventos = carregarEventos();
  delete eventos[dataSelecionadaPopup];
  salvarEventos(eventos);

  fecharPopup();
  renderizarCalendario();
});

calPopupFecharEl.addEventListener('click', fecharPopup);

btnMesAnterior.addEventListener('click', () => {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  fecharPopup();
  renderizarCalendario();
});

btnMesSeguinte.addEventListener('click', () => {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  fecharPopup();
  renderizarCalendario();
});


// ==========================================================================
// 6. INICIALIZAÇÃO
// ==========================================================================

atualizarContador();
carregarObservacoes();
renderizarTarefas();
renderizarCalendario();
