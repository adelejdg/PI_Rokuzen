document.addEventListener('DOMContentLoaded', function () {
  const table = document.getElementById('grade');
  const dataInput = document.getElementById('data-agendamento');
  const dataSelecionada = document.getElementById('data-selecionada');
  let selectedName = null;
  let selectedDate = null;
  
  table.addEventListener('click', function (e) {
    const head = e.target.closest('th.selectable');
    if (head) {
      table.querySelectorAll('th.selectable.selected').forEach(th => th.classList.remove('selected'));
      head.classList.add('selected');
      selectedName = head.textContent;
      return;
    }
    const cell = e.target.closest('.slot');
    if (!cell) return;
    if (cell.classList.contains('status-red')) return; // não permite selecionar reservados
    table.querySelectorAll('.slot.selected').forEach(td => td.classList.remove('selected'));
    cell.classList.add('selected');
  });

  // Configurar data mínima para hoje
  const hoje = new Date().toISOString().split('T')[0];
  dataInput.min = hoje;
  dataInput.value = hoje;
  selectedDate = hoje;
  updateDataSelecionada();

  // Listener para mudança de data
  dataInput.addEventListener('change', function() {
    selectedDate = this.value;
    updateDataSelecionada();
    // Limpar seleções quando mudar a data
    table.querySelectorAll('.slot.selected').forEach(td => td.classList.remove('selected'));
    table.querySelectorAll('th.selectable.selected').forEach(th => th.classList.remove('selected'));
    selectedName = null;
    markReservations();
  });

  function updateDataSelecionada() {
    if (selectedDate) {
      const dataFormatada = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      dataSelecionada.textContent = `Data selecionada: ${dataFormatada}`;
    }
  }

  document.getElementById('btn-confirmar').addEventListener('click', function () {
    const chosen = table.querySelector('.slot.selected');
    if (!selectedDate) { alert('Selecione uma data.'); return; }
    if (!selectedName) { alert('Selecione um nome no cabeçalho.'); return; }
    if (!chosen) { alert('Selecione um horário.'); return; }
    const params = new URLSearchParams({ 
      nome: selectedName, 
      horario: chosen.dataset.hora,
      data: selectedDate
    });
    window.location.href = '05_servicos.html?' + params.toString();
  });

  // Substitui os nomes por aleatórios, mas persistindo entre visitas
  const nomesBase = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Giovana', 'Hugo', 'Isabela', 'João', 'Katia', 'Leonardo', 'Marina', 'Nicolas', 'Olivia', 'Paula', 'Rafael', 'Sofia', 'Tiago', 'Vitória'];
  const ths = Array.from(table.tHead.querySelectorAll('th')).slice(1);
  let nomesPersistidos = null;
  try { nomesPersistidos = JSON.parse(localStorage.getItem('rokuzen_schedule_names') || 'null'); } catch { }
  if (!nomesPersistidos || nomesPersistidos.length < ths.length) {
    const usados = new Set();
    nomesPersistidos = ths.map(() => {
      let nome;
      do { nome = nomesBase[Math.floor(Math.random() * nomesBase.length)]; } while (usados.has(nome));
      usados.add(nome);
      return nome;
    });
    localStorage.setItem('rokuzen_schedule_names', JSON.stringify(nomesPersistidos));
  }
  ths.forEach((th, i) => {
    th.textContent = nomesPersistidos[i];
    th.classList.add('selectable');
  });

  // Gera horários aleatórios nas células e aplica status
  // horários fixos por linha, sem aleatoriedade
  function horaDaLinha(rowIndex) {
    const mapa = {
      0: '09:00',
      1: '10:00',
      2: '11:00',
      3: '14:00',
      4: '15:00',
      5: '16:00'
    };
    return mapa[rowIndex] || '09:00';
  }

  // Preenche horários fixos por linha
  Array.from(table.tBodies[0].rows).forEach((row, rIdx) => {
    const hora = horaDaLinha(rIdx);
    Array.from(row.cells).forEach((cell, cIdx) => {
      if (cIdx === 0) return; // cabeçalho da linha
      const td = cell;
      if (!td.classList.contains('slot')) return;
      td.textContent = hora;
      td.dataset.hora = hora;
      td.classList.add('status-green');
    });
  });

  function markReservations() {
    let bookings = [];
    try { bookings = JSON.parse(localStorage.getItem('rokuzen_agendamentos_v1') || '[]'); } catch { }
    const headerCols = Array.from(table.tHead.querySelectorAll('th')).slice(1);
    const colToName = headerCols.map(th => th.textContent);
    Array.from(table.tBodies[0].rows).forEach(row => {
      Array.from(row.cells).forEach((cell, idx) => {
        if (idx === 0) return;
        const td = cell;
        if (!td.classList.contains('slot')) return;
        const nomeCol = colToName[idx - 1];
        const horaCell = td.dataset.hora;
        const reservado = bookings.some(b => b.nome === nomeCol && b.horario === horaCell && b.data === selectedDate);
        if (reservado) {
          td.classList.remove('selected');
          td.classList.remove('status-green');
          td.classList.add('status-red');
          td.title = 'Horário indisponível';
        } else {
          td.classList.add('status-green');
          td.classList.remove('status-red');
          td.title = 'Disponível';
        }
      });
    });
  }

  // Inicial marcação de reservas
  markReservations();
});
