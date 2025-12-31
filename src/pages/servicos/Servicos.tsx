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
import { Plus, Search, Trash2 } from 'lucide-react'
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

export default function Servicos() {
  const { servicos, addServico, deleteServico } = useData()
  const [filter, setFilter] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  // New Service State
  const [newNome, setNewNome] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newValor, setNewValor] = useState('')
  const [newComissao, setNewComissao] = useState('')

  const filteredServicos = servicos.filter((s) =>
    s.nome.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAdd = () => {
    if (!newNome || !newValor) return

    addServico({
      nome: newNome,
      descricao: newDesc,
      valor: parseCurrency(newValor),
      comissao: Number(newComissao.replace(',', '.')), // Keep as pure number for percentage
    })
    setIsAddOpen(false)
    setNewNome('')
    setNewDesc('')
    setNewValor('')
    setNewComissao('')
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
        <Button onClick={() => setIsAddOpen(true)}>
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
            <DialogDescription>
              Cadastre um novo serviço disponível na oficina.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">
                Descrição
              </Label>
              <Input
                id="desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input
                id="valor"
                value={newValor}
                onChange={handleCurrencyInput(setNewValor)}
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
                value={newComissao}
                onChange={(e) => setNewComissao(e.target.value)}
                placeholder="Ex: 10"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
