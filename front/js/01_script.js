//criar uma função p mostrar o nome na msg de olá no pop-up dps de logado/cadastrado
//criar uma função para verificar se o usuário está logado, 
// se sim, mostrar a opção de meus dados e etc,
// se não, mostrar o pop-up de cadastro 
//colocar os alertas

// Função para verificar se o usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('rokuzen_current_user') !== null;
}

// Função para atualizar a visibilidade dos elementos com base no status de login
function updateLoginElements() {
    const loginBtn = document.getElementById('acessar-conta');
    const loginCta = document.getElementById('criar-conta');
    const loginTxt = document.getElementById('texto-cad');
    const depoisDeLogado = document.querySelectorAll('.acesso-logado');

    if (isUserLoggedIn()) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (loginCta) loginCta.style.display = 'none';
        if (loginTxt) loginTxt.style.display = 'none';
        depoisDeLogado.forEach(el => { el.style.display = 'block'; });
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (loginCta) loginCta.style.display = 'block';
        if (loginTxt) loginTxt.style.display = 'block';
        depoisDeLogado.forEach(el => { el.style.display = 'none'; });
    }
}

// Logout via JS (sem inline no HTML)
function performLogout() {
    localStorage.removeItem('rokuzen_current_user');
    const greetingElement = document.getElementById('header-greeting');
    if (greetingElement) {
        greetingElement.textContent = '';
        greetingElement.classList.remove('is-visible');
        greetingElement.style.display = 'none';
    }
    updateLoginElements();
    if (typeof updateAuthElements === 'function') updateAuthElements();
    // trocar pelo alert do bootstrap
    alert('Você saiu da conta.');
    window.location.href = window.location.href;
}

document.addEventListener('DOMContentLoaded', function () {
    // Link de agendamentos
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

    // Estado login
    updateLoginElements();
    setTimeout(function () { updateLoginElements(); }, 500);

    // Carousel
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentIndex = slides.findIndex(s => s.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;
    let autoScrollInterval = null;
    
    function updatePosition() { if (track) track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)'; }
    function goTo(index) { 
        currentIndex = (index + slides.length) % slides.length; 
        slides.forEach((s, i) => s.classList.toggle('is-active', i === currentIndex)); 
        updatePosition(); 
    }
    
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            goTo(currentIndex + 1);
        }, 3000);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
    
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoScroll(); goTo(currentIndex - 1); startAutoScroll(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoScroll(); goTo(currentIndex + 1); startAutoScroll(); });
    
    if (track) {
        let startX = 0;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAutoScroll(); }, { passive: true });
        track.addEventListener('touchend', (e) => { 
            const delta = e.changedTouches[0].clientX - startX; 
            if (Math.abs(delta) > 40) { 
                if (delta < 0) goTo(currentIndex + 1); 
                else goTo(currentIndex - 1); 
            }
            startAutoScroll();
        });
        updatePosition();
        startAutoScroll();
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) { e.preventDefault(); performLogout(); });
    }

    // VLibras
    if (window.VLibras && typeof window.VLibras.Widget === 'function') {
        try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {}
    }
});

// Busca
// document.addEventListener('DOMContentLoaded', function () {
//     const searchForm = document.querySelector('#header-pesquisa form');
//     const searchInput = document.querySelector('#header-pesquisa input[name="q"]');
//     if (searchForm && searchInput) {
//         searchForm.addEventListener('submit', function (e) {
//             e.preventDefault();
//             const searchTerm = searchInput.value.trim();
//             if (searchTerm) window.location.href = `busca.html?q=${encodeURIComponent(searchTerm)}`;
//             else alert('Digite algo para buscar!');
//         });
//         searchInput.addEventListener('keypress', function (e) {
//             if (e.key === 'Enter') { e.preventDefault(); searchForm.dispatchEvent(new Event('submit')); }
//         });
//     }
// });

// Cookies
document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    const overlay = modal ? modal.querySelector('.cookie-overlay') : null;
    const reopenBtn = document.getElementById('cookie-reopen');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const acceptAllBtn2 = document.getElementById('cookie-accept-all-2');
    const rejectBtn = document.getElementById('cookie-reject-nonessential');
    const openPrefsBtn = document.getElementById('cookie-open-preferences');
    const savePrefsBtn = document.getElementById('cookie-save-preferences');
    const functionalCb = document.getElementById('cookie-functional');
    const analyticsCb = document.getElementById('cookie-analytics');
    const marketingCb = document.getElementById('cookie-marketing');
    const STORAGE_KEY = 'rokuzen_cookie_prefs_v1';
    function getPrefs() { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } }
    function savePrefs(prefs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); }
    function applyPrefs(prefs) { /* Condicionar scripts conforme prefs aqui no futuro */ }
    function openCookieModal() { if (!modal) return; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); }
    function closeCookieModal() { if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }
    function hideBanner() { if (banner) banner.style.display = 'none'; }
    function showBanner() { if (banner) banner.style.display = 'block'; }
    function showReopen() { if (reopenBtn) reopenBtn.style.display = 'inline-flex'; }
    function setFormFromPrefs(prefs) { if (!prefs) return; if (functionalCb) functionalCb.checked = !!prefs.functional; if (analyticsCb) analyticsCb.checked = !!prefs.analytics; if (marketingCb) marketingCb.checked = !!prefs.marketing; }
    const existing = getPrefs();
    if (!existing) { showBanner(); } else { applyPrefs(existing); showReopen(); }
    if (acceptAllBtn) acceptAllBtn.addEventListener('click', function () { const prefs = { necessary: true, functional: true, analytics: true, marketing: true, ts: Date.now() }; savePrefs(prefs); applyPrefs(prefs); hideBanner(); showReopen(); });
    if (acceptAllBtn2) acceptAllBtn2.addEventListener('click', function () { const prefs = { necessary: true, functional: true, analytics: true, marketing: true, ts: Date.now() }; savePrefs(prefs); applyPrefs(prefs); closeCookieModal(); hideBanner(); showReopen(); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { const prefs = { necessary: true, functional: false, analytics: false, marketing: false, ts: Date.now() }; savePrefs(prefs); applyPrefs(prefs); hideBanner(); showReopen(); });
    if (openPrefsBtn) openPrefsBtn.addEventListener('click', function () { setFormFromPrefs(getPrefs() || { functional: false, analytics: false, marketing: false }); openCookieModal(); });
    if (overlay) overlay.addEventListener('click', closeCookieModal);
    document.querySelectorAll('[data-close="cookie-modal"]').forEach(function (el) { el.addEventListener('click', closeCookieModal); });
    if (savePrefsBtn) savePrefsBtn.addEventListener('click', function () { const prefs = { necessary: true, functional: functionalCb ? !!functionalCb.checked : false, analytics: analyticsCb ? !!analyticsCb.checked : false, marketing: marketingCb ? !!marketingCb.checked : false, ts: Date.now() }; savePrefs(prefs); applyPrefs(prefs); closeCookieModal(); hideBanner(); showReopen(); });
    if (reopenBtn) reopenBtn.addEventListener('click', function () { setFormFromPrefs(getPrefs() || { functional: false, analytics: false, marketing: false }); openCookieModal(); });
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
    
    document.querySelectorAll('#acessar-conta').forEach(function (el) { 
        el.addEventListener('click', function (e) { e.preventDefault(); openModal(loginModal); }); 
    });

    document.querySelectorAll('#criar-conta').forEach(function (el) { 
        el.addEventListener('click', function (e) { e.preventDefault(); openModal(signupModal); }); 
    });

    document.querySelectorAll('[data-close="modal"]').forEach(function (el) { 
        el.addEventListener('click', function () { 
            const modal = el.closest('.auth-modal'); closeModal(modal); 
        });
    });

    document.addEventListener('keydown', function (e) { 
        if (e.key === 'Escape') { [loginModal, signupModal].forEach(closeModal); } 
    });

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
        if (!raw) { el.textContent = ''; 
        el.classList.remove('is-visible'); 
        el.style.display = 'none'; 
        return; } 
        const current = JSON.parse(raw); 
        el.textContent = `Olá, ${current.nome}!`; 
        el.classList.add('is-visible'); 
        l.style.display = 'block'; 
    }
    
    renderGreeting();
    
    function updateAuthElements() { 
        const raw = localStorage.getItem('rokuzen_current_user'); 
        const isLogged = !!raw; 
        const loginBtn = document.getElementById('btn-login'); 
        const loginCta = document.getElementById('criar-conta'); 
        const loggedInElements = document.querySelectorAll('.btn-logged-in'); 
        if (isLogged) { 
            if (loginBtn) loginBtn.style.display = 'none'; 
            if (loginCta) loginCta.style.display = 'none'; 
            loggedInElements.forEach(el => { el.style.display = 'block'; }); 
        } 
        else { 
            if (loginBtn) loginBtn.style.display = 'block'; 
            if (loginCta) loginCta.style.display = 'block'; 
            loggedInElements.forEach(el => { el.style.display = 'none'; }); 
        } 
    }

    updateAuthElements();
    
    const formCadastro = document.getElementById('form-cadastro');
    const erroCadastro = document.getElementById('cad-erro');
    if (formCadastro) { 
        formCadastro.addEventListener('submit', function (e) { 
            e.preventDefault(); 
            const nome = /** @type {HTMLInputElement} */(document.getElementById('cad-nome')).value.trim(); 
            const email = /** @type {HTMLInputElement} */(document.getElementById('cad-email')).value.trim(); 
            const telefone = /** @type {HTMLInputElement} */(document.getElementById('cad-telefone')).value.trim(); 
            const senha = /** @type {HTMLInputElement} */(document.getElementById('cad-senha')).value; 
            const confirmar = /** @type {HTMLInputElement} */(document.getElementById('cad-confirmar')).value; if (senha !== confirmar) { erroCadastro.classList.add('is-visible'); return; } 
            erroCadastro.classList.remove('is-visible'); 
            const result = saveUser({ nome, email, telefone, senha }); 
            if (!result.ok) { alert(result.reason); return; } 
            localStorage.setItem('rokuzen_current_user', JSON.stringify({ nome, email })); 
            renderGreeting(); 
            updateAuthElements(); 
            closeModal(signupModal); 
            //trocar pelo alert do bootstrap
            alert('Cadastro realizado com sucesso!'); 
        }); 
    }

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
            updateAuthElements(); closeModal(loginModal); 
        }); 
    }
    const dropdown = document.querySelector('.dropdown-conteudo');
});