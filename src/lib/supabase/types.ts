// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      aquisicoes_moto: {
        Row: {
          consignacao: boolean | null
          data: string
          id: string
          km: number | null
          moto_id: string | null
          valor: number
          vendedor: string | null
        }
        Insert: {
          consignacao?: boolean | null
          data: string
          id?: string
          km?: number | null
          moto_id?: string | null
          valor: number
          vendedor?: string | null
        }
        Update: {
          consignacao?: boolean | null
          data?: string
          id?: string
          km?: number | null
          moto_id?: string | null
          valor?: number
          vendedor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'aquisicoes_moto_moto_id_fkey'
            columns: ['moto_id']
            isOneToOne: false
            referencedRelation: 'motos'
            referencedColumns: ['id']
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnh: string
          cnhValidade: string
          complemento: string | null
          cpf: string | null
          created_at: string
          dataNascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          genero: string | null
          id: string
          nome: string
          prof_cargo: string | null
          prof_cnpj: string | null
          prof_email: string | null
          prof_empresa: string | null
          prof_endereco: string | null
          prof_salario: number | null
          prof_supervisor: string | null
          prof_telefone: string | null
          prof_tempo: string | null
          rg: string | null
          telefone: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnh: string
          cnhValidade: string
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          dataNascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome: string
          prof_cargo?: string | null
          prof_cnpj?: string | null
          prof_email?: string | null
          prof_empresa?: string | null
          prof_endereco?: string | null
          prof_salario?: number | null
          prof_supervisor?: string | null
          prof_telefone?: string | null
          prof_tempo?: string | null
          rg?: string | null
          telefone?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnh?: string
          cnhValidade?: string
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          dataNascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome?: string
          prof_cargo?: string | null
          prof_cnpj?: string | null
          prof_email?: string | null
          prof_empresa?: string | null
          prof_endereco?: string | null
          prof_salario?: number | null
          prof_supervisor?: string | null
          prof_telefone?: string | null
          prof_tempo?: string | null
          rg?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      empresa: {
        Row: {
          cnpj: string | null
          email: string | null
          endereco: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo: string | null
          nome: string
          telefone: string | null
          telefone2: string | null
          telefone3: string | null
          tiktok: string | null
          updated_at: string
          website: string | null
          x: string | null
        }
        Insert: {
          cnpj?: string | null
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          nome: string
          telefone?: string | null
          telefone2?: string | null
          telefone3?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          x?: string | null
        }
        Update: {
          cnpj?: string | null
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          nome?: string
          telefone?: string | null
          telefone2?: string | null
          telefone3?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          x?: string | null
        }
        Relationships: []
      }
      financiamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_contrato: string
          id: string
          moto_id: string | null
          numero_contrato: number | null
          observacao: string | null
          quantidade_parcelas: number
          status: string
          taxa_financiamento: number | null
          taxa_juros_atraso: number | null
          valor_entrada: number
          valor_financiado: number
          valor_multa_atraso: number | null
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_contrato: string
          id?: string
          moto_id?: string | null
          numero_contrato?: number | null
          observacao?: string | null
          quantidade_parcelas: number
          status?: string
          taxa_financiamento?: number | null
          taxa_juros_atraso?: number | null
          valor_entrada: number
          valor_financiado: number
          valor_multa_atraso?: number | null
          valor_total: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_contrato?: string
          id?: string
          moto_id?: string | null
          numero_contrato?: number | null
          observacao?: string | null
          quantidade_parcelas?: number
          status?: string
          taxa_financiamento?: number | null
          taxa_juros_atraso?: number | null
          valor_entrada?: number
          valor_financiado?: number
          valor_multa_atraso?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: 'financiamentos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financiamentos_moto_id_fkey'
            columns: ['moto_id']
            isOneToOne: false
            referencedRelation: 'motos'
            referencedColumns: ['id']
          },
        ]
      }
      motos: {
        Row: {
          ano: number
          chassis: string | null
          cor: string
          created_at: string
          dataLicenciamento: string | null
          fabricante: string
          id: string
          imagem: string | null
          kmAtual: number | null
          modelo: string
          placa: string | null
          status: string
          valor: number
        }
        Insert: {
          ano: number
          chassis?: string | null
          cor: string
          created_at?: string
          dataLicenciamento?: string | null
          fabricante: string
          id?: string
          imagem?: string | null
          kmAtual?: number | null
          modelo: string
          placa?: string | null
          status?: string
          valor: number
        }
        Update: {
          ano?: number
          chassis?: string | null
          cor?: string
          created_at?: string
          dataLicenciamento?: string | null
          fabricante?: string
          id?: string
          imagem?: string | null
          kmAtual?: number | null
          modelo?: string
          placa?: string | null
          status?: string
          valor?: number
        }
        Relationships: []
      }
      orcamento_itens: {
        Row: {
          comissao_unitario: number | null
          desconto: number | null
          id: string
          nome: string
          orcamento_id: string | null
          quantidade: number | null
          referencia_id: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          comissao_unitario?: number | null
          desconto?: number | null
          id?: string
          nome: string
          orcamento_id?: string | null
          quantidade?: number | null
          referencia_id?: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          comissao_unitario?: number | null
          desconto?: number | null
          id?: string
          nome?: string
          orcamento_id?: string | null
          quantidade?: number | null
          referencia_id?: string | null
          tipo?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: 'orcamento_itens_orcamento_id_fkey'
            columns: ['orcamento_id']
            isOneToOne: false
            referencedRelation: 'orcamentos'
            referencedColumns: ['id']
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          comissao_vendedor: number | null
          created_at: string
          data: string | null
          forma_pagamento: string | null
          garantia_pecas: string | null
          garantia_servicos: string | null
          id: string
          moto_ano: number | null
          moto_modelo: string | null
          moto_placa: string | null
          observacao: string | null
          status: string | null
          valor_total: number | null
          valor_total_pecas: number | null
          valor_total_servicos: number | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          comissao_vendedor?: number | null
          created_at?: string
          data?: string | null
          forma_pagamento?: string | null
          garantia_pecas?: string | null
          garantia_servicos?: string | null
          id?: string
          moto_ano?: number | null
          moto_modelo?: string | null
          moto_placa?: string | null
          observacao?: string | null
          status?: string | null
          valor_total?: number | null
          valor_total_pecas?: number | null
          valor_total_servicos?: number | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          cliente_telefone?: string | null
          comissao_vendedor?: number | null
          created_at?: string
          data?: string | null
          forma_pagamento?: string | null
          garantia_pecas?: string | null
          garantia_servicos?: string | null
          id?: string
          moto_ano?: number | null
          moto_modelo?: string | null
          moto_placa?: string | null
          observacao?: string | null
          status?: string | null
          valor_total?: number | null
          valor_total_pecas?: number | null
          valor_total_servicos?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'orcamentos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamentos_vendedor_id_fkey'
            columns: ['vendedor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      parcelas: {
        Row: {
          data_pagamento: string | null
          data_vencimento: string
          financiamento_id: string | null
          id: string
          numero: number
          status: string
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
          valor_total: number
        }
        Insert: {
          data_pagamento?: string | null
          data_vencimento: string
          financiamento_id?: string | null
          id?: string
          numero: number
          status?: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_total: number
        }
        Update: {
          data_pagamento?: string | null
          data_vencimento?: string
          financiamento_id?: string | null
          id?: string
          numero?: number
          status?: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: 'parcelas_financiamento_id_fkey'
            columns: ['financiamento_id']
            isOneToOne: false
            referencedRelation: 'financiamentos'
            referencedColumns: ['id']
          },
        ]
      }
      pecas: {
        Row: {
          codigo: string | null
          created_at: string
          descricao: string | null
          id: string
          localizacao: string | null
          nome: string
          preco_custo: number | null
          preco_venda: number | null
          quantidade: number | null
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          preco_custo?: number | null
          preco_venda?: number | null
          quantidade?: number | null
        }
        Update: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          preco_custo?: number | null
          preco_venda?: number | null
          quantidade?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string | null
          endereco: string | null
          foto: string | null
          id: string
          nome: string
          role: string
          uf: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto?: string | null
          id: string
          nome: string
          role?: string
          uf?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto?: string | null
          id?: string
          nome?: string
          role?: string
          uf?: string | null
        }
        Relationships: []
      }
      servicos: {
        Row: {
          comissao: number | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          valor: number | null
        }
        Insert: {
          comissao?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          valor?: number | null
        }
        Update: {
          comissao?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          valor?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
