import { useState } from 'react'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit, FileText, Printer, Calculator } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Vendedor } from '@/types'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatContractId } from '@/lib/utils'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function Vendedores() {
  const { vendedores, addVendedor, updateVendedor, ordensServico, empresa } =
    useData()
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null)

  // Tabs State
  const [activeTab, setActiveTab] = useState('lista')

  // Commission Report State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSellerId, setSelectedSellerId] = useState('all')

  // Form State
  const [nome, setNome] = useState('')
  const [ativo, setAtivo] = useState(true)

  // Vendedores List Logic
  const filteredVendedores = vendedores.filter((v) =>
    v.nome.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleOpenDialog = (vendedor?: Vendedor) => {
    if (vendedor) {
      setEditingVendedor(vendedor)
      setNome(vendedor.nome)
      setAtivo(vendedor.ativo)
    } else {
      setEditingVendedor(null)
      setNome('')
      setAtivo(true)
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    let success = false
    if (editingVendedor) {
      success = await updateVendedor(editingVendedor.id, { nome, ativo })
    } else {
      success = await addVendedor({ nome, ativo })
    }

    if (success) {
      setIsDialogOpen(false)
    }
  }

  // Commission Report Logic
  const filteredCommissions = ordensServico
    .filter((os) => {
      // Data Integrity: Only Approved/Concluded OS
      if (os.situacao !== 'Concluído') return false

      // Filter by Seller
      if (selectedSellerId !== 'all' && os.vendedorId !== selectedSellerId)
        return false

      // Filter by Date
      if (startDate && endDate) {
        const date = parseISO(os.dataEntrada)
        const start = startOfDay(parseISO(startDate))
        const end = endOfDay(parseISO(endDate))
        if (!isWithinInterval(date, { start, end })) return false
      } else if (startDate) {
        if (new Date(os.dataEntrada) < new Date(startDate)) return false
      } else if (endDate) {
        if (new Date(os.dataEntrada) > new Date(endDate)) return false
      }

      return true
    })
    .sort(
      (a, b) =>
        new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime(),
    )

  // Dynamic Commission Calculation: 3% of Parts Value
  const calculateCommission = (partsValue: number) => {
    return partsValue * 0.03
  }

  const totalCommissionsToPay = filteredCommissions.reduce((acc, os) => {
    return acc + calculateCommission(os.valorTotalPecas)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Vendedores</h1>
      </div>

      <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="lista">Lista de Vendedores</TabsTrigger>
          <TabsTrigger value="comissoes">Extrato de Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendedor..."
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Novo Vendedor
            </Button>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendedores.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.nome}</TableCell>
                    <TableCell>
                      <Badge variant={v.ativo ? 'default' : 'secondary'}>
                        {v.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(v)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVendedores.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Nenhum vendedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="comissoes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Filtros do Extrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vendedor</Label>
                  <Select
                    value={selectedSellerId}
                    onValueChange={setSelectedSellerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Vendedores</SelectItem>
                      {vendedores.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultados do Relatório</CardTitle>
              <Badge variant="outline" className="text-xs">
                {filteredCommissions.length} OS Aprovada(s)
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nº OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Valor Peças</TableHead>
                      <TableHead className="text-right">
                        Comissão (3%)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((os) => {
                      const sellerName =
                        vendedores.find((v) => v.id === os.vendedorId)?.nome ||
                        'Desconhecido'
                      const commission = calculateCommission(os.valorTotalPecas)
                      return (
                        <TableRow key={os.id}>
                          <TableCell>
                            {new Date(os.dataEntrada).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            #{formatContractId(os.numeroOS)}
                          </TableCell>
                          <TableCell>{os.clienteNome}</TableCell>
                          <TableCell>{sellerName}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(os.valorTotalPecas)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">
                            {formatCurrency(commission)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredCommissions.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center h-32 text-muted-foreground"
                        >
                          Nenhuma comissão encontrada para este período.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Footer */}
              <div className="mt-6 flex justify-end">
                <div className="bg-muted p-4 rounded-lg border flex flex-col items-end min-w-[300px]">
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    Total de Comissões a Pagar
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(totalCommissionsToPay)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
            <DialogDescription>
              Gerencie as informações do vendedor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ativo" className="text-right">
                Ativo
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
                <Label htmlFor="ativo" className="font-normal">
                  {ativo ? 'Sim' : 'Não'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
