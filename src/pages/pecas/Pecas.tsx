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
import { Plus, Search, Upload } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
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
  const { pecas, importPecasXML } = useData()
  const [filter, setFilter] = useState('')
  const [isImportOpen, setIsImportOpen] = useState(false)

  const filteredPecas = pecas.filter(
    (p) =>
      p.nome.toLowerCase().includes(filter.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filter.toLowerCase()),
  )

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estoque de Peças</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Importar XML
          </Button>
          {/* Add Peca Button could go here if manual entry is needed */}
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
    </div>
  )
}
