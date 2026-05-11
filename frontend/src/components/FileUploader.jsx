import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Play, CheckCircle2 } from "lucide-react";

export default function FileUploader({ onFileSelect, onDemo, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group cursor-pointer`}
      >
        <div
          className={`
            glass p-12 rounded-[2rem] border-2 border-dashed transition-all duration-500
            ${dragActive ? "border-blue-500 bg-blue-500/5 scale-[1.02]" : "border-white/10 hover:border-white/20"}
            flex flex-col items-center text-center
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-blue-500">
            <Upload size={32} />
          </div>

          <h3 className="text-2xl font-bold mb-2">Extract Tables from PDF</h3>
          <p className="text-slate-400 mb-8 max-w-sm">
            Drag and drop your document here, or click to browse. Supported format: PDF
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            className="hidden"
          />

          <button className="btn-primary">
            Select Document
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600/10 blur-3xl rounded-full -z-10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-600/10 blur-3xl rounded-full -z-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 text-sm"
      >
        <span className="text-slate-500">Don't have a file?</span>
        <button 
          onClick={onDemo}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <Play size={14} fill="currentColor" />
          Try Demo Flow
        </button>
      </motion.div>
    </div>
  );
}
