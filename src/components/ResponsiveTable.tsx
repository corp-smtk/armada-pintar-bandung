
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export const ResponsiveTable = ({ headers, children, className = '' }: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop Table */}
      <div className={`hidden lg:block overflow-x-auto ${className}`}>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-3">
        {children}
      </div>
    </>
  );
};

interface ResponsiveTableRowProps {
  children: ReactNode;
  mobileCard?: ReactNode;
  className?: string;
}

export const ResponsiveTableRow = ({ children, mobileCard, className = '' }: ResponsiveTableRowProps) => {
  return (
    <>
      {/* Desktop Row */}
      <tr className={`hidden lg:table-row hover:bg-gray-50 ${className}`}>
        {children}
      </tr>
      
      {/* Mobile Card */}
      <div className="lg:hidden">
        {mobileCard || (
          <Card>
            <CardContent className="p-4">
              {children}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableCell = ({ children, className = '' }: ResponsiveTableCellProps) => {
  return (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};
