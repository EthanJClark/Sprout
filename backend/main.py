from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import threading
import time

import gdacs
from sql_database import sync_gdacs

app = FastAPI()
SYNC_INTERVAL_SECONDS = 10 * 60
_stop_sync_event = threading.Event()


# allow react to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect('disasters.db')
    conn.row_factory = sqlite3.Row
    return conn


def _sync_loop():
    while not _stop_sync_event.is_set():
        try:
            feed = gdacs.fetch_gdacs_rss(10)
            sync_gdacs(feed)
        except Exception as exc:
            print(f"Sync failed: {exc}")
        _stop_sync_event.wait(SYNC_INTERVAL_SECONDS)


@app.on_event("startup")
def start_sync_thread():
    thread = threading.Thread(target=_sync_loop, daemon=True)
    thread.start()


@app.on_event("shutdown")
def stop_sync_thread():
    _stop_sync_event.set()


# endpoint 1: fetch entry by ID
# note this will be instant load unlike AI
@app.get("/api/events/{event_id}/")
def get_event_data(event_id: str, contents: str = ""):
    # defaults to frontend-ready fields
    if contents == "":
        contents = (
            "event_id as id, title, category, location, lat, lng, date, "
            "severity_score as severity, status, affected, description, source, source_url"
        )

    # search using id, select desired contents
    db = get_db()
    row = db.execute(
        f"SELECT event_id, {contents} FROM disaster_cache WHERE event_id = ?", (event_id,)
    ).fetchone()

    db.close()

    # if event cannot be found
    if not row:
        raise HTTPException(status_code=404, detail="event not found")
    

    return dict(row)


@app.get("/api/events")
def get_events(limit: int = 20, contents: str = ""):
    # defaults to frontend-ready fields
    
    if contents == "":
        contents = (
            "event_id as id, title, category, location, lat, lng, date, "
            "severity_score as severity, status, affected, description, source, source_url"
        )

    # search using id, select desired contents
    db = get_db()
    rows = db.execute(
        f"SELECT {contents} FROM disaster_cache ORDER BY date DESC LIMIT ?",
        (limit,)
    ).fetchall()

    db.close()

    

    return [dict(r) for r in rows]