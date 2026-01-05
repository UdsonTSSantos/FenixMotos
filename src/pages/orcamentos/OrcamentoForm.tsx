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
import { formatCurrency, formatPhone } from '@/lib/utils'
import {
  Trash2,
  Printer,
  Calculator,
  Search,
  Check,
  Wrench,
  MessageCircle,
  Mail,
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

const warrantyOptions = [
  'Sem garantia',
  '03 meses',
  '06 meses',
  '12 meses',
  '18 meses',
  '24 meses',
  'Peça fornecida pelo cliente',
] as const

const formSchema = z.object({
  clienteId: z.string().optional(),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  clienteTelefone: z.string().optional(),
  motoPlaca: z.string().optional(),
  motoModelo: z.string().optional(),
  motoAno: z.coerce.number().optional(),
  vendedorId: z.string().min(1, 'Selecione um vendedor'),
  data: z.string(),
  garantiaPecas: z.enum(warrantyOptions),
  garantiaServicos: z.enum(warrantyOptions),
  formaPagamento: z.string().min(1, 'Selecione a forma de pagamento'),
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
    financiamentos,
    motos,
  } = useData()
  const [printMode, setPrintMode] = useState<
    'none' | 'quote' | 'service_order'
  >('none')
  const [openClientSearch, setOpenClientSearch] = useState(false)

  const isEditing = !!id
  const existing = orcamentos.find((o) => o.id === id)

  // Filter users with sales roles
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
      clienteTelefone: '',
      motoPlaca: '',
      motoModelo: '',
      motoAno: undefined,
      vendedorId: '',
      data: new Date().toISOString().split('T')[0],
      garantiaPecas: '03 meses',
      garantiaServicos: '03 meses',
      formaPagamento: 'À Vista',
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
        garantiaPecas: (existing.garantiaPecas as any) || '03 meses',
        garantiaServicos: (existing.garantiaServicos as any) || '03 meses',
        formaPagamento: existing.formaPagamento || 'À Vista',
        status: existing.status || 'aberto',
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
        // Calculate 3% commission for parts by default
        const commissionPerUnit = p.precoVenda * 0.03

        append({
          id: crypto.randomUUID(),
          tipo: 'peca',
          referenciaId: p.id,
          nome: p.nome,
          quantidade: 1,
          valorUnitario: p.precoVenda,
          desconto: 0,
          valorTotal: p.precoVenda,
          comissaoUnitario: commissionPerUnit,
        })
      }
    } else {
      const s = servicos.find((x) => x.id === id)
      if (s) {
        // Calculate commission for service based on percentage
        const commissionPerUnit = s.valor * (s.comissao / 100)

        append({
          id: crypto.randomUUID(),
          tipo: 'servico',
          referenciaId: s.id,
          nome: s.nome,
          quantidade: 1,
          valorUnitario: s.valor,
          desconto: 0,
          valorTotal: s.valor,
          comissaoUnitario: commissionPerUnit,
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
    // If discount is applied, commission might need adjustment?
    // For now simpler logic: commission is per unit * quantity.
    // However, if we discount the total, we might want to reduce commission?
    // Let's assume commission is based on sold value.
    // Recalculate based on current total value proportion if needed, but per-unit is safer.
    // Actually, if I discount, I should probably reduce commission proportionally.
    // Let's stick to unit commission * quantity for now as per requirement.
    return acc + i.comissaoUnitario * i.quantidade
  }, 0)

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

  const handlePrint = (mode: 'quote' | 'service_order') => {
    setPrintMode(mode)
    setTimeout(() => {
      window.print()
      setPrintMode('none')
    }, 100)
  }

  const getMessageBody = (isQuote: boolean) => {
    const cliente = form.getValues('clienteNome')
    const veiculo = `${form.getValues('motoModelo')} (${form.getValues('motoPlaca')})`
    const itemsText = watchedItens
      .map((i) =>
        isQuote
          ? `${i.quantidade}x ${i.nome} - ${formatCurrency(i.valorTotal)}`
          : `${i.quantidade}x ${i.nome}`,
      )
      .join('\n')

    let message = ''

    if (isQuote) {
      message = `*ORÇAMENTO - ${empresa.nome}*\n\n`
      message += `*Cliente:* ${cliente}\n`
      message += `*Veículo:* ${veiculo}\n\n`
      message += `*ITENS:*\n${itemsText}\n\n`
      message += `*TOTAL GERAL:* ${formatCurrency(totalGeral)}\n`
      message += `*Forma de Pagamento:* ${form.getValues('formaPagamento')}\n`
      message += `*Garantia Peças:* ${form.getValues('garantiaPecas')}\n`
      message += `*Garantia Serviços:* ${form.getValues('garantiaServicos')}\n\n`
      message += `Acesse para mais detalhes.`
    } else {
      message = `*ORDEM DE SERVIÇO - ${empresa.nome}*\n\n`
      message += `*Cliente:* ${cliente}\n`
      message += `*Veículo:* ${veiculo}\n\n`
      message += `*SERVIÇOS REALIZADOS:*\n${itemsText}\n\n`
      if (form.getValues('observacao')) {
        message += `*OBS:* ${form.getValues('observacao')}\n`
      }
    }
    return message
  }

  const handleWhatsApp = (mode: 'quote' | 'service_order') => {
    const phone = form.getValues('clienteTelefone')?.replace(/\D/g, '')
    if (!phone) {
      alert('Telefone do cliente não preenchido')
      return
    }
    const message = getMessageBody(mode === 'quote')
    const url = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleEmail = () => {
    const cliente = form.getValues('clienteNome')
    const message = getMessageBody(true)
    const subject = `Orçamento - ${empresa.nome}`
    const body = message.replace(/\*/g, '').replace(/\n/g, '%0D%0A')

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
  }

  if (printMode !== 'none') {
    const isQuote = printMode === 'quote'
    const vendedor = usuarios.find((u) => u.id === form.getValues('vendedorId'))
    const phones = [empresa.telefone, empresa.telefone2, empresa.telefone3]
      .filter(Boolean)
      .join(' | ')

    return (
      <div className="bg-white text-black p-8 min-h-screen font-sans print:p-0 print:m-0 print:w-full">
        {/* Header */}
        <div className="pb-4 flex justify-between items-start mb-6">
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
              <p className="text-sm">{empresa.endereco}</p>
              <p className="text-sm font-bold mt-1">{phones}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">
              {isQuote ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO'}
            </h2>
            <p className="text-sm font-medium">
              Nº:{' '}
              {existing ? existing.id.substring(0, 8).toUpperCase() : 'NOVO'}
            </p>
            <p className="text-sm">
              Data: {new Date(form.getValues('data')).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div>
            <h3 className="font-bold border-b border-black mb-2 uppercase">
              Cliente
            </h3>
            <p>
              <span className="font-semibold">Nome:</span>{' '}
              {form.getValues('clienteNome')}
            </p>
            <p>
              <span className="font-semibold">Telefone:</span>{' '}
              {form.getValues('clienteTelefone')}
            </p>
          </div>
          <div>
            <h3 className="font-bold border-b border-black mb-2 uppercase">
              Veículo / Vendedor
            </h3>
            <p>
              <span className="font-semibold">Modelo:</span>{' '}
              {form.getValues('motoModelo')}
            </p>
            <p>
              <span className="font-semibold">Placa:</span>{' '}
              {form.getValues('motoPlaca')}{' '}
              {form.getValues('motoAno') && `- ${form.getValues('motoAno')}`}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Vendedor:</span> {vendedor?.nome}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-2">Descrição</th>
              <th className="text-center py-2 w-16">Qtd</th>
              {isQuote && (
                <>
                  <th className="text-right py-2 w-24">Valor Unit.</th>
                  <th className="text-right py-2 w-20">Desc(%)</th>
                  <th className="text-right py-2 w-24">Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {watchedItens.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2">{item.nome}</td>
                <td className="text-center py-2">{item.quantidade}</td>
                {isQuote && (
                  <>
                    <td className="text-right py-2">
                      {formatCurrency(item.valorUnitario)}
                    </td>
                    <td className="text-right py-2">
                      {item.desconto > 0 ? `${item.desconto}%` : '-'}
                    </td>
                    <td className="text-right py-2 font-medium">
                      {formatCurrency(item.valorTotal)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Conditions (Quote Only) */}
        {isQuote && (
          <div className="flex justify-end mb-8">
            <div className="w-1/2 space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span>Total Peças:</span>
                <span>{formatCurrency(totalPecas)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span>Total Serviços:</span>
                <span>{formatCurrency(totalServicos)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>TOTAL GERAL:</span>
                <span>{formatCurrency(totalGeral)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Warranty */}
        <div className="grid grid-cols-2 gap-8 text-sm mb-8">
          {isQuote && (
            <div>
              <h3 className="font-bold border-b border-black mb-2">
                CONDIÇÕES
              </h3>
              <p>
                <strong>Forma de Pagamento:</strong>{' '}
                {form.getValues('formaPagamento')}
              </p>
              <p>
                <strong>Garantia Peças:</strong>{' '}
                {form.getValues('garantiaPecas')}
              </p>
              <p>
                <strong>Garantia Serviços:</strong>{' '}
                {form.getValues('garantiaServicos')}
              </p>
            </div>
          )}
          {form.getValues('observacao') && (
            <div className={isQuote ? '' : 'col-span-2'}>
              <h3 className="font-bold border-b border-black mb-2">
                OBSERVAÇÕES
              </h3>
              <p className="whitespace-pre-wrap">
                {form.getValues('observacao')}
              </p>
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="mt-auto pt-16 grid grid-cols-2 gap-16 text-center text-sm">
          <div className="border-t border-black pt-2">
            <p className="font-bold">{empresa.nome}</p>
          </div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Cliente</p>
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
            {existing ? (
              <span className="ml-4 text-sm font-normal text-muted-foreground">
                #{existing.id.substring(0, 8).toUpperCase()}
              </span>
            ) : (
              <span className="ml-4 text-sm font-normal text-muted-foreground">
                (Numeração Automática)
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Enviar por Email"
              onClick={handleEmail}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Enviar Orçamento via WhatsApp"
              onClick={() => handleWhatsApp('quote')}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handlePrint('quote')}
            >
              <Printer className="mr-2 h-4 w-4" /> Orçamento (A4)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Enviar O.S. via WhatsApp"
              onClick={() => handleWhatsApp('service_order')}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handlePrint('service_order')}
            >
              <Wrench className="mr-2 h-4 w-4" /> Ordem de Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-2">
                  <FormLabel>Cliente (Busca Inteligente)</FormLabel>
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
                        {form.watch('clienteNome') || 'Selecione um cliente...'}
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
                      <FormLabel>Celular / Telefone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatPhone(e.target.value))
                          }
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
                      <FormLabel>Vendedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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

                <FormField
                  control={form.control}
                  name="motoModelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo da Moto</FormLabel>
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
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motoAno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="À Vista">À Vista</SelectItem>
                          <SelectItem value="Cartão de Crédito">
                            Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="Cartão de Débito">
                            Cartão de Débito
                          </SelectItem>
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Financiamento">
                            Financiamento
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="garantiaPecas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garantia Peças</FormLabel>
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
                          {warrantyOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
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
                  name="garantiaServicos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garantia Serviços</FormLabel>
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
                          {warrantyOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <SelectTrigger className="w-[180px]">
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

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[80px]">Qtd</TableHead>
                        <TableHead className="w-[120px]">Unitário</TableHead>
                        <TableHead className="w-[100px]">Desc(%)</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
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
                            colSpan={7}
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

              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="w-[200px] mb-0">
                        <FormLabel>Status</FormLabel>
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
                            <SelectItem value="aberto">Aberto</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/orcamentos')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Orçamento</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
