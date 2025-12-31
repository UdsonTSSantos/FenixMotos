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
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import { formatCurrency, parseCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Servico } from '@/types'

export default function Servicos() {
  const { servicos, addServico, updateServico, deleteServico } = useData()
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Servico | null>(null)

  // Service Form State
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [comissao, setComissao] = useState('')

  const filteredServicos = servicos.filter((s) =>
    s.nome.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleOpenDialog = (service?: Servico) => {
    if (service) {
      setEditingService(service)
      setNome(service.nome)
      setDescricao(service.descricao)
      setValor(formatCurrency(service.valor))
      setComissao(service.comissao.toString())
    } else {
      setEditingService(null)
      setNome('')
      setDescricao('')
      setValor('')
      setComissao('')
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!nome || !valor) return

    const serviceData = {
      nome,
      descricao,
      valor: parseCurrency(valor),
      comissao: Number(comissao.replace(',', '.')), // Percentage
    }

    if (editingService) {
      updateServico(editingService.id, serviceData)
    } else {
      addServico(serviceData)
    }
    setIsDialogOpen(false)
  }

  const handleCurrencyInput =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      setter(formatCurrency(number))
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Comissão (%)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServicos.map((servico) => (
              <TableRow key={servico.id}>
                <TableCell className="font-medium">{servico.nome}</TableCell>
                <TableCell>{servico.descricao}</TableCell>
                <TableCell>{formatCurrency(servico.valor)}</TableCell>
                <TableCell className="text-emerald-600 font-medium">
                  {servico.comissao}%
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(servico)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteServico(servico.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredServicos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Atualize os dados do serviço.'
                : 'Cadastre um novo serviço disponível na oficina.'}
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
              <Label htmlFor="desc" className="text-right">
                Descrição
              </Label>
              <Input
                id="desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input
                id="valor"
                value={valor}
                onChange={handleCurrencyInput(setValor)}
                placeholder="R$ 0,00"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comissao" className="text-right">
                Comissão (%)
              </Label>
              <Input
                id="comissao"
                type="number"
                min={0}
                max={100}
                value={comissao}
                onChange={(e) => setComissao(e.target.value)}
                placeholder="Ex: 10"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
