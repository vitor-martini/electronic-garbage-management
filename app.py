from flask import Flask, render_template
from routes import routes  # Importando o blueprint das rotas

app = Flask(__name__)

# Registrando o blueprint
app.register_blueprint(routes)

# Rota inicial
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
