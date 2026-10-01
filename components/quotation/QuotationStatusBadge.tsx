'use client';

import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Sent: 'bg-blue-50 text-blue-700 border-blue-200',
  Accepted: 'bg-green-50 text-green-700 border-green-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Expired: 'bg-gray-50 text-gray-600 border-gray-200',
};

export function QuotationStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex px-2 py-0.5 rounded-full text-[9px] font-black border',
      STATUS_COLORS[status] || STATUS_COLORS.Draft
    )}>
      {status}
    </span>
  );
}
