import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { FABRICANTES } from '@/types'
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
import { parseCurrency, formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Upload } from 'lucide-react'

const aquisicaoSchema = z.object({
  id: z.string(),
  data: z.string().min(1, 'Data é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  vendedor: z.string().min(1, 'Selecione um cliente como vendedor'),
  km: z.coerce.number().min(0, 'KM não pode ser negativo'),
  consignacao: z.boolean().default(false),
})

const formSchema = z.object({
  fabricante: z.string().min(1, 'Selecione um fabricante'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  ano: z.coerce.number().min(1900).max(2100),
  cor: z.string().min(3, 'Cor é obrigatória'),
  placa: z.string().optional(),
  valor: z.string().min(1, 'Valor é obrigatório'),
  kmAtual: z.coerce.number().min(0, 'KM não pode ser negativo'),
  imagem: z.string().optional(),
  historicoAquisicao: z.array(aquisicaoSchema).default([]),
})

export default function MotoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { motos, addMoto, updateMoto, clientes } = useData()
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  )

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
      kmAtual: 0,
      imagem: '',
      historicoAquisicao: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'historicoAquisicao',
  })

  useEffect(() => {
    if (isEditing && existingMoto) {
      const formattedHistory = existingMoto.historicoAquisicao.map((h) => ({
        ...h,
        valor: formatCurrency(h.valor),
      }))

      form.reset({
        fabricante: existingMoto.fabricante,
        modelo: existingMoto.modelo,
        ano: existingMoto.ano,
        cor: existingMoto.cor,
        placa: existingMoto.placa || '',
        valor: formatCurrency(existingMoto.valor),
        kmAtual: existingMoto.kmAtual || 0,
        imagem: existingMoto.imagem,
        historicoAquisicao: formattedHistory,
      })
      setImagePreview(existingMoto.imagem)
    }
  }, [isEditing, existingMoto, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const rawValue = parseCurrency(values.valor)
    const processedHistory = values.historicoAquisicao.map((h) => ({
      ...h,
      valor: parseCurrency(h.valor),
    }))

    const motoData = {
      ...values,
      valor: rawValue,
      imagem: imagePreview || values.imagem || '',
      historicoAquisicao: processedHistory,
    }

    if (isEditing && id) {
      updateMoto(id, motoData)
    } else {
      addMoto(motoData)
    }
    navigate('/motos')
  }

  const handleCurrencyChange =
    (fieldName: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      fieldName.onChange(formatCurrency(number))
    }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        form.setValue('imagem', result, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const addAquisicao = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toISOString().split('T')[0],
      valor: '',
      vendedor: '',
      km: 0,
      consignacao: false,
    })
  }

  const isSold = existingMoto?.status === 'vendida'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Moto' : 'Cadastrar Moto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Veículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <FormLabel>Foto da Motocicleta</FormLabel>
                    <div className="flex items-center gap-4">
                      <div className="border-2 border-dashed rounded-lg p-2 w-48 h-32 flex items-center justify-center bg-muted/50 overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Moto Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs text-center flex flex-col items-center gap-1">
                            <Upload className="h-4 w-4" /> Sem Foto
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          className="w-full max-w-sm"
                          onChange={handleImageUpload}
                        />
                        <FormDescription>
                          Envie uma foto do veículo (JPG, PNG).
                        </FormDescription>
                      </div>
                    </div>
                  </div>

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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="kmAtual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quilometragem Atual</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Venda (R$)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={handleCurrencyChange(field)}
                            disabled={isSold}
                          />
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
                  <h3 className="text-lg font-semibold">
                    Histórico de Aquisições
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAquisicao}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Entrada
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-[200px]">
                          Vendedor/Origem
                        </TableHead>
                        <TableHead>Valor Custo</TableHead>
                        <TableHead>KM</TableHead>
                        <TableHead>Consignação</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`historicoAquisicao.${index}.data`}
                              render={({ field }) => (
                                <Input type="date" {...field} />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`historicoAquisicao.${index}.vendedor`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {clientes.map((cliente) => (
                                      <SelectItem
                                        key={cliente.id}
                                        value={cliente.nome}
                                      >
                                        {cliente.nome}
                                      </SelectItem>
                                    ))}
                                    {/* Fallback for old records */}
                                    {field.value &&
                                      !clientes.some(
                                        (c) => c.nome === field.value,
                                      ) && (
                                        <SelectItem value={field.value}>
                                          {field.value}
                                        </SelectItem>
                                      )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`historicoAquisicao.${index}.valor`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  onChange={handleCurrencyChange(field)}
                                  placeholder="R$ 0,00"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`historicoAquisicao.${index}.km`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  placeholder="KM"
                                  {...field}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`historicoAquisicao.${index}.consignacao`}
                              render={({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
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
                            className="text-center text-muted-foreground h-24"
                          >
                            Nenhum registro de aquisição.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
