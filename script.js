// ============================================
// MAPA DA TORCIDA
// script.js
// ============================================

// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
    "https://yesrkhgvlxsbvhgumzxs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ============================================
// ESTADOS
// ============================================

const estados = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins"
};

// ============================================
// PAÍSES
// ============================================

const paises = [
    "Argentina",
    "Bolívia",
    "Canadá",
    "Chile",
    "Colômbia",
    "Estados Unidos",
    "França",
    "Alemanha",
    "Itália",
    "Japão",
    "México",
    "Paraguai",
    "Peru",
    "Portugal",
    "Reino Unido",
    "Uruguai",
    "Outro"
];

// ============================================
// BANDEIRAS
// ============================================

const bandeirasPaises = {
    "Argentina": "🇦🇷",
    "Bolívia": "🇧🇴",
    "Canadá": "🇨🇦",
    "Chile": "🇨🇱",
    "Colômbia": "🇨🇴",
    "Estados Unidos": "🇺🇸",
    "França": "🇫🇷",
    "Alemanha": "🇩🇪",
    "Itália": "🇮🇹",
    "Japão": "🇯🇵",
    "México": "🇲🇽",
    "Paraguai": "🇵🇾",
    "Peru": "🇵🇪",
    "Portugal": "🇵🇹",
    "Reino Unido": "🇬🇧",
    "Uruguai": "🇺🇾",
    "Outro": "🌎"
};

// ============================================
// VARIÁVEIS
// ============================================

let mapa = null;

let marcadores = [];

let dadosMapa = [];

let estatisticasAtuais = {};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);

async function iniciar() {

    console.log(
        "Mapa da Torcida iniciado."
    );

    preencherEstados();

    preencherPaises();

    configurarLocal();

    configurarFormulario();

    inicializarMapa();

    await carregarDados();

    iniciarRealtime();

}

// ============================================
// PREENCHER ESTADOS
// ============================================

function preencherEstados() {

    const select =
        document.getElementById(
            "estado"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Escolha o estado
        </option>
    `;

    Object.entries(estados)
        .sort(
            (a, b) =>
                a[1].localeCompare(b[1])
        )
        .forEach(
            ([uf, nome]) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = uf;

                option.textContent =
                    `${nome} (${uf})`;

                select.appendChild(
                    option
                );

            }
        );

    select.addEventListener(
        "change",
        carregarCidades
    );

}

// ============================================
// PREENCHER PAÍSES
// ============================================

function preencherPaises() {

    const select =
        document.getElementById(
            "pais"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Escolha o país
        </option>
    `;

    paises.forEach(
        nome => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = nome;

            option.textContent =
                `${bandeiraPais(nome)} ${nome}`;

            select.appendChild(
                option
            );

        }
    );

}

// ============================================
// BRASIL / EXTERIOR
// ============================================

function configurarLocal() {

    const radios =
        document.querySelectorAll(
            'input[name="local_tipo"]'
        );

    radios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                alterarLocal
            );

        }
    );

}

function alterarLocal() {

    const selecionado =
        document.querySelector(
            'input[name="local_tipo"]:checked'
        );

    const brasilFields =
        document.getElementById(
            "brasilFields"
        );

    const exteriorFields =
        document.getElementById(
            "exteriorFields"
        );

    const cidade =
        document.getElementById(
            "cidade"
        );

    const estado =
        document.getElementById(
            "estado"
        );

    const pais =
        document.getElementById(
            "pais"
        );

    const codigoIbge =
        document.getElementById(
            "codigoIbge"
        );

    if (!selecionado) {

        brasilFields?.classList.add(
            "hidden"
        );

        exteriorFields?.classList.add(
            "hidden"
        );

        return;

    }

    if (
        selecionado.value === "Brasil"
    ) {

        brasilFields?.classList.remove(
            "hidden"
        );

        exteriorFields?.classList.add(
            "hidden"
        );

        if (pais) {
            pais.value = "";
        }

    } else {

        brasilFields?.classList.add(
            "hidden"
        );

        exteriorFields?.classList.remove(
            "hidden"
        );

        if (estado) {
            estado.value = "";
        }

        if (cidade) {

            cidade.innerHTML = `
                <option value="">
                    Primeiro escolha o estado
                </option>
            `;

            cidade.disabled = true;

        }

        if (codigoIbge) {
            codigoIbge.value = "";
        }

    }

}

// ============================================
// CARREGAR CIDADES DO IBGE
// ============================================

async function carregarCidades() {

    const estado =
        document.getElementById(
            "estado"
        );

    const cidade =
        document.getElementById(
            "cidade"
        );

    const codigoIbge =
        document.getElementById(
            "codigoIbge"
        );

    if (
        !estado ||
        !cidade ||
        !codigoIbge
    ) {
        return;
    }

    const uf =
        estado.value;

    codigoIbge.value = "";

    cidade.disabled = true;

    if (!uf) {

        cidade.innerHTML = `
            <option value="">
                Primeiro escolha o estado
            </option>
        `;

        return;

    }

    cidade.innerHTML = `
        <option value="">
            Carregando cidades...
        </option>
    `;

    try {

        const resposta =
            await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
            );

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as cidades."
            );

        }

        const municipios =
            await resposta.json();

        municipios.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome
                )
        );

        cidade.innerHTML = `
            <option value="">
                Escolha a cidade
            </option>
        `;

        municipios.forEach(
            municipio => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    municipio.id;

                option.textContent =
                    municipio.nome;

                cidade.appendChild(
                    option
                );

            }
        );

        cidade.disabled = false;

        cidade.addEventListener(
            "change",
            () => {

                codigoIbge.value =
                    cidade.value || "";

            }
        );

    } catch (error) {

        console.error(
            "Erro ao carregar cidades:",
            error
        );

        cidade.innerHTML = `
            <option value="">
                Erro ao carregar cidades
            </option>
        `;

    }

}

// ============================================
// FORMULÁRIO
// ============================================

function configurarFormulario() {

    const form =
        document.getElementById(
            "cadastroForm"
        );

    if (!form) {

        console.error(
            "Formulário cadastroForm não encontrado."
        );

        return;

    }

    form.addEventListener(
        "submit",
        enviarCadastro
    );

}

// ============================================
// ENVIAR CADASTRO
// ============================================

async function enviarCadastro(
    event
) {

    event.preventDefault();

    const form =
        document.getElementById(
            "cadastroForm"
        );

    const botao =
        document.getElementById(
            "submitButton"
        );

    const mensagem =
        document.getElementById(
            "formMessage"
        );

    const nome =
        document.getElementById(
            "nome"
        )?.value.trim();

    const idade =
        Number(
            document.getElementById(
                "idade"
            )?.value
        );

    const localSelecionado =
        document.querySelector(
            'input[name="local_tipo"]:checked'
        );

    const genero =
        document.getElementById(
            "genero"
        )?.value;

    const exibicao =
        document.querySelector(
            'input[name="exibicao"]:checked'
        );

    const consentimento =
        document.getElementById(
            "consentimento"
        )?.checked;

    const estado =
        document.getElementById(
            "estado"
        );

    const cidade =
        document.getElementById(
            "cidade"
        );

    const codigoIbge =
        document.getElementById(
            "codigoIbge"
        );

    const pais =
        document.getElementById(
            "pais"
        );

    let localTipo =
        localSelecionado
            ? localSelecionado.value
            : null;

    let estadoUF = null;

    let nomeCidade = null;

    let ibge = null;

    let nomePais = null;

    if (
        localTipo === "Brasil"
    ) {

        estadoUF =
            estado?.value || null;

        if (
            cidade &&
            cidade.selectedIndex >= 0
        ) {

            nomeCidade =
                cidade.options[
                    cidade.selectedIndex
                ]?.textContent || null;

        }

        ibge =
            codigoIbge?.value ||
            cidade?.value ||
            null;

    }

    if (
        localTipo === "Exterior"
    ) {

        nomePais =
            pais?.value || null;

    }

    if (!nome) {

        mostrarMensagem(
            "Digite seu nome."
        );

        return;

    }

    if (
        !idade ||
        idade < 13 ||
        idade > 120
    ) {

        mostrarMensagem(
            "Digite uma idade válida entre 13 e 120 anos."
        );

        return;

    }

    if (!localTipo) {

        mostrarMensagem(
            "Escolha se você está no Brasil ou no exterior."
        );

        return;

    }

    if (
        localTipo === "Brasil" &&
        (
            !estadoUF ||
            !nomeCidade ||
            !ibge
        )
    ) {

        mostrarMensagem(
            "Escolha o estado e a cidade."
        );

        return;

    }

    if (
        localTipo === "Exterior" &&
        !nomePais
    ) {

        mostrarMensagem(
            "Escolha o país."
        );

        return;

    }

    if (!genero) {

        mostrarMensagem(
            "Escolha uma opção de gênero."
        );

        return;

    }

    if (!exibicao) {

        mostrarMensagem(
            "Escolha como você quer aparecer no mapa."
        );

        return;

    }

    if (!consentimento) {

        mostrarMensagem(
            "É necessário autorizar a utilização dos dados."
        );

        return;

    }

    const textoOriginal =
        botao?.textContent;

    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "CADASTRANDO...";

    }

    limparMensagem();

    try {

        console.log(
            "Enviando cadastro:",
            {
                nome,
                idade,
                localTipo,
                estadoUF,
                nomeCidade,
                ibge,
                nomePais,
                genero,
                exibicao: exibicao.value,
                consentimento
            }
        );

        const {
            data,
            error
        } = await db.rpc(
            "cadastrar_participante",
            {
                p_nome: nome,

                p_idade: idade,

                p_local_tipo:
                    localTipo,

                p_estado_uf:
                    estadoUF,

                p_cidade:
                    nomeCidade,

                p_codigo_ibge:
                    ibge,

                p_pais:
                    nomePais,

                p_genero:
                    genero,

                p_exibicao:
                    exibicao.value,

                p_consentimento:
                    true
            }
        );

        console.log(
            "Resposta Supabase:",
            data,
            error
        );

        if (error) {
            throw error;
        }

        form.reset();

        const cidadeSelect =
            document.getElementById(
                "cidade"
            );

        if (cidadeSelect) {

            cidadeSelect.innerHTML = `
                <option value="">
                    Primeiro escolha o estado
                </option>
            `;

            cidadeSelect.disabled = true;

        }

        const codigo =
            document.getElementById(
                "codigoIbge"
            );

        if (codigo) {
            codigo.value = "";
        }

        alterarLocal();

        mostrarSucesso();

        await carregarDados();

    } catch (error) {

        console.error(
            "ERRO COMPLETO DO CADASTRO:",
            error
        );

        const detalhes = [
            error?.message,
            error?.details,
            error?.hint,
            error?.code
        ]
            .filter(Boolean)
            .join(" | ");

        mostrarMensagem(
            detalhes ||
            "O Supabase retornou um erro sem detalhes."
        );

    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                textoOriginal ||
                "ENTRAR NO MAPA";

        }

    }

}

// ============================================
// MENSAGENS
// ============================================

function mostrarMensagem(
    texto
) {

    const elemento =
        document.getElementById(
            "formMessage"
        );

    if (!elemento) {

        alert(texto);

        return;

    }

    elemento.textContent =
        texto;

    elemento.classList.add(
        "visible"
    );

}

function limparMensagem() {

    const elemento =
        document.getElementById(
            "formMessage"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent = "";

    elemento.classList.remove(
        "visible"
    );

}

function mostrarSucesso() {

    const elemento =
        document.getElementById(
            "formMessage"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        "Você está no mapa! 💚💛";

    elemento.classList.add(
        "visible"
    );

    elemento.classList.add(
        "success"
    );

}

// ============================================
// MAPA
// ============================================

function inicializarMapa() {

    const elemento =
        document.getElementById(
            "map"
        );

    if (!elemento) {
        return;
    }

    mapa =
        L.map(
            "map"
        ).setView(
            [-14.2350, -51.9253],
            4
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        mapa
    );

}

// ============================================
// CARREGAR DADOS
// ============================================

async function carregarDados() {

    try {

        await carregarEstatisticas();

        await carregarDadosMapa();

        await carregarPaises();

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

    }

}

// ============================================
// ESTATÍSTICAS
// ============================================

async function carregarEstatisticas() {

    const {
        data,
        error
    } = await db.rpc(
        "estatisticas_mapa"
    );

    if (error) {

        console.error(
            "Erro estatisticas_mapa:",
            error
        );

        return;

    }

    estatisticasAtuais =
        data || {};

    atualizarEstatisticas();

}

function atualizarEstatisticas() {

    const dados =
        estatisticasAtuais || {};

    atualizarElemento(
        "totalTorcedores",
        dados.total || 0
    );

    atualizarElemento(
        "totalCidades",
        dados.cidades || 0
    );

    atualizarElemento(
        "totalEstados",
        dados.estados || 0
    );

    atualizarElemento(
        "totalExterior",
        dados.exterior || 0
    );

    atualizarElemento(
        "origemBrasil",
        dados.brasil || 0
    );

    atualizarElemento(
        "origemExterior",
        dados.exterior || 0
    );

    const total =
        Number(
            dados.total || 0
        );

    const feminino =
        Number(
            dados.genero_feminino || 0
        );

    const masculino =
        Number(
            dados.genero_masculino || 0
        );

    const naoBinario =
        Number(
            dados.genero_nao_binario || 0
        );

    const outro =
        Number(
            dados.genero_outro || 0
        );

    const naoInformado =
        Number(
            dados.genero_nao_informado || 0
        );

    atualizarPercentual(
        "generoFeminino",
        "barFeminino",
        feminino,
        total
    );

    atualizarPercentual(
        "generoMasculino",
        "barMasculino",
        masculino,
        total
    );

    atualizarPercentual(
        "generoNaoBinario",
        "barNaoBinario",
        naoBinario,
        total
    );

    atualizarPercentual(
        "generoOutro",
        "barOutro",
        outro,
        total
    );

    atualizarPercentual(
        "generoNaoInformado",
        "barNaoInformado",
        naoInformado,
        total
    );

}

function atualizarPercentual(
    id,
    barraId,
    quantidade,
    total
) {

    const percentual =
        total > 0
            ? (quantidade / total) * 100
            : 0;

    const elemento =
        document.getElementById(
            id
        );

    const barra =
        document.getElementById(
            barraId
        );

    if (elemento) {

        elemento.textContent =
            `${percentual.toFixed(1)}%`;

    }

    if (barra) {

        barra.style.width =
            `${percentual}%`;

    }

}

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        Number(
            valor
        ).toLocaleString(
            "pt-BR"
        );

}

// ============================================
// DADOS DO MAPA
// ============================================

async function carregarDadosMapa() {

    const {
        data,
        error
    } = await db.rpc(
        "dados_mapa"
    );

    if (error) {

        console.error(
            "Erro dados_mapa:",
            error
        );

        return;

    }

    dadosMapa =
        data || [];

    await desenharMarcadores();

}

// ============================================
// DESENHAR MARCADORES DOS ESTADOS
// ============================================

async function desenharMarcadores() {

    if (!mapa) {
        return;
    }

    marcadores.forEach(
        marcador => {

            mapa.removeLayer(
                marcador
            );

        }
    );

    marcadores = [];

    // ----------------------------------------
    // AGRUPAR TORCEDORES POR ESTADO
    // ----------------------------------------

    const estadosMapa = {};

    dadosMapa.forEach(
        item => {

            if (!item.estado_uf) {
                return;
            }

            const uf =
                String(
                    item.estado_uf
                ).trim().toUpperCase();

            if (!estadosMapa[uf]) {

                estadosMapa[uf] = {
                    uf,
                    nome: estados[uf] || uf,
                    participantes: []
                };

            }

            estadosMapa[uf]
                .participantes
                .push(
                    item
                );

        }
    );

    // ----------------------------------------
    // CRIAR UM CÍRCULO PARA CADA ESTADO
    // ----------------------------------------

    Object.values(estadosMapa)
        .forEach(
            estadoInfo => {

                const coordenadas =
                    coordenadaEstado(
                        estadoInfo.uf
                    );

                if (!coordenadas) {
                    return;
                }

                const quantidade =
                    estadoInfo.participantes.length;

                // --------------------------------
                // TAMANHO DO CÍRCULO
                // --------------------------------

                const tamanho =
                    Math.max(
                        52,
                        Math.min(
                            92,
                            52 +
                            Math.sqrt(
                                quantidade
                            ) * 10
                        )
                    );

                const tamanhoFonte =
                    Math.max(
                        17,
                        Math.min(
                            30,
                            tamanho / 2.4
                        )
                    );

                // --------------------------------
                // CÍRCULO
                // --------------------------------

                const icone =
                    L.divIcon({
                        className:
                            "custom-state-marker",

                        html: `
                            <div
                                class="state-marker"
                                style="
                                    width:${tamanho}px;
                                    height:${tamanho}px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    box-sizing:border-box;
                                    font-size:${tamanhoFonte}px;
                                    font-weight:700;
                                    line-height:1;
                                    cursor:pointer;
                                "
                            >
                                ${quantidade}
                            </div>
                        `,

                        iconSize: [
                            tamanho,
                            tamanho
                        ],

                        iconAnchor: [
                            tamanho / 2,
                            tamanho / 2
                        ]

                    });

                const marcador =
                    L.marker(
                        coordenadas,
                        {
                            icon: icone
                        }
                    ).addTo(
                        mapa
                    );

                // --------------------------------
                // CLIQUE NO ESTADO
                // --------------------------------

                marcador.on(
                    "click",
                    () => {

                        abrirPainelEstado(
                            estadoInfo
                        );

                    }
                );

                marcadores.push(
                    marcador
                );

            }
        );

}

// ============================================
// PAINEL LATERAL DO ESTADO
// ============================================

function abrirPainelEstado(
    estadoInfo
) {

    let painel =
        document.getElementById(
            "painelEstadoMapa"
        );

    if (!painel) {

        painel =
            document.createElement(
                "div"
            );

        painel.id =
            "painelEstadoMapa";

        document
            .getElementById("map")
            ?.appendChild(
                painel
            );

    }

    // ----------------------------------------
    // AGRUPAR POR CIDADE
    // ----------------------------------------

    const cidades = {};

    estadoInfo.participantes.forEach(
        participante => {

            const cidade =
                participante.cidade ||
                "Cidade não informada";

            if (!cidades[cidade]) {

                cidades[cidade] = [];

            }

            cidades[cidade].push(
                participante
            );

        }
    );

    // ----------------------------------------
    // LISTA DE CIDADES
    // ----------------------------------------

    const listaCidades =
        Object.entries(cidades)
            .sort(
                (a, b) =>
                    a[0].localeCompare(
                        b[0],
                        "pt-BR"
                    )
            )
            .map(
                ([cidade, participantes]) => {

                    const listaTorcedores =
                        participantes
                            .map(
                                participante => {

                                    const nome =
                                        participante.nome_exibicao ||
                                        "Torcedor";

                                    const idade =
                                        Number(
                                            participante.idade
                                        );

                                    const idadeTexto =
                                        Number.isFinite(
                                            idade
                                        )
                                            ? `${idade} anos`
                                            : "";

                                    return `
                                        <div class="supporter-item">
                                            <strong>
                                                ${escapeHTML(
                                                    nome
                                                )}
                                            </strong>
                                            ${
                                                idadeTexto
                                                    ? `, ${idadeTexto}`
                                                    : ""
                                            }
                                            <span>
                                                ${escapeHTML(
                                                    cidade
                                                )}/${escapeHTML(
                                                    estadoInfo.uf
                                                )}
                                            </span>
                                        </div>
                                    `;

                                }
                            )
                            .join("");

                    return `
                        <div class="state-city-group">

                            <div class="state-city-title">
                                <strong>
                                    ${escapeHTML(
                                        cidade
                                    )}
                                </strong>

                                <span>
                                    ${
                                        participantes.length
                                    }
                                    torcedor${
                                        participantes.length === 1
                                            ? ""
                                            : "es"
                                    }
                                </span>
                            </div>

                            <div class="state-city-supporters">
                                ${listaTorcedores}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");

    // ----------------------------------------
    // CONTEÚDO DO PAINEL
    // ----------------------------------------

    painel.innerHTML = `

        <div class="state-panel-header">

            <div>

                <div class="state-panel-kicker">
                    MAPA DA TORCIDA
                </div>

                <h2>
                    ${escapeHTML(
                        estadoInfo.nome
                    )}
                </h2>

                <div class="state-panel-total">
                    ${
                        estadoInfo.participantes.length
                    }
                    torcedor${
                        estadoInfo.participantes.length === 1
                            ? ""
                            : "es"
                    }
                </div>

            </div>

            <button
                type="button"
                class="state-panel-close"
                aria-label="Fechar"
                onclick="fecharPainelEstado()"
            >
                ×
            </button>

        </div>

        <div class="state-panel-body">

            ${listaCidades}

        </div>

    `;

    // ----------------------------------------
    // ESTILOS DO PAINEL
    // ----------------------------------------

    painel.style.position =
        "absolute";

    painel.style.top =
        "0";

    painel.style.right =
        "0";

    painel.style.width =
        "min(380px, 90%)";

    painel.style.height =
        "100%";

    painel.style.background =
        "#ffffff";

    painel.style.zIndex =
        "1000";

    painel.style.boxSizing =
        "border-box";

    painel.style.boxShadow =
        "-8px 0 25px rgba(0,0,0,0.18)";

    painel.style.display =
        "flex";

    painel.style.flexDirection =
        "column";

    painel.style.overflow =
        "hidden";

    painel.style.borderRadius =
        "12px 0 0 12px";

    // ----------------------------------------
    // CABEÇALHO
    // ----------------------------------------

    const header =
        painel.querySelector(
            ".state-panel-header"
        );

    if (header) {

        header.style.padding =
            "22px";

        header.style.display =
            "flex";

        header.style.justifyContent =
            "space-between";

        header.style.alignItems =
            "flex-start";

        header.style.gap =
            "15px";

        header.style.background =
            "#ffffff";

        header.style.borderBottom =
            "1px solid #e5e5e5";

    }

    const kicker =
        painel.querySelector(
            ".state-panel-kicker"
        );

    if (kicker) {

        kicker.style.fontSize =
            "11px";

        kicker.style.fontWeight =
            "700";

        kicker.style.letterSpacing =
            "1px";

        kicker.style.color =
            "#16843d";

        kicker.style.marginBottom =
            "5px";

    }

    const titulo =
        painel.querySelector(
            "h2"
        );

    if (titulo) {

        titulo.style.margin =
            "0";

        titulo.style.fontSize =
            "24px";

        titulo.style.lineHeight =
            "1.2";

    }

    const total =
        painel.querySelector(
            ".state-panel-total"
        );

    if (total) {

        total.style.marginTop =
            "6px";

        total.style.fontSize =
            "14px";

        total.style.fontWeight =
            "600";

        total.style.color =
            "#555";

    }

    const botaoFechar =
        painel.querySelector(
            ".state-panel-close"
        );

    if (botaoFechar) {

        botaoFechar.style.border =
            "0";

        botaoFechar.style.background =
            "transparent";

        botaoFechar.style.fontSize =
            "30px";

        botaoFechar.style.lineHeight =
            "1";

        botaoFechar.style.cursor =
            "pointer";

        botaoFechar.style.color =
            "#555";

        botaoFechar.style.padding =
            "0 4px";

    }

    // ----------------------------------------
    // CORPO
    // ----------------------------------------

    const corpo =
        painel.querySelector(
            ".state-panel-body"
        );

    if (corpo) {

        corpo.style.padding =
            "16px 20px 25px";

        corpo.style.overflowY =
            "auto";

        corpo.style.flex =
            "1";

        corpo.style.boxSizing =
            "border-box";

    }

    // ----------------------------------------
    // GRUPOS DE CIDADE
    // ----------------------------------------

    painel
        .querySelectorAll(
            ".state-city-group"
        )
        .forEach(
            grupo => {

                grupo.style.marginBottom =
                    "18px";

                grupo.style.paddingBottom =
                    "15px";

                grupo.style.borderBottom =
                    "1px solid #eeeeee";

            }
        );

    painel
        .querySelectorAll(
            ".state-city-title"
        )
        .forEach(
            tituloCidade => {

                tituloCidade.style.display =
                    "flex";

                tituloCidade.style.justifyContent =
                    "space-between";

                tituloCidade.style.alignItems =
                    "center";

                tituloCidade.style.gap =
                    "10px";

                tituloCidade.style.marginBottom =
                    "8px";

                tituloCidade.style.fontSize =
                    "15px";

            }
        );

    painel
        .querySelectorAll(
            ".state-city-title span"
        )
        .forEach(
            contador => {

                contador.style.fontSize =
                    "12px";

                contador.style.color =
                    "#777";

                contador.style.whiteSpace =
                    "nowrap";

            }
        );

    painel
        .querySelectorAll(
            ".supporter-item"
        )
        .forEach(
            item => {

                item.style.padding =
                    "7px 0";

                item.style.fontSize =
                    "14px";

                item.style.lineHeight =
                    "1.4";

                item.style.color =
                    "#333";

            }
        );

    painel
        .querySelectorAll(
            ".supporter-item span"
        )
        .forEach(
            local => {

                local.style.display =
                    "block";

                local.style.fontSize =
                    "12px";

                local.style.color =
                    "#777";

                local.style.marginTop =
                    "2px";

            }
        );

}

// ============================================
// FECHAR PAINEL DO ESTADO
// ============================================

function fecharPainelEstado() {

    const painel =
        document.getElementById(
            "painelEstadoMapa"
        );

    if (!painel) {
        return;
    }

    painel.remove();

}

// ============================================
// COORDENADAS IBGE
// ============================================

async function obterCoordenadasMunicipio(
    codigo,
    uf
) {

    try {

        const resposta =
            await fetch(
                `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${codigo}?formato=application/vnd.geo+json&qualidade=minima`
            );

        if (!resposta.ok) {

            throw new Error(
                "Erro na API de malhas do IBGE."
            );

        }

        const geojson =
            await resposta.json();

        const centro =
            encontrarCentroGeoJSON(
                geojson
            );

        if (centro) {
            return centro;
        }

    } catch (error) {

        console.warn(
            "Erro ao obter coordenadas:",
            codigo,
            error
        );

    }

    return coordenadaEstado(
        uf
    );

}

// ============================================
// CENTRO DO GEOJSON
// ============================================

function encontrarCentroGeoJSON(
    geojson
) {

    const pontos = [];

    function percorrer(
        coordenadas
    ) {

        if (
            !Array.isArray(
                coordenadas
            )
        ) {
            return;
        }

        if (
            coordenadas.length >= 2 &&
            typeof coordenadas[0] === "number" &&
            typeof coordenadas[1] === "number"
        ) {

            pontos.push([
                coordenadas[1],
                coordenadas[0]
            ]);

            return;

        }

        coordenadas.forEach(
            percorrer
        );

    }

    if (
        geojson?.geometry?.coordinates
    ) {

        percorrer(
            geojson.geometry.coordinates
        );

    }

    if (!pontos.length) {
        return null;
    }

    let latitude = 0;

    let longitude = 0;

    pontos.forEach(
        ponto => {

            latitude += ponto[0];

            longitude += ponto[1];

        }
    );

    return [
        latitude / pontos.length,
        longitude / pontos.length
    ];

}

// ============================================
// COORDENADAS DOS ESTADOS
// ============================================

function coordenadaEstado(
    uf
) {

    const coordenadas = {

        AC: [-9.0238, -70.8120],

        AL: [-9.5713, -36.7820],

        AP: [1.4102, -51.7700],

        AM: [-3.4168, -65.8561],

        BA: [-12.5797, -41.7007],

        CE: [-5.4984, -39.3206],

        DF: [-15.7998, -47.8645],

        ES: [-19.1834, -40.3089],

        GO: [-15.8270, -49.8362],

        MA: [-5.4200, -45.4400],

        MT: [-12.6819, -56.9211],

        MS: [-20.7722, -54.7852],

        MG: [-18.5122, -44.5550],

        PA: [-3.4168, -52.2166],

        PB: [-7.2400, -36.7820],

        PR: [-24.8947, -51.5500],

        PE: [-8.8137, -36.9541],

        PI: [-7.7183, -42.7289],

        RJ: [-22.2523, -42.6600],

        RN: [-5.8120, -36.5920],

        RS: [-30.0346, -51.2177],

        RO: [-10.9431, -62.8278],

        RR: [2.7376, -62.0751],

        SC: [-27.2423, -50.2189],

        SP: [-22.2500, -48.5000],

        SE: [-10.5741, -37.3857],

        TO: [-10.1753, -48.2982]

    };

    return (
        coordenadas[uf] ||
        null
    );

}

// ============================================
// PAÍSES NO EXTERIOR
// ============================================

async function carregarPaises() {

    const {
        data,
        error
    } = await db.rpc(
        "torcida_por_pais"
    );

    if (error) {

        console.error(
            "Erro torcida_por_pais:",
            error
        );

        return;

    }

    const container =
        document.getElementById(
            "listaPaises"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <p class="empty-state">
                Ainda não há torcedores cadastrados no exterior.
            </p>
        `;

        return;

    }

    data.forEach(
        item => {

            const linha =
                document.createElement(
                    "div"
                );

            linha.className =
                "country-row";

            const bandeira =
                bandeiraPais(
                    item.pais
                );

            linha.innerHTML = `
                <span>
                    ${bandeira}
                    ${escapeHTML(
                        item.pais
                    )}
                </span>

                <strong>
                    ${Number(
                        item.quantidade
                    ).toLocaleString(
                        "pt-BR"
                    )}
                </strong>
            `;

            container.appendChild(
                linha
            );

        }
    );

}

// ============================================
// BANDEIRA DO PAÍS
// ============================================

function bandeiraPais(
    pais
) {

    return (
        bandeirasPaises[pais] ||
        "🌎"
    );

}

// ============================================
// REALTIME
// ============================================

function iniciarRealtime() {

    try {

        db
            .channel(
                "mapa-da-torcida"
            )
            .on(
                "broadcast",
                {
                    event:
                        "atualizacao"
                },
                async () => {

                    console.log(
                        "Mapa atualizado."
                    );

                    await carregarDados();

                }
            )
            .subscribe(
                status => {

                    console.log(
                        "Realtime:",
                        status
                    );

                }
            );

    } catch (error) {

        console.error(
            "Erro no Realtime:",
            error
        );

    }

}

// ============================================
// SEGURANÇA
// ============================================

function escapeHTML(
    texto
) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
