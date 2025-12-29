import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Moto, Cliente, Financiamento, Parcela } from '@/types'
import {
  addMonths,
  differenceInDays,
  isAfter,
  parseISO,
  startOfDay,
} from 'date-fns'
import { toast } from '@/hooks/use-toast'

interface DataContextType {
  motos: Moto[]
  clientes: Cliente[]
  financiamentos: Financiamento[]
  addMoto: (moto: Omit<Moto, 'id' | 'status'>) => void
  updateMoto: (id: string, moto: Partial<Moto>) => void
  deleteMoto: (id: string) => void
  addCliente: (cliente: Omit<Cliente, 'id'>) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  addFinanciamento: (
    financiamento: Omit<Financiamento, 'id' | 'status' | 'parcelas'>,
  ) => void
  registerPayment: (
    financiamentoId: string,
    parcelaNumero: number,
    dataPagamento: string,
    valorPago: number,
  ) => void
  refreshPenalties: () => void
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
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpf: '987.654.321-00',
    telefone: '(21) 91234-5678',
    email: 'maria@email.com',
    endereco: 'Av B, 456',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-000',
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [motos, setMotos] = useState<Moto[]>(INITIAL_MOTOS)
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES)
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>(
    INITIAL_FINANCIAMENTOS,
  )

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
      imagem: `https://img.usecurling.com/p/300/200?q=${motoData.modelo.split(' ').join('%20')}`,
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

    const newFinanciamento: Financiamento = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
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

  return (
    <DataContext.Provider
      value={{
        motos,
        clientes,
        financiamentos,
        addMoto,
        updateMoto,
        deleteMoto,
        addCliente,
        updateCliente,
        addFinanciamento,
        registerPayment,
        refreshPenalties,
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
