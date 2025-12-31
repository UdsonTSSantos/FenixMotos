import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { ESTADOS_BR } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import {
  formatCPF,
  formatPhone,
  formatCEP,
  formatCurrency,
  formatCNPJ,
  parseCurrency,
} from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit } from 'lucide-react'

const formSchema = z.object({
  // Personal Info
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  rg: z.string().optional(),
  dataNascimento: z.string().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
  telefone: z.string().min(14, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().length(2, 'Selecione um estado'),
  cep: z.string().min(9, 'CEP inválido'),
  cnh: z.string().optional(),
  cnhValidade: z.string().optional(),

  // Professional Info
  prof_empresa: z.string().optional(),
  prof_endereco: z.string().optional(),
  prof_telefone: z.string().optional(),
  prof_email: z.string().email('Email inválido').optional().or(z.literal('')),
  prof_cnpj: z.string().optional(),
  prof_cargo: z.string().optional(),
  prof_tempo: z.string().optional(),
  prof_salario: z.string().optional(),
  prof_supervisor: z.string().optional(),
})

export default function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clientes, addCliente, updateCliente, financiamentos, motos } =
    useData()

  const isEditing = !!id
  const existing = clientes.find((c) => c.id === id)

  // Get customer motorcycles based on financing
  const customerFinanciamentos = isEditing
    ? financiamentos.filter((f) => f.clienteId === id)
    : []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      genero: undefined,
      telefone: '',
      email: '',
      endereco: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      cnh: '',
      cnhValidade: '',
      prof_empresa: '',
      prof_endereco: '',
      prof_telefone: '',
      prof_email: '',
      prof_cnpj: '',
      prof_cargo: '',
      prof_tempo: '',
      prof_salario: '',
      prof_supervisor: '',
    },
  })

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        ...existing,
        complemento: existing.complemento || '',
        bairro: existing.bairro || '',
        cnh: existing.cnh || '',
        cnhValidade: existing.cnhValidade || '',
        prof_salario: existing.prof_salario
          ? formatCurrency(existing.prof_salario)
          : '',
      })
    }
  }, [isEditing, existing, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      prof_salario: values.prof_salario
        ? parseCurrency(values.prof_salario)
        : undefined,
    }

    if (isEditing && id) {
      updateCliente(id, formattedValues)
    } else {
      addCliente(formattedValues)
    }
    navigate('/clientes')
  }

  // Mask handlers
  const handleCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('cpf', formatCPF(e.target.value))
  }
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('telefone', formatPhone(e.target.value))
  }
  const handleCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('cep', formatCEP(e.target.value))
  }
  const handleCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('prof_cnpj', formatCNPJ(e.target.value))
  }
  const handleProfPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('prof_telefone', formatPhone(e.target.value))
  }
  const handleSalary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const number = Number(raw) / 100
    form.setValue('prof_salario', formatCurrency(number))
  }

  const getMotoDetails = (motoId: string) => motos.find((m) => m.id === motoId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="pessoal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="profissional">
                    Dados Profissionais
                  </TabsTrigger>
                  <TabsTrigger value="motos" disabled={!isEditing}>
                    Motocicletas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pessoal" className="space-y-4 pt-4">
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
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleCPF}
                              maxLength={14}
                              placeholder="000.000.000-00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="00.000.000-0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">
                                Masculino
                              </SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone/Celular</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handlePhone}
                              maxLength={15}
                              placeholder="(00) 00000-0000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              placeholder="cliente@email.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New CNH Fields */}
                    <FormField
                      control={form.control}
                      name="cnh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº da Habilitação (CNH)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnhValidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vencimento da Habilitação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                onChange={handleCEP}
                                maxLength={9}
                                placeholder="00000-000"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Endereço (Rua, Número)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Rua Exemplo, 123"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="complemento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Apto, Bloco, etc."
                              />
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

                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
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
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="profissional" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prof_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ da Empresa</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleCNPJ}
                              maxLength={18}
                              placeholder="00.000.000/0000-00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_cargo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo / Função</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_tempo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo de Serviço</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: 2 anos" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_salario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renda Mensal</FormLabel>
                          <FormControl>
                            <Input {...field} onChange={handleSalary} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Comercial</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleProfPhone}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email Comercial</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_supervisor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Supervisor</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prof_endereco"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço da Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {isEditing && (
                  <TabsContent value="motos" className="space-y-4 pt-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Cor</TableHead>
                            <TableHead>Placa</TableHead>
                            <TableHead>Status Contrato</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerFinanciamentos.map((fin) => {
                            const moto = getMotoDetails(fin.motoId)
                            if (!moto) return null
                            return (
                              <TableRow key={fin.id}>
                                <TableCell className="font-medium">
                                  {moto.modelo}
                                </TableCell>
                                <TableCell>{moto.cor}</TableCell>
                                <TableCell>{moto.placa || '-'}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      fin.status === 'ativo'
                                        ? 'outline'
                                        : fin.status === 'quitado'
                                          ? 'secondary'
                                          : 'destructive'
                                    }
                                  >
                                    {fin.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link to={`/motos/${moto.id}`}>
                                        <Edit className="mr-2 h-3 w-3" /> Editar
                                        Moto
                                      </Link>
                                    </Button>
                                    <Button variant="default" size="sm" asChild>
                                      <Link to={`/financiamentos/${fin.id}`}>
                                        <Eye className="mr-2 h-3 w-3" /> Ver
                                        Financiamento
                                      </Link>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {customerFinanciamentos.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                Nenhuma moto adquirida por este cliente.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clientes')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Cliente</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
