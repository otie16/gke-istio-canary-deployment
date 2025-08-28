from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import socket

VERSION = os.getenv("APP_VERSION", "v1")
COLOR = os.getenv("APP_COLOR", "#4f46e5")  # indigo-ish by default
MESSAGE = os.getenv("APP_MESSAGE", "Beautiful Canary Python App ✨")

app = FastAPI(title="Beautiful Canary Python App", version=VERSION)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    hostname = socket.gethostname()
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "version": VERSION,
            "hostname": hostname,
            "color": COLOR,
            "message": MESSAGE,
        },
    )

@app.get("/api/info")
async def info():
    return JSONResponse({
        "app": "beautiful-canary-py",
        "version": VERSION,
        "hostname": socket.gethostname(),
        "message": MESSAGE,
    })

@app.get("/healthz")
async def healthz():
    return JSONResponse({"status": "ok"})

@app.get("/readyz")
async def readyz():
    return JSONResponse({"ready": True})
