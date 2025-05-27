import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface TableRow {
  [key: string]: string | number | boolean | Date | null;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const { format } = widget.configuration;
  const data = (widget.data || []) as TableRow[];

  const formatValue = (value: any, columnFormat?: typeof format) => {
    if (!columnFormat) return value;

    const { type, options } = columnFormat;
    if (typeof value !== 'number') return value;

    switch (type) {
      case 'number':
        return new Intl.NumberFormat('pt-BR', options).format(value);
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          ...options
        }).format(value);
      case 'percentage':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
          ...options
        }).format(value / 100);
      case 'date':
        return new Intl.DateTimeFormat('pt-BR', options).format(new Date(value));
      default:
        return value;
    }
  };

  if (!data.length) {
    return (
      <div className="h-full w-full p-4">
        <WidgetHeader
          title={widget.title}
          isEditing={isEditing}
          onRefresh={onRefresh}
        />
        <div className="flex items-center justify-center h-[calc(100%-40px)] text-gray-500">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: TableRow, index: number) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {formatValue(row[column], widget.configuration.columns?.[column]?.format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 