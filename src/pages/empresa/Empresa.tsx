import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { formatCNPJ, formatPhone } from '@/lib/utils'
import { Upload } from 'lucide-react'

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(18, 'CNPJ inválido'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  telefone: z.string().min(14, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  logo: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  x: z.string().optional(),
  tiktok: z.string().optional(),
  website: z.string().optional(),
})

export default function Empresa() {
  const { empresa, updateEmpresa } = useData()
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      email: '',
      logo: '',
      instagram: '',
      facebook: '',
      x: '',
      tiktok: '',
      website: '',
    },
  })

  useEffect(() => {
    if (empresa) {
      form.reset({
        ...empresa,
        instagram: empresa.instagram || '',
        facebook: empresa.facebook || '',
        x: empresa.x || '',
        tiktok: empresa.tiktok || '',
        website: empresa.website || '',
      })
      setLogoPreview(empresa.logo)
    }
  }, [empresa, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateEmpresa({
      ...values,
      logo: logoPreview || values.logo || '',
    })
  }

  // Mask handlers
  const handleCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('cnpj', formatCNPJ(e.target.value))
  }
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('telefone', formatPhone(e.target.value))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        form.setValue('logo', result, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade Corporativa</CardTitle>
          <CardDescription>
            Gerencie as informações da sua concessionária, branding e redes
            sociais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Section */}
                <div className="md:col-span-2 space-y-4">
                  <FormLabel>Logo da Empresa</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 w-32 h-32 flex items-center justify-center bg-muted/50 overflow-hidden relative">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs text-center">
                          Sem Logo
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full max-w-sm"
                        onChange={handleLogoUpload}
                      />
                      <FormDescription>
                        Envie uma imagem (JPG, PNG) para usar como logo.
                      </FormDescription>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Razão Social / Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
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
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
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
                      <FormLabel>Email de Contato</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="contato@empresa.com"
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
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Redes Sociais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://www.suaempresa.com.br"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://instagram.com/..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://facebook.com/..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="x"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://x.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://tiktok.com/..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
