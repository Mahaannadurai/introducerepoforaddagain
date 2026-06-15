from sqlalchemy import create_engine

DATABASE_URL = (
    "postgresql://postgres:postgres@db:5432/mydb"
)

engine = create_engine(DATABASE_URL)