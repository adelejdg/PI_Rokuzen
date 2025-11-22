require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const crypto = require('crypto')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.set('strictQuery', true)
mongoose.set('bufferCommands', false)

// Schema de Usuário
const userSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  telefone: {
    type: String,
    trim: true,
    default: ''
  },
  senhaHash: { 
    type: String, 
    required: true 
  },
  senhaSalt: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
})

// Índices para melhor performance
userSchema.index({ email: 1 })

const User = mongoose.models.User || mongoose.model('User', userSchema)

// Schema de Agendamento
const bookingSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    trim: true 
  },
  horario: { 
    type: String, 
    trim: true 
  },
  data: { 
    type: String, 
    trim: true 
  },
  servico: { 
    type: String, 
    trim: true 
  },
  equipamento: { 
    type: String, 
    trim: true 
  },
  duracaoAvulso: { 
    type: String, 
    trim: true 
  },
  pacote4: { 
    type: String, 
    trim: true 
  },
  pacote8: { 
    type: String, 
    trim: true 
  },
  unidade: { 
    type: String, 
    trim: true 
  },
  unidadeNome: { 
    type: String, 
    trim: true 
  },
  clienteNome: { 
    type: String, 
    trim: true 
  },
  clienteEmail: { 
    type: String, 
    trim: true,
    lowercase: true 
  },
  clienteTelefone: { 
    type: String, 
    trim: true 
  },
  tipoPacote: {
    type: String,
    enum: ['avulso', 'pacote4', 'pacote8'],
    default: 'avulso'
  },
  valor: {
    type: Number,
    default: 0
  },
  und_ukey: {
    type: Number,
    default: null
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
})

// Índices para melhor performance nas consultas
bookingSchema.index({ data: 1 })
bookingSchema.index({ timestamp: -1 })
bookingSchema.index({ clienteEmail: 1 })

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

// Schema de Relatório de Sessão
const sessionReportSchema = new mongoose.Schema({
  inicio: {
    type: String,
    required: true,
    trim: true
  },
  fim: {
    type: String,
    required: true,
    trim: true
  },
  procedimento: {
    type: String,
    required: true,
    trim: true
  },
  cliente: {
    type: String,
    required: true,
    trim: true
  },
  massagistaEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  data: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

sessionReportSchema.index({ massagistaEmail: 1 })
sessionReportSchema.index({ data: 1 })
sessionReportSchema.index({ timestamp: -1 })

const SessionReport = mongoose.models.SessionReport || mongoose.model('SessionReport', sessionReportSchema)

// Schema de Atendente
const atendenteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  unidades: [{
    type: String,
    required: true,
    enum: ['golden', 'mooca', 'grand-plaza', 'west-plaza']
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

atendenteSchema.index({ unidades: 1 })
atendenteSchema.index({ ativo: 1 })

const Atendente = mongoose.models.Atendente || mongoose.model('Atendente', atendenteSchema)

// Schema de Escala de Terapeutas
const escalaSchema = new mongoose.Schema({
  atendenteNome: {
    type: String,
    required: true,
    trim: true
  },
  unidade: {
    type: String,
    required: true,
    enum: ['golden', 'mooca', 'grand-plaza', 'west-plaza']
  },
  und_ukey: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 6] // 1=Golden, 2=Mooca, 3=Grand Plaza, 6=West Plaza
  },
  diaSemana: {
    type: Number,
    required: true,
    min: 0,
    max: 6 // 0=Domingo, 1=Segunda, ..., 6=Sábado
  },
  entrada: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // Formato HH:mm
  },
  saida: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // Formato HH:mm
  },
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

escalaSchema.index({ atendenteNome: 1, unidade: 1, diaSemana: 1 })
escalaSchema.index({ und_ukey: 1 })

const Escala = mongoose.models.Escala || mongoose.model('Escala', escalaSchema)

// Função para mapear unidade para und_ukey
function unidadeParaUndKey(unidade) {
  const map = {
    'golden': 1,
    'mooca': 2,
    'grand-plaza': 3,
    'west-plaza': 6
  }
  return map[unidade] || null
}

// Função para mapear und_ukey para unidade
function undKeyParaUnidade(undKey) {
  const map = {
    1: 'golden',
    2: 'mooca',
    3: 'grand-plaza',
    6: 'west-plaza'
  }
  return map[undKey] || null
}

function hashPassword(p, s) {
  return crypto.pbkdf2Sync(p, s, 100000, 32, 'sha256').toString('hex')
}

async function conectarAoMongoDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI
  if (!uri) {
    console.error('❌ MONGODB_URI não configurada. Por favor, crie um arquivo .env com MONGODB_URI=...')
    process.exit(1)
  }
  
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  }

  try {
    await mongoose.connect(uri, options)
    console.log('✅ Conectado ao MongoDB Atlas!')
    
    // Eventos de conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado. Tentando reconectar...')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado!')
    })
  } catch (e) {
    console.error('❌ Erro ao conectar ao MongoDB:', e.message)
    process.exit(1)
  }
}

function isDBConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1
}

function requireDB(req, res, next) {
  if (!isDBConnected()) { 
    console.error('⚠️ Tentativa de acesso sem conexão ao MongoDB');
    res.status(503).json({ ok: false, error: 'db_not_connected', message: 'Banco de dados não conectado. Verifique a conexão com o MongoDB.' }); 
    return 
  }
  next()
}

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Servidor está rodando', dbConnected: isDBConnected() })
})

// Estrutura de preços dos serviços
const PRECOS_SERVICOS = {
  'quick': {
    nome: 'Quick Massage',
    avulso: {
      '15': 52.00,
      '25': 73.00,
      '35': 92.00
    },
    pacote4: {
      '15': 191.00,
      '25': 269.00,
      '35': 339.00
    },
    pacote8: {
      '15': 362.00,
      '25': 508.00,
      '35': 640.00
    }
  },
  'maca': {
    nome: 'Maca',
    avulso: {
      '30': 114.00,
      '45': 160.00,
      '60': 198.00,
      '90': 292.00
    },
    pacote4: {
      '30': 420.00,
      '45': 589.00,
      '60': 729.00,
      '90': 1075.00
    },
    pacote8: {
      '30': 793.00,
      '45': 1114.00,
      '60': 1378.00,
      '90': 2032.00
    }
  },
  'reflexologia': {
    nome: 'Reflexologia Podal',
    avulso: {
      '20': 83.00,
      '30': 99.00,
      '40': 118.00,
      '60': 159.00
    },
    pacote4: {
      '20': 305.00,
      '30': 364.00,
      '40': 434.00,
      '60': 585.00
    },
    pacote8: {
      '20': 578.00,
      '30': 689.00,
      '40': 821.00,
      '60': 1107.00
    }
  },
  'auriculoterapia': {
    nome: 'Auriculoterapia',
    avulso: {
      '10-20': 69.00
    },
    pacote4: {
      '10-20': 254.00
    },
    pacote8: {
      '10-20': 480.00
    }
  }
}

// Endpoint para buscar preços dos serviços
app.get('/servicos/precos', (req, res) => {
  res.json({ ok: true, precos: PRECOS_SERVICOS })
})

// Função para mapear nome do serviço para a chave no objeto de preços
function mapearServico(servico) {
  if (!servico) return null
  const servicoLower = servico.toLowerCase()
  
  // Mapear diferentes formatos de nome para a chave correta
  if (servicoLower.includes('quick') || servicoLower === 'quick-massage') return 'quick'
  if (servicoLower.includes('maca') || servicoLower === 'maca') return 'maca'
  if (servicoLower.includes('reflex') || servicoLower === 'reflexologia' || servicoLower === 'reflexologia-podal') return 'reflexologia'
  if (servicoLower.includes('auric') || servicoLower === 'auriculoterapia') return 'auriculoterapia'
  
  return servicoLower
}

// Função para calcular preço baseado no serviço, duração e tipo de pacote
function calcularPreco(servico, duracao, tipoPacote) {
  const servicoKey = mapearServico(servico)
  if (!servicoKey) {
    console.warn('Serviço não reconhecido:', servico)
    return 0
  }
  
  const servicoData = PRECOS_SERVICOS[servicoKey]
  if (!servicoData) {
    console.warn('Preços não encontrados para serviço:', servicoKey)
    return 0
  }
  
  const pacoteData = servicoData[tipoPacote]
  if (!pacoteData) {
    console.warn('Pacote não encontrado:', tipoPacote, 'para serviço:', servicoKey)
    return 0
  }
  
  // Para auriculoterapia, a duração é '10-20'
  if (servicoKey === 'auriculoterapia') {
    return pacoteData['10-20'] || 0
  }
  
  // Para outros serviços, usar a duração numérica
  const preco = pacoteData[duracao] || 0
  if (preco === 0) {
    console.warn('Preço não encontrado para duração:', duracao, 'tipo:', tipoPacote, 'serviço:', servicoKey)
  }
  return preco
}

app.use('/auth', requireDB)
app.use('/agendamentos', requireDB)
app.use('/estatisticas', requireDB)
app.use('/users', requireDB)
app.use('/relatorios', requireDB)
app.use('/atendentes', requireDB)
app.use('/escalas', requireDB)
app.use('/pontuacao', requireDB)

// Função para determinar o tipo de usuário baseado no email
function getUserType(email) {
  if (!email) return 'cliente'
  const domain = email.toLowerCase().split('@')[1]
  if (domain === 'admin.com') return 'admin'
  if (domain === 'massagista.com') return 'massagista'
  if (domain === 'recepcionista.com') return 'recepcionista'
  return 'cliente'
}

app.post('/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body
  if (!nome || !email || !senha) { res.status(400).json({ ok: false }); return }
  try {
    const exists = await User.findOne({ email })
    if (exists) { res.status(409).json({ ok: false }); return }
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = hashPassword(senha, salt)
    const u = new User({ nome, email, senhaHash: hash, senhaSalt: salt })
    await u.save()
    const userType = getUserType(email)
    res.json({ ok: true, user: { nome, email, tipo: userType } })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) { res.status(400).json({ ok: false }); return }
  try {
    const u = await User.findOne({ email })
    if (!u) { res.status(401).json({ ok: false }); return }
    const hash = hashPassword(senha, u.senhaSalt)
    if (hash !== u.senhaHash) { res.status(401).json({ ok: false }); return }
    const userType = getUserType(u.email)
    res.json({ ok: true, user: { nome: u.nome, email: u.email, tipo: userType } })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.post('/auth/change-password', async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body
  if (!email || !senhaAtual || !novaSenha) { res.status(400).json({ ok: false }); return }
  try {
    const u = await User.findOne({ email })
    if (!u) { res.status(404).json({ ok: false }); return }
    const currentHash = hashPassword(senhaAtual, u.senhaSalt)
    if (currentHash !== u.senhaHash) { res.status(401).json({ ok: false }); return }
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newHash = hashPassword(novaSenha, newSalt)
    u.senhaSalt = newSalt
    u.senhaHash = newHash
    await u.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.post('/agendamentos', async (req, res) => {
  try {
    const body = { ...req.body }
    
    // Sempre recalcular o preço para garantir que está correto
    let duracao = null
    let tipoPacote = 'avulso'
    
    // Determinar tipo de pacote
    if (body.pacote4) {
      tipoPacote = 'pacote4'
    } else if (body.pacote8) {
      tipoPacote = 'pacote8'
    } else {
      tipoPacote = 'avulso'
    }
    
    // Extrair duração
    if (body.duracaoAvulso) {
      duracao = body.duracaoAvulso.replace(' min', '').trim()
    } else if (tipoPacote === 'pacote4' || tipoPacote === 'pacote8') {
      // Para pacotes sem duração especificada, usar a primeira duração disponível do serviço
      const servicoKey = mapearServico(body.servico)
      if (servicoKey && PRECOS_SERVICOS[servicoKey]) {
        const servicoData = PRECOS_SERVICOS[servicoKey]
        if (servicoData.avulso) {
          duracao = Object.keys(servicoData.avulso)[0]
        }
      }
    }
    
    // Calcular preço
    if (body.servico && duracao) {
      body.valor = calcularPreco(body.servico, duracao, tipoPacote)
      body.tipoPacote = tipoPacote
    } else if (!body.valor) {
      // Se não conseguiu calcular, definir como 0
      body.valor = 0
      body.tipoPacote = tipoPacote || 'avulso'
    }
    
    // Adicionar und_ukey baseado na unidade
    if (body.unidade && !body.und_ukey) {
      body.und_ukey = unidadeParaUndKey(body.unidade)
    }
    
    console.log('Agendamento recebido:', {
      servico: body.servico,
      duracao: duracao,
      tipoPacote: body.tipoPacote,
      valor: body.valor,
      und_ukey: body.und_ukey
    })
    
    const b = new Booking(body)
    await b.save()
    res.json(b)
  } catch (e) {
    console.error('Erro ao salvar agendamento:', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/agendamentos', async (req, res) => {
  const { weekStart, weekEnd, clienteEmail } = req.query
  try {
    let query = {}
    
    // Se clienteEmail for fornecido, buscar todos os agendamentos desse cliente
    if (clienteEmail) {
      query.clienteEmail = clienteEmail.toLowerCase()
    } else if (weekStart && weekEnd) {
      // Se não houver clienteEmail, usar filtro de data
      query.data = { $gte: weekStart, $lte: weekEnd }
    } else {
      // Se não houver nenhum filtro, retornar todos
      query = {}
    }
    
    const items = await Booking.find(query).sort({ data: 1, horario: 1 })
    res.json(items)
  } catch (e) {
    console.error('Erro ao buscar agendamentos:', e)
    res.status(500).json([])
  }
})

app.delete('/agendamentos/:id', async (req, res) => {
  const { id } = req.params
  try {
    await Booking.findByIdAndDelete(id)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.get('/estatisticas/por-mes', async (req, res) => {
  try {
    const items = await Booking.aggregate([
      { $addFields: { month: { $substr: ['$data', 0, 7] } } },
      { $group: { 
        _id: '$month', 
        total: { $sum: 1 },
        receita: { $sum: { $ifNull: ['$valor', 0] } }
      } },
      { $sort: { _id: 1 } }
    ])
    res.json(items)
  } catch {
    res.status(500).json([])
  }
})

// Estatísticas por hora (ontem)
app.get('/estatisticas/por-hora-ontem', async (req, res) => {
  try {
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)
    const dataOntem = ontem.toISOString().slice(0, 10)
    
    const agendamentos = await Booking.find({ data: dataOntem })
    const horas = Array.from({ length: 24 }, (_, i) => i)
    
    const comCadastro = horas.map(hora => {
      const horaStr = hora.toString().padStart(2, '0') + ':00'
      return agendamentos.filter(a => {
        const horario = (a.horario || a.hora || '').toString()
        const horaMatch = horario.startsWith(horaStr) || horario === horaStr || horario.startsWith(hora + ':')
        return horaMatch && a.clienteEmail && a.clienteEmail.trim()
      }).length
    })
    
    const semCadastro = horas.map(hora => {
      const horaStr = hora.toString().padStart(2, '0') + ':00'
      return agendamentos.filter(a => {
        const horario = (a.horario || a.hora || '').toString()
        const horaMatch = horario.startsWith(horaStr) || horario === horaStr || horario.startsWith(hora + ':')
        return horaMatch && (!a.clienteEmail || !a.clienteEmail.trim())
      }).length
    })
    
    res.json({ comCadastro, semCadastro })
  } catch (e) {
    res.status(500).json({ comCadastro: [], semCadastro: [] })
  }
})

// Estatísticas por hora (hoje)
app.get('/estatisticas/por-hora-hoje', async (req, res) => {
  try {
    const hoje = new Date()
    const dataHoje = hoje.toISOString().slice(0, 10)
    
    const agendamentos = await Booking.find({ data: dataHoje })
    const horas = Array.from({ length: 24 }, (_, i) => i)
    
    const comCadastro = horas.map(hora => {
      const horaStr = hora.toString().padStart(2, '0') + ':00'
      return agendamentos.filter(a => {
        const horario = (a.horario || a.hora || '').toString()
        const horaMatch = horario.startsWith(horaStr) || horario === horaStr || horario.startsWith(hora + ':')
        return horaMatch && a.clienteEmail && a.clienteEmail.trim()
      }).length
    })
    
    const semCadastro = horas.map(hora => {
      const horaStr = hora.toString().padStart(2, '0') + ':00'
      return agendamentos.filter(a => {
        const horario = (a.horario || a.hora || '').toString()
        const horaMatch = horario.startsWith(horaStr) || horario === horaStr || horario.startsWith(hora + ':')
        return horaMatch && (!a.clienteEmail || !a.clienteEmail.trim())
      }).length
    })
    
    res.json({ comCadastro, semCadastro })
  } catch (e) {
    res.status(500).json({ comCadastro: [], semCadastro: [] })
  }
})

// Endpoint para listar todos os usuários (sem senhas por segurança)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { senhaHash: 0, senhaSalt: 0 }).sort({ createdAt: -1 })
    res.json({ ok: true, total: users.length, users })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoint para buscar dados do usuário logado
app.get('/auth/profile', async (req, res) => {
  const { email } = req.query
  if (!email) {
    res.status(400).json({ ok: false, error: 'Email é obrigatório' })
    return
  }
  try {
    const user = await User.findOne({ email }, { senhaHash: 0, senhaSalt: 0 })
    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuário não encontrado' })
      return
    }
    const userType = getUserType(user.email)
    res.json({ ok: true, user: { nome: user.nome, email: user.email, telefone: user.telefone || '', tipo: userType } })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoint para atualizar dados do usuário
app.put('/auth/profile', async (req, res) => {
  const { email, nome, telefone } = req.body
  if (!email) {
    res.status(400).json({ ok: false, error: 'Email é obrigatório' })
    return
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuário não encontrado' })
      return
    }
    if (nome) {
      if (nome.trim().length < 2) {
        res.status(400).json({ ok: false, error: 'Nome deve ter pelo menos 2 caracteres' })
        return
      }
      user.nome = nome.trim()
    }
    if (telefone !== undefined) {
      user.telefone = telefone.trim() || ''
    }
    await user.save()
    res.json({ ok: true, user: { nome: user.nome, email: user.email, telefone: user.telefone || '' } })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoint para salvar relatório de sessão
app.post('/relatorios/sessao', async (req, res) => {
  const { inicio, fim, procedimento, cliente, massagistaEmail, data } = req.body
  if (!inicio || !fim || !procedimento || !cliente || !massagistaEmail || !data) {
    res.status(400).json({ ok: false, error: 'Todos os campos são obrigatórios' })
    return
  }
  try {
    const report = new SessionReport({ inicio, fim, procedimento, cliente, massagistaEmail, data })
    await report.save()
    res.json({ ok: true, report })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoint para listar relatórios de sessão do massagista
app.get('/relatorios/sessao', async (req, res) => {
  const { email, data } = req.query
  if (!email) {
    res.status(400).json({ ok: false, error: 'Email é obrigatório' })
    return
  }
  try {
    const query = { massagistaEmail: email.toLowerCase() }
    if (data) {
      query.data = data
    }
    const reports = await SessionReport.find(query).sort({ timestamp: -1 })
    res.json({ ok: true, reports })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoints para Atendentes
// Listar atendentes por unidade
app.get('/atendentes', async (req, res) => {
  const { unidade } = req.query
  try {
    let query = { ativo: true }
    if (unidade) {
      query.unidades = unidade
    }
    const atendentes = await Atendente.find(query).sort({ nome: 1 })
    res.json({ ok: true, atendentes })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Verificar disponibilidade de um atendente
app.get('/atendentes/disponibilidade', async (req, res) => {
  const { nome, data, hora, unidade } = req.query
  if (!nome || !data || !hora || !unidade) {
    res.status(400).json({ ok: false, error: 'Parâmetros incompletos' })
    return
  }
  try {
    // Verificar se há agendamento no mesmo horário
    const agendamentos = await Booking.find({
      nome: nome,
      data: data,
      $or: [
        { horario: hora },
        { hora: hora }
      ],
      unidade: unidade
    })
    
    if (agendamentos.length > 0) {
      res.json({ ok: true, disponivel: false, motivo: 'Já possui agendamento neste horário' })
      return
    }
    
    // Verificar escala
    const dataObj = new Date(data + 'T00:00:00')
    const diaSemana = dataObj.getDay()
    const escalas = await Escala.find({
      atendenteNome: nome,
      unidade: unidade,
      diaSemana: diaSemana,
      ativo: true
    })
    
    if (escalas.length === 0) {
      // Se não há escala, considerar disponível
      res.json({ ok: true, disponivel: true })
      return
    }
    
    // Verificar se o horário está dentro do horário de trabalho
    const [horaSlotH, horaSlotM] = hora.split(':').map(Number)
    const horaSlotMinutos = horaSlotH * 60 + horaSlotM
    
    const disponivel = escalas.some(escala => {
      const [entradaH, entradaM] = escala.entrada.split(':').map(Number)
      const [saidaH, saidaM] = escala.saida.split(':').map(Number)
      const entradaMinutos = entradaH * 60 + entradaM
      const saidaMinutos = saidaH * 60 + saidaM
      return horaSlotMinutos >= entradaMinutos && horaSlotMinutos < saidaMinutos
    })
    
    res.json({ ok: true, disponivel })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Criar atendente
app.post('/atendentes', async (req, res) => {
  const { nome, unidades } = req.body
  if (!nome || !unidades || !Array.isArray(unidades) || unidades.length === 0) {
    res.status(400).json({ ok: false, error: 'Nome e unidades são obrigatórios' })
    return
  }
  try {
    const atendente = new Atendente({ nome, unidades })
    await atendente.save()
    res.json({ ok: true, atendente })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Atualizar atendente
app.put('/atendentes/:id', async (req, res) => {
  const { id } = req.params
  const { nome, unidades, ativo } = req.body
  try {
    const atendente = await Atendente.findByIdAndUpdate(
      id,
      { nome, unidades, ativo },
      { new: true, runValidators: true }
    )
    if (!atendente) {
      res.status(404).json({ ok: false, error: 'Atendente não encontrado' })
      return
    }
    res.json({ ok: true, atendente })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Deletar atendente
app.delete('/atendentes/:id', async (req, res) => {
  const { id } = req.params
  try {
    await Atendente.findByIdAndDelete(id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoint para inicializar atendentes padrão (apenas se não existirem)
app.post('/atendentes/init', async (req, res) => {
  try {
    const count = await Atendente.countDocuments()
    if (count > 0) {
      res.json({ ok: true, message: 'Atendentes já existem no banco', count })
      return
    }

    const atendentesIniciais = [
      { nome: 'Ana', unidades: ['golden', 'mooca'] },
      { nome: 'Bruno', unidades: ['golden', 'grand-plaza'] },
      { nome: 'Carla', unidades: ['mooca', 'west-plaza'] },
      { nome: 'Diego', unidades: ['grand-plaza', 'west-plaza'] },
      { nome: 'Eduarda', unidades: ['golden'] },
      { nome: 'Felipe', unidades: ['mooca', 'grand-plaza'] },
      { nome: 'Giovana', unidades: ['west-plaza'] },
      { nome: 'Hugo', unidades: ['golden', 'mooca', 'grand-plaza'] },
      { nome: 'Isabela', unidades: ['grand-plaza', 'west-plaza'] },
      { nome: 'João', unidades: ['mooca', 'west-plaza'] }
    ]

    await Atendente.insertMany(atendentesIniciais)
    res.json({ ok: true, message: `${atendentesIniciais.length} atendentes criados com sucesso` })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoints para Escalas
// Listar escalas
app.get('/escalas', async (req, res) => {
  const { unidade, atendenteNome, semana } = req.query
  try {
    let query = { ativo: true }
    if (unidade) {
      query.unidade = unidade
    }
    if (atendenteNome) {
      query.atendenteNome = atendenteNome
    }
    const escalas = await Escala.find(query).sort({ diaSemana: 1, entrada: 1 })
    res.json({ ok: true, escalas })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Criar escala
app.post('/escalas', async (req, res) => {
  const { atendenteNome, unidade, diaSemana, entrada, saida } = req.body
  if (!atendenteNome || !unidade || diaSemana === undefined || !entrada || !saida) {
    res.status(400).json({ ok: false, error: 'Todos os campos são obrigatórios' })
    return
  }
  try {
    const und_ukey = unidadeParaUndKey(unidade)
    if (!und_ukey) {
      res.status(400).json({ ok: false, error: 'Unidade inválida' })
      return
    }
    const escala = new Escala({ atendenteNome, unidade, und_ukey, diaSemana, entrada, saida })
    await escala.save()
    res.json({ ok: true, escala })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Atualizar escala
app.put('/escalas/:id', async (req, res) => {
  const { id } = req.params
  const { atendenteNome, unidade, diaSemana, entrada, saida, ativo } = req.body
  try {
    const updateData = { atendenteNome, diaSemana, entrada, saida, ativo }
    if (unidade) {
      updateData.unidade = unidade
      updateData.und_ukey = unidadeParaUndKey(unidade)
    }
    const escala = await Escala.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    if (!escala) {
      res.status(404).json({ ok: false, error: 'Escala não encontrada' })
      return
    }
    res.json({ ok: true, escala })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Deletar escala
app.delete('/escalas/:id', async (req, res) => {
  const { id } = req.params
  try {
    await Escala.findByIdAndDelete(id)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Endpoints para Pontuação
// Calcular pontuação de um agendamento (valor / 52)
function calcularPontuacao(valor) {
  if (!valor || valor <= 0) return 0
  return parseFloat((valor / 52).toFixed(2))
}

// Obter pontuação pessoal
app.get('/pontuacao/pessoal', async (req, res) => {
  const { email, mes, ano } = req.query
  if (!email) {
    res.status(400).json({ ok: false, error: 'Email é obrigatório' })
    return
  }
  try {
    // Buscar usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(404).json({ ok: false, error: 'Usuário não encontrado' })
      return
    }
    
    // Para admin, buscar todos os agendamentos
    // Para massagista/recepcionista, buscar apenas onde o nome do terapeuta corresponde
    const userType = getUserType(user.email)
    let query = {}
    
    if (userType === 'admin') {
      // Admin vê todos os agendamentos
      query = {}
    } else {
      // Massagista/recepcionista vê apenas seus próprios agendamentos
      query = { nome: user.nome }
    }
    
    if (mes && ano) {
      const startDate = `${ano}-${mes.padStart(2, '0')}-01`
      const endDate = `${ano}-${mes.padStart(2, '0')}-31`
      query.data = { $gte: startDate, $lte: endDate }
    } else {
      // Se não especificou mês/ano, buscar todos
    }
    
    const agendamentos = await Booking.find(query).sort({ data: -1, horario: -1 })
    
    let totalPontos = 0
    let totalAgendamentos = agendamentos.length
    const detalhes = agendamentos.map(ag => {
      const pontos = calcularPontuacao(ag.valor)
      totalPontos += pontos
      return {
        data: ag.data,
        horario: ag.horario || ag.hora,
        servico: ag.servico,
        valor: ag.valor,
        pontos: pontos,
        cliente: ag.clienteNome,
        unidade: ag.unidadeNome || ag.unidade
      }
    })
    
    res.json({
      ok: true,
      usuario: user.nome,
      totalPontos: parseFloat(totalPontos.toFixed(2)),
      totalAgendamentos,
      detalhes
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Listar todos os clientes cadastrados (apenas admin)
app.get('/users/clientes', async (req, res) => {
  try {
    // Buscar apenas usuários que não são admin, massagista ou recepcionista
    const users = await User.find({}, { senhaHash: 0, senhaSalt: 0 })
      .sort({ createdAt: -1 })
      .then(users => users.filter(u => {
        const tipo = getUserType(u.email)
        return tipo === 'cliente'
      }))
    
    res.json({ ok: true, total: users.length, clientes: users })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

app.listen(3000, async () => {
  await conectarAoMongoDB()
  console.log('🚀 Servidor rodando em http://localhost:3000')
  console.log('💡 Dica: Para inicializar atendentes padrão, faça uma requisição POST para /atendentes/init')
})
