
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

interface MobileTableProps {
  children: ReactNode;
  className?: string;
}

interface MobileTableItemProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const MobileTable = ({ children, className = '' }: MobileTableProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
};

export const MobileTableItem = ({ 
  title, 
  subtitle, 
  status, 
  actions, 
  children, 
  className = '' 
}: MobileTableItemProps) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header section with title, subtitle, and status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base text-gray-900 truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
              )}
            </div>
            {status && (
              <div className="shrink-0">
                {status}
              </div>
            )}
          </div>
          
          {/* Additional content */}
          {children && (
            <div className="space-y-2 text-sm">
              {children}
            </div>
          )}
          
          {/* Actions section */}
          {actions && (
            <div className="pt-2 border-t border-gray-100">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ResponsiveTable = ({ headers, children, className = '' }: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop Table - Show on medium screens and up */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50/80">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Show on small screens */}
      <div className="md:hidden space-y-3">
        {children}
      </div>
    </>
  );
};

// Export ResponsiveTableRow and ResponsiveTableCell for backward compatibility
export const ResponsiveTableRow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <tr className={className}>{children}</tr>
);

export const ResponsiveTableCell = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm text-gray-900 ${className}`}>{children}</td>
);
