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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { FileText, Printer } from 'lucide-react'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function Comissoes() {
  const { orcamentos, usuarios, empresa } = useData()

  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [segment, setSegment] = useState<'all' | 'pecas' | 'servicos'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [printMode, setPrintMode] = useState<'none' | 'individual' | 'general'>(
    'none',
  )

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

  // Calculate commission for a specific budget based on selected segment
  const calculateBudgetCommission = (
    budget: (typeof approvedOrcamentos)[0],
    seg: typeof segment,
  ) => {
    // Only count items that match segment
    const items = budget.itens || []

    return items.reduce((acc, item) => {
      if (seg === 'pecas' && item.tipo !== 'peca') return acc
      if (seg === 'servicos' && item.tipo !== 'servico') return acc

      // Use the commission value stored on the item * quantity
      return acc + item.comissaoUnitario * item.quantidade
    }, 0)
  }

  // Calculate sales total for a specific budget based on segment
  const calculateBudgetSalesTotal = (
    budget: (typeof approvedOrcamentos)[0],
    seg: typeof segment,
  ) => {
    if (seg === 'pecas') return budget.valorTotalPecas
    if (seg === 'servicos') return budget.valorTotalServicos
    return budget.valorTotal
  }

  // Calculate global totals for filtered data
  const totalCommission = filteredData.reduce(
    (acc, curr) => acc + calculateBudgetCommission(curr, segment),
    0,
  )

  const totalSales = filteredData.reduce(
    (acc, curr) => acc + calculateBudgetSalesTotal(curr, segment),
    0,
  )

  const handlePrint = (mode: 'individual' | 'general') => {
    setPrintMode(mode)
    setTimeout(() => {
      window.print()
      setPrintMode('none')
    }, 100)
  }

  const getGeneralReportData = () => {
    // Group by Salesperson
    const salesPeople = usuarios.filter((u) =>
      ['Vendedor', 'Gerente', 'Administrador'].includes(u.role),
    )

    return salesPeople
      .map((sp) => {
        // Find budgets for this salesperson within date range
        const budgets = approvedOrcamentos.filter((o) => {
          if (o.vendedorId !== sp.id) return false
          if (startDate && endDate) {
            const date = parseISO(o.data)
            const start = startOfDay(parseISO(startDate))
            const end = endOfDay(parseISO(endDate))
            return isWithinInterval(date, { start, end })
          }
          return true
        })

        const sales = budgets.reduce(
          (acc, b) => acc + calculateBudgetSalesTotal(b, segment),
          0,
        )
        const comm = budgets.reduce(
          (acc, b) => acc + calculateBudgetCommission(b, segment),
          0,
        )

        return {
          id: sp.id,
          nome: sp.nome,
          totalSales: sales,
          totalCommission: comm,
          budgetCount: budgets.length,
        }
      })
      .filter((sp) => sp.totalSales > 0) // Only show active
  }

  const generalReportData = getGeneralReportData()
  const generalTotalSales = generalReportData.reduce(
    (acc, curr) => acc + curr.totalSales,
    0,
  )
  const generalTotalCommission = generalReportData.reduce(
    (acc, curr) => acc + curr.totalCommission,
    0,
  )

  const selectedUserName =
    selectedUser === 'all'
      ? 'Todos os Vendedores'
      : usuarios.find((u) => u.id === selectedUser)?.nome || 'Vendedor'

  const segmentTitle =
    segment === 'pecas'
      ? 'Somente Peças'
      : segment === 'servicos'
        ? 'Somente Serviços'
        : 'Geral (Peças + Serviços)'

  if (printMode !== 'none') {
    return (
      <div className="bg-white text-black p-8 min-h-screen font-sans print:p-0 print:m-0 print:w-full">
        {/* Header */}
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
            <p className="text-sm">
              {printMode === 'individual'
                ? 'Relatório Individual de Comissões'
                : 'Relatório Geral de Comissões'}
            </p>
          </div>
          <div className="ml-auto text-right text-sm">
            <p>Emissão: {new Date().toLocaleDateString()}</p>
            <p>Tipo: {segmentTitle}</p>
            <p>
              Período:{' '}
              {startDate ? new Date(startDate).toLocaleDateString() : 'Início'}
              {' a '}
              {endDate ? new Date(endDate).toLocaleDateString() : 'Hoje'}
            </p>
          </div>
        </div>

        {printMode === 'individual' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Vendedor: {selectedUserName}
              </h2>
            </div>

            <table className="w-full text-sm border-collapse border border-black mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Data</th>
                  <th className="border border-black p-2 text-left">
                    Orçamento
                  </th>
                  <th className="border border-black p-2 text-left">Cliente</th>
                  <th className="border border-black p-2 text-right">
                    Total Venda ({segment === 'all' ? 'Geral' : segment})
                  </th>
                  <th className="border border-black p-2 text-right">
                    Comissão
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-black p-2">
                      {new Date(item.data).toLocaleDateString()}
                    </td>
                    <td className="border border-black p-2">
                      #{item.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="border border-black p-2">
                      {item.clienteNome}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(calculateBudgetSalesTotal(item, segment))}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(calculateBudgetCommission(item, segment))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td
                    colSpan={3}
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
          </>
        )}

        {printMode === 'general' && (
          <>
            <table className="w-full text-sm border-collapse border border-black mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">
                    Vendedor
                  </th>
                  <th className="border border-black p-2 text-center">
                    Qtd. Orçamentos
                  </th>
                  <th className="border border-black p-2 text-right">
                    Total Vendas
                  </th>
                  <th className="border border-black p-2 text-right">
                    Total Comissões
                  </th>
                </tr>
              </thead>
              <tbody>
                {generalReportData.map((sp) => (
                  <tr key={sp.id}>
                    <td className="border border-black p-2 font-medium">
                      {sp.nome}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {sp.budgetCount}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(sp.totalSales)}
                    </td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(sp.totalCommission)}
                    </td>
                  </tr>
                ))}
                {generalReportData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-black p-4 text-center"
                    >
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-black p-2 text-right">TOTAIS</td>
                  <td className="border border-black p-2 text-center">
                    {generalReportData.reduce(
                      (acc, c) => acc + c.budgetCount,
                      0,
                    )}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {formatCurrency(generalTotalSales)}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {formatCurrency(generalTotalCommission)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}

        <div className="text-center text-sm pt-8 mt-12">
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
        <div className="flex gap-2">
          <Button onClick={() => handlePrint('general')} variant="secondary">
            <FileText className="mr-2 h-4 w-4" /> Relatório Geral (Todos)
          </Button>
          <Button
            onClick={() => handlePrint('individual')}
            variant="outline"
            disabled={selectedUser === 'all'}
          >
            <Printer className="mr-2 h-4 w-4" /> Relatório Individual
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Segmento de Comissão</label>
            <Tabs
              value={segment}
              onValueChange={(v) => setSegment(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">Geral</TabsTrigger>
                <TabsTrigger value="pecas">Somente Peças</TabsTrigger>
                <TabsTrigger value="servicos">Somente Serviços</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas ({segment === 'all' ? 'Geral' : segment})
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
              {segment === 'pecas'
                ? 'Baseado na comissão de peças (3% padrão)'
                : segment === 'servicos'
                  ? 'Baseado na comissão de serviços'
                  : 'Soma de Peças + Serviços'}
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
              {segment === 'all' && <TableHead>Total Peças</TableHead>}
              {segment === 'all' && <TableHead>Total Serviços</TableHead>}
              <TableHead>
                Total {segment === 'all' ? 'Geral' : 'Venda'}
              </TableHead>
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
                  {segment === 'all' && (
                    <TableCell>
                      {formatCurrency(item.valorTotalPecas)}
                    </TableCell>
                  )}
                  {segment === 'all' && (
                    <TableCell>
                      {formatCurrency(item.valorTotalServicos)}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {formatCurrency(calculateBudgetSalesTotal(item, segment))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    {formatCurrency(calculateBudgetCommission(item, segment))}
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={segment === 'all' ? 7 : 5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhum registro encontrado para o filtro selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
