document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome');
  const horario = params.get('horario');
  const data = params.get('data');
  const summary = document.getElementById('summary');
  const pkg4 = document.getElementById('pacote4');
  const pkg8 = document.getElementById('pacote8');
  const finalizarBtn = document.getElementById('btn-finalizar');
  const dadosCliente = document.getElementById('dados-cliente');

  function updateSummary() {
    const serv = document.querySelector('.card.selected')?.textContent || '';
    const eq = document.querySelector('.dot.selected')?.dataset.label || '';
    const dur = document.querySelector('.dur.selected')?.textContent || '';
    const dur4 = document.querySelector('.dur4.selected')?.textContent || '';
    const dur8 = document.querySelector('.dur8.selected')?.textContent || '';
    const dataFormatada = data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
    summary.textContent = `Data: ${dataFormatada} | Profissional: ${nome || '-'} | Horário: ${horario || '-'} | Serviço: ${serv || '-'} | Equipamento: ${eq || '-'} | Duração: ${dur || '-'} | Pacote 4: ${dur4 || '—'} | Pacote 8: ${dur8 || '—'}`;
  }

  // Serviços
  document.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', function () {
      document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('equipamentos').scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateSummary();
    });
  });

  // Dots (equipamentos)
  document.querySelectorAll('.dot').forEach(el => {
    el.addEventListener('click', function () {
      if (el.classList.contains('red')) { alert('Equipamento indisponível.'); return; }
      if (el.classList.contains('yellow')) { alert('Equipamento em manutenção.'); return; }
      document.querySelectorAll('.dot.selected').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('duracao').scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateSummary();
    });
  });

  // Durações
  document.querySelectorAll('.dur').forEach(el => {
    el.addEventListener('click', function () {
      document.querySelectorAll('.dur.selected').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      // revelar pacotes opcionais
      pkg4.classList.remove('hidden');
      pkg8.classList.remove('hidden');
      // mostrar dados do cliente após selecionar duração
      if (dadosCliente) dadosCliente.classList.remove('hidden');
      updateSummary();
    });
  });

  // Seleção de pacotes opcionais (4 e 8 sessões)
  document.querySelectorAll('.dur4').forEach(el => {
    el.addEventListener('click', function () {
      document.querySelectorAll('.dur4.selected').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      updateSummary();
    });
  });

  document.querySelectorAll('.dur8').forEach(el => {
    el.addEventListener('click', function () {
      document.querySelectorAll('.dur8.selected').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      updateSummary();
    });
  });

  // Finalizar
  finalizarBtn.addEventListener('click', function () {
    const serv = document.querySelector('.card.selected')?.textContent;
    const eq = document.querySelector('.dot.selected')?.dataset.label;
    const dur = document.querySelector('.dur.selected')?.textContent;
    if (!serv || !eq || !dur) { alert('Selecione serviço, equipamento (verde) e duração avulsa.'); return; }
    
    // Validar dados do cliente
    const unidade = document.getElementById('unidade');
    const clienteNome = document.getElementById('cliente-nome');
    const clienteEmail = document.getElementById('cliente-email');
    const clienteTelefone = document.getElementById('cliente-telefone');
    
    if (!unidade.value) { alert('Selecione a unidade.'); return; }
    if (!clienteNome.value.trim()) { alert('Informe o nome do cliente.'); return; }
    if (!clienteEmail.value.trim()) { alert('Informe o e-mail do cliente.'); return; }
    if (!clienteTelefone.value.trim()) { alert('Informe o telefone do cliente.'); return; }
    
    const dur4 = document.querySelector('.dur4.selected')?.textContent || null;
    const dur8 = document.querySelector('.dur8.selected')?.textContent || null;
    
    // Salvar agendamento completo
    const agendamento = {
      nome,
      horario,
      data: data,
      servico: serv,
      equipamento: eq,
      duracaoAvulso: dur,
      pacote4: dur4,
      pacote8: dur8,
      unidade: unidade.value,
      unidadeNome: unidade.options[unidade.selectedIndex].textContent,
      clienteNome: clienteNome.value.trim(),
      clienteEmail: clienteEmail.value.trim(),
      clienteTelefone: clienteTelefone.value.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Salvar no localStorage dos agendamentos
    const STORAGE_KEY = 'rokuzen_agendamentos_v1';
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(agendamento);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    // Salvar também como último booking para compatibilidade
    localStorage.setItem('rokuzen_last_booking', JSON.stringify(agendamento));
    
    alert('Agendamento salvo com sucesso!');
    window.location.href = '06_confirmacao.html';
  });

  updateSummary();
});
