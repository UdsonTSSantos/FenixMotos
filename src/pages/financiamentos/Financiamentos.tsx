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
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye } from 'lucide-react'
import { formatCurrency, formatContractId } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Financiamentos() {
  const { financiamentos, clientes, motos } = useData()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getClienteName = (id: string) =>
    clientes.find((c) => c.id === id)?.nome || 'Desconhecido'
  const getMotoModel = (id: string) =>
    motos.find((m) => m.id === id)?.modelo || 'Desconhecida'

  const filteredFinanciamentos = financiamentos.filter((fin) => {
    const clienteName = getClienteName(fin.clienteId).toLowerCase()
    const motoModel = getMotoModel(fin.motoId).toLowerCase()
    // Support searching by new Contract Number if available, or ID
    const contractNum = fin.numeroContrato ? fin.numeroContrato.toString() : ''
    const idMatch = fin.id.includes(filter) || contractNum.includes(filter)

    const searchMatch =
      clienteName.includes(filter.toLowerCase()) ||
      motoModel.includes(filter.toLowerCase()) ||
      idMatch
    const statusMatch = statusFilter === 'all' || fin.status === statusFilter
    return searchMatch && statusMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financiamentos</h1>
        <Button asChild>
          <Link to="/financiamentos/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Contrato
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, moto ou nº contrato..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="quitado">Quitados</SelectItem>
            <SelectItem value="inadimplente">Inadimplentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Moto</TableHead>
              <TableHead>Data Contrato</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFinanciamentos.map((fin) => (
              <TableRow key={fin.id}>
                <TableCell className="font-medium">
                  #{formatContractId(fin.numeroContrato || fin.id)}
                </TableCell>
                <TableCell>{getClienteName(fin.clienteId)}</TableCell>
                <TableCell>{getMotoModel(fin.motoId)}</TableCell>
                <TableCell>
                  {new Date(fin.dataContrato).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatCurrency(fin.valorTotal)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      fin.status === 'ativo'
                        ? 'outline'
                        : fin.status === 'quitado'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className={
                      fin.status === 'ativo'
                        ? 'bg-primary/5 text-primary'
                        : fin.status === 'quitado'
                          ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                          : 'animate-pulse'
                    }
                  >
                    {fin.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/financiamentos/${fin.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredFinanciamentos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhum financiamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
