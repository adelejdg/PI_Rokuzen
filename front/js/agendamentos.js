document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('week-grid');
  const weekLabel = document.getElementById('week-label');
  const prevBtn = document.getElementById('week-prev');
  const nextBtn = document.getElementById('week-next');
  const details = document.getElementById('detalhes-agendamento');
  const STORAGE_KEY = 'rokuzen_agendamentos_v1';
  const deleteToggle = document.getElementById('delete-mode');
  let deleteMode = false;
  const mySessionsWrap = document.getElementById('minhas-sessoes');
  const mySessionsList = document.getElementById('lista-minhas-sessoes');
  let currentMonday = startOfWeek(new Date());

  function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

  function renderWeek() {
    if (!grid || !weekLabel) return;
    const all = loadAll();
    const hours = buildHours();

    // montar cabeçalho com dias
    const days = Array.from({length:7}, (_,i) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate()+i);
      return d;
    });

    weekLabel.textContent = `${days[0].toLocaleDateString('pt-BR')} - ${days[6].toLocaleDateString('pt-BR')}`;

    let html = '<thead><tr><th>Hora</th>' + days.map(d => `<th>${d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'2-digit' })}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    hours.forEach(hh => {
      html += `<tr><th>${hh}</th>`;
      days.forEach(d => {
        const dateStr = d.toISOString().slice(0,10);
        const matches = all.filter(it => it.data === dateStr && (it.horario || it.hora) === hh);
        if (matches.length > 0) {
          const it = matches[0];
          const label = (it.nome || it.massagista || '-') + ' - ' + (it.servico || '-')
          html += `<td class="slot-busy" data-date="${dateStr}" data-time="${hh}">${label}</td>`;
        } else {
          html += `<td class="slot-free" data-date="${dateStr}" data-time="${hh}">Livre</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody>';
    grid.innerHTML = html;

    grid.querySelectorAll('.slot-busy, .slot-free').forEach(td => {
      td.addEventListener('click', () => {
        const dateStr = td.getAttribute('data-date');
        const timeStr = td.getAttribute('data-time');
        const items = loadAll();
        const found = items.find(x => x.data === dateStr && (x.horario || x.hora) === timeStr);
        if (found) {
          if (deleteMode) {
            const idx = items.findIndex(x => x === found);
            if (idx >= 0) {
              // Remover também do conjunto legado 'rokuzen_bookings' se existir
              items.splice(idx,1);
              saveAll(items);
              try {
                const legacy = JSON.parse(localStorage.getItem('rokuzen_bookings')||'[]');
                const filteredLegacy = legacy.filter(x => !(x.data === found.data && (x.horario||x.hora) === (found.horario||found.hora) && (x.nome||'') === (found.nome||'')));
                localStorage.setItem('rokuzen_bookings', JSON.stringify(filteredLegacy));
              } catch {}
              details.classList.add('hidden');
              renderWeek();
            }
            return;
          }
          const dataFormatada = new Date(found.data + 'T00:00:00').toLocaleDateString('pt-BR');
          const minutos = found.duracaoAvulso || found.pacote4 || found.pacote8 || '-';
          details.classList.remove('hidden');
          details.innerHTML = `
            <div><strong>Profissional:</strong> ${found.nome || found.massagista || '-'}</div>
            <div><strong>Unidade:</strong> ${found.unidadeNome || '-'}</div>
            <div><strong>Data:</strong> ${dataFormatada} <strong>Hora:</strong> ${(found.horario||found.hora)||'-'}</div>
            <div><strong>Serviço:</strong> ${found.servico || '-'} | <strong>Equipamento:</strong> ${found.equipamento || '-'}</div>
            <div><strong>Duração:</strong> ${minutos}</div>
            <div><strong>Cliente:</strong> ${found.clienteNome || '-'} | ${found.clienteEmail || '-'} | ${found.clienteTelefone || '-'}</div>
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
    const all = loadAll();
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
      div.innerHTML = `
        <div><strong>Cliente:</strong> ${sess.clienteNome || '-'}</div>
        <div><strong>Procedimento:</strong> ${sess.servico || '-'}</div>
        <div><strong>Data/Hora:</strong> ${dataFmt} ${sess.horario || sess.hora || '-'}</div>
        <div><strong>Duração:</strong> ${dur}</div>
        <div style="margin-top:6px;"><button class="btn-timer">Iniciar timer</button> <span class="timer-display" aria-live="polite"></span></div>
      `;
      const display = div.querySelector('.timer-display');
      const btn = div.querySelector('.btn-timer');
      let interval = null;
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
      mySessionsList.appendChild(div);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { const d = new Date(currentMonday); d.setDate(d.getDate()-7); currentMonday = d; renderWeek(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { const d = new Date(currentMonday); d.setDate(d.getDate()+7); currentMonday = d; renderWeek(); });

  if (deleteToggle) {
    deleteToggle.addEventListener('click', () => {
      deleteMode = !deleteMode;
      deleteToggle.setAttribute('aria-pressed', String(deleteMode));
      deleteToggle.classList.toggle('active', deleteMode);
    });
  }

  renderWeek();
});


