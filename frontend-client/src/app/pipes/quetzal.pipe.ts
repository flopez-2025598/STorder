import { Pipe, type PipeTransform } from '@angular/core';

export const QUETZAL_SYMBOL = 'Q';

const quetzalFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Pipe({ name: 'quetzal' })
export class QuetzalPipe implements PipeTransform {
  transform(amount: string): string {
    const [whole = '0', fraction = ''] = amount.split('.');
    // Los importes de la API son decimales exactos. BigInt conserva los totales grandes.
    const parts = quetzalFormatter.formatToParts(BigInt(whole));
    const digits = parts.map(({ type, value }) => {
      if (type === 'integer' || type === 'group' || type === 'decimal') return value;
      if (type === 'fraction') return fraction.padEnd(2, '0');
      return '';
    });
    return QUETZAL_SYMBOL + digits.join('');
  }
}
