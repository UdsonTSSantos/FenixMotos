import { useEffect } from 'react'
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

const formSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().optional(), // Optional on edit
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
        role: existing.role,
        ativo: existing.ativo,
        senha: '', // Don't show password
        foto: existing.foto || '',
      })
    }
  }, [isEditing, existing, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing && id) {
      const updateData: any = { ...values }
      if (!values.senha) delete updateData.senha // Don't update if empty
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

  const handleRandomPhoto = () => {
    const gender = Math.random() > 0.5 ? 'male' : 'female'
    const seed = Math.floor(Math.random() * 1000)
    const url = `https://img.usecurling.com/ppl/medium?gender=${gender}&seed=${seed}`
    form.setValue('foto', url)
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
              <div className="flex items-center gap-6 justify-center pb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={form.watch('foto')} />
                  <AvatarFallback className="text-lg">
                    {form.watch('nome')
                      ? form.watch('nome').substring(0, 2).toUpperCase()
                      : '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomPhoto}
                  >
                    Gerar Foto Aleatória
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Ou cole uma URL abaixo
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="foto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder={
                          isEditing ? 'Deixe em branco para não alterar' : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
