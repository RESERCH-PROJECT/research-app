import { useState } from "react";

export default function App() {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {

    if (!file) {
      alert("Select a PDF");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = "tables.zip";

      document.body.appendChild(a);

      a.click();

      a.remove();

    } catch (error) {

      console.error(error);

      alert("Upload failed");

    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-slate-900 p-10 rounded-2xl w-[500px]">

        <h1 className="text-3xl font-bold mb-6">
          AI Table Extractor
        </h1>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="mb-6"
        />

        <button
          onClick={uploadFile}
          className="bg-blue-600 px-6 py-3 rounded-xl w-full"
        >
          {
            loading
              ? "Processing..."
              : "Extract Tables"
          }
        </button>

      </div>

    </div>
  );
}
