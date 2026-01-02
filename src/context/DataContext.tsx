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
  Usuario,
  Peca,
  Servico,
  Orcamento,
} from '@/types'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface DataContextType {
  motos: Moto[]
  clientes: Cliente[]
  financiamentos: Financiamento[]
  empresa: Empresa
  usuarios: Usuario[]
  pecas: Peca[]
  servicos: Servico[]
  orcamentos: Orcamento[]

  currentUser: Usuario | null
  login: (email: string, pass: string) => Promise<boolean>
  logout: () => void

  addMoto: (moto: Omit<Moto, 'id' | 'status'>) => void
  updateMoto: (id: string, moto: Partial<Moto>) => void
  deleteMoto: (id: string) => void
  addCliente: (cliente: Omit<Cliente, 'id'>) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  addFinanciamento: (
    financiamento: Omit<Financiamento, 'id' | 'status' | 'parcelas'> & {
      parcelas: any[]
    },
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
  deleteOrcamento: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const DEFAULT_EMPRESA: Empresa = {
  nome: 'Fenix Moto',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  logo: '',
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, signIn, signOut } = useAuth()

  const [motos, setMotos] = useState<Moto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [financiamentos, setFinanciamentos] = useState<Financiamento[]>([])
  const [empresa, setEmpresa] = useState<Empresa>(DEFAULT_EMPRESA)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pecas, setPecas] = useState<Peca[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  const fetchAllData = async () => {
    if (!authUser) return

    // Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    if (profile) setCurrentUser(profile)

    // Fetch Empresa
    const { data: empData } = await supabase
      .from('empresa')
      .select('*')
      .single()
    if (empData) setEmpresa(empData)

    // Fetch Lists
    const { data: motosData } = await supabase
      .from('motos')
      .select(`*, historicoAquisicao:aquisicoes_moto(*)`)
    if (motosData) setMotos(motosData)

    const { data: clientesData } = await supabase.from('clientes').select('*')
    if (clientesData) setClientes(clientesData)

    const { data: financs } = await supabase
      .from('financiamentos')
      .select(`*, parcelas(*)`)
    if (financs) setFinanciamentos(financs)

    const { data: users } = await supabase.from('profiles').select('*')
    if (users) setUsuarios(users)

    const { data: pecasData } = await supabase.from('pecas').select('*')
    if (pecasData) setPecas(pecasData)

    const { data: servs } = await supabase.from('servicos').select('*')
    if (servs) setServicos(servs)

    const { data: orcs } = await supabase
      .from('orcamentos')
      .select(`*, itens:orcamento_itens(*)`)
    if (orcs) setOrcamentos(orcs)
  }

  useEffect(() => {
    fetchAllData()
  }, [authUser])

  // Login Wrapper
  const login = async (email: string, pass: string) => {
    const { error } = await signIn(email, pass)
    return !error
  }

  const logout = async () => {
    await signOut()
    setCurrentUser(null)
  }

  // Motos
  const addMoto = async (motoData: Omit<Moto, 'id' | 'status'>) => {
    const { historicoAquisicao, ...moto } = motoData
    const { data, error } = await supabase
      .from('motos')
      .insert({ ...moto, status: 'estoque' })
      .select()
      .single()
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    if (historicoAquisicao && historicoAquisicao.length > 0) {
      const aquisicoes = historicoAquisicao.map((h) => ({
        ...h,
        moto_id: data.id,
      }))
      await supabase.from('aquisicoes_moto').insert(aquisicoes)
    }
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto adicionada!' })
  }

  const updateMoto = async (id: string, data: Partial<Moto>) => {
    const { historicoAquisicao, ...fields } = data
    await supabase.from('motos').update(fields).eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto atualizada.' })
  }

  const deleteMoto = async (id: string) => {
    const { error } = await supabase.from('motos').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto removida.' })
  }

  // Clientes
  const addCliente = async (clienteData: Omit<Cliente, 'id'>) => {
    const { error } = await supabase.from('clientes').insert(clienteData)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Cliente cadastrado!' })
  }

  const updateCliente = async (id: string, data: Partial<Cliente>) => {
    await supabase.from('clientes').update(data).eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Cliente atualizado.' })
  }

  // Financiamentos
  const addFinanciamento = async (data: any) => {
    const { parcelas, ...finData } = data
    const { data: fin, error } = await supabase
      .from('financiamentos')
      .insert({
        cliente_id: finData.clienteId,
        moto_id: finData.motoId,
        data_contrato: finData.dataContrato,
        valor_total: finData.valorTotal,
        valor_entrada: finData.valorEntrada,
        valor_financiado: finData.valorFinanciado,
        quantidade_parcelas: finData.quantidadeParcelas,
        taxa_juros_atraso: finData.taxaJurosAtraso,
        valor_multa_atraso: finData.valorMultaAtraso,
        taxa_financiamento: finData.taxaFinanciamento,
        observacao: finData.observacao,
        status: 'ativo',
      })
      .select()
      .single()

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    const parcelasDb = parcelas.map((p: Parcela) => ({
      financiamento_id: fin.id,
      numero: p.numero,
      data_vencimento: p.dataVencimento,
      valor_original: p.valorOriginal,
      valor_juros: p.valorJuros,
      valor_multa: p.valorMulta,
      valor_total: p.valorTotal,
      status: p.status,
    }))
    await supabase.from('parcelas').insert(parcelasDb)

    await supabase
      .from('motos')
      .update({ status: 'vendida' })
      .eq('id', fin.moto_id)

    fetchAllData()
    toast({ title: 'Sucesso', description: 'Financiamento criado.' })
  }

  const updateFinanciamento = async (
    id: string,
    data: Partial<Financiamento>,
  ) => {
    const dbData: any = {}
    if (data.status) dbData.status = data.status
    if (data.observacao) dbData.observacao = data.observacao

    if (Object.keys(dbData).length > 0) {
      await supabase.from('financiamentos').update(dbData).eq('id', id)
    }

    if (data.parcelas) {
      for (const p of data.parcelas) {
        await supabase
          .from('parcelas')
          .update({
            valor_original: p.valorOriginal,
            valor_total: p.valorTotal,
            status: p.status,
            data_pagamento: p.dataPagamento,
          })
          .eq('financiamento_id', id)
          .eq('numero', p.numero)
      }
    }

    fetchAllData()
    toast({ title: 'Sucesso', description: 'Financiamento atualizado.' })
  }

  const registerPayment = async (
    finId: string,
    pNum: number,
    dataPgto: string,
    valorPago: number,
  ) => {
    await supabase
      .from('parcelas')
      .update({
        status: 'paga',
        data_pagamento: dataPgto,
        valor_total: valorPago,
      })
      .match({ financiamento_id: finId, numero: pNum })

    const { data: parcels } = await supabase
      .from('parcelas')
      .select('status')
      .eq('financiamento_id', finId)
    if (parcels && parcels.every((p) => p.status === 'paga')) {
      await supabase
        .from('financiamentos')
        .update({ status: 'quitado' })
        .eq('id', finId)
    }

    fetchAllData()
    toast({ title: 'Sucesso', description: 'Pagamento registrado.' })
  }

  const refreshPenalties = () => {
    // Client-side simulation
  }

  const updateEmpresa = async (data: Empresa) => {
    if (empresa.id) {
      await supabase
        .from('empresa')
        .update(data)
        .eq('id', (empresa as any).id)
    } else {
      await supabase.from('empresa').insert(data)
    }
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Empresa atualizada.' })
  }

  // Usuarios / Colaboradores
  const addUsuario = async (userData: Omit<Usuario, 'id'>) => {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData,
    })
    if (error || data?.error) {
      toast({
        title: 'Erro',
        description: error?.message || data?.error,
        variant: 'destructive',
      })
      return
    }
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Colaborador cadastrado.' })
  }

  const updateUsuario = async (id: string, data: Partial<Usuario>) => {
    const { senha, ...updateData } = data as any
    // Note: Password update is not handled here directly, would require separate auth api call if needed.
    // For now, updating profile fields.

    await supabase.from('profiles').update(updateData).eq('id', id)
    fetchAllData()
    toast({
      title: 'Sucesso',
      description: 'Dados do colaborador atualizados.',
    })
  }

  const deleteUsuario = async (id: string) => {
    await supabase.from('profiles').update({ ativo: false }).eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Colaborador desativado.' })
  }

  // Pecas
  const addPeca = async (data: Omit<Peca, 'id'>) => {
    const dbData = {
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      quantidade: data.quantidade,
      preco_custo: data.precoCusto,
      preco_venda: data.precoVenda,
    }
    await supabase.from('pecas').insert(dbData)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Peça adicionada.' })
  }

  const updatePeca = async (id: string, data: Partial<Peca>) => {
    const dbData: any = {}
    if (data.codigo) dbData.codigo = data.codigo
    if (data.nome) dbData.nome = data.nome
    if (data.descricao) dbData.descricao = data.descricao
    if (data.quantidade !== undefined) dbData.quantidade = data.quantidade
    if (data.precoCusto) dbData.preco_custo = data.precoCusto
    if (data.precoVenda) dbData.preco_venda = data.precoVenda

    await supabase.from('pecas').update(dbData).eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Peça atualizada.' })
  }

  const deletePeca = async (id: string) => {
    await supabase.from('pecas').delete().eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Peça removida.' })
  }

  const importPecasXML = (xmlContent: string) => {
    toast({
      title: 'Info',
      description: 'Importação via XML processada (Simulação).',
    })
  }

  // Servicos
  const addServico = async (data: Omit<Servico, 'id'>) => {
    await supabase.from('servicos').insert(data)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço adicionado.' })
  }

  const updateServico = async (id: string, data: Partial<Servico>) => {
    await supabase.from('servicos').update(data).eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço atualizado.' })
  }

  const deleteServico = async (id: string) => {
    await supabase.from('servicos').delete().eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço removido.' })
  }

  // Orcamentos
  const addOrcamento = async (data: Omit<Orcamento, 'id'>) => {
    const { itens, ...orcData } = data
    const dbOrc = {
      cliente_id: orcData.clienteId === 'new' ? null : orcData.clienteId,
      cliente_nome: orcData.clienteNome,
      cliente_telefone: orcData.clienteTelefone,
      moto_placa: orcData.motoPlaca,
      moto_modelo: orcData.motoModelo,
      moto_ano: orcData.motoAno,
      vendedor_id: orcData.vendedorId,
      data: orcData.data,
      garantia_pecas: orcData.garantiaPecas,
      garantia_servicos: orcData.garantiaServicos,
      forma_pagamento: orcData.formaPagamento,
      valor_total_pecas: orcData.valorTotalPecas,
      valor_total_servicos: orcData.valorTotalServicos,
      valor_total: orcData.valorTotal,
      comissao_vendedor: orcData.comissaoVendedor,
      status: orcData.status,
      observacao: orcData.observacao,
    }

    const { data: newOrc, error } = await supabase
      .from('orcamentos')
      .insert(dbOrc)
      .select()
      .single()
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    const itensDb = itens.map((i) => ({
      orcamento_id: newOrc.id,
      tipo: i.tipo,
      referencia_id: i.referenciaId,
      nome: i.nome,
      quantidade: i.quantidade,
      valor_unitario: i.valorUnitario,
      desconto: i.desconto,
      valor_total: i.valorTotal,
      comissao_unitario: i.comissaoUnitario,
    }))

    await supabase.from('orcamento_itens').insert(itensDb)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Orçamento criado.' })
  }

  const updateOrcamento = async (id: string, data: Partial<Orcamento>) => {
    const { itens, ...orcData } = data
    const dbData: any = {}
    if (orcData.status) dbData.status = orcData.status

    await supabase.from('orcamentos').update(dbData).eq('id', id)

    if (itens) {
      await supabase.from('orcamento_itens').delete().eq('orcamento_id', id)
      const itensDb = itens.map((i) => ({
        orcamento_id: id,
        tipo: i.tipo,
        referencia_id: i.referenciaId,
        nome: i.nome,
        quantidade: i.quantidade,
        valor_unitario: i.valorUnitario,
        desconto: i.desconto,
        valor_total: i.valorTotal,
        comissao_unitario: i.comissaoUnitario,
      }))
      await supabase.from('orcamento_itens').insert(itensDb)
    }

    fetchAllData()
    toast({ title: 'Sucesso', description: 'Orçamento atualizado.' })
  }

  const deleteOrcamento = async (id: string) => {
    await supabase.from('orcamentos').delete().eq('id', id)
    fetchAllData()
    toast({ title: 'Sucesso', description: 'Orçamento removido.' })
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
        deleteOrcamento,
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
