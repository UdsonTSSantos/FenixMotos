import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { parseCurrency, formatCurrency } from '@/lib/utils'
import { addMonths, parseISO } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  motoId: z.string().min(1, 'Selecione uma moto'),
  clienteId: z.string().min(1, 'Selecione um cliente'),
  valorEntrada: z.string().min(1, 'Informe a entrada'),
  quantidadeParcelas: z.coerce.number().min(1).max(60),
  taxaJurosAtraso: z.coerce.number().min(0),
  valorMultaAtraso: z.string().min(1, 'Informe a multa'),
  taxaFinanciamento: z.coerce.number().min(0).default(0),
  valorParcela: z.string().min(1, 'Valor da parcela obrigatório'),
  observacao: z.string().optional(),
})

export default function FinanciamentoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    motos,
    clientes,
    addFinanciamento,
    updateFinanciamento,
    financiamentos,
  } = useData()

  const isEditing = !!id
  const existingFinanciamento = financiamentos.find((f) => f.id === id)

  const motosDisponiveis = motos.filter(
    (m) =>
      m.status === 'estoque' ||
      (isEditing && m.id === existingFinanciamento?.motoId),
  )

  const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null)
  const [isManualParcel, setIsManualParcel] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motoId: '',
      clienteId: '',
      valorEntrada: 'R$ 0,00',
      quantidadeParcelas: 12,
      taxaJurosAtraso: 2.0,
      valorMultaAtraso: 'R$ 50,00',
      taxaFinanciamento: 0,
      valorParcela: 'R$ 0,00',
      observacao: '',
    },
  })

  useEffect(() => {
    if (isEditing && existingFinanciamento) {
      setSelectedMotoId(existingFinanciamento.motoId)
      const parcelValue =
        existingFinanciamento.parcelas.length > 0
          ? existingFinanciamento.parcelas[0].valorOriginal
          : 0

      form.reset({
        motoId: existingFinanciamento.motoId,
        clienteId: existingFinanciamento.clienteId,
        valorEntrada: formatCurrency(existingFinanciamento.valorEntrada),
        quantidadeParcelas: existingFinanciamento.quantidadeParcelas,
        taxaJurosAtraso: existingFinanciamento.taxaJurosAtraso,
        valorMultaAtraso: formatCurrency(
          existingFinanciamento.valorMultaAtraso,
        ),
        taxaFinanciamento: existingFinanciamento.taxaFinanciamento || 0,
        valorParcela: formatCurrency(parcelValue),
        observacao: existingFinanciamento.observacao || '',
      })
    }
  }, [isEditing, existingFinanciamento, form])

  const selectedMoto = motos.find((m) => m.id === selectedMotoId)

  const watchEntrada = form.watch('valorEntrada')
  const watchParcelas = form.watch('quantidadeParcelas')
  const watchTaxaFinanciamento = form.watch('taxaFinanciamento')
  const watchValorParcela = form.watch('valorParcela')

  useEffect(() => {
    if (isManualParcel) return

    if (!selectedMoto) return

    const entradaValue = parseCurrency(watchEntrada || '0')
    const principal = Math.max(0, selectedMoto.valor - entradaValue)
    const count = watchParcelas || 1
    const rate = watchTaxaFinanciamento || 0

    const baseParcel = principal / count
    const interestPart = baseParcel * (rate / 100)
    const finalParcel = baseParcel + interestPart

    if (!isNaN(finalParcel) && finalParcel !== Infinity) {
      form.setValue('valorParcela', formatCurrency(finalParcel), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
  }, [selectedMoto, watchEntrada, watchParcelas, watchTaxaFinanciamento])

  const handleManualParcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManualParcel(true)
    handleCurrencyChange(form.getValues('valorParcela'), 'valorParcela')(e)
  }

  const handleCurrencyChange =
    (currentValue: string, fieldName: any) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      form.setValue(fieldName, formatCurrency(number))
    }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedMoto) return

    const entrada = parseCurrency(values.valorEntrada)
    const parcelaVal = parseCurrency(values.valorParcela)
    const total = entrada + parcelaVal * values.quantidadeParcelas
    const financiado = total - entrada

    const today = new Date()
    const contractDate =
      isEditing && existingFinanciamento
        ? existingFinanciamento.dataContrato
        : today.toISOString()

    const newParcelas = Array.from({ length: values.quantidadeParcelas }).map(
      (_, i) => ({
        numero: i + 1,
        dataVencimento: addMonths(parseISO(contractDate), i + 1).toISOString(),
        valorOriginal: parcelaVal,
        valorJuros: 0,
        valorMulta: 0,
        valorTotal: parcelaVal,
        status: 'pendente' as const,
      }),
    )

    const commonData = {
      motoId: values.motoId,
      clienteId: values.clienteId,
      valorTotal: total,
      valorEntrada: entrada,
      valorFinanciado: financiado,
      quantidadeParcelas: values.quantidadeParcelas,
      taxaJurosAtraso: values.taxaJurosAtraso,
      valorMultaAtraso: parseCurrency(values.valorMultaAtraso),
      taxaFinanciamento: values.taxaFinanciamento,
      observacao: values.observacao,
      parcelas: newParcelas,
    }

    if (isEditing && id) {
      updateFinanciamento(id, commonData)
      navigate(`/financiamentos/${id}`)
    } else {
      addFinanciamento({
        ...commonData,
        dataContrato: new Date().toISOString(),
      })
      navigate('/financiamentos')
    }
  }

  const entradaValue = parseCurrency(watchEntrada || '0')
  const motoValue = selectedMoto?.valor || 0
  const valorFinanciadoDisplay = Math.max(0, motoValue - entradaValue)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Ajuste os termos do financiamento.'
              : 'Selecione o veículo e o cliente para iniciar a venda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Dados do Contrato</h3>

                  <FormField
                    control={form.control}
                    name="motoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motocicleta</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val)
                            setSelectedMotoId(val)
                            setIsManualParcel(false)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a moto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motosDisponiveis.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.modelo} - {m.cor} ({formatCurrency(m.valor)})
                                {m.status === 'vendida' &&
                                  isEditing &&
                                  ' (Atual)'}
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
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome} - CPF: {c.cpf}
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
                      name="valorEntrada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor de Entrada</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                setIsManualParcel(false)
                                handleCurrencyChange(
                                  field.value,
                                  'valorEntrada',
                                )(e)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantidadeParcelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd. Parcelas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={60}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setIsManualParcel(false)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxaFinanciamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Juros Financiamento (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setIsManualParcel(false)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Acréscimo mensal.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valorParcela"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">
                            Valor da Parcela
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleManualParcelChange}
                              className="font-bold border-primary/50"
                            />
                          </FormControl>
                          <FormDescription>
                            {isManualParcel
                              ? 'Valor manual definido.'
                              : 'Calculado automaticamente.'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxaJurosAtraso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Juros Atraso (Dia %)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valorMultaAtraso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Multa Atraso (Fixa)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleCurrencyChange(
                                field.value,
                                'valorMultaAtraso',
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="observacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Anote detalhes relevantes do contrato aqui..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Resumo da Simulação</h3>
                  <div className="bg-muted p-6 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Valor da Moto:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(motoValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrada:</span>
                      <span className="font-medium text-emerald-600">
                        - {formatCurrency(entradaValue)}
                      </span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Principal:</span>
                      <span>{formatCurrency(valorFinanciadoDisplay)}</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Parcelas Mensais:
                        </span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {watchParcelas}x de {watchValorParcela}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-right">
                        Total Final:{' '}
                        {formatCurrency(
                          entradaValue +
                            parseCurrency(watchValorParcela) *
                              (watchParcelas || 1),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      isEditing ? `/financiamentos/${id}` : '/financiamentos',
                    )
                  }
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedMotoId || !valorFinanciadoDisplay}
                >
                  {isEditing ? 'Salvar Alterações' : 'Confirmar Financiamento'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
