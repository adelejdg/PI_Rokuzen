document.addEventListener('DOMContentLoaded', function() {
  const API = 'http://localhost:3000';
  let escalas = [];
  let atendentes = [];

  // Verificar se é admin
  if (!isAdmin()) {
    alert('Apenas administradores podem acessar esta página.');
    window.location.href = '01_index.html';
    return;
  }

  // Carregar atendentes
  async function loadAtendentes() {
    try {
      const response = await fetch(API + '/atendentes');
      if (response.ok) {
        const data = await response.json();
        atendentes = data.atendentes || [];
        console.log('Atendentes carregados:', atendentes.length);
        if (atendentes.length === 0) {
          console.warn('Nenhum atendente encontrado. Use o endpoint /atendentes/init para criar atendentes padrão.');
        }
        updateAtendenteFilters();
      } else {
        console.error('Erro ao carregar atendentes:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
      alert('Erro ao carregar atendentes. Verifique se o servidor está rodando.');
    }
  }

  function updateAtendenteFilters() {
    const filterSelect = document.getElementById('filter-atendente');
    const formSelect = document.getElementById('escala-atendente');
    
    // Para o filtro, manter "Todos"
    if (filterSelect) {
      const currentValue = filterSelect.value;
      filterSelect.innerHTML = '<option value="">Todos</option>';
      atendentes.forEach(atendente => {
        const option = document.createElement('option');
        option.value = atendente.nome;
        option.textContent = atendente.nome;
        if (currentValue === atendente.nome) {
          option.selected = true;
        }
        filterSelect.appendChild(option);
      });
    }
    
    // Para o formulário, não incluir "Todos", apenas os atendentes
    if (formSelect) {
      const currentValue = formSelect.value;
      formSelect.innerHTML = '<option value="">Selecione um atendente...</option>';
      atendentes.forEach(atendente => {
        const option = document.createElement('option');
        option.value = atendente.nome;
        option.textContent = atendente.nome;
        if (currentValue === atendente.nome) {
          option.selected = true;
        }
        formSelect.appendChild(option);
      });
    }
  }

  // Carregar escalas
  async function loadEscalas() {
    try {
      const unidade = document.getElementById('filter-unidade').value;
      const atendenteNome = document.getElementById('filter-atendente').value;
      
      let url = API + '/escalas?';
      if (unidade) url += 'unidade=' + unidade + '&';
      if (atendenteNome) url += 'atendenteNome=' + encodeURIComponent(atendenteNome);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        escalas = data.escalas || [];
        renderEscalas();
      }
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
    }
  }

  function renderEscalas() {
    const tbody = document.getElementById('escalas-tbody');
    if (!tbody) return;

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    tbody.innerHTML = '';
    
    if (escalas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Nenhuma escala encontrada.</td></tr>';
      return;
    }

    escalas.forEach(escala => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escala.atendenteNome}</td>
        <td>${escala.unidade}</td>
        <td>${diasSemana[escala.diaSemana]}</td>
        <td>${escala.entrada}</td>
        <td>${escala.saida}</td>
        <td>
          <button class="btn-edit" onclick="editEscala('${escala._id}')">Editar</button>
          <button class="btn-delete" onclick="deleteEscala('${escala._id}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Event listeners
  document.getElementById('filter-unidade').addEventListener('change', loadEscalas);
  document.getElementById('filter-atendente').addEventListener('change', loadEscalas);
  document.getElementById('escala-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEscala();
  });

  // Modal functions
  window.openModal = async function(escalaId = null) {
    // Garantir que os atendentes estejam carregados antes de abrir o modal
    if (atendentes.length === 0) {
      await loadAtendentes();
    }
    
    const modal = document.getElementById('escala-modal');
    const form = document.getElementById('escala-form');
    form.reset();
    document.getElementById('escala-id').value = '';
    document.getElementById('modal-title').textContent = 'Nova Escala';
    
    // Atualizar a lista de atendentes no formulário
    updateAtendenteFilters();
    
    if (escalaId) {
      const escala = escalas.find(e => e._id === escalaId);
      if (escala) {
        document.getElementById('escala-id').value = escala._id;
        document.getElementById('escala-atendente').value = escala.atendenteNome;
        document.getElementById('escala-unidade').value = escala.unidade;
        document.getElementById('escala-dia').value = escala.diaSemana;
        document.getElementById('escala-entrada').value = escala.entrada;
        document.getElementById('escala-saida').value = escala.saida;
        document.getElementById('modal-title').textContent = 'Editar Escala';
      }
    }
    
    modal.style.display = 'block';
  };

  window.closeModal = function() {
    document.getElementById('escala-modal').style.display = 'none';
  };

  window.editEscala = function(id) {
    openModal(id);
  };

  window.deleteEscala = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;
    
    try {
      const response = await fetch(API + '/escalas/' + id, { method: 'DELETE' });
      if (response.ok) {
        await loadEscalas();
      } else {
        alert('Erro ao excluir escala.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir escala.');
    }
  };

  async function saveEscala() {
    const id = document.getElementById('escala-id').value;
    const data = {
      atendenteNome: document.getElementById('escala-atendente').value,
      unidade: document.getElementById('escala-unidade').value,
      diaSemana: parseInt(document.getElementById('escala-dia').value),
      entrada: document.getElementById('escala-entrada').value,
      saida: document.getElementById('escala-saida').value
    };

    try {
      let response;
      if (id) {
        response = await fetch(API + '/escalas/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch(API + '/escalas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (response.ok) {
        closeModal();
        await loadEscalas();
      } else {
        const error = await response.json();
        alert('Erro ao salvar: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar escala.');
    }
  }

  // Fechar modal ao clicar fora
  window.onclick = function(event) {
    const modal = document.getElementById('escala-modal');
    if (event.target === modal) {
      closeModal();
    }
  };

  // Inicializar
  async function init() {
    await loadAtendentes();
    await loadEscalas();
  }
  
  init();
});

