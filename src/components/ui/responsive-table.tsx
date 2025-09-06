import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface Column {
  key: string;
  label: string;
  width?: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable({ 
  columns, 
  data, 
  onRowClick, 
  emptyMessage = 'Nenhum item encontrado.',
  className = '' 
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <Table className="w-full min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`
                    px-4 py-3 
                    ${column.width || ''}
                    ${column.hideOnMobile ? 'hidden md:table-cell' : ''}
                    ${column.hideOnTablet ? 'hidden lg:table-cell' : ''}
                    ${column.className || ''}
                  `}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={row.id || index}
                className={`
                  hover:bg-gray-50 transition-colors duration-200
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.key}
                    className={`
                      px-4 py-3
                      ${column.hideOnMobile ? 'hidden md:table-cell' : ''}
                      ${column.hideOnTablet ? 'hidden lg:table-cell' : ''}
                      ${column.className || ''}
                    `}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}