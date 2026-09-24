

const clientModal = document.getElementById("clientModal");

const newClientButton = document.getElementById("newClientButton");

const closeModal = document.getElementById("closeModal");

const cancelButton = document.getElementById("cancelButton");

const clientForm = document.getElementById("clientForm");

const clientsTable = document.getElementById("clientsTable");

const searchClient = document.getElementById("searchClient");

const statusFilter = document.getElementById("statusFilter");


/* =========================================
   DADOS
========================================= */

let clients = JSON.parse(localStorage.getItem("clients")) || [];

let editingClientId = null;


/* =========================================
   ELEMENTOS DOS INDICADORES
========================================= */

const totalClientsElement = document.querySelector(
    ".stat-card:nth-child(1) strong"
);

const activeClientsElement = document.querySelector(
    ".stat-card:nth-child(2) strong"
);

const newClientsElement = document.querySelector(
    ".stat-card:nth-child(3) strong"
);


/* =========================================
   ABRIR MODAL
========================================= */

newClientButton.addEventListener("click", () => {

    editingClientId = null;

    clientForm.reset();

    document.querySelector(".modal-header h3").textContent =
        "Novo cliente";

    document.querySelector(".primary-button[type='submit']").textContent =
        "Cadastrar cliente";

    clientModal.classList.add("active");

});


/* =========================================
   FECHAR MODAL
========================================= */

function closeClientModal() {

    clientModal.classList.remove("active");

    clientForm.reset();

    editingClientId = null;

}


closeModal.addEventListener("click", closeClientModal);

cancelButton.addEventListener("click", closeClientModal);


/* =========================================
   FECHAR MODAL CLICANDO FORA
========================================= */

clientModal.addEventListener("click", (event) => {

    if (event.target === clientModal) {

        closeClientModal();

    }

});


/* =========================================
   SALVAR CLIENTES
========================================= */

function saveClients() {

    localStorage.setItem(
        "clients",
        JSON.stringify(clients)
    );

}


/* =========================================
   GERAR ID
========================================= */

function generateId() {

    return Date.now();

}


/* =========================================
   ADICIONAR CLIENTE
========================================= */

clientForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const name = document
        .getElementById("clientName")
        .value
        .trim();

    const email = document
        .getElementById("clientEmail")
        .value
        .trim();

    const phone = document
        .getElementById("clientPhone")
        .value
        .trim();

    const status = document
        .getElementById("clientStatus")
        .value;


    /* =========================
       VALIDAÇÃO
    ========================= */

    if (!name || !email || !phone) {

        alert("Preencha todos os campos.");

        return;

    }


    /* =========================
       EDITAR CLIENTE
    ========================= */

    if (editingClientId !== null) {

        const clientIndex = clients.findIndex(
            client => client.id === editingClientId
        );


        if (clientIndex !== -1) {

            clients[clientIndex] = {

                ...clients[clientIndex],

                name,

                email,

                phone,

                status

            };

        }


    }

    /* =========================
       NOVO CLIENTE
    ========================= */

    else {

        const newClient = {

            id: generateId(),

            name,

            email,

            phone,

            status,

            company: "",

            createdAt: new Date().toISOString()

        };


        clients.push(newClient);

    }


    /* =========================
       SALVAR
    ========================= */

    saveClients();

    renderClients();

    updateStatistics();

    closeClientModal();

});


/* =========================================
   RENDERIZAR CLIENTES
========================================= */

function renderClients() {

    const searchTerm = searchClient.value
        .toLowerCase()
        .trim();


    const selectedStatus = statusFilter.value;


    const filteredClients = clients.filter(client => {

        const matchesSearch =
            client.name
                .toLowerCase()
                .includes(searchTerm) ||

            client.email
                .toLowerCase()
                .includes(searchTerm) ||

            client.phone
                .includes(searchTerm);


        const matchesStatus =
            selectedStatus === "all" ||
            client.status === selectedStatus;


        return matchesSearch && matchesStatus;

    });


    clientsTable.innerHTML = "";


    /* =========================
       NENHUM RESULTADO
    ========================= */

    if (filteredClients.length === 0) {

        clientsTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align: center; padding: 40px;"
                >

                    Nenhum cliente encontrado.

                </td>

            </tr>

        `;

        return;

    }


    /* =========================
       CLIENTES
    ========================= */

    filteredClients.forEach(client => {

        const row = document.createElement("tr");


        const initials = getInitials(client.name);

        const formattedDate = formatDate(client.createdAt);

        const statusText = getStatusText(client.status);


        row.innerHTML = `

            <td>

                <div class="client">

                    <div class="client-avatar">
                        ${initials}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(client.name)}
                        </strong>

                        <span>
                            ${escapeHTML(client.company || "Cliente")}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(client.email)}
            </td>


            <td>
                ${escapeHTML(client.phone)}
            </td>


            <td>

                <span class="status ${client.status}">
                    ${statusText}
                </span>

            </td>


            <td>
                ${formattedDate}
            </td>


            <td>

                <button
                    class="action-button"
                    onclick="showClientActions(${client.id})"
                    aria-label="Ações do cliente"
                >
                    ⋮
                </button>

            </td>

        `;


        clientsTable.appendChild(row);

    });

}


/* =========================================
   INICIAIS DO CLIENTE
========================================= */

function getInitials(name) {

    const words = name
        .trim()
        .split(" ")
        .filter(Boolean);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================
   STATUS
========================================= */

function getStatusText(status) {

    const statusMap = {

        active: "Ativo",

        pending: "Pendente",

        inactive: "Inativo"

    };


    return statusMap[status] || "Desconhecido";

}


/* =========================================
   DATA
========================================= */

function parseLocalDate(dateInput) {

    /* Datas no formato "YYYY-MM-DD" (sem horário) são
       interpretadas pelo JS como UTC, o que faz a data
       "voltar" um dia em fusos negativos como o do Brasil.
       Aqui elas são montadas manualmente no fuso local. */

    if (
        typeof dateInput === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ) {

        const [year, month, day] = dateInput
            .split("-")
            .map(Number);

        return new Date(year, month - 1, day);

    }


    return new Date(dateInput);

}


function formatDate(date) {

    const parsedDate = parseLocalDate(date);


    return parsedDate.toLocaleDateString(
        "pt-BR"
    );

}


/* =========================================
   SEGURANÇA
========================================= */

function escapeHTML(text) {

    const element = document.createElement("div");

    element.textContent = text;

    return element.innerHTML;

}


/* =========================================
   AÇÕES DO CLIENTE
========================================= */

function showClientActions(id) {

    const client = clients.find(
        client => client.id === id
    );


    if (!client) {

        return;

    }


    const action = prompt(

        `Cliente: ${client.name}\n\n` +

        `Digite:\n` +

        `1 - Editar\n` +

        `2 - Excluir\n` +

        `3 - Cancelar`

    );


    if (action === "1") {

        editClient(id);

    }


    if (action === "2") {

        deleteClient(id);

    }

}


/* =========================================
   EDITAR CLIENTE
========================================= */

function editClient(id) {

    const client = clients.find(
        client => client.id === id
    );


    if (!client) {

        return;

    }


    editingClientId = id;


    document.getElementById("clientName").value =
        client.name;


    document.getElementById("clientEmail").value =
        client.email;


    document.getElementById("clientPhone").value =
        client.phone;


    document.getElementById("clientStatus").value =
        client.status;


    document.querySelector(".modal-header h3").textContent =
        "Editar cliente";


    document.querySelector(".primary-button[type='submit']").textContent =
        "Salvar alterações";


    clientModal.classList.add("active");

}


/* =========================================
   EXCLUIR CLIENTE
========================================= */

function deleteClient(id) {

    const client = clients.find(
        client => client.id === id
    );


    if (!client) {

        return;

    }


    const confirmed = confirm(

        `Deseja realmente excluir o cliente "${client.name}"?`

    );


    if (!confirmed) {

        return;

    }


    clients = clients.filter(
        client => client.id !== id
    );


    saveClients();

    renderClients();

    updateStatistics();

}


/* =========================================
   ESTATÍSTICAS
========================================= */

function updateStatistics() {

    const total = clients.length;


    const active = clients.filter(
        client => client.status === "active"
    ).length;


    const currentMonth = new Date().getMonth();

    const currentYear = new Date().getFullYear();


    const newClients = clients.filter(client => {

        const date = parseLocalDate(client.createdAt);

        return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        );

    }).length;


    totalClientsElement.textContent = total;

    activeClientsElement.textContent = active;

    newClientsElement.textContent = newClients;

}


/* =========================================
   BUSCA
========================================= */

searchClient.addEventListener(
    "input",
    renderClients
);


/* =========================================
   FILTRO
========================================= */

statusFilter.addEventListener(
    "change",
    renderClients
);


/* =========================================
   CLIENTES INICIAIS
========================================= */

function createInitialClients() {

    const savedClients = localStorage.getItem("clients");

    if (savedClients !== null) {

        try {

            const parsedClients = JSON.parse(savedClients);

            if (Array.isArray(parsedClients)) {

                clients = parsedClients;

                return;

            }

        } catch (error) {

            console.warn(
                "Dados de clientes inválidos no localStorage. Recriando lista inicial.",
                error
            );

        }

    }


    clients = [

        {
            id: generateId(),

            name: "João Silva",

            email: "joao@email.com",

            phone: "(37) 99999-9999",

            status: "active",

            company: "Empresa XYZ",

            createdAt: "2026-09-15"

        },


        {
            id: generateId() + 1,

            name: "Maria Souza",

            email: "maria@email.com",

            phone: "(37) 98888-8888",

            status: "pending",

            company: "Studio Maria",

            createdAt: "2026-09-12"

        },


        {
            id: generateId() + 2,

            name: "Carlos Almeida",

            email: "carlos@email.com",

            phone: "(37) 97777-7777",

            status: "inactive",

            company: "Almeida Serviços",

            createdAt: "2026-09-05"

        }

    ];


    saveClients();

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

createInitialClients();

renderClients();

updateStatistics();
