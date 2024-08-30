document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-produto');
    const tabela = document.getElementById('tabela-produtos').getElementsByTagName('tbody')[0];
    const valueField = document.getElementById('value');

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingOverlay);

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none'; 
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (isError) {
            toast.style.backgroundColor = '#e74c3c';
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
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    valueField.addEventListener('input', function(e) {
        let value = e.target.value;

        value = value.replace(/[^0-9,]/g, '');

        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }

        if (parts[1] && parts[1].length > 2) {
            value = `${parts[0]},${parts[1].slice(0, 2)}`;
        }

        e.target.value = value;
    });

    function carregarProdutos() {
        return fetch('/produtos')  
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

    function validarCampos() {
        const publicId = document.getElementById('public_id').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim();
        const disposalDate = document.getElementById('disposal_date').value.trim();

        if (!publicId || !name || !value || !disposalDate) {
            return false; 
        }

        return true; 
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validarCampos()) {
            showToast("Todos os campos devem ser preenchidos!", true); 
            return;
        }

        showLoading(); 

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
            return carregarProdutos(); 
        })
        .then(() => {
            showToast("Cadastrado com sucesso!"); 
        })
        .finally(() => {
            hideLoading();
            form.reset();
        });
    });

    tabela.addEventListener('click', function(event) {
        if (event.target.classList.contains('excluir-btn')) {
            const id = event.target.getAttribute('data-id');
            showLoading(); 

            fetch(`/produtos/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                return carregarProdutos(); 
            })
            .then(() => {
                showToast("Excluído com sucesso!"); 
            })
            .finally(() => {
                hideLoading(); 
            });
        }
    });

    showLoading();
    carregarProdutos().finally(() => {
        hideLoading();  
    });

    document.getElementById('extract-report').addEventListener('click', function() {
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;

        if (!startDate || !endDate) {
            showToast("Por favor, selecione as datas de início e fim!", true);
            return;
        }

        showLoading();

        fetch(`/extrair-relatorio?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `relatorio_${startDate}_a_${endDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showToast("Relatório gerado com sucesso!");
            })
            .finally(() => {
                hideLoading();
            });
    });
});
