import slugify from 'slugify';
interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  includeTime?: boolean;
}

export const formatter = {
  currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  date(date: Date, options?: DateTimeFormatOptions): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Data inválida.';
    }

    const opts: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(!!options?.includeTime && {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...options,
    };

    return new Intl.DateTimeFormat('pt-BR', opts).format(date);
  },

  slug: (name: string) => {
    return slugify(name, {
      replacement: '-',
      lower: true,
      strict: false,
      trim: true,
    });
  },

  phone(value: string): string {
    const onlyNumbers = value.replace(/\D/g, '');

    if (onlyNumbers.length === 11) {
      const ddd = onlyNumbers.slice(0, 2);
      const first = onlyNumbers.slice(2, 7);
      const second = onlyNumbers.slice(7);

      return `(${ddd}) ${first}-${second}`;
    }

    return 'Inválido.';
  },

  brDateToDate(value: string | number | null): Date | null {
    if (!value) return null;

    // 📌 Data vinda do Excel como número
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + value * 86400000);
    }

    // 📌 Data em string: dd/MM/yyyy
    if (typeof value === 'string') {
      const [day, month, year] = value.split('/').map(Number);
      if (!day || !month || !year) return null;
      return new Date(year, month - 1, day);
    }

    return null;
  },

  upper(v?: string) {
    typeof v === 'string' ? v.trim().toUpperCase() : v;
  },

  getAge(value: Date | string | number | null): number | null {
    if (!value) return null;

    let birthDate: Date | null = null;

    if (value instanceof Date) {
      birthDate = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      birthDate = this.brDateToDate(value);
    }

    if (!birthDate || isNaN(birthDate.getTime())) return null;

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  },
};
