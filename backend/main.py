from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
import psycopg2
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for local frontend dev and production
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL environment variable is required")

def get_db_conn():
    return psycopg2.connect(DB_URL, sslmode='require')

def init_db():
    """Initialize database and create waitlist table if it doesn't exist"""
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        
        # Create waitlist table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS waitlist (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Failed to initialize database: {e}")

# Initialize database on startup
init_db()

class WaitlistRequest(BaseModel):
    email: EmailStr

@app.post("/api/waitlist")
def add_to_waitlist(req: WaitlistRequest):
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO waitlist (email) VALUES (%s) RETURNING id, email, created_at", (req.email,))
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {"id": row[0], "email": row[1], "created_at": row[2]}
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Email already exists in waitlist")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to add email to waitlist")

@app.get("/health")
def health():
    return {"status": "ok"}

# Serve static files from frontend build
try:
    app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")
except:
    pass  # Frontend build might not exist in development

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the React app for all non-API routes"""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Try to serve static files first
    static_path = f"frontend/dist/{full_path}"
    if os.path.exists(static_path) and os.path.isfile(static_path):
        return FileResponse(static_path)
    
    # Serve index.html for all other routes (SPA routing)
    index_path = "frontend/dist/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="Not found")
