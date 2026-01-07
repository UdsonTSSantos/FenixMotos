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
import { formatCurrency, formatContractId } from '@/lib/utils'
import { FileText, Printer } from 'lucide-react'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function Comissoes() {
  const { ordensServico, vendedores, empresa } = useData()

  const [selectedVendedor, setSelectedVendedor] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [printMode, setPrintMode] = useState<'none' | 'individual' | 'general'>(
    'none',
  )

  // Filter completed OS (assuming commission is paid on completion)
  const completedOS = ordensServico.filter((o) => o.situacao === 'Concluído')

  const filteredData = completedOS.filter((o) => {
    let matchesUser = true
    let matchesDate = true

    if (selectedVendedor !== 'all') {
      matchesUser = o.vendedorId === selectedVendedor
    }

    if (startDate && endDate) {
      const date = parseISO(o.dataEntrada)
      const start = startOfDay(parseISO(startDate))
      const end = endOfDay(parseISO(endDate))
      matchesDate = isWithinInterval(date, { start, end })
    }

    return matchesUser && matchesDate
  })

  // Calculate totals for filtered data
  // Now using the stored comissaoVendedor field from the DB which is accurate per OS
  const totalCommission = filteredData.reduce(
    (acc, curr) => acc + (curr.comissaoVendedor || 0),
    0,
  )

  const totalSales = filteredData.reduce(
    (acc, curr) => acc + curr.valorTotal,
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
    return vendedores
      .map((vend) => {
        // Find OS for this seller within date range
        const osList = completedOS.filter((o) => {
          if (o.vendedorId !== vend.id) return false
          if (startDate && endDate) {
            const date = parseISO(o.dataEntrada)
            const start = startOfDay(parseISO(startDate))
            const end = endOfDay(parseISO(endDate))
            return isWithinInterval(date, { start, end })
          }
          return true
        })

        const sales = osList.reduce((acc, o) => acc + o.valorTotal, 0)
        const comm = osList.reduce(
          (acc, o) => acc + (o.comissaoVendedor || 0),
          0,
        )

        return {
          id: vend.id,
          nome: vend.nome,
          totalSales: sales,
          totalCommission: comm,
          osCount: osList.length,
        }
      })
      .filter((v) => v.totalSales > 0 || v.totalCommission > 0) // Only show active
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

  const selectedVendedorName =
    selectedVendedor === 'all'
      ? 'Todos os Vendedores'
      : vendedores.find((u) => u.id === selectedVendedor)?.nome || 'Vendedor'

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
                ? 'Extrato de Comissões - Individual'
                : 'Relatório Geral de Comissões'}
            </p>
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

        {printMode === 'individual' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Vendedor: {selectedVendedorName}
              </h2>
            </div>

            <table className="w-full text-sm border-collapse border border-black mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">Data</th>
                  <th className="border border-black p-2 text-left">OS</th>
                  <th className="border border-black p-2 text-left">Cliente</th>
                  <th className="border border-black p-2 text-right">
                    Total Venda
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
                      {new Date(item.dataEntrada).toLocaleDateString()}
                    </td>
                    <td className="border border-black p-2">
                      #{formatContractId(item.numeroOS)}
                    </td>
                    <td className="border border-black p-2">
                      {item.clienteNome}
                    </td>
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
                    Qtd. OS
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
                      {sp.osCount}
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
                    {generalReportData.reduce((acc, c) => acc + c.osCount, 0)}
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
        <h1 className="text-3xl font-bold">Relatório de Comissões (OS)</h1>
        <div className="flex gap-2">
          <Button onClick={() => handlePrint('general')} variant="secondary">
            <FileText className="mr-2 h-4 w-4" /> Relatório Geral (Todos)
          </Button>
          <Button
            onClick={() => handlePrint('individual')}
            variant="outline"
            disabled={selectedVendedor === 'all'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendedor</label>
              <Select
                value={selectedVendedor}
                onValueChange={setSelectedVendedor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Vendedores</SelectItem>
                  {vendedores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
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
              Total de Vendas (Geral)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredData.length} ordens de serviço (Concluídas)
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
              Baseado na comissão de peças (3% do valor das peças)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nº OS</TableHead>
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
                vendedores.find((u) => u.id === item.vendedorId)?.nome || '?'
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.dataEntrada).toLocaleDateString()}
                  </TableCell>
                  <TableCell>#{formatContractId(item.numeroOS)}</TableCell>
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
                  colSpan={8}
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
