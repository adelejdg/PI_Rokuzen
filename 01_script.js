// Função para verificar se o usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('rokuzen_current_user') !== null;
}

// Função para atualizar a visibilidade dos elementos com base no status de login
function updateLoginElements() {
    const loginBtn = document.getElementById('btn-login');
    const loginCta = document.getElementById('login-cta');
    const loggedInElements = document.querySelectorAll('.btn-logged-in');

    if (isUserLoggedIn()) {
        // Usuário está logado - esconder opções de login/criar conta
        if (loginBtn) loginBtn.style.display = 'none';
        if (loginCta) loginCta.style.display = 'none';

        // Mostrar elementos para usuários logados
        loggedInElements.forEach(el => {
            el.style.display = 'block';
            console.log('Mostrando elemento logado:', el.textContent);
        });
    } else {
        // Usuário não está logado - mostrar opções de login/criar conta
        if (loginBtn) loginBtn.style.display = 'block';
        if (loginCta) loginCta.style.display = 'block';

        // Esconder elementos para usuários logados
        loggedInElements.forEach(el => {
            el.style.display = 'none';
            console.log('Escondendo elemento logado:', el.textContent);
        });
    }
}

// Função de logout
function logout() {
    // Remover usuário do localStorage
    localStorage.removeItem('rokuzen_current_user');

    // Limpar a saudação diretamente
    const greetingElement = document.getElementById('header-greeting');
    if (greetingElement) {
        greetingElement.textContent = '';
        greetingElement.classList.remove('is-visible');
        greetingElement.style.display = 'none';
    }

    // Atualizar elementos de interface
    updateLoginElements();
    updateAuthElements();

    alert('Você saiu da conta.');

    // Recarregar a página completamente para garantir que todos os elementos sejam atualizados
    window.location.href = window.location.href;
}

document.addEventListener('DOMContentLoaded', function () {
    // Configurar verificação de login para o link de agendamentos
    const linkAgendamentos = document.getElementById('link-agendamentos');
    if (linkAgendamentos) {
        linkAgendamentos.addEventListener('click', function (e) {
            e.preventDefault();
            if (isUserLoggedIn()) {
                window.location.href = '03_meusagendamentos.html';
            } else {
                alert('Entre na sua conta para poder agendar clientes');
            }
        });
    }

    // Inicializar estado dos elementos de login/logout
    updateLoginElements();

    // Forçar a atualização da interface após um pequeno delay
    setTimeout(function () {
        updateLoginElements();
        console.log("Estado de login:", isUserLoggedIn() ? "Logado" : "Não logado");
    }, 500);
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let currentIndex = slides.findIndex(s => s.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    function updatePosition() {
        const offset = -currentIndex * 100;
        track.style.transform = 'translateX(' + offset + '%)';
    }

    function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === currentIndex));
        updatePosition();
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Touch / swipe básico
    let startX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const delta = endX - startX;
        if (Math.abs(delta) > 40) {
            if (delta < 0) goTo(currentIndex + 1);
            else goTo(currentIndex - 1);
        }
    });

    updatePosition();
});

// Funcionalidade da barra de pesquisa
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.querySelector('#header-pesquisa form');
    const searchInput = document.querySelector('#header-pesquisa input[name="q"]');

    console.log('Form encontrado:', searchForm);
    console.log('Input encontrado:', searchInput);

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            console.log('Termo de busca:', searchTerm);

            if (searchTerm) {
                // Redireciona para página de resultados com o termo de busca
                window.location.href = `busca.html?q=${encodeURIComponent(searchTerm)}`;
            } else {
                alert('Digite algo para buscar!');
            }
        });

        // Também permite busca ao pressionar Enter
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.dispatchEvent(new Event('submit'));
            }
        });
    } else {
        console.log('Elementos não encontrados');
    }
});
// Modais Login/Cadastro
document.addEventListener('DOMContentLoaded', function () {
    const loginModal = document.getElementById('modal-login');
    const signupModal = document.getElementById('modal-cadastro');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Abrir pelos links
    document.querySelectorAll('.btn-access-account:not(.btn-block)').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            openModal(loginModal);
        });
    });

    document.querySelectorAll('.link-start-here').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            openModal(signupModal);
        });
    });

    // Fechar pelos elementos com data-close
    document.querySelectorAll('[data-close="modal"]').forEach(function (el) {
        el.addEventListener('click', function () {
            const modal = el.closest('.auth-modal');
            closeModal(modal);
        });
    });

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            [loginModal, signupModal].forEach(closeModal);
        }
    });

    // Persistência e cumprimento
    function saveUser(user) {
        const raw = localStorage.getItem('rokuzen_users');
        const users = raw ? JSON.parse(raw) : [];
        const exists = users.some(u => u.email === user.email);
        if (exists) return { ok: false, reason: 'E-mail já cadastrado.' };
        users.push(user);
        localStorage.setItem('rokuzen_users', JSON.stringify(users));
        return { ok: true };
    }

    function renderGreeting() {
        const el = document.getElementById('header-greeting');
        if (!el) return;
        const raw = localStorage.getItem('rokuzen_current_user');
        if (!raw) {
            el.textContent = '';
            el.classList.remove('is-visible');
            el.style.display = 'none';
            return;
        }
        const current = JSON.parse(raw);
        el.textContent = `Olá, ${current.nome}`;
        el.classList.add('is-visible');
        el.style.display = 'block';
    }

    // Mostrar cumprimento se já logado ao carregar
    renderGreeting();
    // Esconder opções de login/cadastro se logado e mostrar opções de usuário logado
    function updateAuthElements() {
        const raw = localStorage.getItem('rokuzen_current_user');
        const isLogged = !!raw;

        // Elementos de login/cadastro
        const loginBtn = document.getElementById('btn-login');
        const loginCta = document.getElementById('login-cta');

        // Elementos para usuários logados
        const loggedInElements = document.querySelectorAll('.btn-logged-in');

        if (isLogged) {
            // Esconder opções de login/cadastro
            if (loginBtn) loginBtn.style.display = 'none';
            if (loginCta) loginCta.style.display = 'none';

            // Mostrar opções para usuários logados
            loggedInElements.forEach(el => {
                el.style.display = 'block';
                console.log('Mostrando elemento logado:', el.textContent);
            });
        } else {
            // Mostrar opções de login/cadastro
            if (loginBtn) loginBtn.style.display = 'block';
            if (loginCta) loginCta.style.display = 'block';

            // Esconder opções para usuários logados
            loggedInElements.forEach(el => {
                el.style.display = 'none';
                console.log('Escondendo elemento logado:', el.textContent);
            });
        }
    }

    // Atualizar elementos ao carregar a página
    updateAuthElements();

    // Cadastro com validação e auto-login
    const formCadastro = document.getElementById('form-cadastro');
    const erroCadastro = document.getElementById('cad-erro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function (e) {
            e.preventDefault();
            const nome = /** @type {HTMLInputElement} */(document.getElementById('cad-nome')).value.trim();
            const email = /** @type {HTMLInputElement} */(document.getElementById('cad-email')).value.trim();
            const telefone = /** @type {HTMLInputElement} */(document.getElementById('cad-telefone')).value.trim();
            const senha = /** @type {HTMLInputElement} */(document.getElementById('cad-senha')).value;
            const confirmar = /** @type {HTMLInputElement} */(document.getElementById('cad-confirmar')).value;
            if (senha !== confirmar) {
                erroCadastro.classList.add('is-visible');
                return;
            }
            erroCadastro.classList.remove('is-visible');
            const result = saveUser({ nome, email, telefone, senha });
            if (!result.ok) {
                alert(result.reason);
                return;
            }
            localStorage.setItem('rokuzen_current_user', JSON.stringify({ nome, email }));
            renderGreeting();
            updateAuthElements(); // Atualizar elementos de interface
            closeModal(signupModal);
            alert('Cadastro realizado com sucesso!');
        });
    }

    // Login validando localStorage
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = /** @type {HTMLInputElement} */(document.getElementById('login-email')).value.trim();
            const senha = /** @type {HTMLInputElement} */(document.getElementById('login-senha')).value;
            const raw = localStorage.getItem('rokuzen_users');
            const users = raw ? JSON.parse(raw) : [];
            const user = users.find(u => u.email === email && u.senha === senha);
            if (!user) {
                alert('E-mail ou senha inválidos.');
                return;
            }
            localStorage.setItem('rokuzen_current_user', JSON.stringify({ nome: user.nome, email: user.email }));
            renderGreeting();
            updateAuthElements(); // Atualizar elementos de interface
            closeModal(loginModal);
        });
    }

    // Adiciona ação de sair no dropdown, se não existir
    const dropdown = document.querySelector('.dropdown-conteudo');
    if (dropdown && !dropdown.querySelector('.btn-logout')) {
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'btn-block btn-logout';
        logoutLink.textContent = 'Sair';
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('rokuzen_current_user');
            renderGreeting();
            // Reexibir opções de login/cadastro ao sair
            const accessBtn = document.querySelector('.btn-access-account:not(.btn-block)');
            const ctaRow = document.querySelector('.login-cta-row');
            if (accessBtn) accessBtn.style.display = '';
            if (ctaRow) ctaRow.style.display = '';
            alert('Você saiu da conta.');
        });
        dropdown.appendChild(logoutLink);
    }
});