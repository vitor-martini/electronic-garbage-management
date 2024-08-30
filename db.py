import psycopg2
import urllib.parse as up  # Importando urllib.parse e referenciando como 'up'

# URL pública do banco de dados
DATABASE_URL = "postgresql://postgres:jbDIZVcVbOVZmiYkNNYDHDsZEHcQGxYU@junction.proxy.rlwy.net:27379/railway"

# Parseando a URL para obter os componentes de conexão
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
