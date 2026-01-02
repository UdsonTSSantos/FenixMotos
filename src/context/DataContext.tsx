import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import {
  Moto,
  Cliente,
  Financiamento,
  Parcela,
  Empresa,
  ParcelaStatus,
  Usuario,
  Peca,
  Servico,
  Orcamento,
} from '@/types'
import {
  differenceInDays,
  isAfter,
  parseISO,
  startOfDay,
  addMonths,
} from 'date-fns'
import { toast } from '@/hooks/use-toast'

interface DataContextType {
  // Data
  motos: Moto[]
  clientes: Cliente[]
  financiamentos: Financiamento[]
  empresa: Empresa
  usuarios: Usuario[]
  pecas: Peca[]
  servicos: Servico[]
  orcamentos: Orcamento[]

  // Auth
  currentUser: Usuario | null
  login: (email: string, pass: string) => boolean
  logout: () => void

  // Methods
  addMoto: (moto: Omit<Moto, 'id' | 'status'>) => void
  updateMoto: (id: string, moto: Partial<Moto>) => void
  deleteMoto: (id: string) => void
  addCliente: (cliente: Omit<Cliente, 'id'>) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  addFinanciamento: (
    financiamento: Omit<Financiamento, 'id' | 'status' | 'parcelas'>,
  ) => void
  updateFinanciamento: (id: string, data: Partial<Financiamento>) => void
  registerPayment: (
    financiamentoId: string,
    parcelaNumero: number,
    dataPagamento: string,
    valorPago: number,
  ) => void
  refreshPenalties: () => void
  updateEmpresa: (data: Empresa) => void

  // New Methods
  addUsuario: (user: Omit<Usuario, 'id'>) => void
  updateUsuario: (id: string, user: Partial<Usuario>) => void
  deleteUsuario: (id: string) => void

  addPeca: (peca: Omit<Peca, 'id'>) => void
  updatePeca: (id: string, peca: Partial<Peca>) => void
  deletePeca: (id: string) => void
  importPecasXML: (xmlContent: string) => void

  addServico: (servico: Omit<Servico, 'id'>) => void
  updateServico: (id: string, servico: Partial<Servico>) => void
  deleteServico: (id: string) => void

  addOrcamento: (orcamento: Omit<Orcamento, 'id'>) => void
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Mock Data
const INITIAL_MOTOS: Moto[] = [
  {
    id: '1',
    modelo: 'CG 160 Titan',
    fabricante: 'Honda',
    ano: 2024,
    cor: 'Vermelho',
    valor: 18500,
    status: 'estoque',
    imagem: 'https://img.usecurling.com/p/300/200?q=honda%20cg%20160&color=red',
    kmAtual: 0,
    chassis: '9C2JP8580KR001234',
    dataLicenciamento: '2025-10-15',
    historicoAquisicao: [],
  },
  {
    id: '3',
    modelo: 'CB 500X',
    fabricante: 'Honda',
    ano: 2022,
    cor: 'Verde',
    valor: 45000,
    status: 'vendida',
    placa: 'ABC-1234',
    imagem: 'https://img.usecurling.com/p/300/200?q=honda%20cb500x&color=green',
    kmAtual: 12000,
    historicoAquisicao: [],
  },
]

const INITIAL_CLIENTES: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'joao@email.com',
    endereco: 'Rua A, 123',
    bairro: 'Centro',
    complemento: 'Apto 101',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    genero: 'masculino',
  },
]

const INITIAL_FINANCIAMENTOS: Financiamento[] = [
  {
    id: '1',
    clienteId: '1',
    motoId: '3',
    dataContrato: '2024-01-15',
    valorTotal: 45000,
    valorEntrada: 15000,
    valorFinanciado: 30000,
    quantidadeParcelas: 12,
    taxaJurosAtraso: 2,
    valorMultaAtraso: 50,
    taxaFinanciamento: 0,
    status: 'ativo',
    parcelas: Array.from({ length: 12 }).map((_, i) => ({
      numero: i + 1,
      dataVencimento: addMonths(new Date('2024-01-15'), i + 1).toISOString(),
      valorOriginal: 2500,
      valorJuros: 0,
      valorMulta: 0,
      valorTotal: 2500,
      status: i < 5 ? 'paga' : 'pendente',
      dataPagamento:
        i < 5
          ? addMonths(new Date('2024-01-15'), i + 1).toISOString()
          : undefined,
    })),
  },
]

const INITIAL_EMPRESA: Empresa = {
  nome: 'Fenix Moto',
  cnpj: '00.000.000/0000-00',
  endereco: 'Av. das Motos, 1000 - Centro',
  telefone: '(11) 3333-4444',
  telefone2: '(11) 9999-8888',
  telefone3: '(11) 9777-6666',
  email: 'contato@fenixmoto.com.br',
  logo: 'https://img.usecurling.com/i?q=motorcycle&shape=outline&color=black',
  instagram: 'https://instagram.com/fenixmoto',
  website: 'https://fenixmoto.com.br',
}

const INITIAL_USUARIOS: Usuario[] = [
  {
    id: '1',
    nome: 'Webmaster',
    email: 'webmaster@fenixmoto.com.br',
    senha: '26843831',
    role: 'Administrador',
    ativo: true,
    foto: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
  },
]

const INITIAL_PECAS: Peca[] = [
  {
    id: '1',
    codigo: 'OLEO001',
    nome: 'Óleo Motor 10W30',
    descricao: 'Óleo Semissintético',
    quantidade: 50,
    precoCusto: 25,
    precoVenda: 45,
  },
  {
    id: '2',
    codigo: 'FILT002',
    nome: 'Filtro de Ar CG',
    descricao: 'Para CG 160',
    quantidade: 20,
    precoCusto: 15,
    precoVenda: 30,
  },
]

const INITIAL_SERVICOS: Servico[] = [
  {
    id: '1',
    nome: 'Troca de Óleo',
    descricao: 'Mão de obra troca simples',
    valor: 20,
    comissao: 25, // 25%
  },
  {
    id: '2',
    nome: 'Revisão Geral',
    descricao: 'Revisão completa',
    valor: 250,
    comissao: 20, // 20%
  },
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [motos, setMotos] = useState<Moto[]>(INITIAL_MOTOS)
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES)
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>(
    INITIAL_FINANCIAMENTOS,
  )
  const [empresa, setEmpresa] = useState<Empresa>(INITIAL_EMPRESA)
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS)
  const [pecas, setPecas] = useState<Peca[]>(INITIAL_PECAS)
  const [servicos, setServicos] = useState<Servico[]>(INITIAL_SERVICOS)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Auth
  const login = (email: string, pass: string) => {
    const user = usuarios.find(
      (u) => u.email === email && u.senha === pass && u.ativo,
    )
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }

  // Calculate penalties on mount and when needed
  const refreshPenalties = () => {
    const today = startOfDay(new Date())

    setFinanciamentos((prev) =>
      prev.map((fin) => {
        let hasOverdue = false
        const newParcelas = fin.parcelas.map((p) => {
          if (p.status === 'paga') return p

          const dueDate = parseISO(p.dataVencimento)
          if (isAfter(today, dueDate)) {
            const daysOverdue = differenceInDays(today, dueDate)
            const interest =
              p.valorOriginal * (fin.taxaJurosAtraso / 100) * daysOverdue
            const penalty = fin.valorMultaAtraso

            hasOverdue = true
            return {
              ...p,
              status: 'atrasada',
              valorJuros: interest,
              valorMulta: penalty,
              valorTotal: p.valorOriginal + interest + penalty,
            }
          }
          return p
        })

        const allPaid = newParcelas.every((p) => p.status === 'paga')

        return {
          ...fin,
          parcelas: newParcelas,
          status: allPaid ? 'quitado' : hasOverdue ? 'inadimplente' : 'ativo',
        }
      }),
    )
  }

  useEffect(() => {
    refreshPenalties()
    const interval = setInterval(refreshPenalties, 60000)
    return () => clearInterval(interval)
  }, [])

  // CRUD Motos
  const addMoto = (motoData: Omit<Moto, 'id' | 'status'>) => {
    const newMoto: Moto = {
      ...motoData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'estoque',
      imagem:
        motoData.imagem ||
        `https://img.usecurling.com/p/300/200?q=${motoData.modelo.split(' ').join('%20')}`,
      historicoAquisicao: motoData.historicoAquisicao || [],
    }
    setMotos([...motos, newMoto])
    toast({ title: 'Sucesso', description: 'Moto adicionada ao estoque!' })
  }

  const updateMoto = (id: string, data: Partial<Moto>) => {
    setMotos(motos.map((m) => (m.id === id ? { ...m, ...data } : m)))
    toast({ title: 'Sucesso', description: 'Dados da moto atualizados.' })
  }

  const deleteMoto = (id: string) => {
    if (financiamentos.some((f) => f.motoId === id)) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir moto com financiamento vinculado.',
        variant: 'destructive',
      })
      return
    }
    setMotos(motos.filter((m) => m.id !== id))
    toast({ title: 'Sucesso', description: 'Moto removida.' })
  }

  // CRUD Clientes
  const addCliente = (clienteData: Omit<Cliente, 'id'>) => {
    if (clientes.some((c) => c.cpf === clienteData.cpf)) {
      toast({
        title: 'Erro',
        description: 'CPF já cadastrado.',
        variant: 'destructive',
      })
      return
    }
    const newCliente = {
      ...clienteData,
      id: Math.random().toString(36).substr(2, 9),
    }
    setClientes([...clientes, newCliente])
    toast({ title: 'Sucesso', description: 'Cliente cadastrado!' })
  }

  const updateCliente = (id: string, data: Partial<Cliente>) => {
    setClientes(clientes.map((c) => (c.id === id ? { ...c, ...data } : c)))
    toast({ title: 'Sucesso', description: 'Dados do cliente atualizados.' })
  }

  // CRUD Financiamentos
  const addFinanciamento = (
    data: Omit<Financiamento, 'id' | 'status' | 'parcelas'>,
  ) => {
    const parcelValue = data.valorFinanciado / data.quantidadeParcelas
    const parcelas: Parcela[] = Array.from({
      length: data.quantidadeParcelas,
    }).map((_, i) => ({
      numero: i + 1,
      dataVencimento: addMonths(
        parseISO(data.dataContrato),
        i + 1,
      ).toISOString(),
      valorOriginal: parcelValue,
      valorJuros: 0,
      valorMulta: 0,
      valorTotal: parcelValue,
      status: 'pendente',
    }))

    const maxId = financiamentos.reduce((max, f) => {
      const numId = parseInt(f.id)
      return !isNaN(numId) && numId > max ? numId : max
    }, 0)
    const newId = (maxId + 1).toString()

    const newFinanciamento: Financiamento = {
      ...data,
      id: newId,
      status: 'ativo',
      parcelas,
    }

    setFinanciamentos([...financiamentos, newFinanciamento])
    setMotos((prev) =>
      prev.map((m) => (m.id === data.motoId ? { ...m, status: 'vendida' } : m)),
    )
    toast({
      title: 'Sucesso',
      description: 'Financiamento criado com sucesso!',
    })
  }

  const updateFinanciamento = (id: string, data: Partial<Financiamento>) => {
    setFinanciamentos((prev) => {
      const oldFinanciamento = prev.find((f) => f.id === id)
      if (!oldFinanciamento) return prev
      if (data.motoId && data.motoId !== oldFinanciamento.motoId) {
        setMotos((currentMotos) =>
          currentMotos.map((m) => {
            if (m.id === oldFinanciamento.motoId)
              return { ...m, status: 'estoque' }
            if (m.id === data.motoId) return { ...m, status: 'vendida' }
            return m
          }),
        )
      }
      return prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    })
    toast({ title: 'Sucesso', description: 'Financiamento atualizado.' })
  }

  const registerPayment = (
    financiamentoId: string,
    parcelNumero: number,
    dataPagamento: string,
    valorPago: number,
  ) => {
    setFinanciamentos((prev) =>
      prev.map((fin) => {
        if (fin.id !== financiamentoId) return fin
        const updatedParcelas = fin.parcelas.map((p) => {
          if (p.numero === parcelNumero) {
            return {
              ...p,
              status: 'paga' as ParcelaStatus,
              dataPagamento,
              valorTotal: valorPago,
            }
          }
          return p
        })
        const allPaid = updatedParcelas.every((p) => p.status === 'paga')
        return {
          ...fin,
          parcelas: updatedParcelas,
          status: allPaid ? 'quitado' : fin.status,
        }
      }),
    )
    toast({
      title: 'Pagamento Registrado',
      description: `Parcela ${parcelNumero} quitada com sucesso.`,
    })
  }

  const updateEmpresa = (data: Empresa) => {
    setEmpresa(data)
    toast({ title: 'Sucesso', description: 'Dados da empresa atualizados.' })
  }

  // CRUD Usuarios
  const addUsuario = (userData: Omit<Usuario, 'id'>) => {
    const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) }
    setUsuarios([...usuarios, newUser])
    toast({ title: 'Sucesso', description: 'Usuário criado.' })
  }

  const updateUsuario = (id: string, data: Partial<Usuario>) => {
    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...data } : u)))
    toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
  }

  const deleteUsuario = (id: string) => {
    if (usuarios.length <= 1) {
      toast({
        title: 'Erro',
        description: 'Não é possível remover o último usuário.',
        variant: 'destructive',
      })
      return
    }
    setUsuarios(usuarios.filter((u) => u.id !== id))
    toast({ title: 'Sucesso', description: 'Usuário removido.' })
  }

  // CRUD Pecas
  const addPeca = (data: Omit<Peca, 'id'>) => {
    const newPeca = { ...data, id: Math.random().toString(36).substr(2, 9) }
    setPecas([...pecas, newPeca])
    toast({ title: 'Sucesso', description: 'Peça cadastrada.' })
  }

  const updatePeca = (id: string, data: Partial<Peca>) => {
    setPecas(pecas.map((p) => (p.id === id ? { ...p, ...data } : p)))
    toast({ title: 'Sucesso', description: 'Peça atualizada.' })
  }

  const deletePeca = (id: string) => {
    setPecas(pecas.filter((p) => p.id !== id))
    toast({ title: 'Sucesso', description: 'Peça removida.' })
  }

  const importPecasXML = (xmlContent: string) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

    const dets = xmlDoc.getElementsByTagName('det')
    let importedCount = 0
    const newPecasToAdd: Peca[] = []

    if (dets.length > 0) {
      for (let i = 0; i < dets.length; i++) {
        const prod = dets[i].getElementsByTagName('prod')[0]
        if (prod) {
          const codigo =
            prod.getElementsByTagName('cProd')[0]?.textContent ||
            `IMP-${Math.random().toString(36).substr(2, 5)}`
          const nome =
            prod.getElementsByTagName('xProd')[0]?.textContent ||
            'Produto Importado'
          const qtd = parseFloat(
            prod.getElementsByTagName('qCom')[0]?.textContent || '0',
          )
          const valor = parseFloat(
            prod.getElementsByTagName('vUnCom')[0]?.textContent || '0',
          )

          newPecasToAdd.push({
            id: Math.random().toString(36).substr(2, 9),
            codigo,
            nome,
            descricao: 'Importado via XML',
            quantidade: qtd,
            precoCusto: valor,
            precoVenda: valor * 1.5,
          })
          importedCount++
        }
      }
    } else {
      const items = xmlDoc.getElementsByTagName('item')
      for (let i = 0; i < items.length; i++) {
        const nome =
          items[i].getElementsByTagName('name')[0]?.textContent || 'Item'
        newPecasToAdd.push({
          id: Math.random().toString(36).substr(2, 9),
          codigo: `XML-${i}`,
          nome,
          descricao: 'Importado',
          quantidade: 10,
          precoCusto: 10,
          precoVenda: 20,
        })
        importedCount++
      }
    }

    if (importedCount > 0) {
      setPecas([...pecas, ...newPecasToAdd])
      toast({
        title: 'Importação Concluída',
        description: `${importedCount} itens importados com sucesso.`,
      })
    } else {
      toast({
        title: 'Erro na Importação',
        description: 'Nenhum item válido encontrado no XML.',
        variant: 'destructive',
      })
    }
  }

  // CRUD Servicos
  const addServico = (data: Omit<Servico, 'id'>) => {
    setServicos([
      ...servicos,
      { ...data, id: Math.random().toString(36).substr(2, 9) },
    ])
    toast({ title: 'Sucesso', description: 'Serviço cadastrado.' })
  }

  const updateServico = (id: string, data: Partial<Servico>) => {
    setServicos(servicos.map((s) => (s.id === id ? { ...s, ...data } : s)))
    toast({ title: 'Sucesso', description: 'Serviço atualizado.' })
  }

  const deleteServico = (id: string) => {
    setServicos(servicos.filter((s) => s.id !== id))
    toast({ title: 'Sucesso', description: 'Serviço removido.' })
  }

  // CRUD Orcamentos
  const addOrcamento = (data: Omit<Orcamento, 'id'>) => {
    // Generate sequential ID
    const ids = orcamentos.map((o) => parseInt(o.id)).filter((n) => !isNaN(n))
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1

    setOrcamentos([...orcamentos, { ...data, id: nextId.toString() }])
    toast({ title: 'Sucesso', description: `Orçamento #${nextId} criado.` })
  }

  const updateOrcamento = (id: string, data: Partial<Orcamento>) => {
    // Handle inventory deduction if status changes to 'aprovado'
    const oldOrcamento = orcamentos.find((o) => o.id === id)

    if (
      oldOrcamento &&
      data.status === 'aprovado' &&
      oldOrcamento.status !== 'aprovado'
    ) {
      const itemsToDeduct = data.itens || oldOrcamento.itens

      setPecas((currentPecas) => {
        return currentPecas.map((peca) => {
          const item = itemsToDeduct.find(
            (i) => i.tipo === 'peca' && i.referenciaId === peca.id,
          )
          if (item) {
            return {
              ...peca,
              quantidade: peca.quantidade - item.quantidade,
            }
          }
          return peca
        })
      })
      toast({
        title: 'Estoque Atualizado',
        description: 'Quantidades deduzidas do estoque.',
      })
    }

    setOrcamentos((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data } : o)),
    )
    toast({ title: 'Sucesso', description: 'Orçamento atualizado.' })
  }

  return (
    <DataContext.Provider
      value={{
        motos,
        clientes,
        financiamentos,
        empresa,
        usuarios,
        pecas,
        servicos,
        orcamentos,
        currentUser,
        login,
        logout,
        addMoto,
        updateMoto,
        deleteMoto,
        addCliente,
        updateCliente,
        addFinanciamento,
        updateFinanciamento,
        registerPayment,
        refreshPenalties,
        updateEmpresa,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        addPeca,
        updatePeca,
        deletePeca,
        importPecasXML,
        addServico,
        updateServico,
        deleteServico,
        addOrcamento,
        updateOrcamento,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}
