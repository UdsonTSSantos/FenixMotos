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

  addMoto: (moto: Omit<Moto, 'id' | 'status'>) => Promise<void>
  updateMoto: (id: string, moto: Partial<Moto>) => Promise<void>
  deleteMoto: (id: string) => Promise<void>
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>
  addFinanciamento: (
    financiamento: Omit<Financiamento, 'id' | 'status' | 'parcelas'> & {
      parcelas: any[]
    },
  ) => Promise<void>
  updateFinanciamento: (
    id: string,
    data: Partial<Financiamento>,
  ) => Promise<void>
  registerPayment: (
    financiamentoId: string,
    parcelaNumero: number,
    dataPagamento: string,
    valorPago: number,
  ) => Promise<void>
  refreshPenalties: () => void
  updateEmpresa: (data: Empresa) => Promise<void>

  addUsuario: (user: Omit<Usuario, 'id'>) => Promise<boolean>
  updateUsuario: (id: string, user: Partial<Usuario>) => Promise<void>
  deleteUsuario: (id: string) => Promise<void>

  addPeca: (peca: Omit<Peca, 'id'>) => Promise<void>
  updatePeca: (id: string, peca: Partial<Peca>) => Promise<void>
  deletePeca: (id: string) => Promise<void>
  importPecasXML: (xmlContent: string) => void

  addServico: (servico: Omit<Servico, 'id'>) => Promise<void>
  updateServico: (id: string, servico: Partial<Servico>) => Promise<void>
  deleteServico: (id: string) => Promise<void>

  addOrcamento: (orcamento: Omit<Orcamento, 'id'>) => Promise<boolean>
  updateOrcamento: (
    id: string,
    orcamento: Partial<Orcamento>,
  ) => Promise<boolean>
  deleteOrcamento: (id: string) => Promise<boolean>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const DEFAULT_EMPRESA: Empresa = {
  nome: 'Fenix Motos',
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
    if (empData) setEmpresa(empData as unknown as Empresa)

    // Fetch Lists
    // Removed historicoAquisicao join as it's no longer used
    const { data: motosData } = await supabase.from('motos').select(`*`)
    if (motosData) setMotos(motosData as unknown as Moto[])

    const { data: clientesData } = await supabase.from('clientes').select('*')
    if (clientesData) setClientes(clientesData as unknown as Cliente[])

    const { data: financs } = await supabase
      .from('financiamentos')
      .select(`*, parcelas(*)`)
    if (financs) setFinanciamentos(financs as unknown as Financiamento[])

    const { data: users } = await supabase.from('profiles').select('*')
    if (users) setUsuarios(users as unknown as Usuario[])

    const { data: pecasData } = await supabase.from('pecas').select('*')
    if (pecasData) setPecas(pecasData)

    const { data: servs } = await supabase.from('servicos').select('*')
    if (servs) setServicos(servs)

    const { data: orcs } = await supabase
      .from('orcamentos')
      .select(`*, itens:orcamento_itens(*)`)
    if (orcs) setOrcamentos(orcs as unknown as Orcamento[])
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
    const { error } = await supabase
      .from('motos')
      .insert({ ...motoData, status: 'estoque' })
      .select()
      .single()

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto adicionada com sucesso!' })
  }

  const updateMoto = async (id: string, data: Partial<Moto>) => {
    const { error } = await supabase.from('motos').update(data).eq('id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto atualizada com sucesso.' })
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
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Moto removida com sucesso.' })
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
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' })
  }

  const updateCliente = async (id: string, data: Partial<Cliente>) => {
    const { error } = await supabase.from('clientes').update(data).eq('id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
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
      throw error
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

    await fetchAllData()
    toast({
      title: 'Sucesso',
      description: 'Financiamento criado com sucesso.',
    })
  }

  const updateFinanciamento = async (
    id: string,
    data: Partial<Financiamento>,
  ) => {
    const dbData: any = {}
    if (data.status) dbData.status = data.status
    if (data.observacao) dbData.observacao = data.observacao
    if (data.valorTotal !== undefined) dbData.valor_total = data.valorTotal
    if (data.valorFinanciado !== undefined)
      dbData.valor_financiado = data.valorFinanciado
    if (data.valorEntrada !== undefined)
      dbData.valor_entrada = data.valorEntrada
    if (data.quantidadeParcelas !== undefined)
      dbData.quantidade_parcelas = data.quantidadeParcelas
    if (data.taxaFinanciamento !== undefined)
      dbData.taxa_financiamento = data.taxaFinanciamento
    if (data.taxaJurosAtraso !== undefined)
      dbData.taxa_juros_atraso = data.taxaJurosAtraso
    if (data.valorMultaAtraso !== undefined)
      dbData.valor_multa_atraso = data.valorMultaAtraso
    if (data.motoId) dbData.moto_id = data.motoId
    if (data.clienteId) dbData.cliente_id = data.clienteId
    if (data.dataContrato) dbData.data_contrato = data.dataContrato

    if (Object.keys(dbData).length > 0) {
      const { error } = await supabase
        .from('financiamentos')
        .update(dbData)
        .eq('id', id)
      if (error) {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        })
        throw error
      }
    }

    if (data.parcelas && data.parcelas.length > 0) {
      await supabase.from('parcelas').delete().eq('financiamento_id', id)
      const parcelasDb = data.parcelas.map((p) => ({
        financiamento_id: id,
        numero: p.numero,
        data_vencimento: p.dataVencimento,
        valor_original: p.valorOriginal,
        valor_juros: p.valorJuros,
        valor_multa: p.valorMulta,
        valor_total: p.valorTotal,
        status: p.status,
        data_pagamento: p.dataPagamento,
      }))
      await supabase.from('parcelas').insert(parcelasDb)
    }

    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Financiamento atualizado.' })
  }

  const registerPayment = async (
    finId: string,
    pNum: number,
    dataPgto: string,
    valorPago: number,
  ) => {
    const { error } = await supabase
      .from('parcelas')
      .update({
        status: 'paga',
        data_pagamento: dataPgto,
        valor_total: valorPago,
      })
      .match({ financiamento_id: finId, numero: pNum })

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

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

    await fetchAllData()
    toast({
      title: 'Sucesso',
      description: 'Pagamento registrado com sucesso.',
    })
  }

  const refreshPenalties = () => {
    // Client-side simulation
  }

  const updateEmpresa = async (data: Empresa) => {
    let error = null
    if ((empresa as any).id) {
      const { error: updateError } = await supabase
        .from('empresa')
        .update(data)
        .eq('id', (empresa as any).id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('empresa').insert(data)
      error = insertError
    }

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso.' })
  }

  // Usuarios / Colaboradores
  const addUsuario = async (userData: Omit<Usuario, 'id'>) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
      })

      if (error) {
        toast({
          title: 'Erro de Comunicação',
          description: error.message || 'Falha ao conectar com o servidor.',
          variant: 'destructive',
        })
        return false
      }

      if (data?.error) {
        toast({
          title: 'Erro ao Cadastrar',
          description: data.error,
          variant: 'destructive',
        })
        return false
      }

      await fetchAllData()
      toast({ title: 'Sucesso', description: 'Colaborador cadastrado.' })
      return true
    } catch (e: any) {
      toast({
        title: 'Erro Inesperado',
        description: e.message,
        variant: 'destructive',
      })
      return false
    }
  }

  const updateUsuario = async (id: string, data: Partial<Usuario>) => {
    const { senha, ...updateData } = data as any
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    await fetchAllData()
    toast({
      title: 'Sucesso',
      description: 'Dados do colaborador atualizados.',
    })
  }

  const deleteUsuario = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
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
    const { error } = await supabase.from('pecas').insert(dbData)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
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

    const { error } = await supabase.from('pecas').update(dbData).eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Peça atualizada.' })
  }

  const deletePeca = async (id: string) => {
    const { error } = await supabase.from('pecas').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
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
    const { error } = await supabase.from('servicos').insert(data)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço adicionado.' })
  }

  const updateServico = async (id: string, data: Partial<Servico>) => {
    const { error } = await supabase.from('servicos').update(data).eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço atualizado.' })
  }

  const deleteServico = async (id: string) => {
    const { error } = await supabase.from('servicos').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
    await fetchAllData()
    toast({ title: 'Sucesso', description: 'Serviço removido.' })
  }

  // Orcamentos
  const addOrcamento = async (data: Omit<Orcamento, 'id'>) => {
    try {
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

      const { data: newOrc, error: headerError } = await supabase
        .from('orcamentos')
        .insert(dbOrc)
        .select()
        .single()

      if (headerError) {
        throw new Error(headerError.message)
      }

      if (itens && itens.length > 0) {
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

        const { error: itemsError } = await supabase
          .from('orcamento_itens')
          .insert(itensDb)

        if (itemsError) {
          await supabase.from('orcamentos').delete().eq('id', newOrc.id)
          throw new Error(`Erro ao salvar itens: ${itemsError.message}`)
        }
      }

      await fetchAllData()
      toast({ title: 'Sucesso', description: 'Orçamento criado com sucesso.' })
      return true
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar orçamento.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateOrcamento = async (id: string, data: Partial<Orcamento>) => {
    try {
      const { itens, ...orcData } = data
      const dbData: any = {}

      if (orcData.status) dbData.status = orcData.status
      if (orcData.clienteId !== undefined)
        dbData.cliente_id =
          orcData.clienteId === 'new' ? null : orcData.clienteId
      if (orcData.clienteNome) dbData.cliente_nome = orcData.clienteNome
      if (orcData.clienteTelefone)
        dbData.cliente_telefone = orcData.clienteTelefone
      if (orcData.motoPlaca) dbData.moto_placa = orcData.motoPlaca
      if (orcData.motoModelo) dbData.moto_modelo = orcData.motoModelo
      if (orcData.motoAno) dbData.moto_ano = orcData.motoAno
      if (orcData.vendedorId) dbData.vendedor_id = orcData.vendedorId
      if (orcData.data) dbData.data = orcData.data
      if (orcData.garantiaPecas) dbData.garantia_pecas = orcData.garantiaPecas
      if (orcData.garantiaServicos)
        dbData.garantia_servicos = orcData.garantiaServicos
      if (orcData.formaPagamento)
        dbData.forma_pagamento = orcData.formaPagamento
      if (orcData.valorTotalPecas !== undefined)
        dbData.valor_total_pecas = orcData.valorTotalPecas
      if (orcData.valorTotalServicos !== undefined)
        dbData.valor_total_servicos = orcData.valorTotalServicos
      if (orcData.valorTotal !== undefined)
        dbData.valor_total = orcData.valorTotal
      if (orcData.comissaoVendedor !== undefined)
        dbData.comissao_vendedor = orcData.comissaoVendedor
      if (orcData.observacao) dbData.observacao = orcData.observacao

      if (Object.keys(dbData).length > 0) {
        const { error } = await supabase
          .from('orcamentos')
          .update(dbData)
          .eq('id', id)
        if (error) throw error
      }

      if (itens) {
        const { error: deleteError } = await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', id)

        if (deleteError) throw deleteError

        if (itens.length > 0) {
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

          const { error: insertError } = await supabase
            .from('orcamento_itens')
            .insert(itensDb)
          if (insertError) throw insertError
        }
      }

      await fetchAllData()
      toast({ title: 'Sucesso', description: 'Orçamento atualizado.' })
      return true
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar orçamento.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteOrcamento = async (id: string) => {
    try {
      const { error } = await supabase.from('orcamentos').delete().eq('id', id)
      if (error) throw error
      await fetchAllData()
      toast({ title: 'Sucesso', description: 'Orçamento removido.' })
      return true
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
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
