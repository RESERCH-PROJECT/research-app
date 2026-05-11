import os
import shutil
import zipfile
import uvicorn
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from docling.document_converter import DocumentConverter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "input_pdfs"
OUTPUT_FOLDER = "output_tables"

os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

converter = DocumentConverter()

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Clear old files
        shutil.rmtree(INPUT_FOLDER, ignore_errors=True)
        shutil.rmtree(OUTPUT_FOLDER, ignore_errors=True)
        os.makedirs(INPUT_FOLDER, exist_ok=True)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)

        pdf_path = os.path.join(INPUT_FOLDER, file.filename)

        # Save uploaded PDF
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process PDF
        result = converter.convert(pdf_path)
        document = result.document
        tables = document.tables

        paper_name = os.path.splitext(file.filename)[0]
        paper_folder = os.path.join(OUTPUT_FOLDER, paper_name)
        os.makedirs(paper_folder, exist_ok=True)

        tables_data = []
        for i, table in enumerate(tables):
            df = table.export_to_dataframe()
            
            # Save to Excel for ZIP
            output_file = os.path.join(paper_folder, f"table_{i+1}.xlsx")
            df.to_excel(output_file, index=False)
            
            # Prepare data for JSON
            tables_data.append({
                "id": i + 1,
                "name": f"Table {i+1}",
                "columns": df.columns.tolist(),
                "rows": df.to_dict(orient="records")
            })

        # Create ZIP
        zip_path = os.path.join(OUTPUT_FOLDER, "tables.zip")
        with zipfile.ZipFile(zip_path, "w") as zipf:
            for root, dirs, files in os.walk(paper_folder):
                for file_name in files:
                    file_path = os.path.join(root, file_name)
                    zipf.write(file_path, arcname=file_name)

        return {
            "status": "success",
            "filename": file.filename,
            "tables": tables_data
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.get("/download")
async def download_results():
    zip_path = os.path.join(OUTPUT_FOLDER, "tables.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="Results not found. Please upload a file first.")
    
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="tables.zip"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=3000, limit_concurrency=5)
