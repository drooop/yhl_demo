from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

DIST_DIR = Path(__file__).parent / "dist"
ASSETS_DIR = DIST_DIR / "assets"

app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
async def spa_router(full_path: str):
    candidate = DIST_DIR / full_path
    if candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(DIST_DIR / "index.html")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)