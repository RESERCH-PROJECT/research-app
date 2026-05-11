import { motion, AnimatePresence } from "framer-motion";
import { XCircle, RefreshCw, X } from "lucide-react";

export default function ErrorModal({ error, onClose, onRetry }) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass max-w-md w-full p-8 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
              <XCircle size={32} />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Processing Failed</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {error || "An unexpected error occurred while processing your document. Please try again."}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRetry}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
