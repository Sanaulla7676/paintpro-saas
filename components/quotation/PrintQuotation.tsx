'use client';

import { Printer } from 'lucide-react';

interface PrintQuotationProps {
  quotation: Record<string, any>;
  profile: Record<string, any> | null;
  rooms: any[];
  items: any[];
}

export function PrintQuotation({ quotation: q, profile, rooms, items }: PrintQuotationProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      onClick={handlePrint}
      className="h-10 px-4 rounded-xl font-bold text-sm text-white flex items-center gap-1.5"
      style={{ background: '#1f2528' }}
    >
      <Printer size={14} /> Print / PDF
    </button>
  );
}
