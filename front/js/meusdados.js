document.addEventListener('DOMContentLoaded', function () {
  const API = 'http://localhost:3000';
  
  // Verificar se está logado
  const currentRaw = localStorage.getItem('rokuzen_current_user');
  if (!currentRaw) {
    alert('É preciso estar logado para acessar esta página.');
    window.location.href = '/front/html/01_index.html';
    return;
  }
  const current = JSON.parse(currentRaw);
  
  // Carregar dados do usuário
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const telefoneInput = document.getElementById('telefone');
  
  // Carregar dados do backend
  fetch(API + '/auth/profile?email=' + encodeURIComponent(current.email))
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.ok && data.user) {
        if (nomeInput) nomeInput.value = data.user.nome || '';
        if (emailInput) emailInput.value = data.user.email || '';
        if (telefoneInput) telefoneInput.value = data.user.telefone || '';
      } else {
        // Fallback para dados do localStorage
        if (nomeInput) nomeInput.value = current.nome || '';
        if (emailInput) emailInput.value = current.email || '';
        if (telefoneInput) telefoneInput.value = '';
      }
    })
    .catch(() => {
      // Fallback para dados do localStorage
      if (nomeInput) nomeInput.value = current.nome || '';
      if (emailInput) emailInput.value = current.email || '';
      if (telefoneInput) telefoneInput.value = '';
    });
  
  // Formulário de dados pessoais
  const formDados = document.querySelector('form');
  if (formDados && !formDados.id) {
    formDados.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = nomeInput ? nomeInput.value.trim() : '';
      const telefone = telefoneInput ? telefoneInput.value.trim() : '';
      
      if (!nome || nome.length < 2) {
        alert('O nome deve ter pelo menos 2 caracteres.');
        return;
      }
      
      fetch(API + '/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: current.email, nome, telefone })
      }).then(async r => {
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.ok) {
          alert('Dados atualizados com sucesso!');
          // Atualizar localStorage
          const updatedUser = { ...current, nome: data.user.nome, telefone: data.user.telefone };
          localStorage.setItem('rokuzen_current_user', JSON.stringify(updatedUser));
        } else {
          alert('Não foi possível atualizar os dados. Tente novamente.');
        }
      }).catch(() => {
        alert('Erro de rede. Verifique sua conexão.');
      });
    });
  }
  
  // Formulário de alterar senha
  const formAlterarSenha = document.getElementById('form-alterar-senha');
  if (formAlterarSenha) {
    formAlterarSenha.addEventListener('submit', function (e) {
      e.preventDefault();
      const senhaAtual = /** @type {HTMLInputElement} */(document.getElementById('senha-atual')).value;
      const novaSenha = /** @type {HTMLInputElement} */(document.getElementById('nova-senha')).value;
      const confirmar = /** @type {HTMLInputElement} */(document.getElementById('confirmar-senha')).value;

      if (novaSenha.length < 6) { 
        alert('A nova senha deve ter pelo menos 6 caracteres.'); 
        return; 
      }
      if (novaSenha !== confirmar) { 
        alert('A confirmação não confere.'); 
        return; 
      }
      
      fetch(API + '/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: current.email, senhaAtual, novaSenha })
      }).then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) { 
          alert('Não foi possível alterar a senha. Verifique se a senha atual está correta.'); 
          return; 
        }
        alert('Senha atualizada com sucesso.');
        formAlterarSenha.reset();
      }).catch(() => { 
        alert('Erro de rede. Verifique sua conexão.'); 
      });
    });
  }
});


