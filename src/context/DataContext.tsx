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
  motos: Moto[]
  clientes: Cliente[]
  financiamentos: Financiamento[]
  empresa: Empresa
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
    historicoAquisicao: [
      {
        id: 'aq1',
        data: '2024-01-01',
        valor: 15000,
        vendedor: 'Honda Factory',
        km: 0,
        consignacao: false,
      },
    ],
  },
  {
    id: '2',
    modelo: 'MT-03',
    fabricante: 'Yamaha',
    ano: 2023,
    cor: 'Azul',
    valor: 32000,
    status: 'estoque',
    imagem: 'https://img.usecurling.com/p/300/200?q=yamaha%20mt03&color=blue',
    kmAtual: 5000,
    chassis: '9C2JP8580KR005678',
    dataLicenciamento: new Date().toISOString().split('T')[0], // For testing "Current Month"
    historicoAquisicao: [
      {
        id: 'aq2',
        data: '2023-12-01',
        valor: 28000,
        vendedor: 'José da Silva',
        km: 5000,
        consignacao: true,
      },
    ],
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
    chassis: '9C2JP8580KR009012',
    dataLicenciamento: '2025-05-20',
    historicoAquisicao: [
      {
        id: 'aq3',
        data: '2023-11-15',
        valor: 38000,
        vendedor: 'Leilão SP',
        km: 11000,
        consignacao: false,
      },
    ],
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
    prof_empresa: 'Tech Solutions',
    prof_cargo: 'Desenvolvedor',
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpf: '987.654.321-00',
    telefone: '(21) 91234-5678',
    email: 'maria@email.com',
    endereco: 'Av B, 456',
    bairro: 'Copacabana',
    complemento: '',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-000',
    genero: 'feminino',
    prof_empresa: 'Loja de Roupas',
    prof_cargo: 'Gerente',
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
  nome: 'MotoFin Dealership',
  cnpj: '00.000.000/0000-00',
  endereco: 'Av. das Motos, 1000 - Centro',
  telefone: '(11) 3333-4444',
  telefone2: '',
  telefone3: '',
  email: 'contato@motofin.com',
  logo: 'https://img.usecurling.com/i?q=motorcycle&shape=outline&color=black',
  instagram: 'https://instagram.com/motofin',
  facebook: 'https://facebook.com/motofin',
  x: 'https://x.com/motofin',
  tiktok: '',
  website: 'https://motofin.com.br',
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [motos, setMotos] = useState<Moto[]>(INITIAL_MOTOS)
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES)
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>(
    INITIAL_FINANCIAMENTOS,
  )
  const [empresa, setEmpresa] = useState<Empresa>(INITIAL_EMPRESA)

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
    const interval = setInterval(refreshPenalties, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

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

    // Generate numeric ID
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

    // Update Moto Status
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

      // Check if Moto changed
      if (data.motoId && data.motoId !== oldFinanciamento.motoId) {
        // Swap Status
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
    parcelaNumero: number,
    dataPagamento: string,
    valorPago: number,
  ) => {
    setFinanciamentos((prev) =>
      prev.map((fin) => {
        if (fin.id !== financiamentoId) return fin

        const updatedParcelas = fin.parcelas.map((p) => {
          if (p.numero === parcelaNumero) {
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
      description: `Parcela ${parcelaNumero} quitada com sucesso.`,
    })
  }

  const updateEmpresa = (data: Empresa) => {
    setEmpresa(data)
    toast({ title: 'Sucesso', description: 'Dados da empresa atualizados.' })
  }

  return (
    <DataContext.Provider
      value={{
        motos,
        clientes,
        financiamentos,
        empresa,
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
