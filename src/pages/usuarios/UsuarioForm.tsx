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
import { USER_ROLES } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

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
})

export default function UsuarioForm() {
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
          message: 'Senha é obrigatória para novos usuários',
        })
        return
      }
      addUsuario(values as any)
    }
    navigate('/usuarios')
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

      // Upload to 'avatars' bucket
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (error) {
        setUploading(false)
        toast({
          title: 'Erro no upload',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      form.setValue('foto', publicUrl)
      setUploading(false)
      toast({
        title: 'Foto carregada',
        description: 'A imagem foi enviada com sucesso.',
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
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
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
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

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
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

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissão / Função</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
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

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Ativo</FormLabel>
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
                  onClick={() => navigate('/usuarios')}
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
