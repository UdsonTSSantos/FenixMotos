import { useEffect, useState } from 'react'
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
import { Upload, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  fabricante: z.string().min(1, 'Selecione um fabricante'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  ano: z.coerce.number().min(1900).max(2100),
  cor: z.string().min(3, 'Cor é obrigatória'),
  placa: z.string().optional(),
  renavam: z
    .string()
    .max(11, 'Renavam deve ter no máximo 11 dígitos')
    .optional(),
  chassis: z.string().optional(),
  dataLicenciamento: z.string().optional(),
  valor: z.string().min(1, 'Valor é obrigatório'),
  kmAtual: z.coerce.number().min(0, 'KM não pode ser negativo'),
  imagem: z.string().optional(),
  observacao: z.string().optional(),
  status: z.enum(['estoque', 'vendida']).default('estoque'),
})

export default function MotoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { motos, addMoto, updateMoto } = useData()
  const [uploading, setUploading] = useState(false)

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
      renavam: '',
      chassis: '',
      dataLicenciamento: '',
      valor: '',
      kmAtual: 0,
      imagem: '',
      observacao: '',
      status: 'estoque',
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
        renavam: existingMoto.renavam || '',
        chassis: existingMoto.chassis || '',
        dataLicenciamento: existingMoto.dataLicenciamento || '',
        valor: formatCurrency(existingMoto.valor),
        kmAtual: existingMoto.kmAtual || 0,
        imagem: existingMoto.imagem || '',
        observacao: existingMoto.observacao || '',
        status: existingMoto.status,
      })
    }
  }, [isEditing, existingMoto, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const rawValue = parseCurrency(values.valor)

    const motoData = {
      ...values,
      valor: rawValue,
    }

    try {
      if (isEditing && id) {
        await updateMoto(id, motoData)
      } else {
        await addMoto(motoData)
      }
      navigate('/motos')
    } catch (error) {
      // Error handled by DataContext toast
    }
  }

  const handleCurrencyChange =
    (fieldName: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      fieldName.onChange(formatCurrency(number))
    }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor envie uma imagem.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(filePath)

      form.setValue('imagem', publicUrl, { shouldDirty: true })
      toast({
        title: 'Sucesso',
        description: 'Imagem enviada com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const currentImage = form.watch('imagem')

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
                      <div className="border-2 border-dashed rounded-lg p-2 w-48 h-32 flex items-center justify-center bg-muted/50 overflow-hidden relative">
                        {currentImage ? (
                          <>
                            <img
                              src={currentImage}
                              alt="Moto Preview"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                form.setValue('imagem', '', {
                                  shouldDirty: true,
                                })
                              }
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs text-center flex flex-col items-center gap-1">
                            <Upload className="h-4 w-4" /> Sem Foto
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          className="w-full max-w-sm relative overflow-hidden"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Carregar Foto
                            </>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </Button>
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
                          <Input placeholder="Ex: CG 160" {...field} />
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
                          <Input type="number" {...field} />
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
                          <Input placeholder="Ex: Vermelho" {...field} />
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
                    name="renavam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renavam</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345678901"
                            {...field}
                            maxLength={11}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chassis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Chassi</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 9C2JP85..."
                            {...field}
                            className="uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataLicenciamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Licenciamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
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
                              <SelectItem value="estoque">Estoque</SelectItem>
                              <SelectItem value="vendida">Vendida</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="observacao"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Histórico, avarias, detalhes extras..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
