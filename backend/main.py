import os
import shutil
import zipfile
import uvicorn
import pandas as pd

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

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


@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    # Clear old files
    shutil.rmtree(
        INPUT_FOLDER,
        ignore_errors=True
    )

    shutil.rmtree(
        OUTPUT_FOLDER,
        ignore_errors=True
    )

    os.makedirs(INPUT_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    pdf_path = os.path.join(
        INPUT_FOLDER,
        file.filename
    )

    # Save uploaded PDF
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Process PDF
    result = converter.convert(pdf_path)

    document = result.document

    tables = document.tables

    paper_name = os.path.splitext(
        file.filename
    )[0]

    paper_folder = os.path.join(
        OUTPUT_FOLDER,
        paper_name
    )

    os.makedirs(
        paper_folder,
        exist_ok=True
    )

    for i, table in enumerate(tables):

        df = table.export_to_dataframe()

        output_file = os.path.join(
            paper_folder,
            f"table_{i+1}.xlsx"
        )

        df.to_excel(
            output_file,
            index=False
        )

    # Create ZIP
    zip_path = os.path.join(
        OUTPUT_FOLDER,
        "tables.zip"
    )

    with zipfile.ZipFile(
        zip_path,
        "w"
    ) as zipf:

        for root, dirs, files in os.walk(
            paper_folder
        ):

            for file_name in files:

                file_path = os.path.join(
                    root,
                    file_name
                )

                zipf.write(
                    file_path,
                    arcname=file_name
                )

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="tables.zip"
    )
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
