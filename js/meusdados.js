document.addEventListener('DOMContentLoaded', function () {
  const formAlterarSenha = document.getElementById('form-alterar-senha');
  if (!formAlterarSenha) return;

  formAlterarSenha.addEventListener('submit', function (e) {
    e.preventDefault();
    const senhaAtual = /** @type {HTMLInputElement} */(document.getElementById('senha-atual')).value;
    const novaSenha = /** @type {HTMLInputElement} */(document.getElementById('nova-senha')).value;
    const confirmar = /** @type {HTMLInputElement} */(document.getElementById('confirmar-senha')).value;

    const rawUsers = localStorage.getItem('rokuzen_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const currentRaw = localStorage.getItem('rokuzen_current_user');
    if (!currentRaw) { alert('É preciso estar logado para alterar a senha.'); return; }
    const current = JSON.parse(currentRaw);

    const idx = users.findIndex(u => u.email === current.email);
    if (idx < 0) { alert('Usuário não encontrado.'); return; }
    const user = users[idx];

    if (user.senha !== senhaAtual) { alert('Senha atual incorreta.'); return; }
    if (novaSenha.length < 6) { alert('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { alert('A confirmação não confere.'); return; }

    users[idx] = { ...user, senha: novaSenha };
    localStorage.setItem('rokuzen_users', JSON.stringify(users));
    alert('Senha atualizada com sucesso.');
    formAlterarSenha.reset();
  });
});


