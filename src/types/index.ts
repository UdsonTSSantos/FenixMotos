export type MotoStatus = 'estoque' | 'vendida'

export interface Moto {
  id: string
  modelo: string
  fabricante: string
  ano: number
  cor: string
  placa?: string
  valor: number
  status: MotoStatus
  imagem?: string
  // Enhanced Inventory Tracking
  kmAtual?: number
  compra_vendedor?: string
  compra_valor?: number
  compra_data?: string // ISO Date
  compra_km?: number
  consignacao?: boolean
}

export interface Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  // Advanced Profiling
  rg?: string
  dataNascimento?: string // ISO Date
  genero?: 'masculino' | 'feminino' | 'outro'
  // Professional Information
  prof_empresa?: string
  prof_endereco?: string
  prof_telefone?: string
  prof_email?: string
  prof_cnpj?: string
  prof_cargo?: string
  prof_tempo?: string // e.g., "2 anos"
  prof_salario?: number
  prof_supervisor?: string
}

export type FinanciamentoStatus = 'ativo' | 'quitado' | 'inadimplente'

export interface Financiamento {
  id: string
  clienteId: string
  motoId: string
  dataContrato: string // ISO Date
  valorTotal: number
  valorEntrada: number
  valorFinanciado: number
  quantidadeParcelas: number
  taxaJurosAtraso: number // Percentage
  valorMultaAtraso: number // Fixed value
  status: FinanciamentoStatus
  parcelas: Parcela[]
}

export type ParcelaStatus = 'pendente' | 'paga' | 'atrasada'

export interface Parcela {
  numero: number
  dataVencimento: string // ISO Date
  dataPagamento?: string // ISO Date
  valorOriginal: number
  valorJuros: number
  valorMulta: number
  valorTotal: number
  status: ParcelaStatus
}

export interface Empresa {
  nome: string
  cnpj: string
  endereco: string
  telefone: string
  email: string
  logo: string
}

export const FABRICANTES = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'BMW',
  'Triumph',
  'Ducati',
  'Royal Enfield',
  'Harley-Davidson',
  'KTM',
  'Dafra',
  'Haojue',
  'Shineray',
  'Voltz',
  'Watts',
  'Sousa',
] as const

export const ESTADOS_BR = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const
