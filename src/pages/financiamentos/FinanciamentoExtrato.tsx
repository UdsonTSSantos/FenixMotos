import { useParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatCNPJ, formatContractId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Printer, Instagram, Facebook, Twitter, Video } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function FinanciamentoExtrato() {
  const { id } = useParams()
  const { financiamentos, clientes, motos, empresa } = useData()

  const financiamento = financiamentos.find((f) => f.id === id)

  if (!financiamento) {
    return <div>Financiamento não encontrado.</div>
  }

  const cliente = clientes.find((c) => c.id === financiamento.clienteId)
  const moto = motos.find((m) => m.id === financiamento.motoId)

  const handlePrint = () => {
    window.print()
  }

  const phones = [empresa.telefone, empresa.telefone2, empresa.telefone3]
    .filter(Boolean)
    .join(' | ')

  const valorParcela =
    financiamento.parcelas.length > 0
      ? financiamento.parcelas[0].valorOriginal
      : financiamento.valorFinanciado / financiamento.quantidadeParcelas

  return (
    <div className="bg-white min-h-screen p-8 text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Actions */}
        <div className="flex justify-end print:hidden">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Extrato
          </Button>
        </div>

        {/* Document Header */}
        <div className="border-b-2 border-black pb-4 flex justify-between items-start">
          <div className="flex gap-4">
            {empresa.logo && (
              <img
                src={empresa.logo}
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold uppercase">{empresa.nome}</h1>
              <p className="text-sm">{empresa.endereco}</p>
              <p className="text-sm">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
              <p className="text-sm font-medium mt-1">{phones}</p>
              <p className="text-sm">{empresa.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">EXTRATO FINANCEIRO</h2>
            <p className="text-sm text-gray-600">
              Emissão: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm font-bold mt-2">
              Contrato #{formatContractId(financiamento.id)}
            </p>
          </div>
        </div>

        {/* Client & Vehicle Info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold border-b border-black mb-2 pb-1">
              DADOS DO CLIENTE
            </h3>
            <p>
              <strong>Nome:</strong> {cliente?.nome}
            </p>
            <p>
              <strong>CPF:</strong> {cliente?.cpf}
            </p>
            <p>
              <strong>Telefone:</strong> {cliente?.telefone}
            </p>
            <p>
              <strong>Endereço:</strong> {cliente?.endereco}, {cliente?.cidade}{' '}
              - {cliente?.estado}
            </p>
          </div>
          <div>
            <h3 className="font-bold border-b border-black mb-2 pb-1">
              DADOS DO VEÍCULO
            </h3>
            <p>
              <strong>Modelo:</strong> {moto?.modelo}
            </p>
            <p>
              <strong>Fabricante:</strong> {moto?.fabricante}
            </p>
            <p>
              <strong>Ano/Cor:</strong> {moto?.ano} / {moto?.cor}
            </p>
            <p>
              <strong>Placa:</strong> {moto?.placa || 'N/A'}
            </p>
            <p>
              <strong>Licenciamento:</strong>{' '}
              {moto?.dataLicenciamento
                ? new Date(moto.dataLicenciamento).toLocaleDateString()
                : 'N/A'}
            </p>
            {moto?.chassis && (
              <p>
                <strong>Chassi:</strong> {moto.chassis}
              </p>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-100 p-4 rounded border border-gray-300">
          <h3 className="font-bold mb-2">RESUMO DO CONTRATO</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">Valor Total</span>
              <span className="font-bold">
                {formatCurrency(financiamento.valorTotal)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Entrada</span>
              <span className="font-bold">
                {formatCurrency(financiamento.valorEntrada)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Financiado</span>
              <span className="font-bold">
                {formatCurrency(financiamento.valorFinanciado)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Status</span>
              <span className="font-bold uppercase">
                {financiamento.status}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 border-t border-gray-300 pt-4">
            <div>
              <span className="block text-gray-500">Valor da Parcela</span>
              <span className="font-bold">{formatCurrency(valorParcela)}</span>
            </div>
            <div>
              <span className="block text-gray-500">Taxa Juros (Atraso)</span>
              <span className="font-bold">
                {financiamento.taxaJurosAtraso}% a.d.
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Multa (Atraso)</span>
              <span className="font-bold">
                {formatCurrency(financiamento.valorMultaAtraso)}
              </span>
            </div>
            {financiamento.taxaFinanciamento !== undefined && (
              <div>
                <span className="block text-gray-500">Taxa Financiamento</span>
                <span className="font-bold">
                  {financiamento.taxaFinanciamento}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Installments Table */}
        <div>
          <h3 className="font-bold border-b border-black mb-4 pb-1">
            DETALHAMENTO DAS PARCELAS
          </h3>
          <Table className="border border-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-black font-bold">Nº</TableHead>
                <TableHead className="text-black font-bold">
                  Vencimento
                </TableHead>
                <TableHead className="text-black font-bold">
                  Pagamento
                </TableHead>
                <TableHead className="text-black font-bold">Valor</TableHead>
                <TableHead className="text-black font-bold">Encargos</TableHead>
                <TableHead className="text-black font-bold">Total</TableHead>
                <TableHead className="text-black font-bold text-right">
                  Situação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financiamento.parcelas.map((p) => (
                <TableRow key={p.numero}>
                  <TableCell>{p.numero}</TableCell>
                  <TableCell>
                    {new Date(p.dataVencimento).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {p.dataPagamento
                      ? new Date(p.dataPagamento).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>{formatCurrency(p.valorOriginal)}</TableCell>
                  <TableCell>
                    {p.valorJuros + p.valorMulta > 0
                      ? formatCurrency(p.valorJuros + p.valorMulta)
                      : '-'}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(p.valorTotal)}
                  </TableCell>
                  <TableCell className="text-right uppercase text-xs font-bold">
                    {p.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500 pt-4 border-t">
          <div className="flex justify-center flex-wrap gap-6 mb-2 font-medium">
            {empresa.website && <span>{empresa.website}</span>}
            {empresa.instagram && (
              <span className="flex items-center gap-1">
                <Instagram className="h-3 w-3" />{' '}
                {empresa.instagram.split('/').pop()}
              </span>
            )}
            {empresa.facebook && (
              <span className="flex items-center gap-1">
                <Facebook className="h-3 w-3" />{' '}
                {empresa.facebook.split('/').pop()}
              </span>
            )}
            {empresa.x && (
              <span className="flex items-center gap-1">
                <Twitter className="h-3 w-3" /> {empresa.x.split('/').pop()}
              </span>
            )}
            {empresa.tiktok && (
              <span className="flex items-center gap-1">
                <Video className="h-3 w-3" /> {empresa.tiktok.split('/').pop()}
              </span>
            )}
          </div>
          <p>Documento gerado automaticamente pelo sistema MotoFin.</p>
        </div>
      </div>
    </div>
  )
}
