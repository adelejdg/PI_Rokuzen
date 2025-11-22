// Função para verificar se o usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('rokuzen_current_user') !== null;
}

// Função para obter dados do usuário logado
function getCurrentUser() {
    const userStr = localStorage.getItem('rokuzen_current_user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Função para obter tipo de usuário
function getUserType() {
    const user = getCurrentUser();
    if (!user || !user.email) return 'cliente';
    // Se já tiver tipo salvo, usar ele
    if (user.tipo) return user.tipo;
    // Caso contrário, determinar pelo email
    return getUserTypeFromEmail(user.email);
}

function getUserTypeFromEmail(email) {
    if (!email) return 'cliente';
    const domain = email.toLowerCase().split('@')[1];
    if (domain === 'admin.com') return 'admin';
    if (domain === 'massagista.com') return 'massagista';
    if (domain === 'recepcionista.com') return 'recepcionista';
    return 'cliente';
}

// Funções de verificação de permissões
function canAccessTimer() {
    const tipo = getUserType();
    return tipo === 'massagista' || tipo === 'admin';
}

function canAccessRelatorio() {
    const tipo = getUserType();
    return tipo === 'massagista' || tipo === 'admin';
}

function canAccessEstatisticas() {
    const tipo = getUserType();
    return tipo === 'admin';
}

function isAdmin() {
    return getUserType() === 'admin';
}

function isMassagista() {
    return getUserType() === 'massagista';
}

function isRecepcionista() {
    return getUserType() === 'recepcionista';
}

// Função para atualizar a visibilidade dos elementos com base no status de login
function updateLoginElements() {
    const loginBtn = document.getElementById('acessar-conta');
    const loginCta = document.getElementById('criar-conta');
    const loginTxt = document.getElementById('texto-cad');
    const depoisDeLogado = document.querySelectorAll('.acesso-logado');
    const linkAgendamento = document.getElementById('agendar-horario-link');
    
    // Links de acesso baseado em permissões
    const linkRelatorio = document.getElementById('link-relatorio');
    const brRelatorio = document.getElementById('br-relatorio');
    const linkEstatisticas = document.getElementById('link-estatisticas');
    const brEstatisticas = document.getElementById('br-estatisticas');
    const linkEscalas = document.getElementById('link-escalas');
    const brEscalas = document.getElementById('br-escalas');
    const linkClientes = document.getElementById('link-clientes');
    const brClientes = document.getElementById('br-clientes');
    const linkPontuacao = document.getElementById('link-pontuacao');
    const brPontuacao = document.getElementById('br-pontuacao');

    if (isUserLoggedIn()) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (loginCta) loginCta.style.display = 'none';
        if (loginTxt) loginTxt.style.display = 'none';
        depoisDeLogado.forEach(el => { el.style.display = 'block'; });
        // Link "Agende seu horário" aponta para a página com tabela semanal
        if (linkAgendamento) linkAgendamento.href = '/front/html/03_meusagendamentos.html?view=schedule';
        
        // Mostrar/ocultar links baseado em permissões
        if (linkRelatorio && brRelatorio) {
            if (canAccessRelatorio()) {
                linkRelatorio.style.display = 'block';
                brRelatorio.style.display = 'block';
            } else {
                linkRelatorio.style.display = 'none';
                brRelatorio.style.display = 'none';
            }
        }
        
        if (linkEstatisticas && brEstatisticas) {
            if (canAccessEstatisticas()) {
                linkEstatisticas.style.display = 'block';
                brEstatisticas.style.display = 'block';
            } else {
                linkEstatisticas.style.display = 'none';
                brEstatisticas.style.display = 'none';
            }
        }
        
        // Links de admin (escalas e clientes)
        if (linkEscalas && brEscalas) {
            if (isAdmin()) {
                linkEscalas.style.display = 'block';
                brEscalas.style.display = 'block';
            } else {
                linkEscalas.style.display = 'none';
                brEscalas.style.display = 'none';
            }
        }
        
        if (linkClientes && brClientes) {
            if (isAdmin()) {
                linkClientes.style.display = 'block';
                brClientes.style.display = 'block';
            } else {
                linkClientes.style.display = 'none';
                brClientes.style.display = 'none';
            }
        }
        
        // Link de pontuação (admin, massagista, recepcionista)
        if (linkPontuacao && brPontuacao) {
            const tipo = getUserType();
            if (tipo === 'admin' || tipo === 'massagista' || tipo === 'recepcionista') {
                linkPontuacao.style.display = 'block';
                brPontuacao.style.display = 'block';
            } else {
                linkPontuacao.style.display = 'none';
                brPontuacao.style.display = 'none';
            }
        }
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

    // Widget de Acessibilidade para Daltônicos
    const acessibilidadeBtn = document.getElementById('acessibilidade-btn');
    const acessibilidadePanel = document.getElementById('acessibilidade-panel');
    const acessibilidadeClose = document.getElementById('acessibilidade-close');
    const acessibilidadeOptions = document.querySelectorAll('.acessibilidade-option');
    
    // Abrir/fechar painel
    if (acessibilidadeBtn && acessibilidadePanel) {
        acessibilidadeBtn.addEventListener('click', function() {
            const isVisible = acessibilidadePanel.style.display === 'block';
            acessibilidadePanel.style.display = isVisible ? 'none' : 'block';
        });
    }
    
    if (acessibilidadeClose && acessibilidadePanel) {
        acessibilidadeClose.addEventListener('click', function() {
            acessibilidadePanel.style.display = 'none';
        });
    }
    
    // Aplicar filtros
    if (acessibilidadeOptions.length > 0) {
        // Carregar preferência salva
        const savedFilter = localStorage.getItem('rokuzen_accessibility_filter') || 'normal';
        applyAccessibilityFilter(savedFilter);
        
        acessibilidadeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                applyAccessibilityFilter(filter);
                localStorage.setItem('rokuzen_accessibility_filter', filter);
                
                // Atualizar estado visual
                acessibilidadeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
            
            // Marcar opção salva como ativa
            if (option.getAttribute('data-filter') === savedFilter) {
                option.classList.add('active');
            }
        });
    }
    
    function applyAccessibilityFilter(filter) {
        const body = document.body;
        
        // Remover todos os filtros
        body.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia', 'filter-high-contrast', 'filter-grayscale');
        
        if (filter !== 'normal') {
            body.classList.add('filter-' + filter);
        }
    }
});

// Busca
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.querySelector('#header-pesquisa form');
    const searchInput = document.querySelector('#header-pesquisa input[name="q"]');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `busca.html?q=${encodeURIComponent(searchTerm)}`;
            } else {
                alert('Digite algo para buscar!');
            }
        });
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});

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
    const dropdownAcc = document.getElementById('dropdown-account');
    const btnMinhaConta = document.getElementById('btn-minha-conta');
    
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

    if (dropdownAcc && btnMinhaConta) {
        // Verifica se já foi inicializado para evitar múltiplos listeners
        if (dropdownAcc._dropdownInitialized) {
            return;
        }
        dropdownAcc._dropdownInitialized = true;
        
        // Flag global para rastrear se o botão foi clicado
        if (!window._dropdownButtonClicked) {
            window._dropdownButtonClicked = false;
        }
        
        // Função para abrir o dropdown
        function openDropdown() {
            dropdownAcc.classList.add('is-open');
            dropdownAcc.setAttribute('aria-expanded', 'true');
        }
        
        // Função para fechar o dropdown
        function closeDropdown() {
            dropdownAcc.classList.remove('is-open');
            dropdownAcc.setAttribute('aria-expanded', 'false');
        }
        
        // Função para toggle do dropdown
        function toggleDropdown(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Marca que o botão foi clicado ANTES de fazer qualquer coisa
            window._dropdownButtonClicked = true;
            
            const wasOpen = dropdownAcc.classList.contains('is-open');
            
            if (wasOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
            
            // Mantém a flag por mais tempo para evitar que o listener do document feche imediatamente
            setTimeout(function() {
                window._dropdownButtonClicked = false;
            }, 500); // Aumentado para 500ms para garantir
        }
        
        // Event listener APENAS no botão "Minha conta"
        // Usa mousedown em vez de click para garantir que seja processado primeiro
        btnMinhaConta.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Marca imediatamente que o botão foi clicado
            window._dropdownButtonClicked = true;
        }, true); // Usa capture phase para processar antes
        
        btnMinhaConta.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleDropdown(e);
            return false;
        }, false); // Não usa capture phase no click
        
        // Event listener no dropdown para teclado (acessibilidade)
        dropdownAcc.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { 
                e.preventDefault(); 
                toggleDropdown(e); 
            }
            if (e.key === 'Escape') { 
                closeDropdown();
            }
        });
        
        // Prevenir que cliques dentro do dropdown o fechem
        const dropdownContent = dropdownAcc.querySelector('.dropdown-conteudo');
        if (dropdownContent) {
            // Adiciona listener no mousedown também para prevenir propagação
            dropdownContent.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            });
            dropdownContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // Previne que cliques nos links dentro do dropdown fechem o dropdown
            const linksInside = dropdownContent.querySelectorAll('a');
            linksInside.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            });
        }
        
        // Fechar dropdown quando clicar fora - usando um listener único global
        // Só adiciona uma vez, mesmo se o script for carregado múltiplas vezes
        if (!window._dropdownAccountGlobalListener) {
            window._dropdownAccountGlobalListener = true;
            
            // Usa um listener único no document, mas com verificação mais cuidadosa
            document.addEventListener('click', function (e) {
                // Ignora completamente se o botão foi clicado recentemente
                if (window._dropdownButtonClicked) {
                    return;
                }
                
                // Verifica todos os dropdowns abertos
                const allDropdowns = document.querySelectorAll('#dropdown-account.is-open');
                
                // Se não há dropdowns abertos, não faz nada
                if (allDropdowns.length === 0) {
                    return;
                }
                
                // Pequeno delay para garantir que stopPropagation dos links foi processado
                setTimeout(function() {
                    // Verifica novamente se o botão foi clicado
                    if (window._dropdownButtonClicked) {
                        return;
                    }
                    
                    // Verifica novamente os dropdowns abertos
                    const currentDropdowns = document.querySelectorAll('#dropdown-account.is-open');
                    
                    currentDropdowns.forEach(function(dropdown) {
                        const btn = dropdown.querySelector('#btn-minha-conta');
                        const dropdownContent = dropdown.querySelector('.dropdown-conteudo');
                        
                        // Verifica se o clique foi no botão
                        const clickedOnButton = e.target === btn || 
                                              (btn && btn.contains && btn.contains(e.target)) ||
                                              (e.target && e.target.id === 'btn-minha-conta');
                        
                        // Verifica se o clique foi dentro do dropdown (incluindo todo o conteúdo)
                        const clickedInsideDropdown = dropdown.contains(e.target) || 
                                                     (dropdownContent && dropdownContent.contains(e.target));
                        
                        // Verifica se o clique foi em algum link dentro do dropdown
                        let clickedOnLink = false;
                        if (dropdownContent) {
                            const links = dropdownContent.querySelectorAll('a');
                            links.forEach(function(link) {
                                if (link === e.target || link.contains(e.target)) {
                                    clickedOnLink = true;
                                }
                            });
                        }
                        
                        // Só fecha se clicou FORA do dropdown E não foi no botão E não foi em um link
                        if (!clickedInsideDropdown && !clickedOnButton && !clickedOnLink) {
                            dropdown.classList.remove('is-open');
                            dropdown.setAttribute('aria-expanded', 'false');
                        }
                    });
                }, 100); // Delay maior para garantir que o evento do botão foi processado
            }, false); // Não usa capture phase
        }
    }

    const API = 'http://localhost:3000';
    const cadastroForm = document.getElementById('form-cadastro');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const nome = document.getElementById('cad-nome')?.value || '';
            const email = document.getElementById('cad-email')?.value || '';
            const senha = document.getElementById('cad-senha')?.value || '';
            const confirmar = document.getElementById('cad-confirmar')?.value || '';
            if (!nome || !email || !senha || senha !== confirmar) { alert('Verifique os dados.'); return; }
            try {
                const r = await fetch(API + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, email, senha }) });
                const data = await r.json();
                if (!r.ok || !data.ok) { alert('Não foi possível cadastrar.'); return; }
                localStorage.setItem('rokuzen_current_user', JSON.stringify({ 
                    nome: data.user.nome, 
                    email: data.user.email, 
                    tipo: data.user.tipo || getUserTypeFromEmail(data.user.email)
                }));
                updateLoginElements();
                if (typeof updateAuthElements === 'function') updateAuthElements();
                closeModal(signupModal);
                alert('Conta criada com sucesso.');
            } catch (_) { alert('Erro de rede.'); }
        });
    }
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('cadastro-email')?.value || '';
            const senha = document.getElementById('cadastro-senha')?.value || '';
            if (!email || !senha) { alert('Informe e-mail e senha.'); return; }
            try {
                const r = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
                const data = await r.json();
                if (!r.ok || !data.ok) { alert('Credenciais inválidas.'); return; }
                localStorage.setItem('rokuzen_current_user', JSON.stringify({ 
                    nome: data.user.nome, 
                    email: data.user.email, 
                    tipo: data.user.tipo || getUserTypeFromEmail(data.user.email)
                }));
                updateLoginElements();
                if (typeof updateAuthElements === 'function') updateAuthElements();
                closeModal(loginModal);
                alert('Login realizado.');
            } catch (_) { alert('Erro de rede.'); }
        });
    }

    function renderGreeting() { 
        const el = document.getElementById('header-greeting'); 
        if (!el) return; 
        const raw = localStorage.getItem('rokuzen_current_user'); 
        if (!raw) { el.textContent = ''; el.classList.remove('is-visible'); el.style.display = 'none'; return; } 
        const current = JSON.parse(raw); 
        el.textContent = `Olá, ${current.nome}!`; 
        el.classList.add('is-visible'); 
        el.style.display = 'block'; 
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
    
    const dropdown = document.querySelector('.dropdown-conteudo');
});