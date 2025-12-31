import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatCNPJ } from '@/lib/utils'
import {
  Plus,
  Trash2,
  Printer,
  Instagram,
  Facebook,
  Twitter,
  Video,
  Calculator,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

const itemSchema = z.object({
  id: z.string(),
  tipo: z.enum(['peca', 'servico']),
  referenciaId: z.string(),
  nome: z.string(),
  quantidade: z.coerce.number().min(1),
  valorUnitario: z.coerce.number().min(0),
  valorTotal: z.coerce.number().min(0),
  comissaoUnitario: z.number().default(0), // Hidden field to track commission per item
})

const formSchema = z.object({
  clienteId: z.string().optional(),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  vendedorId: z.string().min(1, 'Selecione um vendedor'),
  data: z.string(),
  validade: z.string(),
  itens: z.array(itemSchema),
  observacao: z.string().optional(),
  status: z.enum(['aberto', 'aprovado', 'rejeitado']),
})

export default function OrcamentoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    orcamentos,
    addOrcamento,
    updateOrcamento,
    clientes,
    usuarios,
    pecas,
    servicos,
    empresa,
  } = useData()
  const [isPrinting, setIsPrinting] = useState(false)

  const isEditing = !!id
  const existing = orcamentos.find((o) => o.id === id)

  // Filter users for "Vendedor" role or Admin/Manager
  const vendedores = usuarios.filter(
    (u) =>
      [
        'Administrador',
        'Diretor',
        'Gerente',
        'Supervisor',
        'Vendedor',
      ].includes(u.role) && u.ativo,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: 'new',
      clienteNome: '',
      vendedorId: '',
      data: new Date().toISOString().split('T')[0],
      validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      itens: [],
      observacao: '',
      status: 'aberto',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        ...existing,
        clienteId: existing.clienteId || 'new',
        clienteNome: existing.clienteNome || '',
      })
    }
  }, [isEditing, existing, form])

  const handleClienteChange = (val: string) => {
    form.setValue('clienteId', val)
    if (val !== 'new') {
      const cliente = clientes.find((c) => c.id === val)
      if (cliente) {
        form.setValue('clienteNome', cliente.nome)
      }
    } else {
      form.setValue('clienteNome', '')
    }
  }

  const addItem = (type: 'peca' | 'servico', id: string) => {
    if (type === 'peca') {
      const p = pecas.find((x) => x.id === id)
      if (p) {
        append({
          id: Math.random().toString(36).substr(2, 9),
          tipo: 'peca',
          referenciaId: p.id,
          nome: p.nome,
          quantidade: 1,
          valorUnitario: p.precoVenda,
          valorTotal: p.precoVenda,
          comissaoUnitario: 0, // Commission for parts is calculated on total later (3%)
        })
      }
    } else {
      const s = servicos.find((x) => x.id === id)
      if (s) {
        append({
          id: Math.random().toString(36).substr(2, 9),
          tipo: 'servico',
          referenciaId: s.id,
          nome: s.nome,
          quantidade: 1,
          valorUnitario: s.valor,
          valorTotal: s.valor,
          comissaoUnitario: s.comissao, // Fixed commission from service definition
        })
      }
    }
  }

  // Calculate totals for display
  const watchedItens = form.watch('itens')
  const totalPecas = watchedItens
    .filter((i) => i.tipo === 'peca')
    .reduce((acc, i) => acc + i.valorTotal, 0)
  const totalServicos = watchedItens
    .filter((i) => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.valorTotal, 0)
  const totalGeral = totalPecas + totalServicos

  // Commission Logic
  // Parts: 3% of total parts value
  const comissaoPecas = totalPecas * 0.03
  // Services: Sum of (comissaoUnitario * quantidade)
  const comissaoServicos = watchedItens
    .filter((i) => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.comissaoUnitario * i.quantidade, 0)
  const totalComissao = comissaoPecas + comissaoServicos

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const dataToSave = {
      ...values,
      valorTotalPecas: totalPecas,
      valorTotalServicos: totalServicos,
      valorTotal: totalGeral,
      comissaoVendedor: totalComissao,
    }

    if (isEditing && id) {
      updateOrcamento(id, dataToSave)
    } else {
      addOrcamento(dataToSave)
    }
    navigate('/orcamentos')
  }

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  if (isPrinting) {
    // Print View
    const cliente = clientes.find((c) => c.id === form.getValues('clienteId'))
    const vendedor = usuarios.find((u) => u.id === form.getValues('vendedorId'))
    const phones = [empresa.telefone, empresa.telefone2, empresa.telefone3]
      .filter(Boolean)
      .join(' | ')

    return (
      <div className="bg-white text-black p-8 min-h-screen">
        <div className="border-b-2 border-black pb-4 flex justify-between items-start mb-6">
          <div className="flex gap-4">
            {empresa.logo && (
              <img
                src={empresa.logo}
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold uppercase">{empresa.nome}</h1>
              <p className="text-sm">{empresa.endereco}</p>
              <p className="text-sm">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
              <p className="text-sm font-medium mt-1">{phones}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">ORÇAMENTO</h2>
            <p className="text-sm">
              Nº: {existing ? existing.id.toUpperCase() : 'NOVO'}
            </p>
            <p className="text-sm">
              Data: {new Date(form.getValues('data')).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-bold border-b border-black mb-2">CLIENTE</h3>
            <p>
              <strong>Nome:</strong> {form.getValues('clienteNome')}
            </p>
            {cliente && (
              <>
                <p>
                  <strong>CPF:</strong> {cliente.cpf}
                </p>
                <p>
                  <strong>Telefone:</strong> {cliente.telefone}
                </p>
              </>
            )}
          </div>
          <div>
            <h3 className="font-bold border-b border-black mb-2">VENDEDOR</h3>
            <p>
              <strong>Nome:</strong> {vendedor?.nome}
            </p>
            <p>
              <strong>Email:</strong> {vendedor?.email}
            </p>
          </div>
        </div>

        <Table className="border border-black mb-6">
          <TableHeader>
            <TableRow className="border-b border-black">
              <TableHead className="text-black font-bold">Item</TableHead>
              <TableHead className="text-black font-bold w-20 text-center">
                Qtd
              </TableHead>
              <TableHead className="text-black font-bold w-32 text-right">
                Unitário
              </TableHead>
              <TableHead className="text-black font-bold w-32 text-right">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchedItens.map((item, idx) => (
              <TableRow key={idx} className="border-b border-gray-300">
                <TableCell>{item.nome}</TableCell>
                <TableCell className="text-center">{item.quantidade}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.valorUnitario)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.valorTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mb-8">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between border-b border-gray-300">
              <span>Total Peças:</span>
              <span>{formatCurrency(totalPecas)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300">
              <span>Total Serviços:</span>
              <span>{formatCurrency(totalServicos)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL GERAL:</span>
              <span>{formatCurrency(totalGeral)}</span>
            </div>
          </div>
        </div>

        {form.getValues('observacao') && (
          <div className="mb-8">
            <h3 className="font-bold border-b border-black mb-2">
              OBSERVAÇÕES
            </h3>
            <p className="whitespace-pre-wrap">
              {form.getValues('observacao')}
            </p>
          </div>
        )}

        <div className="mt-auto text-center text-xs text-gray-500 pt-4 border-t border-black">
          <p>
            Validade do orçamento:{' '}
            {new Date(form.getValues('validade')).toLocaleDateString()}
          </p>
          <div className="flex justify-center gap-4 mt-2">
            {empresa.website && <span>{empresa.website}</span>}
            <span>{empresa.email}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
          </CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente Cadastrado</FormLabel>
                      <Select
                        onValueChange={handleClienteChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione ou Novo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">
                            -- Cliente não cadastrado / Avulso --
                          </SelectItem>
                          {clientes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
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
                  name="clienteNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendedorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o vendedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendedores.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Emissão</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Itens do Orçamento</h3>
                  <div className="flex gap-2">
                    <Select onValueChange={(val) => addItem('peca', val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="+ Adicionar Peça" />
                      </SelectTrigger>
                      <SelectContent>
                        {pecas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome} - {formatCurrency(p.precoVenda)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => addItem('servico', val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="+ Adicionar Serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicos.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome} - {formatCurrency(s.valor)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[100px]">Qtd</TableHead>
                        <TableHead className="w-[150px]">Unitário</TableHead>
                        <TableHead className="w-[150px]">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="capitalize">
                            {form.getValues(`itens.${index}.tipo`)}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`itens.${index}.nome`}
                              render={({ field }) => <Input {...field} />}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`itens.${index}.quantidade`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    const qty = Number(e.target.value)
                                    const unit = form.getValues(
                                      `itens.${index}.valorUnitario`,
                                    )
                                    form.setValue(
                                      `itens.${index}.valorTotal`,
                                      qty * unit,
                                    )
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`itens.${index}.valorUnitario`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    const unit = Number(e.target.value)
                                    const qty = form.getValues(
                                      `itens.${index}.quantidade`,
                                    )
                                    form.setValue(
                                      `itens.${index}.valorTotal`,
                                      qty * unit,
                                    )
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={formatCurrency(
                                form.watch(`itens.${index}.valorTotal`),
                              )}
                              readOnly
                              className="bg-muted"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {fields.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Adicione itens ao orçamento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-8 text-sm p-4 bg-muted/20 rounded-lg">
                  <div className="text-right">
                    <p className="text-muted-foreground">Total Peças</p>
                    <p className="font-semibold">
                      {formatCurrency(totalPecas)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Total Serviços</p>
                    <p className="font-semibold">
                      {formatCurrency(totalServicos)}
                    </p>
                  </div>
                  <div className="text-right border-l pl-8">
                    <p className="text-muted-foreground">Total Geral</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(totalGeral)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calculator className="h-3 w-3" />
                  <span>
                    Comissão Estimada para o Vendedor:{' '}
                    <strong>{formatCurrency(totalComissao)}</strong>
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orcamentos')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Orçamento</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
