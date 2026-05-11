import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Table as TableIcon, ArrowLeft, ExternalLink, FileSpreadsheet } from "lucide-react";
import FileUploader from "./components/FileUploader";
import Loader from "./components/Loader";
import ErrorModal from "./components/ErrorModal";
import TablePreview from "./components/TablePreview";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setResults({
        filename: "demo_research_paper.pdf",
        tables: [
          {
            id: 1,
            name: "Table 1: Population Statistics",
            columns: ["Region", "Population (M)", "Growth Rate (%)", "Density"],
            rows: [
              { "Region": "North America", "Population (M)": 592, "Growth Rate (%)": 0.8, "Density": "20/km²" },
              { "Region": "Europe", "Population (M)": 746, "Growth Rate (%)": 0.1, "Density": "34/km²" },
              { "Region": "Asia", "Population (M)": 4723, "Growth Rate (%)": 0.9, "Density": "150/km²" },
              { "Region": "Africa", "Population (M)": 1393, "Growth Rate (%)": 2.5, "Density": "45/km²" }
            ]
          },
          {
            id: 2,
            name: "Table 2: Economic Indicators",
            columns: ["Country", "GDP (B)", "Inflation", "Unemployment"],
            rows: [
              { "Country": "USA", "GDP (B)": 25462, "Inflation": "3.4%", "Unemployment": "3.7%" },
              { "Country": "China", "GDP (B)": 17963, "Inflation": "0.7%", "Unemployment": "5.1%" },
              { "Country": "Germany", "GDP (B)": 4072, "Inflation": "2.2%", "Unemployment": "3.2%" }
            ]
          }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const handleDownloadAll = () => {
    window.location.href = "/api/download";
  };

  const reset = () => {
    setResults(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <TableIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Table Extractor</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Research Assistant</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!results && !loading && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FileUploader 
                onFileSelect={handleUpload} 
                onDemo={handleDemo}
                loading={loading}
              />
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20"
            >
              <Loader message={file ? `Processing ${file.name}...` : "Loading Demo Data..."} />
            </motion.div>
          )}

          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Results Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass p-8 rounded-3xl">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <CheckCircleIcon size={16} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Extraction Complete</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{results.filename}</h2>
                  <p className="text-slate-400">Found {results.tables.length} tables in the document</p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={reset} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Start Over
                  </button>
                  <button onClick={handleDownloadAll} className="btn-primary flex items-center gap-2">
                    <Download size={18} />
                    Download All (ZIP)
                  </button>
                </div>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.tables.map((table) => (
                  <motion.div
                    key={table.id}
                    whileHover={{ y: -5 }}
                    className="glass p-6 rounded-2xl group flex flex-col h-full"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors mb-4">
                      <FileSpreadsheet size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{table.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {table.rows.length} rows • {table.columns.length} columns
                    </p>
                    
                    <div className="mt-auto">
                      <button 
                        onClick={() => setSelectedTable(table)}
                        className="w-full btn-secondary py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink size={14} />
                        Preview Table
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <ErrorModal 
        error={error} 
        onClose={() => setError(null)} 
        onRetry={() => { setError(null); setResults(null); }} 
      />
      
      <TablePreview 
        table={selectedTable} 
        onClose={() => setSelectedTable(null)} 
      />

      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2026 AI Table Extractor. All rights reserved.</p>
      </footer>
    </div>
  );
}

function CheckCircleIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
