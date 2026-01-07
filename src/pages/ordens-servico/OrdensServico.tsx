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
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatContractId } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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

export default function OrdensServico() {
  const { ordensServico, usuarios, deleteOrdemServico } = useData()
  const [filter, setFilter] = useState('')

  const getVendedorName = (id: string) =>
    usuarios.find((u) => u.id === id)?.nome || '?'

  const filteredOS = ordensServico.filter((os) => {
    return (
      os.clienteNome.toLowerCase().includes(filter.toLowerCase()) ||
      os.numeroOS.toString().includes(filter) ||
      (os.motoPlaca &&
        os.motoPlaca.toLowerCase().includes(filter.toLowerCase()))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Button asChild>
          <Link to="/ordens-servico/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova OS
          </Link>
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, nº OS ou placa..."
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
              <TableHead>Nº OS</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOS.map((os) => (
              <TableRow key={os.id}>
                <TableCell className="font-mono font-bold">
                  #{formatContractId(os.numeroOS)}
                </TableCell>
                <TableCell>
                  {new Date(os.dataEntrada).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{os.clienteNome}</TableCell>
                <TableCell>
                  {os.motoModelo} {os.motoPlaca ? `(${os.motoPlaca})` : ''}
                </TableCell>
                <TableCell>{getVendedorName(os.vendedorId)}</TableCell>
                <TableCell>{formatCurrency(os.valorTotal)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      os.situacao === 'Concluído' ? 'default' : 'outline'
                    }
                    className={
                      os.situacao === 'Concluído'
                        ? 'bg-emerald-600'
                        : os.situacao === 'Cancelado'
                          ? 'bg-destructive text-destructive-foreground hover:bg-destructive'
                          : ''
                    }
                  >
                    {os.situacao}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/ordens-servico/${os.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir Ordem de Serviço?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOrdemServico(os.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOS.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
