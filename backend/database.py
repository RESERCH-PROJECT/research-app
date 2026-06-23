import os
import sqlite3
import json

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "extracted_tables.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                columns TEXT NOT NULL,
                rows TEXT NOT NULL,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
            );
        """)
        conn.commit()

def save_document(filename: str, tables_data: list) -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO documents (filename) VALUES (?)", (filename,))
        doc_id = cursor.lastrowid
        for table in tables_data:
            cursor.execute(
                "INSERT INTO tables (document_id, name, columns, rows) VALUES (?, ?, ?, ?)",
                (doc_id, table["name"], json.dumps(table["columns"]), json.dumps(table["rows"]))
            )
        conn.commit()
        return doc_id

def get_all_documents() -> list:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, uploaded_at FROM documents ORDER BY uploaded_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_document_with_tables(doc_id: int) -> dict:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, uploaded_at FROM documents WHERE id = ?", (doc_id,))
        doc_row = cursor.fetchone()
        if not doc_row:
            return None
        
        cursor.execute("SELECT id, name, columns, rows FROM tables WHERE document_id = ?", (doc_id,))
        table_rows = cursor.fetchall()
        
        tables_data = []
        for t in table_rows:
            tables_data.append({
                "id": t["id"],
                "name": t["name"],
                "columns": json.loads(t["columns"]),
                "rows": json.loads(t["rows"])
            })
        
        return {
            "id": doc_row["id"],
            "filename": doc_row["filename"],
            "status": "success",
            "uploaded_at": doc_row["uploaded_at"],
            "tables": tables_data
        }

def delete_document(doc_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        return cursor.rowcount > 0
