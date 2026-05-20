import os
import urllib.parse
from dotenv import load_dotenv
from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

_raw = os.environ["DATABASE_URL"]
_p = urllib.parse.urlparse(_raw)

engine = create_engine(
    URL.create(
        drivername="postgresql+psycopg2",
        username=urllib.parse.unquote(_p.username or ""),
        password=urllib.parse.unquote(_p.password or ""),
        host=_p.hostname,
        port=_p.port,
        database=(_p.path or "/postgres").lstrip("/"),
    ),
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
