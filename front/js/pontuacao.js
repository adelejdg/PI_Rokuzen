document.addEventListener('DOMContentLoaded', function() {
  const API = 'http://localhost:3000';
  let dadosPontuacao = null;

  // Verificar se tem permissão (admin, massagista ou recepcionista)
  const userType = getUserType();
  if (userType !== 'admin' && userType !== 'massagista' && userType !== 'recepcionista') {
    alert('Você não tem permissão para acessar esta página.');
    window.location.href = '01_index.html';
    return;
  }

  // Preencher anos
  function populateYears() {
    const select = document.getElementById('filter-ano');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      select.appendChild(option);
    }
  }

  // Carregar pontuação
  async function loadPontuacao() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      alert('Usuário não encontrado.');
      return;
    }

    const mes = document.getElementById('filter-mes').value;
    const ano = document.getElementById('filter-ano').value;

    try {
      let url = API + '/pontuacao/pessoal?email=' + encodeURIComponent(currentUser.email);
      if (mes && ano) {
        url += '&mes=' + mes + '&ano=' + ano;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        dadosPontuacao = data;
        renderPontuacao();
      } else {
        console.error('Erro ao carregar pontuação');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function renderPontuacao() {
    if (!dadosPontuacao) return;

    document.getElementById('total-pontos').textContent = dadosPontuacao.totalPontos.toFixed(2);
    document.getElementById('total-atendimentos').textContent = dadosPontuacao.totalAgendamentos;

    const tbody = document.getElementById('pontuacao-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (dadosPontuacao.detalhes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Nenhum atendimento encontrado no período selecionado.</td></tr>';
      return;
    }

    dadosPontuacao.detalhes.forEach(detalhe => {
      const tr = document.createElement('tr');
      const dataFormatada = new Date(detalhe.data + 'T00:00:00').toLocaleDateString('pt-BR');
      const valorFormatado = detalhe.valor ? `R$ ${detalhe.valor.toFixed(2).replace('.', ',')}` : '-';
      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${detalhe.horario || '-'}</td>
        <td>${detalhe.servico || '-'}</td>
        <td>${detalhe.cliente || '-'}</td>
        <td>${detalhe.unidade || '-'}</td>
        <td>${valorFormatado}</td>
        <td><strong>${detalhe.pontos.toFixed(2)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Event listeners
  document.getElementById('filter-mes').addEventListener('change', loadPontuacao);
  document.getElementById('filter-ano').addEventListener('change', loadPontuacao);

  // Inicializar
  populateYears();
  loadPontuacao();
});


