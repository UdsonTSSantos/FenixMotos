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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aquisicoes_moto: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          id: string
          moto_id: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          moto_id?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          moto_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aquisicoes_moto_moto_id_fkey"
            columns: ["moto_id"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnh: string | null
          cnhValidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          dataNascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          genero: string | null
          id: string
          nome: string | null
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
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnh?: string | null
          cnhValidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          dataNascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome?: string | null
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
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnh?: string | null
          cnhValidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          dataNascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome?: string | null
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
          updated_at?: string
        }
        Relationships: []
      }
      empresa: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo: string | null
          nome: string | null
          telefone: string | null
          telefone2: string
          telefone3: string | null
          tiktok: string | null
          updated_at: string | null
          website: string | null
          x: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          nome?: string | null
          telefone?: string | null
          telefone2: string
          telefone3?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          x?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          nome?: string | null
          telefone?: string | null
          telefone2?: string
          telefone3?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          x?: string | null
        }
        Relationships: []
      }
      financiamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_contrato: string | null
          id: string
          moto_id: string | null
          observacao: string | null
          quantidade_parcelas: number | null
          status: string | null
          taxa_financiamento: number | null
          taxa_juros_atraso: number | null
          updated_at: string
          valor_entrada: number | null
          valor_financiado: number | null
          valor_multa_atraso: number | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_contrato?: string | null
          id?: string
          moto_id?: string | null
          observacao?: string | null
          quantidade_parcelas?: number | null
          status?: string | null
          taxa_financiamento?: number | null
          taxa_juros_atraso?: number | null
          updated_at?: string
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_multa_atraso?: number | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_contrato?: string | null
          id?: string
          moto_id?: string | null
          observacao?: string | null
          quantidade_parcelas?: number | null
          status?: string | null
          taxa_financiamento?: number | null
          taxa_juros_atraso?: number | null
          updated_at?: string
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_multa_atraso?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financiamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financiamentos_moto_id_fkey"
            columns: ["moto_id"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["id"]
          },
        ]
      }
      motos: {
        Row: {
          ano: number | null
          chassis: string
          cor: string | null
          created_at: string
          dataLicenciamento: string
          fabricante: string
          id: string
          imagem: string
          kmAtual: number
          modelo: string | null
          observacao: string | null
          placa: string | null
          renavam: string | null
          status: string
          valor: number
        }
        Insert: {
          ano?: number | null
          chassis: string
          cor?: string | null
          created_at?: string
          dataLicenciamento: string
          fabricante: string
          id?: string
          imagem: string
          kmAtual: number
          modelo?: string | null
          observacao?: string | null
          placa?: string | null
          renavam?: string | null
          status?: string
          valor: number
        }
        Update: {
          ano?: number | null
          chassis?: string
          cor?: string | null
          created_at?: string
          dataLicenciamento?: string
          fabricante?: string
          id?: string
          imagem?: string
          kmAtual?: number
          modelo?: string | null
          observacao?: string | null
          placa?: string | null
          renavam?: string | null
          status?: string
          valor?: number
        }
        Relationships: []
      }
      ordem_servico_itens: {
        Row: {
          comissao_unitario: number | null
          desconto: number | null
          id: string
          nome: string
          os_id: string | null
          quantidade: number | null
          referencia_id: string | null
          tipo: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          comissao_unitario?: number | null
          desconto?: number | null
          id?: string
          nome: string
          os_id?: string | null
          quantidade?: number | null
          referencia_id?: string | null
          tipo: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          comissao_unitario?: number | null
          desconto?: number | null
          id?: string
          nome?: string
          os_id?: string | null
          quantidade?: number | null
          referencia_id?: string | null
          tipo?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_servico_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string | null
          comissao_vendedor: number | null
          created_at: string | null
          data_entrada: string | null
          data_entrega: string | null
          id: string
          moto_ano: number | null
          moto_modelo: string | null
          moto_placa: string | null
          numero_os: number
          observacao: string | null
          situacao: string | null
          updated_at: string | null
          valor_total: number | null
          valor_total_pecas: number | null
          valor_total_servicos: number | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          comissao_vendedor?: number | null
          created_at?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          id?: string
          moto_ano?: number | null
          moto_modelo?: string | null
          moto_placa?: string | null
          numero_os?: number
          observacao?: string | null
          situacao?: string | null
          updated_at?: string | null
          valor_total?: number | null
          valor_total_pecas?: number | null
          valor_total_servicos?: number | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          comissao_vendedor?: number | null
          created_at?: string | null
          data_entrada?: string | null
          data_entrega?: string | null
          id?: string
          moto_ano?: number | null
          moto_modelo?: string | null
          moto_placa?: string | null
          numero_os?: number
          observacao?: string | null
          situacao?: string | null
          updated_at?: string | null
          valor_total?: number | null
          valor_total_pecas?: number | null
          valor_total_servicos?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas: {
        Row: {
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          financiamento_id: string | null
          id: string
          numero: number | null
          status: string | null
          updated_at: string
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          financiamento_id?: string | null
          id?: string
          numero?: number | null
          status?: string | null
          updated_at?: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          financiamento_id?: string | null
          id?: string
          numero?: number | null
          status?: string | null
          updated_at?: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_financiamento_id_fkey"
            columns: ["financiamento_id"]
            isOneToOne: false
            referencedRelation: "financiamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pecas: {
        Row: {
          codigo: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string | null
          preco_custo: number | null
          preco_venda: number | null
          quantidade: number | null
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string | null
          preco_custo?: number | null
          preco_venda?: number | null
          quantidade?: number | null
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string | null
          preco_custo?: number | null
          preco_venda?: number | null
          quantidade?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          comissao: number | null
          created_at: string
          descricao: string | null
          id: string
          nome: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          comissao?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          comissao?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

