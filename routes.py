from flask import Blueprint, request, jsonify, send_file
import uuid
from db import get_db_connection, get_db_cursor  
import pandas as pd
from io import BytesIO

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

@routes.route('/extrair-relatorio', methods=['GET'])
def extrair_relatorio():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    conn = get_db_connection()
    query = """
        SELECT public_id, name, value, disposal_date
        FROM products
        WHERE disposal_date BETWEEN %s AND %s
        ORDER BY disposal_date
    """
    df = pd.read_sql(query, conn, params=[start_date, end_date])
    conn.close()

    df.columns = ['ID', 'Nome', 'Valor', 'Data Saída']

    df['Data Saída'] = pd.to_datetime(df['Data Saída']).dt.strftime('%d/%m/%Y')

    df['Valor'] = df['Valor'].str.replace(',', '.').astype(float)

    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    df.to_excel(writer, index=False, sheet_name='Relatório')
    writer.close()
    output.seek(0)

    return send_file(output, download_name=f'relatorio_{start_date}_a_{end_date}.xlsx', as_attachment=True)
