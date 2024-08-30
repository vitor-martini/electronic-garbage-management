from flask import Blueprint, request, jsonify
import uuid
from db import get_db_connection, get_db_cursor  # Importando as funções de conexão

# Criação do blueprint para as rotas
routes = Blueprint('routes', __name__)

@routes.route('/produtos', methods=['GET'])
def listar_produtos():
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute("SELECT id, public_id, name, value, disposal_date FROM products ORDER BY disposal_date DESC")
    produtos = cursor.fetchall()
    conn.close()
    return jsonify(produtos)

@routes.route('/produtos', methods=['POST'])
def adicionar_produto():
    novo_produto = request.get_json()
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        "INSERT INTO products (public_id, name, value, disposal_date) VALUES (%s, %s, %s, %s) RETURNING id",
        (novo_produto['public_id'], novo_produto['name'], novo_produto['value'], novo_produto['disposal_date'])
    )
    conn.commit()
    produto_id = cursor.fetchone()[0]
    conn.close()
    return jsonify({"id": produto_id}), 201

@routes.route('/produtos/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute("DELETE FROM products WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Produto excluído com sucesso"}), 200
