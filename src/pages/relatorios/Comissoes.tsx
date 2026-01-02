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
import { FileText, Printer } from 'lucide-react'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function Comissoes() {
  const { orcamentos, usuarios, empresa } = useData()

  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [printMode, setPrintMode] = useState(false)

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

  const handlePrint = () => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 100)
  }

  const selectedUserName =
    selectedUser === 'all'
      ? 'Todos os Vendedores'
      : usuarios.find((u) => u.id === selectedUser)?.nome || 'Vendedor'

  if (printMode) {
    return (
      <div className="bg-white text-black p-8 min-h-screen font-sans print:p-0 print:m-0 print:w-full">
        <div className="flex items-center gap-4 mb-8 border-b border-black pb-4">
          {empresa.logo && (
            <img
              src={empresa.logo}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold uppercase">{empresa.nome}</h1>
            <p className="text-sm">Extrato de Comissões</p>
          </div>
          <div className="ml-auto text-right text-sm">
            <p>Emissão: {new Date().toLocaleDateString()}</p>
            <p>
              Período:{' '}
              {startDate ? new Date(startDate).toLocaleDateString() : 'Início'}
              {' a '}
              {endDate ? new Date(endDate).toLocaleDateString() : 'Hoje'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold">Vendedor: {selectedUserName}</h2>
        </div>

        <table className="w-full text-sm border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left">Data</th>
              <th className="border border-black p-2 text-left">Orçamento</th>
              <th className="border border-black p-2 text-left">Cliente</th>
              {selectedUser === 'all' && (
                <th className="border border-black p-2 text-left">Vendedor</th>
              )}
              <th className="border border-black p-2 text-right">
                Total Venda
              </th>
              <th className="border border-black p-2 text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td className="border border-black p-2">
                  {new Date(item.data).toLocaleDateString()}
                </td>
                <td className="border border-black p-2">
                  #{item.id.toUpperCase()}
                </td>
                <td className="border border-black p-2">{item.clienteNome}</td>
                {selectedUser === 'all' && (
                  <td className="border border-black p-2">
                    {usuarios.find((u) => u.id === item.vendedorId)?.nome}
                  </td>
                )}
                <td className="border border-black p-2 text-right">
                  {formatCurrency(item.valorTotal)}
                </td>
                <td className="border border-black p-2 text-right">
                  {formatCurrency(item.comissaoVendedor)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td
                colSpan={selectedUser === 'all' ? 4 : 3}
                className="border border-black p-2 text-right"
              >
                TOTAIS
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(totalSales)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(totalCommission)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="text-center text-sm pt-8">
          <p className="border-t border-black w-64 mx-auto pt-2">
            Assinatura do Responsável
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatório de Comissões</h1>
        <Button onClick={handlePrint} variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Gerar Extrato (A4)
        </Button>
      </div>

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
