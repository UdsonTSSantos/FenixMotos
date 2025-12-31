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
  chassis?: string
  dataLicenciamento?: string // ISO Date
  valor: number
  status: MotoStatus
  imagem?: string
  kmAtual?: number
  historicoAquisicao: Aquisicao[]
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
  complemento?: string
  bairro?: string
  rg?: string
  dataNascimento?: string // ISO Date
  genero?: 'masculino' | 'feminino' | 'outro'
  cnh?: string
  cnhValidade?: string // ISO Date
  prof_empresa?: string
  prof_endereco?: string
  prof_telefone?: string
  prof_email?: string
  prof_cnpj?: string
  prof_cargo?: string
  prof_tempo?: string
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
  taxaJurosAtraso: number
  valorMultaAtraso: number
  taxaFinanciamento?: number
  observacao?: string
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
  telefone2?: string
  telefone3?: string
  email: string
  logo: string
  instagram?: string
  facebook?: string
  x?: string
  tiktok?: string
  website?: string
}

export type UserRole =
  | 'Administrador'
  | 'Diretor'
  | 'Gerente'
  | 'Supervisor'
  | 'Vendedor'
  | 'Mecânico'
  | 'Financeiro'

export interface Usuario {
  id: string
  nome: string
  email: string
  senha?: string // In a real app this would be hashed or handled by auth provider
  role: UserRole
  ativo: boolean
}

export interface Peca {
  id: string
  codigo: string
  nome: string
  descricao: string
  quantidade: number
  precoCusto: number
  precoVenda: number
  localizacao?: string
}

export interface Servico {
  id: string
  nome: string
  descricao: string
  valor: number
  comissao: number // Fixed value or percentage? User story says "Commission value", implies fixed or %? "3% of parts" is specific to parts. Let's assume fixed value for services for now, or allow % logic.
}

export type OrcamentoStatus = 'aberto' | 'aprovado' | 'rejeitado'

export interface OrcamentoItem {
  id: string
  tipo: 'peca' | 'servico'
  referenciaId: string // id of Peca or Servico
  nome: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export interface Orcamento {
  id: string
  clienteId: string // Optional if prospect? Let's assume registered cliente for now or generic string
  clienteNome?: string // For quick display or unregistered
  vendedorId: string
  data: string // ISO Date
  validade: string // ISO Date
  itens: OrcamentoItem[]
  valorTotalPecas: number
  valorTotalServicos: number
  valorTotal: number
  comissaoVendedor: number
  status: OrcamentoStatus
  observacao?: string
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

export const USER_ROLES: UserRole[] = [
  'Administrador',
  'Diretor',
  'Gerente',
  'Supervisor',
  'Vendedor',
  'Mecânico',
  'Financeiro',
]
