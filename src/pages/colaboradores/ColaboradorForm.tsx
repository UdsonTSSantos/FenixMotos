import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { USER_ROLES, ESTADOS_BR } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().optional(),
  role: z.enum([
    'Administrador',
    'Diretor',
    'Gerente',
    'Supervisor',
    'Vendedor',
    'Mecânico',
    'Financeiro',
  ]),
  ativo: z.boolean().default(true),
  foto: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  uf: z.string().optional(),
  cpf: z.string().optional(),
})

export default function ColaboradorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuarios, addUsuario, updateUsuario } = useData()
  const [uploading, setUploading] = useState(false)

  const isEditing = !!id
  const existing = usuarios.find((u) => u.id === id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      role: 'Vendedor',
      ativo: true,
      foto: '',
      endereco: '',
      bairro: '',
      cidade: '',
      cep: '',
      uf: '',
      cpf: '',
    },
  })

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        nome: existing.nome,
        email: existing.email,
        role: existing.role as any,
        ativo: existing.ativo,
        senha: '',
        foto: existing.foto || '',
        endereco: existing.endereco || '',
        bairro: existing.bairro || '',
        cidade: existing.cidade || '',
        cep: existing.cep || '',
        uf: existing.uf || '',
        cpf: existing.cpf || '',
      })
    }
  }, [isEditing, existing, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing && id) {
      const updateData: any = { ...values }
      if (!values.senha) delete updateData.senha
      updateUsuario(id, updateData)
    } else {
      if (!values.senha) {
        form.setError('senha', {
          message: 'Senha é obrigatória para novos colaboradores',
        })
        return
      }
      addUsuario(values as any)
    }
    navigate('/colaboradores')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description:
            'Por favor, selecione um arquivo de imagem (jpg, png, webp).',
          variant: 'destructive',
        })
        return
      }

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      setUploading(false)
      if (error) {
        toast({
          title: 'Erro no upload',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)
        form.setValue('foto', publicUrl)
        toast({
          title: 'Foto carregada',
          description: 'A imagem foi enviada com sucesso.',
        })
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4 justify-center pb-4">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={form.watch('foto')} />
                  <AvatarFallback className="text-lg">
                    {form.watch('nome')
                      ? form.watch('nome').substring(0, 2).toUpperCase()
                      : '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="relative overflow-hidden cursor-pointer"
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Carregar Foto'}
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </Button>
                  {form.watch('foto') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => form.setValue('foto', '')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="000.000.000-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo / Permissão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Inicial</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />
              <h3 className="text-sm font-medium text-muted-foreground">
                Endereço
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00000-000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESTADOS_BR.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rua, Número" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Colaborador Ativo
                      </FormLabel>
                      <FormDescription>
                        Desative para impedir o acesso ao sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/colaboradores')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
