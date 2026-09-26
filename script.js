/* =========================================================
   MAPA DA TORCIDA
   Supabase + Leaflet + IBGE
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://yesrkhgvlxsbvhgumzxs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy";

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   ESTADOS
========================================================= */

const estados = [
    { uf: "AC", nome: "Acre" },
    { uf: "AL", nome: "Alagoas" },
    { uf: "AP", nome: "Amapá" },
    { uf: "AM", nome: "Amazonas" },
    { uf: "BA", nome: "Bahia" },
    { uf: "CE", nome: "Ceará" },
    { uf: "DF", nome: "Distrito Federal" },
    { uf: "ES", nome: "Espírito Santo" },
    { uf: "GO", nome: "Goiás" },
    { uf: "MA", nome: "Maranhão" },
    { uf: "MT", nome: "Mato Grosso" },
    { uf: "MS", nome: "Mato Grosso do Sul" },
    { uf: "MG", nome: "Minas Gerais" },
    { uf: "PA", nome: "Pará" },
    { uf: "PB", nome: "Paraíba" },
    { uf: "PR", nome: "Paraná" },
    { uf: "PE", nome: "Pernambuco" },
    { uf: "PI", nome: "Piauí" },
    { uf: "RJ", nome: "Rio de Janeiro" },
    { uf: "RN", nome: "Rio Grande do Norte" },
    { uf: "RS", nome: "Rio Grande do Sul" },
    { uf: "RO", nome: "Rondônia" },
    { uf: "RR", nome: "Roraima" },
    { uf: "SC", nome: "Santa Catarina" },
    { uf: "SP", nome: "São Paulo" },
    { uf: "SE", nome: "Sergipe" },
    { uf: "TO", nome: "Tocantins" }
];


/* =========================================================
   PAÍSES
========================================================= */

const paises = [
    "Argentina",
    "Austrália",
    "Canadá",
    "Chile",
    "Colômbia",
    "Espanha",
    "Estados Unidos",
    "França",
    "Itália",
    "Japão",
    "México",
    "Portugal",
    "Reino Unido",
    "Uruguai",
    "Outro"
];


/* =========================================================
   ELEMENTOS
========================================================= */

const form = document.getElementById("participantForm");

const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");

const localTipo = document.getElementById("localTipo");

const brasilFields = document.getElementById("brasilFields");
const exteriorFields = document.getElementById("exteriorFields");

const estadoSelect = document.getElementById("estado");
const cidadeSelect = document.getElementById("cidade");
const paisSelect = document.getElementById("pais");

const generoSelect = document.getElementById("genero");
const exibicaoSelect = document.getElementById("exibicao");

const consentimento = document.getElementById("consentimento");

const submitButton = document.getElementById("submitButton");

const formMessage = document.getElementById("formMessage");
const successBox = document.getElementById("successBox");

const newRegistration =
    document.getElementById("newRegistration");

const mapLoading =
    document.getElementById("mapLoading");

const mapError =
    document.getElementById("mapError");

const cityModal =
    document.getElementById("cityModal");

const closeModal =
    document.getElementById("closeModal");

const modalCityName =
    document.getElementById("modalCityName");

const modalCityCount =
    document.getElementById("modalCityCount");

const modalSupporters =
    document.getElementById("modalSupporters");


/* =========================================================
   MAPA
========================================================= */

let map;

let cityMarkers = [];

let cityData = {};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    preencherEstados();
    preencherPaises();

    inicializarMapa();

    configurarEventos();

    await carregarTudo();

    iniciarRealtime();

});


/* =========================================================
   ESTADOS
========================================================= */

function preencherEstados() {

    estados.forEach((estado) => {

        const option =
            document.createElement("option");

        option.value = estado.uf;
        option.textContent =
            `${estado.uf} — ${estado.nome}`;

        estadoSelect.appendChild(option);

    });

}


/* =========================================================
   PAÍSES
========================================================= */

function preencherPaises() {

    paises.forEach((pais) => {

        const option =
            document.createElement("option");

        option.value = pais;
        option.textContent = pais;

        paisSelect.appendChild(option);

    });

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    localTipo.addEventListener(
        "change",
        alterarTipoLocal
    );

    estadoSelect.addEventListener(
        "change",
        carregarCidades
    );

    form.addEventListener(
        "submit",
        enviarCadastro
    );

    newRegistration.addEventListener(
        "click",
        resetarFormulario
    );

    closeModal.addEventListener(
        "click",
        fecharModal
    );

    cityModal.addEventListener(
        "click",
        (event) => {

            if (event.target === cityModal) {
                fecharModal();
            }

        }
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !cityModal.classList.contains("hidden")
            ) {
                fecharModal();
            }

        }
    );

}


/* =========================================================
   TIPO DE LOCAL
========================================================= */

function alterarTipoLocal() {

    esconderMensagem();

    const tipo = localTipo.value;

    if (tipo === "Brasil") {

        brasilFields.classList.remove("hidden");
        exteriorFields.classList.add("hidden");

        cidadeSelect.innerHTML =
            `<option value="">Selecione primeiro o estado</option>`;

        cidadeSelect.disabled = true;

        paisSelect.value = "";

    } else if (tipo === "Exterior") {

        exteriorFields.classList.remove("hidden");
        brasilFields.classList.add("hidden");

        estadoSelect.value = "";

        cidadeSelect.innerHTML =
            `<option value="">Selecione primeiro o estado</option>`;

        cidadeSelect.disabled = true;

    } else {

        brasilFields.classList.add("hidden");
        exteriorFields.classList.add("hidden");

    }

}


/* =========================================================
   CIDADES DO IBGE
========================================================= */

async function carregarCidades() {

    const uf = estadoSelect.value;

    cidadeSelect.innerHTML =
        `<option value="">Carregando cidades...</option>`;

    cidadeSelect.disabled = true;

    if (!uf) {

        cidadeSelect.innerHTML =
            `<option value="">Selecione primeiro o estado</option>`;

        return;

    }

    try {

        const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar as cidades."
            );
        }

        const cidades = await response.json();

        cidades.sort((a, b) =>
            a.nome.localeCompare(
                b.nome,
                "pt-BR"
            )
        );

        cidadeSelect.innerHTML =
            `<option value="">Selecione a cidade</option>`;

        cidades.forEach((cidade) => {

            const option =
                document.createElement("option");

            option.value = cidade.nome;

            option.textContent = cidade.nome;

            option.dataset.ibge =
                cidade.id;

            cidadeSelect.appendChild(option);

        });

        cidadeSelect.disabled = false;

    } catch (error) {

        cidadeSelect.innerHTML =
            `<option value="">Erro ao carregar cidades</option>`;

        mostrarMensagem(
            "Não foi possível carregar as cidades. Tente novamente."
        );

        console.error(error);

    }

}


/* =========================================================
   MAPA
========================================================= */

function inicializarMapa() {

    map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    map.setView(
        [-14.235, -51.9253],
        4
    );

}


/* =========================================================
   CARREGAR TUDO
========================================================= */

async function carregarTudo() {

    esconderMapError();

    mostrarMapLoading();

    try {

        await Promise.all([
            carregarEstatisticas(),
            carregarMapa(),
            carregarPaises()
        ]);

        esconderMapLoading();

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        esconderMapLoading();
        mostrarMapError();

    }

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

async function carregarEstatisticas() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "estatisticas_mapa"
    );

    if (error) {
        throw error;
    }

    const stats =
        typeof data === "string"
            ? JSON.parse(data)
            : data;

    atualizarEstatisticas(stats);

}


/* =========================================================
   ATUALIZAR ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas(stats) {

    const total =
        Number(stats.total || 0);

    const brasil =
        Number(stats.brasil || 0);

    const exterior =
        Number(stats.exterior || 0);

    const cidades =
        Number(stats.cidades || 0);

    const estados =
        Number(stats.estados || 0);

    document.getElementById(
        "totalTorcedores"
    ).textContent = formatarNumero(total);

    document.getElementById(
        "totalCidades"
    ).textContent = formatarNumero(cidades);

    document.getElementById(
        "totalEstados"
    ).textContent = formatarNumero(estados);

    document.getElementById(
        "totalExterior"
    ).textContent = formatarNumero(exterior);


    /* GÊNERO */

    const genderContainer =
        document.getElementById("genderStats");

    const generos = [
        [
            "Feminino",
            stats.genero_feminino
        ],
        [
            "Masculino",
            stats.genero_masculino
        ],
        [
            "Não binário",
            stats.genero_nao_binario
        ],
        [
            "Outro",
            stats.genero_outro
        ],
        [
            "Não informado",
            stats.genero_nao_informado
        ]
    ];

    genderContainer.innerHTML = "";

    generos.forEach(
        ([label, value]) => {

            const row =
                document.createElement("div");

            row.className = "stat-row";

            row.innerHTML = `
                <span class="stat-row-label">
                    ${escapeHTML(label)}
                </span>

                <strong class="stat-row-value">
                    ${formatarNumero(Number(value || 0))}
                </strong>
            `;

            genderContainer.appendChild(row);

        }
    );


    /* ORIGEM */

    const totalOrigem =
        brasil + exterior;

    const brasilPercent =
        totalOrigem > 0
            ? Math.round(
                (brasil / totalOrigem) * 100
            )
            : 0;

    const exteriorPercent =
        totalOrigem > 0
            ? Math.round(
                (exterior / totalOrigem) * 100
            )
            : 0;

    document.getElementById(
        "brasilPercent"
    ).textContent =
        `${brasilPercent}%`;

    document.getElementById(
        "exteriorPercent"
    ).textContent =
        `${exteriorPercent}%`;

    document.getElementById(
        "brasilBar"
    ).style.width =
        `${brasilPercent}%`;

    document.getElementById(
        "exteriorBar"
    ).style.width =
        `${exteriorPercent}%`;

}


/* =========================================================
   MAPA — DADOS
========================================================= */

async function carregarMapa() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "dados_mapa"
    );

    if (error) {
        throw error;
    }

    organizarDadosMapa(data || []);

}


/* =========================================================
   ORGANIZAR DADOS
========================================================= */

function organizarDadosMapa(registros) {

    cityData = {};

    registros.forEach((registro) => {

        const codigo =
            String(registro.codigo_ibge);

        if (!cityData[codigo]) {

            cityData[codigo] = {
                codigo_ibge: codigo,
                cidade: registro.cidade,
                estado_uf: registro.estado_uf,
                apoiadores: []
            };

        }

        cityData[codigo].apoiadores.push({
            nome_exibicao:
                registro.nome_exibicao,
            idade:
                registro.idade
        });

    });

    renderizarMapa();

}


/* =========================================================
   RENDERIZAR MAPA
========================================================= */

async function renderizarMapa() {

    limparMarcadores();

    const cidades =
        Object.values(cityData);

    for (const cidade of cidades) {

        try {

            const coordenadas =
                await obterCoordenadasCidade(
                    cidade.codigo_ibge,
                    cidade.estado_uf
                );

            if (!coordenadas) {
                continue;
            }

            criarMarcadorCidade(
                cidade,
                coordenadas
            );

        } catch (error) {

            console.warn(
                "Erro na cidade:",
                cidade.cidade,
                error
            );

        }

    }

}


/* =========================================================
   COORDENADAS
========================================================= */

async function obterCoordenadasCidade(
    codigoIBGE,
    uf
) {

    try {

        const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${codigoIBGE}?formato=application/vnd.geo+json&qualidade=minima`
        );

        if (!response.ok) {
            throw new Error("IBGE indisponível");
        }

        const geojson =
            await response.json();

        const centro =
            calcularCentroGeoJSON(geojson);

        if (
            centro &&
            Number.isFinite(centro.lat) &&
            Number.isFinite(centro.lng)
        ) {
            return centro;
        }

    } catch (error) {

        console.warn(
            `Coordenadas IBGE não encontradas para ${codigoIBGE}`,
            error
        );

    }

    return coordenadasEstado(uf);

}


/* =========================================================
   CENTRO DO GEOJSON
========================================================= */

function calcularCentroGeoJSON(
    geojson
) {

    const coordenadas = [];

    function percorrer(coords) {

        if (
            Array.isArray(coords) &&
            coords.length >= 2 &&
            typeof coords[0] === "number" &&
            typeof coords[1] === "number"
        ) {

            coordenadas.push([
                coords[0],
                coords[1]
            ]);

            return;
        }

        if (Array.isArray(coords)) {

            coords.forEach(
                percorrer
            );

        }

    }

    if (
        geojson &&
        geojson.features
    ) {

        geojson.features.forEach(
            (feature) => {

                if (
                    feature.geometry &&
                    feature.geometry.coordinates
                ) {

                    percorrer(
                        feature.geometry.coordinates
                    );

                }

            }
        );

    }

    if (!coordenadas.length) {
        return null;
    }

    let somaLng = 0;
    let somaLat = 0;

    coordenadas.forEach(
        ([lng, lat]) => {

            somaLng += lng;
            somaLat += lat;

        }
    );

    return {
        lat:
            somaLat /
            coordenadas.length,

        lng:
            somaLng /
            coordenadas.length
    };

}


/* =========================================================
   COORDENADAS DE FALLBACK POR ESTADO
========================================================= */

function coordenadasEstado(uf) {

    const coordenadas = {

        AC: [-9.02, -70.81],
        AL: [-9.57, -36.78],
        AP: [1.41, -51.77],
        AM: [-3.47, -65.10],
        BA: [-12.97, -41.44],
        CE: [-5.20, -39.53],
        DF: [-15.78, -47.93],
        ES: [-19.19, -40.34],
        GO: [-15.82, -49.84],
        MA: [-5.42, -45.44],
        MT: [-12.68, -56.92],
        MS: [-20.77, -54.78],
        MG: [-18.10, -44.38],
        PA: [-3.79, -52.48],
        PB: [-7.24, -36.78],
        PR: [-24.89, -51.55],
        PE: [-8.38, -37.86],
        PI: [-7.72, -42.73],
        RJ: [-22.25, -42.66],
        RN: [-5.81, -36.59],
        RS: [-30.17, -53.50],
        RO: [-10.83, -63.34],
        RR: [2.73, -62.08],
        SC: [-27.45, -50.95],
        SP: [-22.19, -48.79],
        SE: [-10.57, -37.45],
        TO: [-10.17, -48.33]

    };

    if (!coordenadas[uf]) {
        return null;
    }

    return {
        lat: coordenadas[uf][0],
        lng: coordenadas[uf][1]
    };

}


/* =========================================================
   CRIAR MARCADOR
========================================================= */

function criarMarcadorCidade(
    cidade,
    coordenadas
) {

    const quantidade =
        cidade.apoiadores.length;

    const tamanho =
        Math.max(
            30,
            Math.min(
                70,
                25 +
                Math.sqrt(quantidade) * 10
            )
        );

    const icon =
        L.divIcon({

            className: "",

            html: `
                <div
                    class="city-marker"
                    style="
                        width:${tamanho}px;
                        height:${tamanho}px;
                        margin-left:-${tamanho / 2}px;
                        margin-top:-${tamanho / 2}px;
                    "
                >
                    <span>${quantidade}</span>
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


    const marker =
        L.marker(
            [
                coordenadas.lat,
                coordenadas.lng
            ],
            {
                icon
            }
        );


    marker.addTo(map);


    marker.on(
        "click",
        () => {

            abrirModalCidade(
                cidade
            );

        }
    );


    cityMarkers.push(marker);

}


/* =========================================================
   LIMPAR MARCADORES
========================================================= */

function limparMarcadores() {

    cityMarkers.forEach(
        (marker) => {

            map.removeLayer(
                marker
            );

        }
    );

    cityMarkers = [];

}


/* =========================================================
   MODAL CIDADE
========================================================= */

function abrirModalCidade(
    cidade
) {

    modalCityName.textContent =
        `${cidade.cidade} — ${cidade.estado_uf}`;

    const quantidade =
        cidade.apoiadores.length;

    modalCityCount.textContent =
        `${formatarNumero(quantidade)} ${
            quantidade === 1
                ? "torcedor"
                : "torcedores"
        }`;

    modalSupporters.innerHTML = "";

    cidade.apoiadores.forEach(
        (pessoa) => {

            const row =
                document.createElement("div");

            row.className =
                "supporter-row";

            row.innerHTML = `
                <span class="supporter-name">
                    ${escapeHTML(
                        pessoa.nome_exibicao
                    )}
                </span>

                <span class="supporter-age">
                    ${Number(pessoa.idade)} anos
                </span>
            `;

            modalSupporters.appendChild(row);

        }
    );

    cityModal.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

}


function fecharModal() {

    cityModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   PAÍSES
========================================================= */

async function carregarPaises() {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "torcida_por_pais"
    );

    if (error) {
        throw error;
    }

    const container =
        document.getElementById(
            "countryStats"
        );

    container.innerHTML = "";

    if (!data || !data.length) {

        container.innerHTML =
            `<p class="empty-state">
                Ainda não há torcedores cadastrados no exterior.
            </p>`;

        return;

    }

    data
        .sort(
            (a, b) =>
                Number(b.quantidade) -
                Number(a.quantidade)
        )
        .forEach(
            (item) => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "stat-row";

                row.innerHTML = `
                    <span class="stat-row-label">
                        ${escapeHTML(item.pais)}
                    </span>

                    <strong class="stat-row-value">
                        ${formatarNumero(
                            Number(item.quantidade)
                        )}
                    </strong>
                `;

                container.appendChild(row);

            }
        );

}


/* =========================================================
   CADASTRO
========================================================= */

async function enviarCadastro(
    event
) {

    event.preventDefault();

    esconderMensagem();

    if (!consentimento.checked) {

        mostrarMensagem(
            "É necessário autorizar a utilização dos dados."
        );

        return;

    }


    const nome =
        nomeInput.value.trim();

    const idade =
        Number(idadeInput.value);

    const tipo =
        localTipo.value;

    const genero =
        generoSelect.value;

    const exibicao =
        exibicaoSelect.value;


    if (!nome) {

        mostrarMensagem(
            "Digite seu nome."
        );

        return;

    }


    if (
        !Number.isInteger(idade) ||
        idade < 13 ||
        idade > 120
    ) {

        mostrarMensagem(
            "Informe uma idade válida entre 13 e 120 anos."
        );

        return;

    }


    if (!tipo) {

        mostrarMensagem(
            "Selecione onde você está."
        );

        return;

    }


    if (!genero) {

        mostrarMensagem(
            "Selecione seu gênero."
        );

        return;

    }


    if (!exibicao) {

        mostrarMensagem(
            "Escolha como seu nome aparecerá no mapa."
        );

        return;

    }


    let estadoUF = null;
    let cidade = null;
    let codigoIBGE = null;
    let pais = null;


    if (tipo === "Brasil") {

        estadoUF =
            estadoSelect.value;

        cidade =
            cidadeSelect.value;

        const option =
            cidadeSelect.options[
                cidadeSelect.selectedIndex
            ];

        codigoIBGE =
            option?.dataset?.ibge || null;


        if (
            !estadoUF ||
            !cidade ||
            !codigoIBGE
        ) {

            mostrarMensagem(
                "Selecione seu estado e sua cidade."
            );

            return;

        }

    }


    if (tipo === "Exterior") {

        pais =
            paisSelect.value;

        if (!pais) {

            mostrarMensagem(
                "Selecione seu país."
            );

            return;

        }

    }


    submitButton.disabled = true;

    submitButton.textContent =
        "CADASTRANDO...";


    try {

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "cadastrar_participante",
            {
                p_nome: nome,
                p_idade: idade,
                p_local_tipo: tipo,
                p_estado_uf: estadoUF,
                p_cidade: cidade,
                p_codigo_ibge: codigoIBGE,
                p_pais: pais,
                p_genero: genero,
                p_exibicao: exibicao,
                p_consentimento: true
            }
        );


        if (error) {
            throw error;
        }


        console.log(
            "Cadastro realizado:",
            data
        );


        form.classList.add(
            "hidden"
        );

        successBox.classList.remove(
            "hidden"
        );


        await carregarTudo();


    } catch (error) {

        console.error(
            "Erro no cadastro:",
            error
        );

        mostrarMensagem(
            traduzirErro(
                error
            )
        );

    } finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "ENTRAR NO MAPA";

    }

}


/* =========================================================
   RESETAR FORMULÁRIO
========================================================= */

function resetarFormulario() {

    form.reset();

    form.classList.remove(
        "hidden"
    );

    successBox.classList.add(
        "hidden"
    );

    brasilFields.classList.add(
        "hidden"
    );

    exteriorFields.classList.add(
        "hidden"
    );

    cidadeSelect.innerHTML =
        `<option value="">
            Selecione primeiro o estado
        </option>`;

    cidadeSelect.disabled =
        true;

    esconderMensagem();

    window.scrollTo({
        top:
            document.getElementById(
                "cadastro"
            ).offsetTop - 20,

        behavior:
            "smooth"
    });

}


/* =========================================================
   REALTIME
========================================================= */

function iniciarRealtime() {

    const channel =
        supabaseClient.channel(
            "mapa-da-torcida"
        );


    channel
        .on(
            "broadcast",
            {
                event: "atualizacao"
            },
            async () => {

                console.log(
                    "Mapa atualizado em tempo real."
                );

                try {

                    await carregarTudo();

                } catch (error) {

                    console.error(
                        "Erro na atualização:",
                        error
                    );

                }

            }
        )
        .subscribe(
            (status) => {

                console.log(
                    "Realtime:",
                    status
                );

            }
        );

}


/* =========================================================
   LOADING / ERRO DO MAPA
========================================================= */

function mostrarMapLoading() {

    mapLoading.classList.remove(
        "hidden"
    );

}


function esconderMapLoading() {

    mapLoading.classList.add(
        "hidden"
    );

}


function mostrarMapError() {

    mapError.classList.remove(
        "hidden"
    );

}


function esconderMapError() {

    mapError.classList.add(
        "hidden"
    );

}


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagem(
    mensagem
) {

    formMessage.textContent =
        mensagem;

    formMessage.classList.remove(
        "hidden"
    );

}


function esconderMensagem() {

    formMessage.textContent =
        "";

    formMessage.classList.add(
        "hidden"
    );

}


/* =========================================================
   TRADUZIR ERROS
========================================================= */

function traduzirErro(
    error
) {

    const mensagem =
        error?.message ||
        "";

    if (
        mensagem.includes(
            "É necessário autorizar"
        )
    ) {
        return mensagem;
    }

    if (
        mensagem.includes(
            "Nome"
        )
    ) {
        return mensagem;
    }

    if (
        mensagem.includes(
            "idade"
        )
    ) {
        return mensagem;
    }

    if (
        mensagem.includes(
            "permission denied"
        )
    ) {

        return (
            "O cadastro não pôde ser realizado por falta de permissão no banco."
        );

    }

    return (
        "Não foi possível realizar o cadastro. Tente novamente."
    );

}


/* =========================================================
   UTILIDADES
========================================================= */

function formatarNumero(
    numero
) {

    return Number(
        numero || 0
    ).toLocaleString(
        "pt-BR"
    );

}


function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
