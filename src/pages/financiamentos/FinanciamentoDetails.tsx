import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, parseCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  DollarSign,
  User,
  Bike as BikeIcon,
  Printer,
  Edit2,
  FileEdit,
} from 'lucide-react'

export default function FinanciamentoDetails() {
  const { id } = useParams()
  const {
    financiamentos,
    clientes,
    motos,
    registerPayment,
    updateFinanciamento,
  } = useData()

  // Payment Dialog State
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [selectedParcela, setSelectedParcela] = useState<number | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // Edit Parcel Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newParcelValue, setNewParcelValue] = useState('')
  const [editParcelaNumber, setEditParcelaNumber] = useState<number | null>(
    null,
  )

  const financiamento = financiamentos.find((f) => f.id === id)

  if (!financiamento) {
    return <div className="p-8 text-center">Financiamento não encontrado.</div>
  }

  const cliente = clientes.find((c) => c.id === financiamento.clienteId)
  const moto = motos.find((m) => m.id === financiamento.motoId)

  const handlePaymentClick = (parcela: any) => {
    setSelectedParcela(parcela.numero)
    setPaymentAmount(formatCurrency(parcela.valorTotal))
    setPaymentDate(new Date().toISOString().split('T')[0])
    setIsPaymentDialogOpen(true)
  }

  const confirmPayment = () => {
    if (selectedParcela) {
      registerPayment(
        financiamento.id,
        selectedParcela,
        new Date(paymentDate).toISOString(),
        parseCurrency(paymentAmount),
      )
      setIsPaymentDialogOpen(false)
    }
  }

  const handleEditClick = (parcela: any) => {
    setEditParcelaNumber(parcela.numero)
    setNewParcelValue(formatCurrency(parcela.valorOriginal))
    setIsEditDialogOpen(true)
  }

  const confirmEdit = () => {
    if (editParcelaNumber !== null) {
      const newValue = parseCurrency(newParcelValue)
      const updatedParcelas = financiamento.parcelas.map((p) => {
        if (p.numero === editParcelaNumber) {
          return {
            ...p,
            valorOriginal: newValue,
            valorTotal: newValue + p.valorJuros + p.valorMulta,
          }
        }
        return p
      })

      const newTotal =
        updatedParcelas.reduce((acc, p) => acc + p.valorOriginal, 0) +
        financiamento.valorEntrada

      updateFinanciamento(financiamento.id, {
        parcelas: updatedParcelas,
        valorTotal: newTotal,
        valorFinanciado: newTotal - financiamento.valorEntrada,
      })
      setIsEditDialogOpen(false)
    }
  }

  const totalPaid = financiamento.parcelas
    .filter((p) => p.status === 'paga')
    .reduce((acc, p) => acc + p.valorTotal, 0)
  const totalPending = financiamento.parcelas
    .filter((p) => p.status !== 'paga')
    .reduce((acc, p) => acc + p.valorTotal, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/financiamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Contrato #{financiamento.id.toUpperCase()}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/financiamentos/${id}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Editar Contrato
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to={`/financiamentos/${id}/extrato`}>
              <Printer className="mr-2 h-4 w-4" />
              Gerar Extrato
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{cliente?.nome}</div>
            <p className="text-sm text-muted-foreground">{cliente?.cpf}</p>
            <p className="text-sm text-muted-foreground">{cliente?.telefone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículo</CardTitle>
            <BikeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{moto?.modelo}</div>
            <p className="text-sm text-muted-foreground">
              {moto?.fabricante} - {moto?.ano}
            </p>
            <p className="text-sm text-muted-foreground">{moto?.cor}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resumo Financeiro
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span>Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(financiamento.valorTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Pago:</span>
              <span>
                {formatCurrency(totalPaid + financiamento.valorEntrada)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-primary">
              <span>Restante:</span>
              <span>{formatCurrency(totalPending)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Juros/Multa</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financiamento.parcelas.map((parcela) => (
                <TableRow key={parcela.numero}>
                  <TableCell>{parcela.numero}</TableCell>
                  <TableCell>
                    {new Date(parcela.dataVencimento).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatCurrency(parcela.valorOriginal)}</TableCell>
                  <TableCell className="text-red-500 font-medium">
                    {parcela.valorJuros + parcela.valorMulta > 0
                      ? `+ ${formatCurrency(parcela.valorJuros + parcela.valorMulta)}`
                      : '-'}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(parcela.valorTotal)}
                  </TableCell>
                  <TableCell>
                    {parcela.dataPagamento
                      ? new Date(parcela.dataPagamento).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        parcela.status === 'paga'
                          ? 'secondary'
                          : parcela.status === 'atrasada'
                            ? 'destructive'
                            : 'outline'
                      }
                      className={
                        parcela.status === 'paga'
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : ''
                      }
                    >
                      {parcela.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {parcela.status !== 'paga' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(parcela)}
                          title="Editar Valor Individual"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {parcela.status !== 'paga' && (
                        <Button
                          size="sm"
                          onClick={() => handlePaymentClick(parcela)}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registrar Pagamento - Parcela {selectedParcela}
            </DialogTitle>
            <DialogDescription>
              Confirme os dados do pagamento abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <Input
                id="amount"
                value={paymentAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setPaymentAmount(formatCurrency(Number(raw) / 100))
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={confirmPayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parcel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parcela {editParcelaNumber}</DialogTitle>
            <DialogDescription>
              Alterar o valor original desta parcela. Isso recalculará o total.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Novo Valor
              </Label>
              <Input
                id="edit-amount"
                value={newParcelValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setNewParcelValue(formatCurrency(Number(raw) / 100))
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={confirmEdit}>
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
