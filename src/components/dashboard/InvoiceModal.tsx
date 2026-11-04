import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
import { fmtDate } from '../../lib/format';

export interface InvoiceData {
  number: string;
  date: string;
  customer: { name: string; country?: string };
  lines: { description: string; detail?: string; amountUsd: number }[];
  paymentMethod: string;
  status: string;
}

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Printable invoice (browser "Print" → save as PDF). */
export const InvoiceModal: React.FC<{ invoice: InvoiceData; onClose: () => void }> = ({ invoice, onClose }) => {
  const total = invoice.lines.reduce((a, l) => a + l.amountUsd, 0);
  // Portal: parents use CSS transforms (animate-*), which would trap a fixed overlay
  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static" dir="rtl" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="print-area bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl print:shadow-none print:max-h-none print:rounded-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
          <h3 className="text-base font-black text-slate-900">الفاتورة</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-brand-ink text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-4 h-4" />طباعة / حفظ PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-8 space-y-8 text-slate-800">
          <div className="flex items-start justify-between gap-6">
            <div>
              <img src="/assets/aistudio/qeemavoice_logo_5d0c91ae.png" alt="قيمة فويس" className="h-10 mb-2" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <p className="text-sm font-black text-slate-900">قيمة فويس | Qeema Voice</p>
              <p className="text-xs text-slate-500">Qeema Digital Production</p>
              <p className="text-xs text-slate-500" dir="ltr">info@qeemavoice.com</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900">فاتورة</p>
              <p className="text-xs text-slate-500 mt-1">رقم الفاتورة: <span className="font-mono font-bold text-slate-800">{invoice.number}</span></p>
              <p className="text-xs text-slate-500">التاريخ: <span className="font-mono font-bold text-slate-800">{fmtDate(invoice.date)}</span></p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-xs">
            <p className="text-slate-500 mb-1">فاتورة إلى</p>
            <p className="font-black text-slate-900 text-sm">{invoice.customer.name}</p>
            {invoice.customer.country && <p className="text-slate-500">{invoice.customer.country}</p>}
          </div>

          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="py-2 font-black">البيان</th>
                <th className="py-2 font-black text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{l.description}</p>
                    {l.detail && <p className="text-slate-500 mt-0.5">{l.detail}</p>}
                  </td>
                  <td className="py-3 text-left font-mono font-bold">{money(l.amountUsd)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 font-black text-slate-900 text-sm">الإجمالي (USD)</td>
                <td className="pt-4 text-left font-mono font-black text-slate-900 text-lg">{money(total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
            <span className="text-slate-500">طريقة الدفع: <b className="text-slate-800">{invoice.paymentMethod}</b></span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">{invoice.status}</span>
          </div>
          <p className="text-[11px] text-slate-400 text-center">شكراً لاختيارك قيمة فويس. هذه فاتورة إلكترونية صادرة من المنصة.</p>
        </div>
      </div>
    </div>,
    document.body
  );
};
