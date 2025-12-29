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
