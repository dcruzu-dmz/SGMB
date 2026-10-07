import os
import uuid

from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 64 * 1024

# extension normalizada -> (MIME aceptados, chequeo de firma sobre los primeros bytes)
_FORMATS = {
    ".pdf": ({"application/pdf"}, lambda h: h.startswith(b"%PDF")),
    ".jpg": ({"image/jpeg"}, lambda h: h.startswith(b"\xff\xd8\xff")),
    ".png": ({"image/png"}, lambda h: h.startswith(b"\x89PNG\r\n\x1a\n")),
    ".webp": ({"image/webp"}, lambda h: h[:4] == b"RIFF" and h[8:12] == b"WEBP"),
}
_ALIASES = {".jpeg": ".jpg"}

PHOTO_EXTENSIONS = {".jpg", ".png", ".webp"}
REPORT_EXTENSIONS = {".pdf", ".jpg", ".png"}


def save_upload(file: UploadFile, dest_dir: str, allowed: set[str]) -> str:
    """Valida extension, MIME declarado, firma y tamaño, y guarda el archivo
    con un nombre aleatorio. Devuelve el nombre del archivo en disco."""
    extension = os.path.splitext(file.filename or "")[1].lower()
    extension = _ALIASES.get(extension, extension)
    if extension not in allowed:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    mime_types, signature_ok = _FORMATS[extension]
    if file.content_type not in mime_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    head = file.file.read(CHUNK_SIZE)
    if not signature_ok(head):
        raise HTTPException(status_code=400, detail="El contenido no coincide con el tipo de archivo")

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = os.path.join(dest_dir, filename)
    size = 0
    try:
        with open(destination, "wb") as out:
            chunk = head
            while chunk:
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="El archivo supera el límite de 10 MB")
                out.write(chunk)
                chunk = file.file.read(CHUNK_SIZE)
    except BaseException:
        if os.path.exists(destination):
            os.remove(destination)
        raise

    return filename


def remove_upload(dest_dir: str, stored_path: str | None) -> None:
    if not stored_path:
        return
    file_path = os.path.join(dest_dir, os.path.basename(stored_path))
    if os.path.exists(file_path):
        os.remove(file_path)
