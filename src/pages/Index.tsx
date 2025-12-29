import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { Bike, DollarSign, FileText, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  const { motos, financiamentos } = useData()

  // Metrics
  const stockCount = motos.filter((m) => m.status === 'estoque').length
  const activeContracts = financiamentos.filter(
    (f) => f.status === 'ativo',
  ).length

  // Calculate overdue installments
  let overdueCount = 0
  financiamentos.forEach((f) => {
    overdueCount += f.parcelas.filter((p) => p.status === 'atrasada').length
  })

  // Sales this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const salesThisMonth = financiamentos.filter((f) => {
    const d = new Date(f.dataContrato)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  // Chart Data
  const chartData = [
    { name: 'Estoque', value: stockCount, fill: 'hsl(var(--primary))' },
    {
      name: 'Vendas (Mês)',
      value: salesThisMonth,
      fill: 'hsl(var(--chart-2))',
    },
  ]

  // Recent Activity (Last 5 financiamentos)
  const recentSales = [...financiamentos]
    .sort(
      (a, b) =>
        new Date(b.dataContrato).getTime() - new Date(a.dataContrato).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Motos em Estoque
            </CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockCount}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para venda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesThisMonth}</div>
            <p className="text-xs text-muted-foreground">Contratos iniciados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Parcelas Atrasadas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {new Date(sale.dataContrato).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.valorTotal)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sale.status === 'ativo'
                            ? 'outline'
                            : sale.status === 'quitado'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentSales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      Nenhuma venda recente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
