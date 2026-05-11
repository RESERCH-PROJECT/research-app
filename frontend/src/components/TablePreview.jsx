import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Table as TableIcon } from "lucide-react";

export default function TablePreview({ table, onClose }) {
  if (!table) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass max-w-6xl w-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <TableIcon size={20} />
              </div>
              <h3 className="text-xl font-bold">{table.name}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 font-medium border-b border-white/10">
                <tr>
                  {table.columns.map((col, i) => (
                    <th key={i} className="px-4 py-3 bg-white/5 first:rounded-tl-lg last:rounded-tr-lg">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {table.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    {table.columns.map((col, j) => (
                      <td key={j} className="px-4 py-3 text-slate-300">
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
