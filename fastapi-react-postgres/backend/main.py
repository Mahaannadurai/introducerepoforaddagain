from fastapi import FastAPI
from sqlalchemy import text
from database import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FastAPI Running"}


@app.get("/db-check")
def db_check():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT version();")
        ).scalar()

    return {"postgres_version": result}