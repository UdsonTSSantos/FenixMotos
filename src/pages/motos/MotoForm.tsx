import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { FABRICANTES } from '@/types'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { parseCurrency, formatCurrency } from '@/lib/utils'

const formSchema = z.object({
  fabricante: z.string().min(1, 'Selecione um fabricante'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  ano: z.coerce.number().min(1900).max(2100),
  cor: z.string().min(3, 'Cor é obrigatória'),
  placa: z.string().optional(),
  valor: z.string().min(1, 'Valor é obrigatório'),
})

export default function MotoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { motos, addMoto, updateMoto } = useData()

  const isEditing = !!id
  const existingMoto = motos.find((m) => m.id === id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fabricante: '',
      modelo: '',
      ano: new Date().getFullYear(),
      cor: '',
      placa: '',
      valor: '',
    },
  })

  useEffect(() => {
    if (isEditing && existingMoto) {
      form.reset({
        fabricante: existingMoto.fabricante,
        modelo: existingMoto.modelo,
        ano: existingMoto.ano,
        cor: existingMoto.cor,
        placa: existingMoto.placa || '',
        valor: formatCurrency(existingMoto.valor),
      })
    }
  }, [isEditing, existingMoto, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const rawValue = parseCurrency(values.valor)

    if (isEditing && id) {
      updateMoto(id, {
        ...values,
        valor: rawValue,
      })
    } else {
      addMoto({
        ...values,
        valor: rawValue,
      })
    }
    navigate('/motos')
  }

  // Value formatting on change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const number = Number(raw) / 100
    form.setValue('valor', formatCurrency(number))
  }

  const isSold = existingMoto?.status === 'vendida'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Moto' : 'Cadastrar Moto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fabricante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSold}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FABRICANTES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
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
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: CG 160"
                          {...field}
                          disabled={isSold}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isSold} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Vermelho"
                          {...field}
                          disabled={isSold}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC-1234"
                          {...field}
                          className="uppercase"
                          maxLength={8}
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco se for moto 0km.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={handleValueChange}
                          disabled={isSold}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/motos')}
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
