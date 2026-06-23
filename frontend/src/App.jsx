import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Table as TableIcon, ArrowLeft, ExternalLink, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
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
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

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
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = async (docId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${docId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }
      const data = await response.json();
      setFile({ name: data.filename });
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (e, docId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this extraction history?")) return;
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        if (results && results.id === docId) {
          reset();
        }
        fetchHistory();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert(`Error deleting: ${err.message}`);
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
    if (results && results.id) {
      window.location.href = `/api/download?doc_id=${results.id}`;
    } else {
      window.location.href = "/api/download";
    }
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
              className="space-y-12"
            >
              <FileUploader 
                onFileSelect={handleUpload} 
                onDemo={handleDemo}
                loading={loading}
              />

              {history && history.length > 0 && (
                <div className="w-full max-w-2xl mx-auto glass p-8 rounded-[2rem] border border-white/10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Previous Extractions</h3>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{history.length} items</span>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => handleLoadHistory(doc.id)}
                        className="py-4 flex justify-between items-center cursor-pointer hover:bg-white/5 px-4 rounded-xl transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors line-clamp-1">{doc.filename}</p>
                            <p className="text-xs text-slate-500">{new Date(doc.uploaded_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(e, doc.id)}
                          className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Extraction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
