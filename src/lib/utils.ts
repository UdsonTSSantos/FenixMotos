import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export const parseCurrency = (value: string) => {
  if (!value) return 0
  const number = Number(value.replace(/[^0-9,-]+/g, '').replace(',', '.'))
  return isNaN(number) ? 0 : number
}

export const formatContractId = (id: string | number | undefined) => {
  if (typeof id === 'number') {
    return id.toString().padStart(6, '0')
  }
  if (!id) return '000000'
  // Fallback for UUIDs or old strings
  if (/^\d+$/.test(id)) {
    return id.padStart(6, '0')
  }
  return id.substring(0, 8).toUpperCase()
}

export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return '-'
  try {
    // Handle "YYYY-MM-DD" explicitly to avoid timezone offset issues (treat as local date)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('pt-BR')
    }

    // Handle ISO strings with time
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('pt-BR')
  } catch (e) {
    return '-'
  }
}
