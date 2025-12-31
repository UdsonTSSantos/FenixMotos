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
import { Plus, Search, Upload, FileDown } from 'lucide-react'
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

export default function Pecas() {
  const { pecas, importPecasXML, addPeca } = useData()
  const [filter, setFilter] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Manual Add State
  const [newCodigo, setNewCodigo] = useState('')
  const [newNome, setNewNome] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newQtd, setNewQtd] = useState('')
  const [newCusto, setNewCusto] = useState('')
  const [newVenda, setNewVenda] = useState('')

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

  const handleAddManual = () => {
    if (!newNome || !newVenda) return

    addPeca({
      codigo: newCodigo || `MAN-${Math.random().toString(36).substr(2, 4)}`,
      nome: newNome,
      descricao: newDesc,
      quantidade: Number(newQtd),
      precoCusto: parseCurrency(newCusto),
      precoVenda: parseCurrency(newVenda),
    })

    setIsAddOpen(false)
    setNewCodigo('')
    setNewNome('')
    setNewDesc('')
    setNewQtd('')
    setNewCusto('')
    setNewVenda('')
  }

  const handleCurrencyInput =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      const number = Number(raw) / 100
      setter(formatCurrency(number))
    }

  const exportToExcel = () => {
    // Generate CSV (Excel compatible)
    // Ensure alphabetical sort
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
      p.precoCusto,
      p.precoVenda,
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
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Acrescentar nova peça manualmente
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPecas.map((peca) => (
              <TableRow key={peca.id}>
                <TableCell className="font-medium">{peca.codigo}</TableCell>
                <TableCell>{peca.nome}</TableCell>
                <TableCell>{peca.descricao}</TableCell>
                <TableCell>{peca.quantidade}</TableCell>
                <TableCell>{formatCurrency(peca.precoVenda)}</TableCell>
              </TableRow>
            ))}
            {filteredPecas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Peça</DialogTitle>
            <DialogDescription>
              Cadastro manual de peça no estoque.
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
            <Button onClick={handleAddManual}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
