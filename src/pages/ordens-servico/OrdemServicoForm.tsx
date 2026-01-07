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
import { formatCurrency, formatPhone, formatContractId } from '@/lib/utils'
import {
  Trash2,
  Printer,
  Calculator,
  Search,
  Check,
  MessageCircle,
  Loader2,
  Wrench,
  Package,
  Recycle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const itemSchema = z.object({
  id: z.string(),
  tipo: z.enum(['peca', 'servico']),
  referenciaId: z.string(),
  nome: z.string(),
  quantidade: z.coerce.number().min(1),
  valorUnitario: z.coerce.number().min(0),
  desconto: z.coerce.number().min(0).max(100).default(0),
  valorTotal: z.coerce.number().min(0),
  comissaoUnitario: z.number().default(0),
})

const formSchema = z.object({
  clienteId: z.string().optional(),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  clienteTelefone: z.string().optional(),
  motoPlaca: z.string().optional(),
  motoModelo: z.string().optional(),
  motoAno: z.coerce.number().optional(),
  vendedorId: z.string().min(1, 'Selecione um vendedor'),
  dataEntrada: z.string(),
  dataEntrega: z.string().optional(),
  situacao: z.enum(['Aberto', 'Em Andamento', 'Concluído', 'Cancelado']),
  observacao: z.string().optional(),
  itens: z.array(itemSchema),
})

export default function OrdemServicoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    ordensServico,
    addOrdemServico,
    updateOrdemServico,
    clientes,
    vendedores,
    pecas,
    servicos,
    empresa,
    financiamentos,
    motos,
  } = useData()
  const [openClientSearch, setOpenClientSearch] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!id
  const existing = ordensServico.find((o) => o.id === id)

  // Filter active vendors for select
  const activeVendedores = vendedores.filter((v) => v.ativo)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: 'new',
      clienteNome: '',
      clienteTelefone: '',
      motoPlaca: '',
      motoModelo: '',
      motoAno: undefined,
      vendedorId: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      situacao: 'Aberto',
      observacao: '',
      itens: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  useEffect(() => {
    if (isEditing && existing) {
      form.reset({
        clienteId: existing.clienteId || 'new',
        clienteNome: existing.clienteNome || '',
        clienteTelefone: existing.clienteTelefone || '',
        motoPlaca: existing.motoPlaca || '',
        motoModelo: existing.motoModelo || '',
        motoAno: existing.motoAno,
        vendedorId: existing.vendedorId,
        dataEntrada: existing.dataEntrada
          ? new Date(existing.dataEntrada).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        dataEntrega: existing.dataEntrega
          ? new Date(existing.dataEntrega).toISOString().split('T')[0]
          : undefined,
        situacao: existing.situacao,
        observacao: existing.observacao || '',
        itens: existing.itens as any,
      })
    }
  }, [isEditing, existing, form])

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (cliente) {
      form.setValue('clienteId', cliente.id)
      form.setValue('clienteNome', cliente.nome)
      form.setValue('clienteTelefone', cliente.telefone)

      const financs = financiamentos
        .filter((f) => f.clienteId === cliente.id)
        .sort(
          (a, b) =>
            new Date(b.dataContrato).getTime() -
            new Date(a.dataContrato).getTime(),
        )

      const financ = financs.find((f) => f.status === 'ativo') || financs[0]

      if (financ) {
        const moto = motos.find((m) => m.id === financ.motoId)
        if (moto) {
          form.setValue('motoModelo', moto.modelo)
          form.setValue('motoPlaca', moto.placa || '')
          form.setValue('motoAno', moto.ano)
        }
      }
    }
    setOpenClientSearch(false)
  }

  const addItem = (type: 'peca' | 'servico', id: string) => {
    if (type === 'peca') {
      const p = pecas.find((x) => x.id === id)
      if (p) {
        const commissionPerUnit = p.preco_venda * 0.03
        append({
          id: crypto.randomUUID(),
          tipo: 'peca',
          referenciaId: p.id,
          nome: p.nome,
          quantidade: 1,
          valorUnitario: p.preco_venda,
          desconto: 0,
          valorTotal: p.preco_venda,
          comissaoUnitario: commissionPerUnit,
        })
      }
    } else {
      const s = servicos.find((x) => x.id === id)
      if (s) {
        append({
          id: crypto.randomUUID(),
          tipo: 'servico',
          referenciaId: s.id,
          nome: s.nome,
          quantidade: 1,
          valorUnitario: s.valor,
          desconto: 0,
          valorTotal: s.valor,
          comissaoUnitario: 0,
        })
      }
    }
  }

  const watchedItens = form.watch('itens')

  const totalPecas = watchedItens
    .filter((i) => i.tipo === 'peca')
    .reduce((acc, i) => acc + i.valorTotal, 0)

  const totalServicos = watchedItens
    .filter((i) => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.valorTotal, 0)

  const totalGeral = totalPecas + totalServicos

  const totalComissao = watchedItens.reduce((acc, i) => {
    if (i.tipo === 'peca') {
      return acc + i.valorTotal * 0.03
    }
    return acc
  }, 0)

  const totalDesconto = watchedItens.reduce((acc, i) => {
    const originalTotal = i.quantidade * i.valorUnitario
    const currentTotal = i.valorTotal
    return acc + (originalTotal - currentTotal)
  }, 0)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    const dataToSave = {
      ...values,
      valorTotalPecas: totalPecas,
      valorTotalServicos: totalServicos,
      valorTotal: totalGeral,
      comissaoVendedor: totalComissao,
    }

    let success = false
    if (isEditing && id) {
      success = await updateOrdemServico(id, dataToSave)
    } else {
      success = await addOrdemServico(dataToSave)
    }
    setIsSaving(false)
    if (success) {
      navigate('/ordens-servico')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const phone = form.getValues('clienteTelefone')?.replace(/\D/g, '')
    if (!phone) {
      alert('Telefone do cliente não preenchido')
      return
    }

    const cliente = form.getValues('clienteNome')
    const modelo = form.getValues('motoModelo') || 'Moto'
    const osNum = existing ? formatContractId(existing.numeroOS) : 'NOVA'
    const itemsSummary = watchedItens
      .slice(0, 3)
      .map((i) => `• ${i.quantidade}x ${i.nome}`)
      .join('\n')
    const moreItems =
      watchedItens.length > 3
        ? `\n...e mais ${watchedItens.length - 3} itens`
        : ''

    const message = `*${empresa.nome}*\n\nOlá *${cliente}*,\nSegue resumo da sua OS *#${osNum}*:\n\n*Veículo:* ${modelo}\n\n*Itens:*\n${itemsSummary}${moreItems}\n\n*Valor Total: ${formatCurrency(totalGeral)}*\n\nQualquer dúvida estamos à disposição!`

    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 
        ========================================
        PRINT LAYOUT (A4)
        ========================================
      */}
      <div className="hidden print:block text-black font-sans bg-white h-auto p-0 m-0">
        <div className="w-full max-w-[210mm] mx-auto p-8 h-[297mm] relative flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div className="flex gap-4 items-center">
              {empresa.logo && (
                <img
                  src={empresa.logo}
                  alt="Logo"
                  className="h-20 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold uppercase">{empresa.nome}</h1>
                <p className="text-sm text-gray-600 max-w-xs leading-snug">
                  {empresa.endereco}
                </p>
                <p className="text-sm font-bold mt-1">
                  CNPJ: {empresa.cnpj || '00.000.000/0000-00'}
                </p>
                <p className="text-sm font-bold">{empresa.telefone}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <h2 className="text-3xl font-black uppercase tracking-wider mb-2">
                ORDEM DE SERVIÇO
              </h2>
              <div className="bg-gray-100 p-2 rounded w-full text-right mb-2">
                <p className="text-lg font-bold">
                  Nº {existing ? formatContractId(existing.numeroOS) : '---'}
                </p>
                <p className="text-xs">
                  Emissão: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-6 text-sm bg-gray-50 p-4 rounded border border-gray-200">
            <div>
              <h3 className="font-bold border-b border-gray-400 mb-2 uppercase text-gray-700">
                Dados do Cliente
              </h3>
              <p className="py-0.5">
                <span className="font-semibold w-20 inline-block">Nome:</span>{' '}
                {form.getValues('clienteNome')}
              </p>
              <p className="py-0.5">
                <span className="font-semibold w-20 inline-block">Tel:</span>{' '}
                {form.getValues('clienteTelefone')}
              </p>
            </div>
            <div>
              <h3 className="font-bold border-b border-gray-400 mb-2 uppercase text-gray-700">
                Dados do Veículo
              </h3>
              <p className="py-0.5">
                <span className="font-semibold w-20 inline-block">Modelo:</span>{' '}
                {form.getValues('motoModelo')}
              </p>
              <p className="py-0.5">
                <span className="font-semibold w-20 inline-block">Placa:</span>{' '}
                <span className="uppercase font-mono bg-gray-200 px-1 rounded">
                  {form.getValues('motoPlaca')}
                </span>
              </p>
              <p className="py-0.5">
                <span className="font-semibold w-20 inline-block">Ano:</span>{' '}
                {form.getValues('motoAno') || '-'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1">
            <table className="w-full mb-6 text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-y border-black">
                  <th className="text-left py-2 px-2 font-bold uppercase text-xs">
                    Tipo
                  </th>
                  <th className="text-left py-2 px-2 font-bold uppercase text-xs">
                    Descrição
                  </th>
                  <th className="text-center py-2 px-2 font-bold uppercase text-xs w-16">
                    Qtd
                  </th>
                  <th className="text-right py-2 px-2 font-bold uppercase text-xs w-24">
                    V. Unit
                  </th>
                  <th className="text-right py-2 px-2 font-bold uppercase text-xs w-20">
                    Desc(%)
                  </th>
                  <th className="text-right py-2 px-2 font-bold uppercase text-xs w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {watchedItens.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-2 px-2 capitalize text-xs text-gray-500">
                      {item.tipo}
                    </td>
                    <td className="py-2 px-2 font-medium">{item.nome}</td>
                    <td className="text-center py-2 px-2">{item.quantidade}</td>
                    <td className="text-right py-2 px-2 text-gray-600">
                      {formatCurrency(item.valorUnitario)}
                    </td>
                    <td className="text-right py-2 px-2 text-gray-600">
                      {item.desconto > 0 ? `${item.desconto}%` : '-'}
                    </td>
                    <td className="text-right py-2 px-2 font-bold">
                      {formatCurrency(item.valorTotal)}
                    </td>
                  </tr>
                ))}
                {watchedItens.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-400 italic"
                    >
                      Nenhum item adicionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-1/2 bg-gray-50 p-4 rounded border border-gray-200">
              <div className="flex justify-between py-1 text-sm text-gray-600">
                <span>Total Peças:</span>
                <span>{formatCurrency(totalPecas)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm text-gray-600">
                <span>Total Serviços:</span>
                <span>{formatCurrency(totalServicos)}</span>
              </div>
              {totalDesconto > 0 && (
                <div className="flex justify-between py-1 text-sm text-emerald-600 font-medium border-t border-gray-200 mt-1">
                  <span>Total Desconto:</span>
                  <span>- {formatCurrency(totalDesconto)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t-2 border-black">
                <span>TOTAL GERAL:</span>
                <span>{formatCurrency(totalGeral)}</span>
              </div>
            </div>
          </div>

          {/* Observations */}
          {form.getValues('observacao') && (
            <div className="mb-8 border border-gray-200 rounded p-4 bg-yellow-50/50">
              <h3 className="font-bold mb-1 text-xs uppercase text-gray-500">
                Observações:
              </h3>
              <p className="whitespace-pre-wrap text-sm">
                {form.getValues('observacao')}
              </p>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-auto grid grid-cols-2 gap-16 text-center text-sm pt-8">
            <div>
              <div className="border-t border-black mb-2" />
              <p className="font-medium">{empresa.nome}</p>
              <p className="text-xs text-gray-500">Responsável Técnico</p>
            </div>
            <div>
              <div className="border-t border-black mb-2" />
              <p className="font-medium">
                {form.getValues('clienteNome') || 'Cliente'}
              </p>
              <p className="text-xs text-gray-500">Assinatura do Cliente</p>
            </div>
          </div>

          {/* Footer / Recycling Message */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center flex flex-col items-center gap-1 text-xs text-gray-400">
            <div className="flex items-center gap-1 text-green-700/80 font-medium">
              <Recycle className="h-3 w-3" />
              <span>
                Por favor, descarte este papel de forma consciente. Recicle.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================
        SCREEN LAYOUT
        ========================================
      */}
      <Card className="print:hidden border-t-4 border-t-primary shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {isEditing
                ? `OS #${existing ? formatContractId(existing.numeroOS) : ''}`
                : 'Nova Ordem de Serviço'}
              {isEditing && existing && (
                <span
                  className={cn(
                    'text-sm px-2 py-0.5 rounded-full border',
                    existing.situacao === 'Concluído'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  )}
                >
                  {existing.situacao}
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha os dados abaixo para gerar a OS.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Enviar no WhatsApp"
              onClick={handleWhatsApp}
              className="hover:text-green-600 hover:border-green-600"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex flex-col space-y-2">
                  <FormLabel className="font-semibold">Cliente</FormLabel>
                  <div className="flex gap-2">
                    <Popover
                      open={openClientSearch}
                      onOpenChange={setOpenClientSearch}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openClientSearch}
                          className="justify-between w-full"
                        >
                          {form.watch('clienteNome') ||
                            'Selecione um cliente...'}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar cliente..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhum cliente encontrado.
                            </CommandEmpty>
                            <CommandGroup>
                              {clientes
                                .sort((a, b) => a.nome.localeCompare(b.nome))
                                .map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={cliente.nome}
                                    onSelect={() =>
                                      handleClienteSelect(cliente.id)
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        form.watch('clienteId') === cliente.id
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    {cliente.nome}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    placeholder="Nome do Cliente (Manual)"
                    {...form.register('clienteNome')}
                    className={
                      form.watch('clienteId') !== 'new' ? 'hidden' : ''
                    }
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clienteTelefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Celular / WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatPhone(e.target.value))
                          }
                          placeholder="(00) 00000-0000"
                        />
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
                      <FormLabel className="font-semibold">Vendedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeVendedores.length === 0 && (
                            <SelectItem value="none" disabled>
                              Nenhum vendedor ativo
                            </SelectItem>
                          )}
                          {activeVendedores.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.nome}
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
                  name="motoModelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Modelo da Moto
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Honda CG 160" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motoPlaca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Placa</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="uppercase font-mono"
                          placeholder="ABC-1234"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="situacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Situação</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aberto">Aberto</SelectItem>
                          <SelectItem value="Em Andamento">
                            Em Andamento
                          </SelectItem>
                          <SelectItem value="Concluído">Concluído</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-muted-foreground" /> Itens
                    da OS
                  </h3>
                  <div className="flex w-full md:w-auto gap-2">
                    <Select onValueChange={(val) => addItem('peca', val)}>
                      <SelectTrigger className="flex-1 md:w-[200px] border-dashed border-primary/50 hover:bg-primary/5">
                        <SelectValue placeholder="+ Adicionar Peça" />
                      </SelectTrigger>
                      <SelectContent>
                        {pecas
                          .sort((a, b) => a.nome.localeCompare(b.nome))
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => addItem('servico', val)}>
                      <SelectTrigger className="flex-1 md:w-[200px] border-dashed border-primary/50 hover:bg-primary/5">
                        <SelectValue placeholder="+ Adicionar Serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicos.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[80px]">Qtd</TableHead>
                        <TableHead className="w-[120px] text-right">
                          Unitário
                        </TableHead>
                        <TableHead className="w-[100px] text-right">
                          Desc(%)
                        </TableHead>
                        <TableHead className="w-[140px] text-right">
                          Total
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id} className="group">
                          <TableCell className="capitalize text-xs text-muted-foreground">
                            {form.getValues(`itens.${index}.tipo`)}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`itens.${index}.nome`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="h-8 bg-transparent border-transparent group-hover:bg-background group-hover:border-input"
                                />
                              )}
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
                                  className="h-8 text-center"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    const qty = Number(e.target.value)
                                    const unit = form.getValues(
                                      `itens.${index}.valorUnitario`,
                                    )
                                    const desc = form.getValues(
                                      `itens.${index}.desconto`,
                                    )
                                    const total =
                                      qty * unit * (1 - (desc || 0) / 100)
                                    form.setValue(
                                      `itens.${index}.valorTotal`,
                                      total,
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
                                  className="h-8 text-right"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    const unit = Number(e.target.value)
                                    const qty = form.getValues(
                                      `itens.${index}.quantidade`,
                                    )
                                    const desc = form.getValues(
                                      `itens.${index}.desconto`,
                                    )
                                    const total =
                                      qty * unit * (1 - (desc || 0) / 100)
                                    form.setValue(
                                      `itens.${index}.valorTotal`,
                                      total,
                                    )
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`itens.${index}.desconto`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  className="h-8 text-right text-red-600 font-medium"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    const desc = Number(e.target.value)
                                    const unit = form.getValues(
                                      `itens.${index}.valorUnitario`,
                                    )
                                    const qty = form.getValues(
                                      `itens.${index}.quantidade`,
                                    )
                                    const total =
                                      qty * unit * (1 - (desc || 0) / 100)
                                    form.setValue(
                                      `itens.${index}.valorTotal`,
                                      total,
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
                              className="h-8 bg-muted text-right font-bold pointer-events-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {fields.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center h-32 text-muted-foreground bg-muted/5 border-dashed"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-8 w-8 opacity-20" />
                              <p>Adicione peças ou serviços acima.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col md:flex-row justify-end gap-6 text-sm p-6 bg-muted/30 rounded-lg border border-border/50 shadow-sm">
                  <div className="flex gap-8 justify-end">
                    <div className="text-right space-y-1">
                      <p className="text-muted-foreground">Total Peças</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(totalPecas)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-muted-foreground">Total Serviços</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(totalServicos)}
                      </p>
                    </div>
                    {totalDesconto > 0 && (
                      <div className="text-right space-y-1">
                        <p className="text-muted-foreground">Total Desconto</p>
                        <p className="font-semibold text-lg text-emerald-600">
                          - {formatCurrency(totalDesconto)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right border-l pl-8 border-border">
                    <p className="text-muted-foreground uppercase text-xs font-bold tracking-wider mb-1">
                      Total Geral
                    </p>
                    <p className="text-3xl font-black text-primary tracking-tight">
                      {formatCurrency(totalGeral)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                  <Calculator className="h-3 w-3" />
                  <span>
                    Comissão Estimada (Vendedor):{' '}
                    <strong>{formatCurrency(totalComissao)}</strong>
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Gerais</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detalhes adicionais, defeitos relatados, condições de pagamento..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/ordens-servico')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[150px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Ordem de Serviço'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
