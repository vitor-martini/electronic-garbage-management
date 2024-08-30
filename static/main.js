document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-produto');
    const tabela = document.getElementById('tabela-produtos').getElementsByTagName('tbody')[0];
    const valueField = document.getElementById('value'); // Campo de valor

    // Criar o overlay de loading e adicioná-lo ao body
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingOverlay);

    function showLoading() {
        loadingOverlay.style.display = 'flex'; // Mostra o overlay com o spinner
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none'; // Esconde o overlay
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (isError) {
            toast.style.backgroundColor = '#e74c3c'; // Cor de fundo para erros
        }
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            document.body.removeChild(toast);
        }, 3000);
    }

    function formatarData(dataString) {
        const data = new Date(dataString);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    
    // Função para aplicar máscara ao campo de valor
    valueField.addEventListener('input', function(e) {
        let value = e.target.value;

        // Remove qualquer caractere que não seja número ou vírgula
        value = value.replace(/[^0-9,]/g, '');

        // Verifica se há mais de uma vírgula e remove as extras
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }

        // Limita as casas decimais a duas
        if (parts[1] && parts[1].length > 2) {
            value = `${parts[0]},${parts[1].slice(0, 2)}`;
        }

        e.target.value = value;
    });

    // Função para carregar os produtos
    // Função para carregar os produtos
    function carregarProdutos() {
        return fetch('/produtos')  // Retorna a Promise
            .then(response => response.json())
            .then(produtos => {
                tabela.innerHTML = '';
                produtos.forEach(produto => {
                    let row = tabela.insertRow();
                    row.innerHTML = `
                        <td>${produto[1]}</td> <!-- ID -->
                        <td>${produto[2]}</td> <!-- Nome -->
                        <td>${produto[3]}</td> <!-- Valor -->
                        <td>${formatarData(produto[4])}</td> <!-- Data Saída -->
                        <td><button class="excluir-btn" data-id="${produto[0]}">
                            <img src="/static/trash-icon.svg" alt="Excluir" class="trash-icon">
                        </button></td> <!-- Ações -->
                    `;
                });
            });
    }

    // Função para validar os campos
    function validarCampos() {
        const publicId = document.getElementById('public_id').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim();
        const disposalDate = document.getElementById('disposal_date').value.trim();

        if (!publicId || !name || !value || !disposalDate) {
            return false; // Retorna false se algum campo estiver vazio
        }

        return true; // Retorna true se todos os campos estiverem preenchidos
    }

    // Função para adicionar produto
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validarCampos()) {
            showToast("Todos os campos devem ser preenchidos!", true); // Exibe toast de erro
            return; // Sai da função se a validação falhar
        }

        showLoading(); // Mostra o loading ao iniciar o cadastro

        const data = {
            public_id: document.getElementById('public_id').value,
            name: document.getElementById('name').value,
            value: document.getElementById('value').value,
            disposal_date: document.getElementById('disposal_date').value
        };

        fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(() => {
            return carregarProdutos(); // Aguarda o carregamento dos produtos
        })
        .then(() => {
            showToast("Cadastrado com sucesso!");  // Exibe o toast após o carregamento
        })
        .finally(() => {
            hideLoading(); // Esconde o loading após o cadastro e a atualização da tabela
            form.reset();
        });
    });

    // Função para excluir produto
    tabela.addEventListener('click', function(event) {
        if (event.target.classList.contains('excluir-btn')) {
            const id = event.target.getAttribute('data-id');
            showLoading(); // Mostra o loading ao iniciar a exclusão

            fetch(`/produtos/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                return carregarProdutos(); // Aguarda o carregamento dos produtos
            })
            .then(() => {
                showToast("Excluído com sucesso!");  // Exibe o toast após o carregamento
            })
            .finally(() => {
                hideLoading(); // Esconde o loading após a exclusão e a atualização da tabela
            });
        }
    });

    // Mostrar o loading e carregar os produtos ao iniciar
    showLoading();
    carregarProdutos().finally(() => {
        hideLoading();  // Esconde o loading após o carregamento inicial dos produtos
    });
});
