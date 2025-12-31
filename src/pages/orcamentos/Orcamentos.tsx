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
import { Plus, Search, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function Orcamentos() {
  const { orcamentos, clientes, usuarios } = useData()
  const [filter, setFilter] = useState('')

  const getClienteName = (id: string) =>
    clientes.find((c) => c.id === id)?.nome ||
    orcamentos.find((o) => o.id === id)?.clienteNome ||
    'Desconhecido'
  const getVendedorName = (id: string) =>
    usuarios.find((u) => u.id === id)?.nome || '?'

  const filteredOrcamentos = orcamentos.filter((o) => {
    const cliente = getClienteName(o.clienteId || o.id)
    return cliente.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Button asChild>
          <Link to="/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
          </Link>
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
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
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrcamentos.map((orc) => (
              <TableRow key={orc.id}>
                <TableCell>{new Date(orc.data).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  {orc.clienteNome || getClienteName(orc.clienteId)}
                </TableCell>
                <TableCell>{getVendedorName(orc.vendedorId)}</TableCell>
                <TableCell>{formatCurrency(orc.valorTotal)}</TableCell>
                <TableCell>
                  <Badge
                    variant={orc.status === 'aprovado' ? 'default' : 'outline'}
                  >
                    {orc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/orcamentos/${orc.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrcamentos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhum orçamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
