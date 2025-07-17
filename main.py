from fastapi import FastAPI, HTTPException, Depends, Request, Form, BackgroundTasks, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import json
import asyncio
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any, Union
import sqlite3
import redis
import docker
import openai
from pydantic import BaseModel, EmailStr
import os
from pathlib import Path
import subprocess
import threading
import logging
import bcrypt
import jwt
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT Secret
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Initialize FastAPI app
app = FastAPI(title="API Maker Engine", version="2.0.0", description="Build and deploy APIs instantly")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static and templates directories if they don't exist
Path("static").mkdir(exist_ok=True)
Path("templates").mkdir(exist_ok=True)
Path("data").mkdir(exist_ok=True)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Security
security = HTTPBearer(auto_error=False)

# Initialize Redis (for rate limiting and caching)
try:
    redis_client = redis.Redis(host='redis' if os.getenv('DOCKER_ENV') else 'localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    logger.info("Redis connected successfully")
except:
    logger.warning("Redis not available, using in-memory storage")
    redis_client = None

# Initialize Docker client
try:
    docker_client = docker.from_env()
except:
    logger.warning("Docker not available")
    docker_client = None

# Database setup
def init_db():
    conn = sqlite3.connect('data/api_maker.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # APIs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS apis (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            endpoint TEXT UNIQUE NOT NULL,
            description TEXT,
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            is_public BOOLEAN DEFAULT FALSE,
            api_key TEXT,
            rate_limit_requests INTEGER DEFAULT 1000,
            rate_limit_period TEXT DEFAULT 'day',
            pricing_model TEXT DEFAULT 'free',
            price_per_request REAL DEFAULT 0.0,
            status TEXT DEFAULT 'draft',
            container_id TEXT,
            port INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # API Parameters table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_parameters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            required BOOLEAN DEFAULT FALSE,
            description TEXT,
            FOREIGN KEY (api_id) REFERENCES apis (id)
        )
    ''')
    
    # API Requests table (for analytics)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_id TEXT NOT NULL,
            user_id TEXT,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER,
            response_time REAL,
            ip_address TEXT,
            user_agent TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (api_id) REFERENCES apis (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Rate limiting table (for individual API rate limits)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_id TEXT NOT NULL,
            ip_address TEXT,
            user_id TEXT,
            request_count INTEGER DEFAULT 0,
            window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (api_id) REFERENCES apis (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # API Settings table (for per-API configurations)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_settings (
            api_id TEXT PRIMARY KEY,
            max_requests_per_hour INTEGER DEFAULT 1000,
            max_requests_per_day INTEGER DEFAULT 10000,
            max_requests_per_month INTEGER DEFAULT 100000,
            requires_auth BOOLEAN DEFAULT FALSE,
            allowed_origins TEXT DEFAULT '*',
            webhook_url TEXT,
            FOREIGN KEY (api_id) REFERENCES apis (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str]
    is_active: bool
    created_at: str

class APIParameter(BaseModel):
    name: str
    type: str
    required: bool = False
    description: str = ""

class APISettings(BaseModel):
    max_requests_per_hour: int = 1000
    max_requests_per_day: int = 10000
    max_requests_per_month: int = 100000
    requires_auth: bool = False
    allowed_origins: str = "*"
    webhook_url: Optional[str] = None

class APICreate(BaseModel):
    name: str
    endpoint: str
    description: str = ""
    code: str
    language: str
    parameters: List[APIParameter] = []
    is_public: bool = False
    api_key: Optional[str] = None
    rate_limit_requests: int = 1000
    rate_limit_period: str = "day"
    pricing_model: str = "free"
    price_per_request: float = 0.0
    settings: Optional[APISettings] = None

class APIUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    is_public: Optional[bool] = None
    api_key: Optional[str] = None
    rate_limit_requests: Optional[int] = None
    rate_limit_period: Optional[str] = None
    pricing_model: Optional[str] = None
    price_per_request: Optional[float] = None
    settings: Optional[APISettings] = None

class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str = "python"
    endpoint: str = ""

class APITestRequest(BaseModel):
    method: str = "POST"
    headers: Dict[str, str] = {}
    body: Union[Dict, str, None] = None
    query_params: Dict[str, str] = {}

# Utility functions
def generate_api_id():
    return secrets.token_urlsafe(16)

def generate_user_id():
    return secrets.token_urlsafe(16)

def generate_api_key():
    return f"ak_{secrets.token_urlsafe(32)}"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_db_connection():
    conn = sqlite3.connect('data/api_maker.db')
    conn.row_factory = sqlite3.Row
    return conn

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_id = verify_jwt_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ? AND is_active = TRUE", (user_id,)).fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return dict(user)

def check_rate_limit_enhanced(api_id: str, settings: Dict, user_id: str = None, ip_address: str = None):
    """Enhanced rate limiting with per-API settings"""
    if not redis_client:
        return True  # Skip rate limiting if Redis not available
    
    # Create unique keys for different time windows
    hour_key = f"rate_limit:{api_id}:hour:{user_id or ip_address}"
    day_key = f"rate_limit:{api_id}:day:{user_id or ip_address}"
    month_key = f"rate_limit:{api_id}:month:{user_id or ip_address}"
    
    # Check hourly limit
    hour_count = redis_client.get(hour_key) or 0
    if int(hour_count) >= settings.get('max_requests_per_hour', 1000):
        return False
    
    # Check daily limit
    day_count = redis_client.get(day_key) or 0
    if int(day_count) >= settings.get('max_requests_per_day', 10000):
        return False
    
    # Check monthly limit
    month_count = redis_client.get(month_key) or 0
    if int(month_count) >= settings.get('max_requests_per_month', 100000):
        return False
    
    # Increment counters
    pipe = redis_client.pipeline()
    pipe.incr(hour_key)
    pipe.expire(hour_key, 3600)  # 1 hour
    pipe.incr(day_key)
    pipe.expire(day_key, 86400)  # 1 day
    pipe.incr(month_key)
    pipe.expire(month_key, 2592000)  # 30 days
    pipe.execute()
    
    return True

def check_rate_limit(api_id: str, rate_limit_requests: int, rate_limit_period: str, ip_address: str = None):
    if not redis_client:
        return True  # Skip rate limiting if Redis not available
    
    key = f"rate_limit:{api_id}:{ip_address or 'global'}"
    current_requests = redis_client.get(key)
    
    if current_requests is None:
        # First request
        if rate_limit_period == "hour":
            redis_client.setex(key, 3600, 1)
        elif rate_limit_period == "day":
            redis_client.setex(key, 86400, 1)
        elif rate_limit_period == "month":
            redis_client.setex(key, 2592000, 1)
        return True
    
    if int(current_requests) >= rate_limit_requests:
        return False
    
    redis_client.incr(key)
    return True

async def generate_code_with_gpt(prompt: str, language: str, endpoint: str) -> str:
    """Generate API code using OpenAI GPT"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key not configured")
    
    client = openai.OpenAI(api_key=openai_api_key)
    
    system_prompt = f"""You are an expert API developer. Generate {language} code for an API endpoint based on the user's description.

Requirements:
- Create a complete, functional API endpoint
- Use appropriate framework ({get_framework_for_language(language)})
- Include proper error handling
- Add input validation
- Return JSON responses
- Make it production-ready
- The endpoint should be named: /{endpoint}

Return only the code, no explanations or markdown formatting."""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate code")

def get_framework_for_language(language: str) -> str:
    frameworks = {
        "python": "FastAPI",
        "javascript": "Express.js",
        "java": "Spring Boot",
        "go": "Gin",
        "php": "Laravel"
    }
    return frameworks.get(language, "appropriate framework")

def create_dockerfile(language: str, code: str, endpoint: str) -> str:
    """Create Dockerfile for the API"""
    if language == "python":
        return f"""FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    elif language == "javascript":
        return f"""FROM node:16-slim

WORKDIR /app

COPY package.json .
RUN npm install

COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]
"""
    # Add more languages as needed
    return ""

def create_app_file(language: str, code: str) -> str:
    """Create the main application file"""
    if language == "python":
        return f"""from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

{code}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
    return code

async def deploy_api_container(api_id: str, language: str, code: str, endpoint: str):
    """Deploy API in Docker container"""
    if not docker_client:
        raise HTTPException(status_code=500, detail="Docker not available")
    
    try:
        # Create temporary directory for build
        build_dir = Path(f"/tmp/api_{api_id}")
        build_dir.mkdir(exist_ok=True)
        
        # Create application files
        app_content = create_app_file(language, code)
        dockerfile_content = create_dockerfile(language, code, endpoint)
        
        # Write files
        (build_dir / "app.py").write_text(app_content)
        (build_dir / "Dockerfile").write_text(dockerfile_content)
        
        if language == "python":
            (build_dir / "requirements.txt").write_text("fastapi==0.104.1\nuvicorn==0.24.0")
        
        # Build Docker image
        image_tag = f"api_{api_id}:latest"
        docker_client.images.build(path=str(build_dir), tag=image_tag)
        
        # Run container
        container = docker_client.containers.run(
            image_tag,
            detach=True,
            ports={'8000/tcp': None},
            name=f"api_{api_id}"
        )
        
        # Get assigned port
        container.reload()
        port = container.attrs['NetworkSettings']['Ports']['8000/tcp'][0]['HostPort']
        
        return container.id, int(port)
        
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")

# API Routes

@app.on_event("startup")
async def startup():
    init_db()
    # Create default admin user if not exists
    conn = get_db_connection()
    admin_exists = conn.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
    if not admin_exists:
        admin_id = generate_user_id()
        admin_password = hash_password("admin123")  # Change this in production
        conn.execute("""
            INSERT INTO users (id, username, email, password_hash)
            VALUES (?, ?, ?, ?)
        """, (admin_id, "admin", "admin@apimaker.local", admin_password))
        conn.commit()
        logger.info("Default admin user created: admin/admin123")
    conn.close()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Authentication Routes
@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    conn = get_db_connection()
    
    # Check if username already exists
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (user_data.username,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists (if provided)
    if user_data.email:
        existing_email = conn.execute("SELECT id FROM users WHERE email = ?", (user_data.email,)).fetchone()
        if existing_email:
            conn.close()
            raise HTTPException(status_code=400, detail="Email already exists")
    
    try:
        user_id = generate_user_id()
        password_hash = hash_password(user_data.password)
        
        conn.execute("""
            INSERT INTO users (id, username, email, password_hash)
            VALUES (?, ?, ?, ?)
        """, (user_id, user_data.username, user_data.email, password_hash))
        conn.commit()
        
        # Create JWT token
        token = create_jwt_token(user_id)
        
        conn.close()
        return {
            "token": token,
            "user": {
                "id": user_id,
                "username": user_data.username,
                "email": user_data.email,
                "is_active": True
            }
        }
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(login_data: UserLogin):
    """Login user"""
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND is_active = TRUE", 
                       (login_data.username,)).fetchone()
    conn.close()
    
    if not user or not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user['id'])
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "is_active": user['is_active']
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": current_user['id'],
        "username": current_user['username'],
        "email": current_user['email'],
        "is_active": current_user['is_active'],
        "created_at": current_user['created_at']
    }

@app.post("/api/generate-code")
async def generate_code(request: CodeGenerationRequest):
    """Generate API code using AI"""
    try:
        code = await generate_code_with_gpt(request.prompt, request.language, request.endpoint)
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/apis")
async def create_api(api_data: APICreate, current_user: dict = Depends(get_current_user)):
    """Create a new API"""
    conn = get_db_connection()
    api_id = generate_api_id()
    
    # Check if endpoint already exists
    existing = conn.execute("SELECT id FROM apis WHERE endpoint = ?", (api_data.endpoint,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Endpoint already exists")
    
    # Generate API key if not public
    api_key = api_data.api_key if api_data.api_key else (generate_api_key() if not api_data.is_public else None)
    
    try:
        # Insert API
        conn.execute("""
            INSERT INTO apis (id, user_id, name, endpoint, description, code, language, is_public, 
                            api_key, rate_limit_requests, rate_limit_period, pricing_model, 
                            price_per_request, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (api_id, current_user['id'], api_data.name, api_data.endpoint, api_data.description, 
              api_data.code, api_data.language, api_data.is_public, api_key, 
              api_data.rate_limit_requests, api_data.rate_limit_period, api_data.pricing_model, 
              api_data.price_per_request, 'draft'))
        
        # Insert parameters
        for param in api_data.parameters:
            conn.execute("""
                INSERT INTO api_parameters (api_id, name, type, required, description)
                VALUES (?, ?, ?, ?, ?)
            """, (api_id, param.name, param.type, param.required, param.description))
        
        # Insert API settings
        if api_data.settings:
            settings = api_data.settings
            conn.execute("""
                INSERT INTO api_settings (api_id, max_requests_per_hour, max_requests_per_day, 
                                        max_requests_per_month, requires_auth, allowed_origins, webhook_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (api_id, settings.max_requests_per_hour, settings.max_requests_per_day, 
                  settings.max_requests_per_month, settings.requires_auth, 
                  settings.allowed_origins, settings.webhook_url))
        else:
            # Default settings
            conn.execute("""
                INSERT INTO api_settings (api_id) VALUES (?)
            """, (api_id,))
        
        conn.commit()
        conn.close()
        
        return {
            "id": api_id,
            "api_key": api_key,
            "endpoint": f"/api/execute/{api_data.endpoint}",
            "playground_url": f"/api/apis/{api_id}/playground",
            "status": "created"
        }
        
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
        
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/apis/{api_id}/deploy")
async def deploy_api(api_id: str, background_tasks: BackgroundTasks):
    """Deploy API to container"""
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE id = ?", (api_id,)).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    try:
        # Deploy in background
        container_id, port = await deploy_api_container(api_id, api['language'], api['code'], api['endpoint'])
        
        # Update database
        conn.execute("""
            UPDATE apis SET status = 'deployed', container_id = ?, port = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (container_id, port, api_id))
        conn.commit()
        conn.close()
        
        return {
            "status": "deployed",
            "container_id": container_id,
            "port": port,
            "endpoint": f"http://localhost:{port}"
        }
        
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/apis")
async def list_apis(current_user: dict = Depends(get_current_user)):
    """List user's APIs"""
    conn = get_db_connection()
    apis = conn.execute("""
        SELECT a.id, a.name, a.endpoint, a.description, a.language, a.is_public, a.status, 
               a.rate_limit_requests, a.rate_limit_period, a.created_at, a.port,
               COUNT(r.id) as total_requests,
               s.max_requests_per_hour, s.max_requests_per_day, s.max_requests_per_month,
               s.requires_auth
        FROM apis a
        LEFT JOIN api_requests r ON a.id = r.api_id
        LEFT JOIN api_settings s ON a.id = s.api_id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.created_at DESC
    """, (current_user['id'],)).fetchall()
    conn.close()
    
    return [dict(api) for api in apis]

@app.get("/api/apis/{api_id}")
async def get_api(api_id: str):
    """Get API details"""
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE id = ?", (api_id,)).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    # Get parameters
    parameters = conn.execute("""
        SELECT name, type, required, description FROM api_parameters WHERE api_id = ?
    """, (api_id,)).fetchall()
    
    conn.close()
    
    result = dict(api)
    result['parameters'] = [dict(param) for param in parameters]
    return result

@app.put("/api/apis/{api_id}")
async def update_api(api_id: str, api_data: APIUpdate):
    """Update API"""
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE id = ?", (api_id,)).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    # Build update query
    updates = []
    values = []
    
    for field, value in api_data.dict(exclude_unset=True).items():
        if value is not None:
            updates.append(f"{field} = ?")
            values.append(value)
    
    if updates:
        values.append(api_id)
        query = f"UPDATE apis SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        conn.execute(query, values)
        conn.commit()
    
    conn.close()
    return {"status": "updated"}

@app.delete("/api/apis/{api_id}")
async def delete_api(api_id: str):
    """Delete API and stop container"""
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE id = ?", (api_id,)).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    # Stop and remove container if exists
    if api['container_id'] and docker_client:
        try:
            container = docker_client.containers.get(api['container_id'])
            container.stop()
            container.remove()
        except:
            pass
    
    # Delete from database
    conn.execute("DELETE FROM api_parameters WHERE api_id = ?", (api_id,))
    conn.execute("DELETE FROM api_requests WHERE api_id = ?", (api_id,))
    conn.execute("DELETE FROM apis WHERE id = ?", (api_id,))
    conn.commit()
    conn.close()
    
    return {"status": "deleted"}

@app.post("/api/execute/{endpoint}")
async def execute_api(endpoint: str, request: Request):
    """Execute deployed API with rate limiting and authentication"""
    start_time = time.time()
    
    # Get API details
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE endpoint = ?", (endpoint,)).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    if api['status'] != 'deployed':
        conn.close()
        raise HTTPException(status_code=503, detail="API not deployed")
    
    # Check authentication
    if not api['is_public']:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            conn.close()
            raise HTTPException(status_code=401, detail="API key required")
        
        provided_key = auth_header.split(' ')[1]
        if provided_key != api['api_key']:
            conn.close()
            raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Check rate limiting
    client_ip = request.client.host
    if not check_rate_limit(api['id'], api['rate_limit_requests'], api['rate_limit_period'], client_ip):
        conn.close()
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    try:
        # Forward request to deployed container
        import httpx
        container_url = f"http://localhost:{api['port']}/api/{endpoint}"
        
        async with httpx.AsyncClient() as client:
            if request.method == "GET":
                response = await client.get(container_url, params=request.query_params)
            else:
                body = await request.body()
                response = await client.request(
                    request.method,
                    container_url,
                    content=body,
                    headers=dict(request.headers)
                )
        
        response_time = time.time() - start_time
        
        # Log request
        conn.execute("""
            INSERT INTO api_requests (api_id, endpoint, method, status_code, response_time, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (api['id'], endpoint, request.method, response.status_code, response_time, 
              client_ip, request.headers.get('User-Agent', '')))
        conn.commit()
        conn.close()
        
        return JSONResponse(
            content=response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            status_code=response.status_code
        )
        
    except Exception as e:
        conn.close()
        logger.error(f"API execution error: {e}")
        raise HTTPException(status_code=500, detail="API execution failed")

@app.get("/api/apis/{api_id}/playground")
async def api_playground(api_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    """API testing playground"""
    conn = get_db_connection()
    api = conn.execute("""
        SELECT a.*, s.max_requests_per_hour, s.max_requests_per_day, s.requires_auth
        FROM apis a
        LEFT JOIN api_settings s ON a.id = s.api_id
        WHERE a.id = ? AND a.user_id = ?
    """, (api_id, current_user['id'])).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    # Get parameters
    parameters = conn.execute("""
        SELECT name, type, required, description FROM api_parameters WHERE api_id = ?
    """, (api_id,)).fetchall()
    
    conn.close()
    
    # Return playground data
    return {
        "api": dict(api),
        "parameters": [dict(param) for param in parameters],
        "test_url": f"/api/execute/{api['endpoint']}",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "example_request": {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api['api_key']}" if not api['is_public'] else None
            },
            "body": {param['name']: f"example_{param['type']}" for param in parameters}
        }
    }

@app.post("/api/apis/{api_id}/test")
async def test_api(api_id: str, test_request: APITestRequest, current_user: dict = Depends(get_current_user)):
    """Test API endpoint"""
    conn = get_db_connection()
    api = conn.execute("SELECT * FROM apis WHERE id = ? AND user_id = ?", (api_id, current_user['id'])).fetchone()
    
    if not api:
        conn.close()
        raise HTTPException(status_code=404, detail="API not found")
    
    if api['status'] != 'deployed':
        conn.close()
        raise HTTPException(status_code=400, detail="API must be deployed to test")
    
    conn.close()
    
    try:
        import httpx
        
        # Prepare test request
        test_url = f"http://localhost:{api['port']}/api/{api['endpoint']}"
        headers = test_request.headers or {}
        
        # Add auth if not public
        if not api['is_public'] and api['api_key']:
            headers['Authorization'] = f"Bearer {api['api_key']}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            if test_request.method.upper() == "GET":
                response = await client.get(test_url, params=test_request.query_params, headers=headers)
            else:
                response = await client.request(
                    test_request.method.upper(),
                    test_url,
                    json=test_request.body if isinstance(test_request.body, dict) else None,
                    content=test_request.body if isinstance(test_request.body, str) else None,
                    params=test_request.query_params,
                    headers=headers
                )
        
        return {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "response": response.text,
            "json": response.json() if response.headers.get('content-type', '').startswith('application/json') else None,
            "response_time": response.elapsed.total_seconds()
        }
        
    except Exception as e:
        logger.error(f"API test error: {e}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@app.get("/api/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get user's analytics data"""
    conn = get_db_connection()
    
    # Total requests for user's APIs
    total_requests = conn.execute("""
        SELECT COUNT(*) as count FROM api_requests r
        JOIN apis a ON r.api_id = a.id
        WHERE a.user_id = ?
    """, (current_user['id'],)).fetchone()['count']
    
    # Active APIs for user
    active_apis = conn.execute("""
        SELECT COUNT(*) as count FROM apis WHERE user_id = ? AND status = 'deployed'
    """, (current_user['id'],)).fetchone()['count']
    
    # Average response time for user's APIs
    avg_response_time = conn.execute("""
        SELECT AVG(r.response_time) as avg_time FROM api_requests r
        JOIN apis a ON r.api_id = a.id
        WHERE a.user_id = ? AND r.timestamp > datetime('now', '-24 hours')
    """, (current_user['id'],)).fetchone()['avg_time'] or 0
    
    # Top endpoints for user
    top_endpoints = conn.execute("""
        SELECT a.name, a.endpoint, COUNT(r.id) as request_count
        FROM apis a
        LEFT JOIN api_requests r ON a.id = r.api_id
        WHERE a.user_id = ? AND a.status = 'deployed'
        GROUP BY a.id
        ORDER BY request_count DESC
        LIMIT 5
    """, (current_user['id'],)).fetchall()
    
    # Request volume by day (last 7 days) for user's APIs
    daily_requests = conn.execute("""
        SELECT DATE(r.timestamp) as date, COUNT(*) as count
        FROM api_requests r
        JOIN apis a ON r.api_id = a.id
        WHERE a.user_id = ? AND r.timestamp > datetime('now', '-7 days')
        GROUP BY DATE(r.timestamp)
        ORDER BY date
    """, (current_user['id'],)).fetchall()
    
    # Revenue calculation (mock for now)
    revenue = conn.execute("""
        SELECT SUM(a.price_per_request * COALESCE(request_counts.count, 0)) as total_revenue
        FROM apis a
        LEFT JOIN (
            SELECT api_id, COUNT(*) as count
            FROM api_requests
            WHERE timestamp > datetime('now', '-30 days')
            GROUP BY api_id
        ) request_counts ON a.id = request_counts.api_id
        WHERE a.user_id = ? AND a.pricing_model = 'payg'
    """, (current_user['id'],)).fetchone()['total_revenue'] or 0
    
    conn.close()
    
    return {
        "total_requests": total_requests,
        "active_apis": active_apis,
        "avg_response_time": round(avg_response_time * 1000, 2) if avg_response_time else 0,  # Convert to ms
        "revenue": round(revenue, 2),
        "top_endpoints": [dict(row) for row in top_endpoints],
        "daily_requests": [dict(row) for row in daily_requests]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": "up",
            "redis": "up" if redis_client else "down",
            "docker": "up" if docker_client else "down"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

