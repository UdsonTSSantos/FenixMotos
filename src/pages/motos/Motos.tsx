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
import {
  Plus,
  Search,
  Trash2,
  Edit,
  CalendarClock,
  RotateCcw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { parseISO, isSameMonth, isSameYear } from 'date-fns'

export default function Motos() {
  const { motos, deleteMoto, returnToStock } = useData()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const now = new Date()

  const filteredMotos = motos.filter((moto) => {
    const matchesSearch =
      moto.modelo.toLowerCase().includes(filter.toLowerCase()) ||
      moto.fabricante.toLowerCase().includes(filter.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'licenciamento') {
      if (!moto.dataLicenciamento) {
        matchesStatus = false
      } else {
        const licDate = parseISO(moto.dataLicenciamento)
        matchesStatus = isSameMonth(licDate, now) && isSameYear(licDate, now)
      }
    } else if (statusFilter !== 'all') {
      matchesStatus = moto.status === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estoque de Motos</h1>
        <Button asChild>
          <Link to="/motos/nova">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Moto
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo ou fabricante..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="estoque">Em Estoque</SelectItem>
            <SelectItem value="vendida">Vendidas</SelectItem>
            <SelectItem
              value="licenciamento"
              className="text-amber-600 font-medium"
            >
              Licenciamento Mês Atual
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Licenciamento</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMotos.map((moto) => {
              const licDate = moto.dataLicenciamento
                ? parseISO(moto.dataLicenciamento)
                : null
              const isLicensingMonth =
                licDate && isSameMonth(licDate, now) && isSameYear(licDate, now)

              return (
                <TableRow
                  key={moto.id}
                  className={isLicensingMonth ? 'bg-amber-50/50' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {moto.modelo}
                      {isLicensingMonth && (
                        <CalendarClock
                          className="h-4 w-4 text-amber-600"
                          title="Licenciamento este mês"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{moto.fabricante}</TableCell>
                  <TableCell>{moto.ano}</TableCell>
                  <TableCell>
                    {moto.dataLicenciamento
                      ? new Date(moto.dataLicenciamento).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>{moto.placa || '-'}</TableCell>
                  <TableCell>{formatCurrency(moto.valor)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        moto.status === 'estoque' ? 'default' : 'secondary'
                      }
                      className={
                        moto.status === 'estoque'
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : ''
                      }
                    >
                      {moto.status === 'estoque' ? 'Estoque' : 'Vendida'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {moto.status === 'vendida' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Voltar para Estoque"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Retornar ao Estoque?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação mudará o status da moto para
                                "Estoque".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => returnToStock(moto.id)}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/motos/${moto.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={moto.status === 'vendida'}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Moto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá
                              permanentemente a moto do estoque.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMoto(moto.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredMotos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhuma moto encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
