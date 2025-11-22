document.addEventListener('DOMContentLoaded', function () {
  // Verificar parâmetro da URL
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  
  // Verificar tipo de usuário
  function getUserType() {
    const userStr = localStorage.getItem('rokuzen_current_user');
    if (!userStr) return 'cliente';
    try {
      const user = JSON.parse(userStr);
      if (user.tipo) return user.tipo;
      const email = user.email || '';
      const domain = email.toLowerCase().split('@')[1];
      if (domain === 'admin.com') return 'admin';
      if (domain === 'massagista.com') return 'massagista';
      if (domain === 'recepcionista.com') return 'recepcionista';
      return 'cliente';
    } catch {
      return 'cliente';
    }
  }

  function getCurrentUser() {
    const userStr = localStorage.getItem('rokuzen_current_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  const userType = getUserType();
  const isAdminOrStaff = userType === 'admin' || userType === 'massagista' || userType === 'recepcionista';
  
  const scheduleView = document.getElementById('schedule-view');
  const myBookingsView = document.getElementById('my-bookings-view');
  
  // Se view=schedule, mostrar tabela semanal
  // Caso contrário, mostrar lista de agendamentos do usuário (mesmo para admin)
  if (view === 'schedule') {
    // Mostrar tabela semanal
    if (scheduleView) scheduleView.style.display = 'block';
    if (myBookingsView) myBookingsView.style.display = 'none';
  } else {
    // Mostrar lista de agendamentos do usuário
    if (scheduleView) scheduleView.style.display = 'none';
    if (myBookingsView) myBookingsView.style.display = 'block';
    loadClientBookings();
  }

  const grid = document.getElementById('week-grid');
  const weekLabel = document.getElementById('week-label');
  const prevBtn = document.getElementById('week-prev');
  const nextBtn = document.getElementById('week-next');
  const details = document.getElementById('detalhes-agendamento');
  const STORAGE_KEY = 'rokuzen_agendamentos_v1';
  let deleteMode = false;
  const mySessionsWrap = document.getElementById('minhas-sessoes');
  const mySessionsList = document.getElementById('lista-minhas-sessoes');
  const unitFilter = document.getElementById('unit-filter');
  let currentMonday = startOfWeek(new Date());
  let currentWeekItems = [];
  let selectedUnit = 'all';

  async function loadAll(start, end) {
    const API = 'http://localhost:3000';
    try {
      const r = await fetch(API + '/agendamentos?weekStart=' + start + '&weekEnd=' + end);
      if (!r.ok) {
        console.error('Erro ao carregar agendamentos:', r.status, r.statusText);
        return [];
      }
      const data = await r.json().catch(() => []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro de conexão ao carregar agendamentos:', error);
      // Mostrar mensagem de erro na página
      if (grid) {
        grid.innerHTML = '<tbody><tr><td colspan="8" style="text-align: center; padding: 40px; color: #c62828;"><strong>Erro de conexão</strong><br>Verifique se o servidor está rodando em http://localhost:3000</td></tr></tbody>';
      }
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function parseDate(dateStr, timeStr) {
    // dateStr formato: YYYY-MM-DD, timeStr HH:mm
    return new Date(dateStr + 'T' + (timeStr || '00:00') + ':00');
  }

  function startOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay(); // 0=Dom, 1=Seg, ...
    const diff = (day === 0 ? -6 : 1) - day; // começar na segunda
    date.setDate(date.getDate() + diff);
    date.setHours(0,0,0,0);
    return date;
  }

  function formatWeekRange(date) {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  }

  function groupByWeek(items) {
    const map = new Map();
    items.forEach(it => {
      const dt = parseDate(it.data, it.horario || it.hora);
      const key = startOfWeek(dt).toISOString().slice(0,10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    // ordenar por semana
    const entries = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    return entries.map(([key, list]) => ({ weekStart: new Date(key), items: list.sort((a,b) => parseDate(a.data, a.horario||a.hora) - parseDate(b.data, b.horario||b.hora)) }));
  }

  function buildHours() {
    // grade de horas padrão (8h às 18h a cada 1h)
    const hours = [];
    for (let h = 8; h <= 18; h++) {
      hours.push((h.toString().padStart(2,'0')) + ':00');
    }
    return hours;
  }

  function humanizeNameFromEmail(email) {
    if (!email || !email.includes('@')) return '';
    const local = email.split('@')[0];
    const parts = local.split(/[._-]+/).filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  async function renderWeek() {
    if (!grid || !weekLabel) { alert('Falha ao carregar a grade semanal.'); return; }
    const days = Array.from({length:7}, (_,i) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate()+i);
      return d;
    });
    const weekStart = days[0].toISOString().slice(0,10);
    const weekEnd = days[6].toISOString().slice(0,10);
    const all = await loadAll(weekStart, weekEnd);
    // Filtrar por unidade se selecionada
    let filtered = all;
    if (selectedUnit !== 'all') {
      filtered = all.filter(item => {
        const itemUnit = (item.unidade || '').toLowerCase();
        return itemUnit === selectedUnit;
      });
    }
    currentWeekItems = filtered;
    const hours = buildHours();

    weekLabel.textContent = `${days[0].toLocaleDateString('pt-BR')} - ${days[6].toLocaleDateString('pt-BR')}`;

    // Sempre renderizar a tabela, mesmo se não houver dados
    let html = '<thead><tr><th>Hora</th>' + days.map(d => `<th>${d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'2-digit' })}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    hours.forEach(hh => {
      html += `<tr><th>${hh}</th>`;
      days.forEach(d => {
        const dateStr = d.toISOString().slice(0,10);
        const matches = filtered.filter(it => it.data === dateStr && (it.horario || it.hora) === hh);
        if (matches.length > 0) {
          const it = matches[0];
          const nome = it.nome || it.massagista || '-';
          const servico = it.servico || '-';
          const slotId = it._id || 'temp-' + Date.now();
          html += `<td class="slot-busy" data-id="${it._id || ''}" data-date="${dateStr}" data-time="${hh}">
            <div class="booking-info">
              <span class="booking-name">${nome}</span>
              <span class="booking-service">${servico}</span>
            </div>
            <button class="slot-menu-btn" onclick="event.stopPropagation(); toggleSlotMenu('${slotId}')">
              <i class="fa fa-ellipsis-v"></i>
            </button>
            <div class="slot-menu" id="menu-${slotId}" style="display: none;">
              <button class="menu-item" onclick="editAgendamento('${it._id || ''}')">Editar</button>
              <button class="menu-item delete" onclick="deleteAgendamento('${it._id || ''}')">Excluir</button>
            </div>
          </td>`;
        } else {
          html += `<td class="slot-free" data-date="${dateStr}" data-time="${hh}"></td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody>';
    grid.innerHTML = html;
    
    // Garantir que a tabela seja visível
    if (grid.parentElement) {
      grid.parentElement.style.display = 'block';
    }

    grid.querySelectorAll('.slot-busy, .slot-free').forEach(td => {
      td.addEventListener('click', () => {
        const dateStr = td.getAttribute('data-date');
        const timeStr = td.getAttribute('data-time');
        const items = currentWeekItems;
        const found = items.find(x => x.data === dateStr && (x.horario || x.hora) === timeStr);
        if (found) {
          const dataFormatada = new Date(found.data + 'T00:00:00').toLocaleDateString('pt-BR');
          const minutos = found.duracaoAvulso || found.pacote4 || found.pacote8 || '-';
          const valor = found.valor ? `R$ ${found.valor.toFixed(2).replace('.', ',')}` : '-';
          details.classList.remove('hidden');
          details.innerHTML = `
            <h3>Detalhes do Agendamento</h3>
            <div class="detail-item"><strong>Profissional:</strong> ${found.nome || found.massagista || '-'}</div>
            <div class="detail-item"><strong>Unidade:</strong> ${found.unidadeNome || found.unidade || '-'}</div>
            <div class="detail-item"><strong>Data:</strong> ${dataFormatada} <strong>Hora:</strong> ${(found.horario||found.hora)||'-'}</div>
            <div class="detail-item"><strong>Serviço:</strong> ${found.servico || '-'}</div>
            <div class="detail-item"><strong>Equipamento:</strong> ${found.equipamento || '-'}</div>
            <div class="detail-item"><strong>Duração:</strong> ${minutos}</div>
            <div class="detail-item"><strong>Valor:</strong> ${valor}</div>
            <div class="detail-item"><strong>Cliente:</strong> ${found.clienteNome || '-'}</div>
            ${found.clienteEmail ? `<div class="detail-item"><strong>Email:</strong> ${found.clienteEmail}</div>` : ''}
            ${found.clienteTelefone ? `<div class="detail-item"><strong>Telefone:</strong> ${found.clienteTelefone}</div>` : ''}
          `;
        } else {
          details.classList.remove('hidden');
          const dataFormatada = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
          details.innerHTML = `<div>Horário livre em ${dataFormatada} às ${timeStr}.</div>`;
        }
      });
    });

    renderMySessions();
  }

  function renderMySessions() {
    if (!mySessionsWrap || !mySessionsList) return;
    const currentRaw = localStorage.getItem('rokuzen_current_user');
    if (!currentRaw) { mySessionsWrap.classList.add('hidden'); return; }
    const current = JSON.parse(currentRaw);
    const email = current.email || '';
    // Deriva o nome do massagista a partir do e-mail (ex.: hugo@gmail.com -> "Hugo")
    const profFromEmail = humanizeNameFromEmail(email);
    const all = currentWeekItems;
    // filtra sessões onde o nome do profissional corresponde ao do e-mail
    const minhas = all.filter(x => {
      const prof = (x.nome || x.massagista || '').trim().toLowerCase();
      return prof && prof === profFromEmail.trim().toLowerCase();
    });
    // mostra a seção "Minhas sessões" apenas para logins no formato nomedeles@dominio
    if (!profFromEmail) { mySessionsWrap.classList.add('hidden'); return; }
    if (minhas.length === 0) { mySessionsWrap.classList.remove('hidden'); mySessionsList.innerHTML = '<p>Nenhuma sessão sua nesta semana.</p>'; return; }
    mySessionsWrap.classList.remove('hidden');
    mySessionsList.innerHTML = '';
    minhas.sort((a,b)=> (parseDate(a.data,a.horario||a.hora)) - (parseDate(b.data,b.horario||b.hora)));
    minhas.forEach(sess => {
      const dataFmt = new Date(sess.data + 'T00:00:00').toLocaleDateString('pt-BR');
      const dur = sess.duracaoAvulso || sess.pacote4 || sess.pacote8 || '-';
      const div = document.createElement('div');
      div.className = 'agendamento-item';
      // Verificar se usuário tem acesso ao cronômetro
      const canUseTimer = typeof canAccessTimer === 'function' ? canAccessTimer() : false;
      const valor = sess.valor ? `R$ ${sess.valor.toFixed(2).replace('.', ',')}` : '-';
      
      let timerHTML = '';
      if (canUseTimer) {
        timerHTML = `<div style="margin-top:6px;"><button class="btn-timer">Iniciar timer</button> <span class="timer-display" aria-live="polite"></span></div>`;
      }
      
      div.innerHTML = `
        <div><strong>Cliente:</strong> ${sess.clienteNome || '-'}</div>
        <div><strong>Procedimento:</strong> ${sess.servico || '-'}</div>
        <div><strong>Data/Hora:</strong> ${dataFmt} ${sess.horario || sess.hora || '-'}</div>
        <div><strong>Duração:</strong> ${dur}</div>
        <div><strong>Valor:</strong> ${valor}</div>
        ${timerHTML}
      `;
      
      if (canUseTimer) {
        const display = div.querySelector('.timer-display');
        const btn = div.querySelector('.btn-timer');
        let interval = null;
        if (btn) {
          btn.addEventListener('click', () => {
            if (interval) { clearInterval(interval); interval = null; display.textContent=''; btn.textContent='Iniciar timer'; return; }
            // extrair minutos do texto (ex.: "15 min", "15m")
            const m = String(dur).match(/\d+/);
            let total = m ? parseInt(m[0],10) * 60 : 15*60;
            btn.textContent = 'Parar timer';
            function tick(){
              const mm = Math.floor(total/60).toString().padStart(2,'0');
              const ss = (total%60).toString().padStart(2,'0');
              display.textContent = `${mm}:${ss}`;
              total -= 1;
              if (total < 0) { clearInterval(interval); interval=null; btn.textContent='Iniciar timer'; alert('Tempo encerrado!'); }
            }
            tick();
            interval = setInterval(tick, 1000);
          });
        }
      }
      mySessionsList.appendChild(div);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { const d = new Date(currentMonday); d.setDate(d.getDate()-7); currentMonday = d; renderWeek(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { const d = new Date(currentMonday); d.setDate(d.getDate()+7); currentMonday = d; renderWeek(); });

  // Funções para menu de ações
  window.toggleSlotMenu = function(id) {
    const menus = document.querySelectorAll('.slot-menu');
    menus.forEach(menu => {
      if (menu.id !== 'menu-' + id) {
        menu.style.display = 'none';
      }
    });
    const menu = document.getElementById('menu-' + id);
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  };

  window.editAgendamento = function(id) {
    const item = currentWeekItems.find(x => x._id === id);
    if (item) {
      // Por enquanto, apenas mostra os detalhes
      const dataFormatada = new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR');
      const minutos = item.duracaoAvulso || item.pacote4 || item.pacote8 || '-';
      const valor = item.valor ? `R$ ${item.valor.toFixed(2).replace('.', ',')}` : '-';
      details.classList.remove('hidden');
      details.innerHTML = `
        <h3>Detalhes do Agendamento</h3>
        <div class="detail-item"><strong>Profissional:</strong> ${item.nome || item.massagista || '-'}</div>
        <div class="detail-item"><strong>Unidade:</strong> ${item.unidadeNome || item.unidade || '-'}</div>
        <div class="detail-item"><strong>Data:</strong> ${dataFormatada} <strong>Hora:</strong> ${(item.horario||item.hora)||'-'}</div>
        <div class="detail-item"><strong>Serviço:</strong> ${item.servico || '-'}</div>
        <div class="detail-item"><strong>Equipamento:</strong> ${item.equipamento || '-'}</div>
        <div class="detail-item"><strong>Duração:</strong> ${minutos}</div>
        <div class="detail-item"><strong>Valor:</strong> ${valor}</div>
        <div class="detail-item"><strong>Cliente:</strong> ${item.clienteNome || '-'}</div>
        ${item.clienteEmail ? `<div class="detail-item"><strong>Email:</strong> ${item.clienteEmail}</div>` : ''}
        ${item.clienteTelefone ? `<div class="detail-item"><strong>Telefone:</strong> ${item.clienteTelefone}</div>` : ''}
        <div style="margin-top: 16px;">
          <button class="btn-modern btn-primary" onclick="window.location.href='04_agendar.html?edit=${item._id}'">Editar Agendamento</button>
        </div>
      `;
    }
    // Fechar menu
    const menus = document.querySelectorAll('.slot-menu');
    menus.forEach(menu => menu.style.display = 'none');
  };

  window.deleteAgendamento = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    const API = 'http://localhost:3000';
    try {
      const response = await fetch(API + '/agendamentos/' + id, { method: 'DELETE' });
      if (response.ok) {
        details.classList.add('hidden');
        await renderWeek();
      } else {
        alert('Erro ao excluir agendamento.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir agendamento.');
    }
    
    // Fechar menu
    const menus = document.querySelectorAll('.slot-menu');
    menus.forEach(menu => menu.style.display = 'none');
  };

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.slot-menu-btn') && !e.target.closest('.slot-menu')) {
      const menus = document.querySelectorAll('.slot-menu');
      menus.forEach(menu => menu.style.display = 'none');
    }
  });

  if (unitFilter) {
    unitFilter.addEventListener('change', (e) => {
      selectedUnit = e.target.value;
      renderWeek();
    });
  }

  // Carregar agendamentos do cliente
  async function loadClientBookings() {
    const user = getCurrentUser();
    const confirmadosList = document.getElementById('confirmados-list');
    const realizadosList = document.getElementById('realizados-list');
    
    if (!user) {
      if (confirmadosList) confirmadosList.innerHTML = '<p>Faça login para ver seus agendamentos.</p>';
      if (realizadosList) realizadosList.innerHTML = '';
      return;
    }

    const API = 'http://localhost:3000';
    try {
      // Carregar todos os agendamentos do cliente
      const response = await fetch(API + '/agendamentos?clienteEmail=' + encodeURIComponent(user.email));
      if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos');
      }
      const agendamentos = await response.json();
      
      console.log('Agendamentos carregados:', agendamentos);
      console.log('Email do usuário:', user.email);
      
      const agora = new Date();
      agora.setHours(0, 0, 0, 0);
      
      const agendados = [];
      const finalizados = [];
      
      agendamentos.forEach(ag => {
        const dataAgendamento = new Date(ag.data + 'T' + (ag.horario || ag.hora || '00:00') + ':00');
        dataAgendamento.setHours(0, 0, 0, 0);
        
        // Verificar se o agendamento é do cliente logado
        const isClienteAgendamento = ag.clienteEmail && ag.clienteEmail.toLowerCase() === user.email.toLowerCase();
        
        if (isClienteAgendamento) {
          if (dataAgendamento >= agora) {
            agendados.push(ag);
          } else {
            finalizados.push(ag);
          }
        }
      });
      
      console.log('Agendados (futuros):', agendados);
      console.log('Finalizados (passados):', finalizados);
      
      // Ordenar: agendados por data crescente, finalizados por data decrescente
      agendados.sort((a, b) => {
        const da = new Date(a.data + 'T' + (a.horario || a.hora || '00:00') + ':00');
        const db = new Date(b.data + 'T' + (b.horario || b.hora || '00:00') + ':00');
        return da - db;
      });
      
      finalizados.sort((a, b) => {
        const da = new Date(a.data + 'T' + (a.horario || a.hora || '00:00') + ':00');
        const db = new Date(b.data + 'T' + (b.horario || b.hora || '00:00') + ':00');
        return db - da;
      });
      
      renderClientBookings(agendados, finalizados);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      if (confirmadosList) confirmadosList.innerHTML = '<p style="color: #c62828;">Erro ao carregar agendamentos. Verifique se o servidor está rodando.</p>';
      if (realizadosList) realizadosList.innerHTML = '';
    }
  }

  function renderClientBookings(agendados, finalizados) {
    const confirmadosList = document.getElementById('confirmados-list');
    const realizadosList = document.getElementById('realizados-list');
    
    if (!confirmadosList || !realizadosList) return;
    
    // Renderizar confirmados (futuros)
    if (agendados.length === 0) {
      confirmadosList.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Nenhum agendamento confirmado.</p>';
    } else {
      confirmadosList.innerHTML = agendados.map(ag => {
        const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const hora = ag.horario || ag.hora || '-';
        const valor = ag.valor ? `R$ ${ag.valor.toFixed(2).replace('.', ',')}` : '-';
        const duracao = ag.duracaoAvulso || ag.pacote4 || ag.pacote8 || '-';
        
        return `
          <div class="booking-card" style="background: #f1f8e9; border-left: 4px solid #8BC34A; padding: 16px; margin-bottom: 12px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h3 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 18px;">${ag.servico || '-'}</h3>
                <p style="margin: 4px 0; color: #555;"><strong>Data:</strong> ${dataFormatada} às ${hora}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Terapeuta:</strong> ${ag.nome || '-'}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Unidade:</strong> ${ag.unidadeNome || ag.unidade || '-'}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Duração:</strong> ${duracao}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Valor:</strong> ${valor}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    // Renderizar realizados (passados)
    if (finalizados.length === 0) {
      realizadosList.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Nenhum agendamento realizado.</p>';
    } else {
      realizadosList.innerHTML = finalizados.map(ag => {
        const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const hora = ag.horario || ag.hora || '-';
        const valor = ag.valor ? `R$ ${ag.valor.toFixed(2).replace('.', ',')}` : '-';
        const duracao = ag.duracaoAvulso || ag.pacote4 || ag.pacote8 || '-';
        
        return `
          <div class="booking-card" style="background: #f5f5f5; border-left: 4px solid #757575; padding: 16px; margin-bottom: 12px; border-radius: 8px; opacity: 0.8;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h3 style="margin: 0 0 8px 0; color: #424242; font-size: 18px;">${ag.servico || '-'}</h3>
                <p style="margin: 4px 0; color: #666;"><strong>Data:</strong> ${dataFormatada} às ${hora}</p>
                <p style="margin: 4px 0; color: #666;"><strong>Terapeuta:</strong> ${ag.nome || '-'}</p>
                <p style="margin: 4px 0; color: #666;"><strong>Unidade:</strong> ${ag.unidadeNome || ag.unidade || '-'}</p>
                <p style="margin: 4px 0; color: #666;"><strong>Duração:</strong> ${duracao}</p>
                <p style="margin: 4px 0; color: #666;"><strong>Valor:</strong> ${valor}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Só renderizar a tabela semanal se estiver na visualização de schedule
  if (view === 'schedule') {
    renderWeek();
  }
});


