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
import { Plus, Search, Upload, FileDown, Edit, Trash2 } from 'lucide-react'
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
import { Peca } from '@/types'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Pecas() {
  const {
    pecas,
    importPecasXML,
    addPeca,
    updatePeca,
    deletePeca,
    currentUser,
  } = useData()
  const [filter, setFilter] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null)

  // Manual Add/Edit State
  const [newCodigo, setNewCodigo] = useState('')
  const [newNome, setNewNome] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newQtd, setNewQtd] = useState('')
  const [newCusto, setNewCusto] = useState('')
  const [newVenda, setNewVenda] = useState('')

  const isAdmin = currentUser?.role === 'Administrador'

  const filteredPecas = pecas
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(filter.toLowerCase()) ||
        p.codigo.toLowerCase().includes(filter.toLowerCase()),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      importPecasXML(content)
      setIsImportOpen(false)
    }
    reader.readAsText(file)
  }

  const handleOpenForm = (peca?: Peca) => {
    if (peca) {
      setEditingPeca(peca)
      setNewCodigo(peca.codigo)
      setNewNome(peca.nome)
      setNewDesc(peca.descricao)
      setNewQtd(peca.quantidade.toString())
      setNewCusto(formatCurrency(peca.preco_custo))
      setNewVenda(formatCurrency(peca.preco_venda))
    } else {
      setEditingPeca(null)
      setNewCodigo('')
      setNewNome('')
      setNewDesc('')
      setNewQtd('')
      setNewCusto('')
      setNewVenda('')
    }
    setIsFormOpen(true)
  }

  const handleSaveManual = () => {
    if (!newNome || !newVenda) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    // Safe parsing to avoid NaN
    const priceCusto = parseCurrency(newCusto)
    const priceVenda = parseCurrency(newVenda)
    const quantity = parseInt(newQtd) || 0

    if (isNaN(priceCusto) || isNaN(priceVenda)) {
      toast.error('Valores inválidos')
      return
    }

    const pecaData = {
      codigo: newCodigo || `MAN-${Math.random().toString(36).substr(2, 4)}`,
      nome: newNome,
      descricao: newDesc,
      quantidade: quantity,
      preco_custo: priceCusto,
      preco_venda: priceVenda,
    }

    if (editingPeca) {
      updatePeca(editingPeca.id, pecaData)
    } else {
      addPeca(pecaData)
    }

    setIsFormOpen(false)
  }

  const handleCurrencyInput =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      // Check for valid number
      if (!isNaN(number)) {
        setter(formatCurrency(number))
      } else {
        setter('')
      }
    }

  const exportToExcel = () => {
    const sortedForExport = [...filteredPecas].sort((a, b) =>
      a.nome.localeCompare(b.nome),
    )

    const headers = [
      'Código',
      'Nome',
      'Descrição',
      'Quantidade',
      'Preço Custo',
      'Preço Venda',
    ]
    const rows = sortedForExport.map((p) => [
      p.codigo,
      p.nome,
      p.descricao,
      p.quantidade,
      p.preco_custo,
      p.preco_venda,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'pecas_estoque.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estoque de Peças</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileDown className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Importar XML
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" /> Nova Peça
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
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
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Preço Venda</TableHead>
              {isAdmin && <TableHead>Preço Custo</TableHead>}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPecas.map((peca) => (
              <TableRow key={peca.id}>
                <TableCell className="font-medium">{peca.codigo}</TableCell>
                <TableCell>{peca.nome}</TableCell>
                <TableCell>{peca.descricao}</TableCell>
                <TableCell>{peca.quantidade}</TableCell>
                <TableCell>{formatCurrency(peca.preco_venda)}</TableCell>
                {isAdmin && (
                  <TableCell>{formatCurrency(peca.preco_custo)}</TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenForm(peca)}
                      title="Editar Peça"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Peça?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá
                            permanentemente a peça do estoque.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deletePeca(peca.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPecas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhuma peça encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar XML de Nota Fiscal</DialogTitle>
            <DialogDescription>
              Selecione o arquivo XML da nota fiscal para atualizar o estoque
              automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="xml-file">Arquivo XML</Label>
              <Input
                id="xml-file"
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPeca ? 'Editar Peça' : 'Adicionar Peça'}
            </DialogTitle>
            <DialogDescription>
              {editingPeca
                ? 'Atualize os dados da peça no estoque.'
                : 'Cadastro manual de peça no estoque.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                className="col-span-3"
              />
            </div>
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
              <Label htmlFor="qtd" className="text-right">
                Quantidade
              </Label>
              <Input
                id="qtd"
                type="number"
                value={newQtd}
                onChange={(e) => setNewQtd(e.target.value)}
                className="col-span-3"
                disabled={editingPeca !== null && !isAdmin}
                title={
                  editingPeca !== null && !isAdmin
                    ? 'Apenas administradores podem alterar a quantidade manualmente.'
                    : ''
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custo" className="text-right">
                Preço Custo
              </Label>
              <Input
                id="custo"
                value={newCusto}
                onChange={handleCurrencyInput(setNewCusto)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venda" className="text-right">
                Preço Venda
              </Label>
              <Input
                id="venda"
                value={newVenda}
                onChange={handleCurrencyInput(setNewVenda)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveManual}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
