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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Search } from 'lucide-react'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function Comissoes() {
  const { orcamentos, usuarios } = useData()

  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter approved quotations
  const approvedOrcamentos = orcamentos.filter((o) => o.status === 'aprovado')

  const filteredData = approvedOrcamentos.filter((o) => {
    let matchesUser = true
    let matchesDate = true

    if (selectedUser !== 'all') {
      matchesUser = o.vendedorId === selectedUser
    }

    if (startDate && endDate) {
      const date = parseISO(o.data)
      const start = startOfDay(parseISO(startDate))
      const end = endOfDay(parseISO(endDate))
      matchesDate = isWithinInterval(date, { start, end })
    }

    return matchesUser && matchesDate
  })

  // Group by seller if 'all' is selected, or just list
  const totalCommission = filteredData.reduce(
    (acc, curr) => acc + curr.comissaoVendedor,
    0,
  )
  const totalSales = filteredData.reduce(
    (acc, curr) => acc + curr.valorTotal,
    0,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatório de Comissões</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendedor</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Vendedores</SelectItem>
                  {usuarios
                    .filter((u) =>
                      ['Vendedor', 'Gerente', 'Administrador'].includes(u.role),
                    )
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              {/* Search button is implicit via reactive state, but could be explicit */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas (Aprovadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredData.length} orçamentos encontrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Comissões a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalCommission)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em 3% Peças + Serviços
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total Peças</TableHead>
              <TableHead>Total Serviços</TableHead>
              <TableHead>Total Geral</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => {
              const vendedor =
                usuarios.find((u) => u.id === item.vendedorId)?.nome || '?'
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.data).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{vendedor}</TableCell>
                  <TableCell>{item.clienteNome}</TableCell>
                  <TableCell>{formatCurrency(item.valorTotalPecas)}</TableCell>
                  <TableCell>
                    {formatCurrency(item.valorTotalServicos)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.valorTotal)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    {formatCurrency(item.comissaoVendedor)}
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhum registro encontrado para o período/vendedor
                  selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
