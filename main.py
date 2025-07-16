from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, threading
from webui import webui

app = FastAPI()

app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_fastapi():
    uvicorn.run(app, host="127.0.0.1", port=8000)

def main():
    threading.Thread(target=run_fastapi, daemon=True).start()

    webui.set_config(webui.Config.multi_client, True)
    win = webui.Window()
    webui.set_timeout(0)

    win.show_browser("static/index.html", webui.Browser.AnyBrowser)

    webui.wait()

if __name__ == "__main__":
    main()
