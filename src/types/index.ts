export type MotoStatus = 'estoque' | 'vendida'

export interface Aquisicao {
  id: string
  data: string // ISO Date
  valor: number
  vendedor: string
  km: number
  consignacao: boolean
}

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
  kmAtual?: number
  // Historico de Aquisicoes replaces static fields
  historicoAquisicao: Aquisicao[]

  // Deprecated fields kept optional for backward compatibility if needed,
  // but logic should rely on historicoAquisicao
  compra_vendedor?: string
  compra_valor?: number
  compra_data?: string
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
  // New Address Fields
  complemento?: string
  bairro?: string
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
  taxaJurosAtraso: number // Percentage per day/month for delay
  valorMultaAtraso: number // Fixed value for delay
  taxaFinanciamento?: number // New: Percentage added to base financing (monthly or total)
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
  // Social Media
  instagram?: string
  facebook?: string
  x?: string
  tiktok?: string
  website?: string
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
