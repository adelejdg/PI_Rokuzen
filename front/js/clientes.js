document.addEventListener('DOMContentLoaded', function() {
  const API = 'http://localhost:3000';
  let clientes = [];

  // Verificar se é admin
  if (!isAdmin()) {
    alert('Apenas administradores podem acessar esta página.');
    window.location.href = '01_index.html';
    return;
  }

  // Carregar clientes
  async function loadClientes() {
    try {
      const response = await fetch(API + '/users/clientes');
      if (response.ok) {
        const data = await response.json();
        clientes = data.clientes || [];
        renderClientes();
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  function renderClientes(filter = '') {
    const tbody = document.getElementById('clientes-tbody');
    const totalElement = document.getElementById('total-clientes');
    
    if (!tbody) return;

    const filterLower = filter.toLowerCase();
    const filtered = clientes.filter(cliente => {
      const nome = (cliente.nome || '').toLowerCase();
      const email = (cliente.email || '').toLowerCase();
      return nome.includes(filterLower) || email.includes(filterLower);
    });

    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Nenhum cliente encontrado.</td></tr>';
      totalElement.textContent = '0';
      return;
    }

    filtered.forEach(cliente => {
      const tr = document.createElement('tr');
      const dataCadastro = cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '-';
      tr.innerHTML = `
        <td>${cliente.nome || '-'}</td>
        <td>${cliente.email || '-'}</td>
        <td>${cliente.telefone || '-'}</td>
        <td>${dataCadastro}</td>
      `;
      tbody.appendChild(tr);
    });

    totalElement.textContent = filtered.length;
  }

  // Event listener para busca
  document.getElementById('search-cliente').addEventListener('input', (e) => {
    renderClientes(e.target.value);
  });

  // Inicializar
  loadClientes();
});


