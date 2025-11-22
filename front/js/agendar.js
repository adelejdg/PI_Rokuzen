document.addEventListener('DOMContentLoaded', function () {
  let currentStep = 1;
  const totalSteps = 6;
  const bookingData = {
    unidade: null,
    servico: null,
    duracao: null,
    data: null,
    hora: null,
    terapeuta: null
  };
  let precosServicos = {};
  let atendentes = [];

  // Horários disponíveis
  const horarios = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Função para atualizar o stepper
  function updateStepper() {
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNum = index + 1;
      step.classList.remove('active', 'completed');
      if (stepNum < currentStep) {
        step.classList.add('completed');
      } else if (stepNum === currentStep) {
        step.classList.add('active');
      }
    });
  }

  // Função para mostrar passo
  function showStep(step) {
    document.querySelectorAll('.step-content').forEach(content => {
      content.classList.remove('active');
    });
    const stepContent = document.getElementById(`step-${step}`);
    if (stepContent) {
      stepContent.classList.add('active');
    }
    currentStep = step;
    updateStepper();
    updateButtons();
  }

  // Função para atualizar botões
  function updateButtons() {
    // Atualizar botão "Continuar" baseado na seleção
    const nextBtn = document.getElementById(`btn-next-${currentStep}`);
    if (nextBtn) {
      let canContinue = false;
      
      switch(currentStep) {
        case 1:
          canContinue = bookingData.unidade !== null && bookingData.unidade !== undefined && bookingData.unidade !== '';
          break;
        case 2:
          canContinue = bookingData.servico !== null;
          break;
        case 3:
          canContinue = bookingData.duracao !== null;
          break;
        case 4:
          canContinue = bookingData.data !== null && bookingData.hora !== null;
          break;
        case 5:
          canContinue = bookingData.terapeuta !== null;
          break;
        case 6:
          canContinue = true;
          break;
      }
      
      nextBtn.disabled = !canContinue;
    }
  }

  // Função para carregar atendentes por unidade
  async function loadAtendentes(unidade) {
    const API = 'http://localhost:3000';
    try {
      const response = await fetch(API + '/atendentes?unidade=' + unidade);
      if (response.ok) {
        const data = await response.json();
        atendentes = data.atendentes || [];
        return atendentes;
      }
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
    }
    return [];
  }

  // Função para selecionar unidade
  async function selectUnit(unitCard) {
    document.querySelectorAll('.unit-card').forEach(c => c.classList.remove('selected'));
    unitCard.classList.add('selected');
    bookingData.unidade = unitCard.dataset.unit;
    console.log('Unidade selecionada:', bookingData.unidade);
    
    // Carregar atendentes da unidade selecionada
    await loadAtendentes(bookingData.unidade);
    
    // Habilitar o botão Continuar diretamente
    const btnNext = document.getElementById('btn-next-1');
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.style.opacity = '1';
      btnNext.style.cursor = 'pointer';
      console.log('Botão habilitado');
    } else {
      console.error('Botão btn-next-1 não encontrado');
    }
    
    // Também chamar updateButtons para garantir
    updateButtons();
  }

  // Passo 1: Seleção de Unidade - usar event delegation para garantir que funcione
  const unitsGrid = document.querySelector('.units-grid');
  if (unitsGrid) {
    unitsGrid.addEventListener('click', async function(e) {
      const unitCard = e.target.closest('.unit-card');
      if (unitCard) {
        e.preventDefault();
        e.stopPropagation();
        await selectUnit(unitCard);
      }
    });
  } else {
    // Fallback: registrar eventos diretamente nos cards
    setTimeout(() => {
      document.querySelectorAll('.unit-card').forEach(card => {
        card.addEventListener('click', async function(e) {
          e.preventDefault();
          e.stopPropagation();
          await selectUnit(this);
        });
      });
    }, 100);
  }

  // Registrar evento do botão Continuar
  setTimeout(() => {
    const btnNext1 = document.getElementById('btn-next-1');
    if (btnNext1) {
      btnNext1.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Botão Continuar clicado, unidade:', bookingData.unidade);
        if (bookingData.unidade) {
          showStep(2);
          updateServicePrices();
        } else {
          alert('Por favor, selecione uma unidade para continuar.');
        }
      });
    } else {
      console.error('Botão btn-next-1 não encontrado ao registrar evento');
    }
  }, 100);

  // Carregar preços dos serviços
  async function loadPrices() {
    const API = 'http://localhost:3000';
    try {
      const response = await fetch(API + '/servicos/precos');
      if (response.ok) {
        const data = await response.json();
        precosServicos = data.precos || {};
        updateServicePrices();
      }
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    }
  }

  // Atualizar preços nos cards de serviço
  function updateServicePrices() {
    document.querySelectorAll('.service-card').forEach(card => {
      const servicoKey = card.dataset.service;
      let servicoMap = null;
      
      if (servicoKey === 'quick-massage') servicoMap = 'quick';
      else if (servicoKey === 'maca') servicoMap = 'maca';
      else if (servicoKey === 'reflexologia') servicoMap = 'reflexologia';
      else if (servicoKey === 'auriculoterapia') servicoMap = 'auriculoterapia';
      
      if (servicoMap && precosServicos[servicoMap]) {
        const servicoData = precosServicos[servicoMap];
        const avulso = servicoData.avulso || {};
        // Pegar o primeiro preço disponível como exemplo
        const firstPrice = Object.values(avulso)[0];
        if (firstPrice) {
          let priceElement = card.querySelector('.service-price');
          if (!priceElement) {
            priceElement = document.createElement('div');
            priceElement.className = 'service-price';
            priceElement.style.cssText = 'margin-top: 8px; font-size: 14px; color: #2e7d32; font-weight: 600;';
            card.querySelector('.service-name').after(priceElement);
          }
          priceElement.textContent = `A partir de R$ ${firstPrice.toFixed(2).replace('.', ',')}`;
        }
      }
    });
  }

  // Passo 2: Seleção de Serviço
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      bookingData.servico = this.dataset.service;
      updateButtons();
      updateDurationPrices();
    });
  });

  document.getElementById('btn-back-2')?.addEventListener('click', () => showStep(1));
  document.getElementById('btn-next-2')?.addEventListener('click', () => {
    if (bookingData.servico) {
      showStep(3);
      updateDurationPrices();
    }
  });

  // Passo 3: Seleção de Duração
  document.querySelectorAll('.duration-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.duration-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      bookingData.duracao = this.dataset.duration;
      updateButtons();
    });
  });

  // Atualizar preços nos cards de duração
  function updateDurationPrices() {
    if (!bookingData.servico) return;
    
    let servicoMap = null;
    if (bookingData.servico === 'quick-massage') servicoMap = 'quick';
    else if (bookingData.servico === 'maca') servicoMap = 'maca';
    else if (bookingData.servico === 'reflexologia') servicoMap = 'reflexologia';
    else if (bookingData.servico === 'auriculoterapia') servicoMap = 'auriculoterapia';
    
    if (!servicoMap || !precosServicos[servicoMap]) return;
    
    const servicoData = precosServicos[servicoMap];
    
    document.querySelectorAll('.duration-card').forEach(card => {
      const duracao = card.dataset.duration;
      const servico = card.dataset.servico;
      
      // Mostrar/esconder cards baseado no serviço selecionado
      if (servico === 'all') {
        // Pacotes sempre visíveis
        card.style.display = 'block';
      } else if (servico === servicoMap || servico === bookingData.servico) {
        // Mostrar durações do serviço selecionado
        card.style.display = 'block';
      } else {
        // Esconder durações de outros serviços
        card.style.display = 'none';
        return;
      }
      
      let preco = null;
      
      if (duracao === 'pacote4') {
        const pacote4 = servicoData.pacote4 || {};
        // Para pacotes, mostrar o menor preço disponível
        const prices = Object.values(pacote4);
        if (prices.length > 0) {
          preco = Math.min(...prices);
        }
      } else if (duracao === 'pacote8') {
        const pacote8 = servicoData.pacote8 || {};
        const prices = Object.values(pacote8);
        if (prices.length > 0) {
          preco = Math.min(...prices);
        }
      } else {
        // Duração avulsa
        const avulso = servicoData.avulso || {};
        if (servicoMap === 'auriculoterapia') {
          preco = avulso['10-20'];
        } else {
          preco = avulso[duracao];
        }
      }
      
      let priceElement = card.querySelector('.duration-price');
      if (preco) {
        if (!priceElement) {
          priceElement = document.createElement('div');
          priceElement.className = 'duration-price';
          priceElement.style.cssText = 'margin-top: 8px; font-weight: bold; color: #2e7d32; font-size: 1.1em;';
          card.querySelector('.duration-label').after(priceElement);
        }
        priceElement.style.display = 'block';
        if (duracao === 'pacote4' || duracao === 'pacote8') {
          priceElement.textContent = `A partir de R$ ${preco.toFixed(2).replace('.', ',')}`;
        } else {
          priceElement.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
        }
      } else if (priceElement) {
        priceElement.style.display = 'none';
      }
    });
  }

  document.getElementById('btn-back-3')?.addEventListener('click', () => showStep(2));
  document.getElementById('btn-next-3')?.addEventListener('click', () => {
    if (bookingData.duracao) {
      showStep(4);
      generateTimeSlots();
    }
  });

  // Passo 4: Data e Hora
  const dataInput = document.getElementById('data-agendamento');
  if (dataInput) {
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.min = hoje;
    dataInput.value = hoje;
    bookingData.data = hoje;

    dataInput.addEventListener('change', function() {
      bookingData.data = this.value;
      generateTimeSlots();
      // Limpar seleção de hora quando mudar data
      bookingData.hora = null;
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      // Se já estiver no passo 5, atualizar terapeutas
      if (currentStep === 5) {
        generateTherapists();
      }
      updateButtons();
    });
  }

  function generateTimeSlots() {
    const timeGrid = document.getElementById('time-grid');
    if (!timeGrid) return;

    timeGrid.innerHTML = '';
    
    // Obter data selecionada e hora atual
    const dataSelecionada = bookingData.data;
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    
    horarios.forEach(horario => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = horario;
      slot.dataset.hora = horario;
      
      // Verificar se o horário já passou
      const [horaSlot, minutoSlot] = horario.split(':').map(Number);
      let isPast = false;
      
      if (dataSelecionada === hoje) {
        // Se for hoje, verificar se o horário já passou
        if (horaSlot < horaAtual || (horaSlot === horaAtual && minutoSlot <= minutoAtual)) {
          isPast = true;
        }
      } else if (dataSelecionada < hoje) {
        // Se a data selecionada for no passado
        isPast = true;
      }
      
      if (isPast) {
        slot.classList.add('disabled');
        slot.style.opacity = '0.5';
        slot.style.cursor = 'not-allowed';
      }
      
      slot.addEventListener('click', function() {
        if (this.classList.contains('disabled')) {
          alert('Não é possível agendar horários no passado.');
          return;
        }
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        bookingData.hora = this.dataset.hora;
        // Se já estiver no passo 5, atualizar terapeutas
        if (currentStep === 5) {
          generateTherapists();
        }
        updateButtons();
      });

      timeGrid.appendChild(slot);
    });
  }

  document.getElementById('btn-back-4')?.addEventListener('click', () => showStep(3));
  document.getElementById('btn-next-4')?.addEventListener('click', () => {
    if (bookingData.data && bookingData.hora) {
      showStep(5);
      generateTherapists();
    }
  });

  // Verificar disponibilidade do massagista
  async function verificarDisponibilidadeMassagista(nome, data, hora, unidade) {
    const API = 'http://localhost:3000';
    try {
      const response = await fetch(
        API + '/atendentes/disponibilidade?nome=' + encodeURIComponent(nome) + 
        '&data=' + data + '&hora=' + hora + '&unidade=' + unidade
      );
      if (response.ok) {
        const data = await response.json();
        return data.disponivel !== false;
      }
      return true; // Em caso de erro, considerar disponível
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return true; // Em caso de erro, considerar disponível
    }
  }

  // Passo 5: Seleção de Terapeuta
  async function generateTherapists() {
    const therapistGrid = document.getElementById('therapist-grid');
    if (!therapistGrid) return;

    // Se não houver atendentes carregados, carregar agora
    if (atendentes.length === 0 && bookingData.unidade) {
      await loadAtendentes(bookingData.unidade);
    }

    therapistGrid.innerHTML = '';
    
    if (atendentes.length === 0) {
      therapistGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum atendente disponível para esta unidade.</p>';
      return;
    }

    // Verificar disponibilidade de cada atendente
    const disponibilidades = await Promise.all(
      atendentes.map(async (atendente) => {
        const disponivel = await verificarDisponibilidadeMassagista(
          atendente.nome,
          bookingData.data,
          bookingData.hora,
          bookingData.unidade
        );
        return { atendente, disponivel };
      })
    );

    disponibilidades.forEach(({ atendente, disponivel }) => {
      const nome = atendente.nome;
      const card = document.createElement('div');
      card.className = 'therapist-card';
      if (disponivel) {
        card.classList.add('available');
      } else {
        card.classList.add('unavailable');
      }
      card.innerHTML = `<div class="therapist-name">${nome}</div>`;
      card.dataset.terapeuta = nome;
      card.dataset.disponivel = disponivel;
      
      card.addEventListener('click', function() {
        if (!disponivel) {
          alert('Este massagista não está disponível no horário selecionado.');
          return;
        }
        document.querySelectorAll('.therapist-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        bookingData.terapeuta = this.dataset.terapeuta;
        updateButtons();
      });

      therapistGrid.appendChild(card);
    });
  }

  document.getElementById('btn-back-5')?.addEventListener('click', () => showStep(4));
  document.getElementById('btn-next-5')?.addEventListener('click', () => {
    if (bookingData.terapeuta) {
      showStep(6);
      updateConfirmation();
    }
  });

  // Função para calcular preço
  async function calcularPreco(servico, duracao, tipoPacote) {
    const API = 'http://localhost:3000';
    try {
      const response = await fetch(API + '/servicos/precos');
      if (response.ok) {
        const data = await response.json();
        const precos = data.precos || {};
        
        // Mapear nome do serviço para chave
        let servicoKey = null;
        const servicoLower = servico.toLowerCase();
        if (servicoLower.includes('quick')) servicoKey = 'quick';
        else if (servicoLower.includes('maca')) servicoKey = 'maca';
        else if (servicoLower.includes('reflex')) servicoKey = 'reflexologia';
        else if (servicoLower.includes('auric')) servicoKey = 'auriculoterapia';
        
        if (!servicoKey || !precos[servicoKey]) return 0;
        
        const servicoData = precos[servicoKey];
        const pacoteData = servicoData[tipoPacote];
        if (!pacoteData) return 0;
        
        // Para auriculoterapia, usar '10-20'
        if (servicoKey === 'auriculoterapia') {
          return pacoteData['10-20'] || 0;
        }
        
        // Para outros serviços, usar a duração numérica
        return pacoteData[duracao] || 0;
      }
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
    }
    return 0;
  }

  // Passo 6: Confirmação
  async function updateConfirmation() {
    const unidadeNames = {
      'golden': 'Golden',
      'mooca': 'Mooca',
      'grand-plaza': 'Grand Plaza',
      'west-plaza': 'West Plaza'
    };

    const servicoNames = {
      'quick-massage': 'Quick Massage',
      'maca': 'Maca',
      'reflexologia': 'Reflexologia Podal',
      'auriculoterapia': 'Auriculoterapia'
    };

    const duracaoNames = {
      '15': '15 minutos',
      '25': '25 minutos',
      '35': '35 minutos',
      'pacote4': 'Pacote 4 sessões',
      'pacote8': 'Pacote 8 sessões'
    };

    document.getElementById('confirm-unidade').textContent = unidadeNames[bookingData.unidade] || '-';
    document.getElementById('confirm-servico').textContent = servicoNames[bookingData.servico] || '-';
    document.getElementById('confirm-duracao').textContent = duracaoNames[bookingData.duracao] || '-';
    
    if (bookingData.data) {
      const dataFormatada = new Date(bookingData.data + 'T00:00:00').toLocaleDateString('pt-BR');
      document.getElementById('confirm-data').textContent = dataFormatada;
    }
    
    document.getElementById('confirm-hora').textContent = bookingData.hora || '-';
    document.getElementById('confirm-terapeuta').textContent = bookingData.terapeuta || '-';
    
    // Calcular e exibir preço
    let tipoPacote = 'avulso';
    if (bookingData.duracao === 'pacote4') tipoPacote = 'pacote4';
    else if (bookingData.duracao === 'pacote8') tipoPacote = 'pacote8';
    
    const preco = await calcularPreco(bookingData.servico, bookingData.duracao, tipoPacote);
    const precoElement = document.getElementById('confirm-preco');
    if (precoElement) {
      if (preco > 0) {
        precoElement.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
      } else {
        precoElement.textContent = 'Calculando...';
      }
    }
  }

  document.getElementById('btn-back-6')?.addEventListener('click', () => showStep(5));
  document.getElementById('btn-confirm')?.addEventListener('click', async function() {
    // Salvar agendamento
    const API = 'http://localhost:3000';
    
    // Calcular tipo de pacote e valor
    let tipoPacote = 'avulso';
    if (bookingData.duracao === 'pacote4') tipoPacote = 'pacote4';
    else if (bookingData.duracao === 'pacote8') tipoPacote = 'pacote8';
    
    const valor = await calcularPreco(bookingData.servico, bookingData.duracao, tipoPacote);
    
    const agendamento = {
      unidade: bookingData.unidade,
      unidadeNome: document.getElementById('confirm-unidade').textContent,
      servico: bookingData.servico,
      clienteNome: getCurrentUser()?.nome || 'Cliente',
      clienteEmail: getCurrentUser()?.email || '',
      data: bookingData.data,
      horario: bookingData.hora,
      duracaoAvulso: bookingData.duracao === '15' || bookingData.duracao === '25' || bookingData.duracao === '35' ? bookingData.duracao + ' min' : null,
      pacote4: bookingData.duracao === 'pacote4' ? 'Pacote 4' : null,
      pacote8: bookingData.duracao === 'pacote8' ? 'Pacote 8' : null,
      nome: bookingData.terapeuta,
      valor: valor,
      tipoPacote: tipoPacote
    };

    try {
      const response = await fetch(API + '/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
      });

      if (response.ok) {
        const data = await response.json();
        // Salvar dados do agendamento
        localStorage.setItem('rokuzen_last_booking', JSON.stringify(data));
        alert('Agendamento confirmado com sucesso!');
        // Redirecionar para a página inicial
        window.location.href = '01_index.html';
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = 'Erro ao confirmar agendamento.';
        if (errorData.error === 'db_not_connected') {
          errorMsg = 'Erro: Banco de dados não conectado. Verifique a conexão com o MongoDB no servidor.';
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = 'Erro: ' + errorData.error;
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Erro:', error);
      if (error.message && error.message.includes('Failed to fetch')) {
        alert('Erro de conexão. Verifique se o servidor está rodando em http://localhost:3000\n\nSe o servidor estiver rodando, pode ser um problema de conexão com o MongoDB.');
      } else {
        alert('Erro ao confirmar agendamento: ' + error.message);
      }
    }
  });

  // Inicializar
  updateStepper();
  showStep(1);
  // Não chamar updateButtons() aqui para não desabilitar o botão antes do usuário selecionar
  // O botão já vem desabilitado do HTML
  loadPrices();
  
  // Garantir que o botão está desabilitado inicialmente
  const btnNext1Init = document.getElementById('btn-next-1');
  if (btnNext1Init) {
    btnNext1Init.disabled = true;
  }
});
