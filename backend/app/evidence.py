from io import BytesIO
from pathlib import Path
import warnings

from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError

from .config import IMAGE_TYPES, MAX_IMAGE_BYTES

Image.MAX_IMAGE_PIXELS = 20_000_000


def validate_image(data: bytes, mime: str, filename: str):
    if mime not in IMAGE_TYPES:
        raise HTTPException(415, "Please upload a JPEG, PNG, or WebP image.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image exceeds the 10 MB limit.")
    if not data:
        raise HTTPException(422, "Image is empty.")
    allowed = {"image/jpeg": {".jpg", ".jpeg"}, "image/png": {".png"}, "image/webp": {".webp"}}
    if Path(filename).suffix.lower() not in allowed[mime]:
        raise HTTPException(415, "Image extension does not match its content type.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as image:
                if Image.MIME.get(image.format) != mime:
                    raise HTTPException(415, "Image content does not match its content type.")
                image.verify()
            with Image.open(BytesIO(data)) as image:
                image.load()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise HTTPException(422, "Image is damaged, invalid, or too large to decode safely.") from exc
