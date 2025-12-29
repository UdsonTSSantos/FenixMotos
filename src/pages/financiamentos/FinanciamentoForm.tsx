import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
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

const formSchema = z.object({
  motoId: z.string().min(1, 'Selecione uma moto'),
  clienteId: z.string().min(1, 'Selecione um cliente'),
  valorEntrada: z.string().min(1, 'Informe a entrada'),
  quantidadeParcelas: z.coerce.number().min(1).max(60),
  taxaJurosAtraso: z.coerce.number().min(0),
  valorMultaAtraso: z.string().min(1, 'Informe a multa'),
})

export default function FinanciamentoForm() {
  const navigate = useNavigate()
  const { motos, clientes, addFinanciamento } = useData()
  const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null)

  const motosEstoque = motos.filter((m) => m.status === 'estoque')
  const selectedMoto = motos.find((m) => m.id === selectedMotoId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motoId: '',
      clienteId: '',
      valorEntrada: 'R$ 0,00',
      quantidadeParcelas: 12,
      taxaJurosAtraso: 2.0,
      valorMultaAtraso: 'R$ 50,00',
    },
  })

  const watchEntrada = form.watch('valorEntrada')
  const watchParcelas = form.watch('quantidadeParcelas')

  const entradaValue = parseCurrency(watchEntrada || '0')
  const motoValue = selectedMoto?.valor || 0
  const valorFinanciado = Math.max(0, motoValue - entradaValue)
  const valorParcela = valorFinanciado / (watchParcelas || 1)

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedMoto) return

    addFinanciamento({
      motoId: values.motoId,
      clienteId: values.clienteId,
      valorTotal: selectedMoto.valor,
      valorEntrada: parseCurrency(values.valorEntrada),
      valorFinanciado: valorFinanciado,
      quantidadeParcelas: values.quantidadeParcelas,
      taxaJurosAtraso: values.taxaJurosAtraso,
      valorMultaAtraso: parseCurrency(values.valorMultaAtraso),
      dataContrato: new Date().toISOString(),
    })
    navigate('/financiamentos')
  }

  const handleCurrencyChange =
    (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      field.onChange(formatCurrency(number))
    }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Contrato de Financiamento</CardTitle>
          <CardDescription>
            Selecione o veículo e o cliente para iniciar a venda.
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
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a moto em estoque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motosEstoque.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.modelo} - {m.cor} ({formatCurrency(m.valor)})
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
                              onChange={handleCurrencyChange(field)}
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
                            <Input type="number" min={1} max={60} {...field} />
                          </FormControl>
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
                          <FormLabel>Juros Diário (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormDescription>Sobre atraso.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valorMultaAtraso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Multa Fixa</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={handleCurrencyChange(field)}
                            />
                          </FormControl>
                          <FormDescription>Sobre atraso.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                      <span>A Financiar:</span>
                      <span>{formatCurrency(valorFinanciado)}</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Parcelas Mensais:
                        </span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {watchParcelas}x de {formatCurrency(valorParcela)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/financiamentos')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedMotoId || !valorFinanciado}
                >
                  Confirmar Financiamento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
