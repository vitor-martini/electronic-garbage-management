import psycopg2
import urllib.parse as up
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

up.uses_netloc.append("postgres")
url = up.urlparse(DATABASE_URL)

def get_db_connection():
    conn = psycopg2.connect(
        database=url.path[1:],
        user=url.username,
        password=url.password,
        host=url.hostname,
        port=url.port
    )
    return conn

def get_db_cursor(conn):
    return conn.cursor()
