// ============================================================
// MAPA DA TORCIDA
// ============================================================

// ------------------------------------------------------------
// SUPABASE
// ------------------------------------------------------------

const SUPABASE_URL =
    "https://yesrkhgvlxsbvhgumzxs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ------------------------------------------------------------
// ESTADOS
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// PAÍSES
// ------------------------------------------------------------

const paises = [
    "Argentina",
    "Austrália",
    "Bolívia",
    "Canadá",
    "Chile",
    "Colômbia",
    "Espanha",
    "Estados Unidos",
    "França",
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


// ------------------------------------------------------------
// BANDEIRAS
// ------------------------------------------------------------

const bandeirasPaises = {
    Argentina: "🇦🇷",
    Austrália: "🇦🇺",
    Bolívia: "🇧🇴",
    Canadá: "🇨🇦",
    Chile: "🇨🇱",
    Colômbia: "🇨🇴",
    Espanha: "🇪🇸",
    "Estados Unidos": "🇺🇸",
    França: "🇫🇷",
    Itália: "🇮🇹",
    Japão: "🇯🇵",
    México: "🇲🇽",
    Paraguai: "🇵🇾",
    Peru: "🇵🇪",
    Portugal: "🇵🇹",
    "Reino Unido": "🇬🇧",
    Uruguai: "🇺🇾",
    Outro: "🌎"
};


// ------------------------------------------------------------
// VARIÁVEIS
// ------------------------------------------------------------

let map = null;

let dadosMapa = [];
let dadosEstados = [];

let marcadoresCidades = [];
let marcadoresEstados = [];

let coordenadasCidades = {};

let zoomCamadaCidades = 7;


// ------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        preencherEstados();
        preencherPaises();

        configurarEventos();

        inicializarMapa();

        await carregarTudo();

    }
);


// ------------------------------------------------------------
// ESTADOS NO FORMULÁRIO
// ------------------------------------------------------------

function preencherEstados() {

    const select =
        document.getElementById("estado");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione o estado</option>';

    Object.entries(estados)
        .sort(
            (a, b) =>
                a[1].localeCompare(
                    b[1],
                    "pt-BR"
                )
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

                select.appendChild(option);

            }
        );

}


// ------------------------------------------------------------
// PAÍSES NO FORMULÁRIO
// ------------------------------------------------------------

function preencherPaises() {

    const select =
        document.getElementById("pais");

    if (!select) return;

    select.innerHTML =
        '<option value="">Selecione o país</option>';

    paises.forEach(
        pais => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = pais;

            option.textContent =
                `${bandeirasPaises[pais] || "🌎"} ${pais}`;

            select.appendChild(option);

        }
    );

}


// ------------------------------------------------------------
// EVENTOS
// ------------------------------------------------------------

function configurarEventos() {

    const localTipo =
        document.getElementById("localTipo");

    const estado =
        document.getElementById("estado");

    const form =
        document.getElementById(
            "participantForm"
        );

    if (localTipo) {

        localTipo.addEventListener(
            "change",
            alterarTipoLocal
        );

    }

    if (estado) {

        estado.addEventListener(
            "change",
            carregarCidades
        );

    }

    if (form) {

        form.addEventListener(
            "submit",
            cadastrarParticipante
        );

    }

}


// ------------------------------------------------------------
// BRASIL / EXTERIOR
// ------------------------------------------------------------

function alterarTipoLocal() {

    const tipo =
        document.getElementById(
            "localTipo"
        )?.value;

    const brasilFields =
        document.getElementById(
            "brasilFields"
        );

    const exteriorFields =
        document.getElementById(
            "exteriorFields"
        );


    if (tipo === "Brasil") {

        if (brasilFields) {

            brasilFields.style.display =
                "";

        }

        if (exteriorFields) {

            exteriorFields.style.display =
                "none";

        }

    } else if (tipo === "Exterior") {

        if (brasilFields) {

            brasilFields.style.display =
                "none";

        }

        if (exteriorFields) {

            exteriorFields.style.display =
                "";

        }

    } else {

        if (brasilFields) {

            brasilFields.style.display =
                "none";

        }

        if (exteriorFields) {

            exteriorFields.style.display =
                "none";

        }

    }

}


// ------------------------------------------------------------
// CIDADES DO IBGE
// ------------------------------------------------------------

async function carregarCidades() {

    const uf =
        document.getElementById(
            "estado"
        )?.value;

    const cidade =
        document.getElementById(
            "cidade"
        );

    if (!cidade) return;

    cidade.disabled = true;

    cidade.innerHTML =
        '<option value="">Carregando cidades...</option>';


    if (!uf) {

        cidade.innerHTML =
            '<option value="">Selecione primeiro o estado</option>';

        return;

    }


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


        cidade.innerHTML =
            '<option value="">Selecione a cidade</option>';


        municipios
            .sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            )
            .forEach(
                municipio => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        municipio.nome;

                    option.textContent =
                        municipio.nome;

                    option.dataset.ibge =
                        municipio.id;

                    cidade.appendChild(
                        option
                    );

                }
            );


        cidade.disabled = false;

    } catch (erro) {

        console.error(
            "Erro ao carregar cidades:",
            erro
        );

        cidade.innerHTML =
            '<option value="">Erro ao carregar cidades</option>';

    }

}


// ------------------------------------------------------------
// CADASTRO
// ------------------------------------------------------------

async function cadastrarParticipante(
    event
) {

    event.preventDefault();


    const nome =
        document
            .getElementById("nome")
            .value
            .trim();


    const idade =
        Number(
            document
                .getElementById("idade")
                .value
        );


    const localTipo =
        document
            .getElementById("localTipo")
            .value;


    const estado =
        document
            .getElementById("estado")
            .value;


    const cidadeSelect =
        document
            .getElementById("cidade");


    const cidade =
        cidadeSelect.value;


    const codigoIbge =
        cidadeSelect
            .selectedOptions[0]
            ?.dataset
            ?.ibge || null;


    const pais =
        document
            .getElementById("pais")
            .value;


    const genero =
        document
            .getElementById("genero")
            .value;


    const exibicao =
        document
            .getElementById("exibicao")
            .value;


    const consentimento =
        document
            .getElementById("consentimento")
            .checked;


    const submitButton =
        document.getElementById(
            "submitButton"
        );


    if (!consentimento) {

        mostrarMensagem(
            "Você precisa aceitar o termo de consentimento.",
            true
        );

        return;

    }


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Enviando...";

    }


    try {

        const { data, error } =
            await db.rpc(
                "cadastrar_participante",
                {
                    p_nome: nome,
                    p_idade: idade,

                    p_local_tipo:
                        localTipo,

                    p_estado_uf:
                        localTipo === "Brasil"
                            ? estado
                            : null,

                    p_cidade:
                        localTipo === "Brasil"
                            ? cidade
                            : null,

                    p_codigo_ibge:
                        localTipo === "Brasil"
                            ? codigoIbge
                            : null,

                    p_pais:
                        localTipo === "Exterior"
                            ? pais
                            : null,

                    p_genero:
                        genero,

                    p_exibicao:
                        exibicao,

                    p_consentimento:
                        consentimento
                }
            );


        if (error) {

            throw error;

        }


        console.log(
            "Participante cadastrado:",
            data
        );


        const successBox =
            document.getElementById(
                "successBox"
            );


        const formMessage =
            document.getElementById(
                "formMessage"
            );


        if (successBox) {

            successBox.style.display =
                "";

        }


        if (formMessage) {

            formMessage.textContent =
                "Você está no mapa! 💚💛";

        }


        document
            .getElementById(
                "participantForm"
            )
            ?.reset();


        alterarTipoLocal();


        await carregarTudo();


    } catch (erro) {

        console.error(
            "Erro ao cadastrar:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível realizar o cadastro.",
            true
        );

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "FAÇA PARTE DO MAPA";

        }

    }

}


// ------------------------------------------------------------
// MENSAGEM
// ------------------------------------------------------------

function mostrarMensagem(
    mensagem,
    erro = false
) {

    const elemento =
        document.getElementById(
            "formMessage"
        );

    if (!elemento) return;

    elemento.textContent =
        mensagem;

    elemento.style.color =
        erro
            ? "#c62828"
            : "#00843D";

}


// ------------------------------------------------------------
// MAPA
// ------------------------------------------------------------

function inicializarMapa() {

    map =
        L.map(
            "map",
            {
                zoomControl: true,
                minZoom: 4,
                maxZoom: 12
            }
        );


    map.setView(
        [-14.2, -51.9],
        4
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    map.on(
        "zoomend",
        atualizarCamadaMapa
    );

}


// ------------------------------------------------------------
// CARREGAR TUDO
// ------------------------------------------------------------

async function carregarTudo() {

    try {

        await Promise.all([
            carregarEstatisticas(),
            carregarMapa(),
            carregarEstadosMapa(),
            carregarPaisesMapa()
        ]);


        await prepararMarcadores();


        atualizarCamadaMapa();


    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

    }

}


// ------------------------------------------------------------
// ESTATÍSTICAS
// ------------------------------------------------------------

async function carregarEstatisticas() {

    const { data, error } =
        await db.rpc(
            "estatisticas_mapa"
        );


    if (error) {

        console.error(
            "Erro nas estatísticas:",
            error
        );

        return;

    }


    if (!data) return;


    atualizarElemento(
        "totalSupporters",
        data.total ?? 0
    );

    atualizarElemento(
        "totalCities",
        data.cidades ?? 0
    );

    atualizarElemento(
        "totalStates",
        data.estados ?? 0
    );

    atualizarElemento(
        "totalForeign",
        data.exterior ?? 0
    );


    atualizarElemento(
        "genderFemale",
        data.genero_feminino ?? 0
    );

    atualizarElemento(
        "genderMale",
        data.genero_masculino ?? 0
    );

    atualizarElemento(
        "genderNonBinary",
        data.genero_nao_binario ?? 0
    );

    atualizarElemento(
        "genderOther",
        data.genero_outro ?? 0
    );

    atualizarElemento(
        "genderNoInfo",
        data.genero_nao_informado ?? 0
    );

}


// ------------------------------------------------------------
// ATUALIZAR ELEMENTO
// ------------------------------------------------------------

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (!elemento) return;

    elemento.textContent =
        Number(valor)
            .toLocaleString("pt-BR");

}


// ------------------------------------------------------------
// DADOS DO MAPA
// ------------------------------------------------------------

async function carregarMapa() {

    const { data, error } =
        await db.rpc(
            "dados_mapa"
        );


    if (error) {

        console.error(
            "Erro nos dados do mapa:",
            error
        );

        return;

    }


    dadosMapa =
        organizarDadosMapa(
            data || []
        );

}


// ------------------------------------------------------------
// AGRUPAR POR CIDADE
// ------------------------------------------------------------

function organizarDadosMapa(
    data
) {

    const grupos = {};


    data.forEach(
        item => {

            const chave =
                item.codigo_ibge ||
                `${item.cidade}-${item.estado_uf}`;


            if (!grupos[chave]) {

                grupos[chave] = {

                    cidade:
                        item.cidade,

                    estado_uf:
                        item.estado_uf,

                    codigo_ibge:
                        item.codigo_ibge,

                    participantes: []

                };

            }


            grupos[chave]
                .participantes
                .push(item);

        }
    );


    return Object.values(
        grupos
    );

}


// ------------------------------------------------------------
// DADOS POR ESTADO
// ------------------------------------------------------------

async function carregarEstadosMapa() {

    const { data, error } =
        await db.rpc(
            "torcida_por_estado"
        );


    if (error) {

        console.error(
            "Erro nos dados por estado:",
            error
        );

        return;

    }


    dadosEstados =
        data || [];

}


// ------------------------------------------------------------
// PAÍSES
// ------------------------------------------------------------

async function carregarPaisesMapa() {

    const { data, error } =
        await db.rpc(
            "torcida_por_pais"
        );


    if (error) {

        console.error(
            "Erro nos países:",
            error
        );

        return;

    }


    renderizarPaises(
        data || []
    );

}


// ------------------------------------------------------------
// RENDERIZAR PAÍSES
// ------------------------------------------------------------

function renderizarPaises(
    data
) {

    const container =
        document.getElementById(
            "countryStats"
        );

    if (!container) return;


    container.innerHTML = "";


    data
        .sort(
            (a, b) =>
                Number(b.quantidade) -
                Number(a.quantidade)
        )
        .forEach(
            item => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "country-stat";


                const bandeira =
                    bandeirasPaises[
                        item.pais
                    ] || "🌎";


                div.innerHTML = `
                    <span>
                        ${bandeira}
                        ${escapeHTML(item.pais)}
                    </span>

                    <strong>
                        ${Number(
                            item.quantidade
                        ).toLocaleString("pt-BR")}
                    </strong>
                `;


                container.appendChild(
                    div
                );

            }
        );

}


// ============================================================
// MARCADORES
// ============================================================

// ------------------------------------------------------------
// PREPARAR MARCADORES
// ------------------------------------------------------------

async function prepararMarcadores() {

    limparMarcadores();


    // --------------------------------------------------------
    // ESTADOS
    // --------------------------------------------------------

    dadosEstados.forEach(
        estado => {

            const quantidade =
                Number(
                    estado.quantidade
                ) || 0;


            if (!quantidade) return;


            const coordenadas =
                coordenadasEstado(
                    estado.estado_uf
                );


            if (!coordenadas) return;


            const marcador =
                criarMarcadorEstado(
                    estado.estado_uf,
                    quantidade,
                    coordenadas
                );


            marcadoresEstados.push(
                marcador
            );

        }
    );


    // --------------------------------------------------------
    // CIDADES
    // --------------------------------------------------------

    for (
        const cidade of dadosMapa
    ) {

        const coordenadas =
            await obterCoordenadasCidade(
                cidade
            );


        if (!coordenadas) {

            console.warn(
                "Sem coordenadas:",
                cidade.cidade,
                cidade.estado_uf,
                cidade.codigo_ibge
            );

            continue;

        }


        const marcador =
            criarMarcadorCidade(
                cidade,
                coordenadas
            );


        if (marcador) {

            marcadoresCidades.push(
                marcador
            );

        }

    }

}


// ------------------------------------------------------------
// LIMPAR
// ------------------------------------------------------------

function limparMarcadores() {

    if (!map) return;


    marcadoresEstados.forEach(
        marcador => {

            if (
                map.hasLayer(
                    marcador
                )
            ) {

                map.removeLayer(
                    marcador
                );

            }

        }
    );


    marcadoresCidades.forEach(
        marcador => {

            if (
                map.hasLayer(
                    marcador
                )
            ) {

                map.removeLayer(
                    marcador
                );

            }

        }
    );


    marcadoresEstados = [];
    marcadoresCidades = [];

}


// ------------------------------------------------------------
// TAMANHO
// ------------------------------------------------------------

function calcularTamanhoMarcador(
    quantidade,
    minimo,
    maximo
) {

    const tamanho =
        minimo +
        Math.sqrt(
            Math.max(
                1,
                quantidade
            )
        ) * 8;


    return Math.min(
        maximo,
        tamanho
    );

}


// ------------------------------------------------------------
// ESTADO
// ------------------------------------------------------------

function criarMarcadorEstado(
    uf,
    quantidade,
    coordenadas
) {

    const tamanho =
        calcularTamanhoMarcador(
            quantidade,
            48,
            86
        );


    const icon =
        L.divIcon({

            className:
                "mapa-bolha-estado",

            html: `
                <div
                    style="
                        width:${tamanho}px;
                        height:${tamanho}px;
                        border-radius:50%;
                        background:#00843D;
                        border:3px solid #FFD100;
                        box-sizing:border-box;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:white;
                        font-size:${Math.max(
                            16,
                            Math.min(
                                27,
                                tamanho / 2.6
                            )
                        )}px;
                        font-weight:800;
                        line-height:1;
                        box-shadow:
                            0 3px 10px rgba(0,0,0,.25);
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
                icon
            }
        );


    const nomeEstado =
        estados[uf] || uf;


    marcador.bindPopup(
        `
            <strong>
                ${escapeHTML(nomeEstado)}
                (${escapeHTML(uf)})
            </strong>

            <br>

            ${quantidade}
            torcedor${quantidade === 1 ? "" : "es"}
        `
    );


    return marcador;

}


// ------------------------------------------------------------
// CIDADE
// ------------------------------------------------------------

function criarMarcadorCidade(
    cidadeInfo,
    coordenadas
) {

    const participantes =
        cidadeInfo.participantes || [];


    const quantidade =
        participantes.length;


    if (!quantidade) {

        return null;

    }


    const tamanho =
        calcularTamanhoMarcador(
            quantidade,
            44,
            78
        );


    const icon =
        L.divIcon({

            className:
                "mapa-bolha-cidade",

            html: `
                <div
                    style="
                        width:${tamanho}px;
                        height:${tamanho}px;
                        border-radius:50%;
                        background:#00843D;
                        border:3px solid #FFD100;
                        box-sizing:border-box;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:white;
                        font-size:${Math.max(
                            15,
                            Math.min(
                                25,
                                tamanho / 2.7
                            )
                        )}px;
                        font-weight:800;
                        line-height:1;
                        box-shadow:
                            0 3px 10px rgba(0,0,0,.25);
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
                icon
            }
        );


    const lista =
        participantes
            .map(
                participante => {

                    const nome =
                        participante.nome_exibicao ||
                        "Torcedor";


                    if (
                        nome === "Torcedor"
                    ) {

                        return `
                            <div
                                style="
                                    padding:6px 0;
                                    border-bottom:1px solid #eee;
                                "
                            >
                                <strong>
                                    Torcedor
                                </strong>
                            </div>
                        `;

                    }


                    const idade =
                        participante.idade
                            ? `, ${participante.idade} anos`
                            : "";


                    return `
                        <div
                            style="
                                padding:6px 0;
                                border-bottom:1px solid #eee;
                            "
                        >
                            <strong>
                                ${escapeHTML(nome)}
                            </strong>${idade}
                        </div>
                    `;

                }
            )
            .join("");


    marcador.bindPopup(
        `
            <div
                style="
                    min-width:200px;
                    max-width:280px;
                "
            >

                <strong>
                    ${escapeHTML(
                        cidadeInfo.cidade
                    )}
                    /
                    ${escapeHTML(
                        cidadeInfo.estado_uf
                    )}
                </strong>

                <div
                    style="
                        margin:5px 0 8px;
                        font-size:13px;
                        color:#666;
                    "
                >
                    ${quantidade}
                    torcedor${quantidade === 1 ? "" : "es"}
                </div>

                ${lista}

            </div>
        `
    );


    return marcador;

}


// ============================================================
// COORDENADAS MUNICIPAIS
// ============================================================

// Esta é a parte importante da correção.
//
// O código IBGE identifica EXATAMENTE o município.
// Exemplo:
//
// São Paulo → 3550308
// Osasco    → 3534401
//
// Cada código recebe sua própria coordenada.
//
// ============================================================

async function obterCoordenadasCidade(
    cidadeInfo
) {

    const codigo =
        String(
            cidadeInfo.codigo_ibge || ""
        );


    if (!codigo) {

        return null;

    }


    // Se já buscamos antes, reutiliza.
    if (
        coordenadasCidades[codigo]
    ) {

        return coordenadasCidades[
            codigo
        ];

    }


    try {

        // ----------------------------------------------------
        // PRIMEIRA TENTATIVA:
        // malha municipal do IBGE
        // ----------------------------------------------------

        const resposta =
            await fetch(
                `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${codigo}?formato=application/vnd.geo+json`
            );


        if (
            resposta.ok
        ) {

            const geojson =
                await resposta.json();


            const centro =
                calcularCentroGeoJSON(
                    geojson
                );


            if (centro) {

                coordenadasCidades[
                    codigo
                ] = centro;


                return centro;

            }

        }


    } catch (erro) {

        console.warn(
            "Erro na malha IBGE:",
            codigo,
            erro
        );

    }


    // --------------------------------------------------------
    // SEGUNDA TENTATIVA:
    // API de localização do município
    // --------------------------------------------------------

    try {

        const resposta =
            await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${codigo}`
            );


        if (
            resposta.ok
        ) {

            const municipio =
                await resposta.json();


            // Alguns retornos possuem
            // coordenadas diretamente.

            if (
                municipio.latitude &&
                municipio.longitude
            ) {

                const coordenadas = [
                    Number(
                        municipio.latitude
                    ),
                    Number(
                        municipio.longitude
                    )
                ];


                coordenadasCidades[
                    codigo
                ] = coordenadas;


                return coordenadas;

            }

        }

    } catch (erro) {

        console.warn(
            "Erro na localização do município:",
            codigo,
            erro
        );

    }


    // --------------------------------------------------------
    // ÚLTIMO RECURSO:
    // busca por nome + UF no Nominatim
    // --------------------------------------------------------

    try {

        const cidade =
            encodeURIComponent(
                cidadeInfo.cidade
            );


        const uf =
            encodeURIComponent(
                cidadeInfo.estado_uf
            );


        const resposta =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=Brasil&city=${cidade}&state=${uf}`
            );


        if (
            resposta.ok
        ) {

            const resultado =
                await resposta.json();


            if (
                resultado.length
            ) {

                const coordenadas = [
                    Number(
                        resultado[0].lat
                    ),
                    Number(
                        resultado[0].lon
                    )
                ];


                coordenadasCidades[
                    codigo
                ] = coordenadas;


                return coordenadas;

            }

        }

    } catch (erro) {

        console.warn(
            "Erro no Nominatim:",
            cidadeInfo.cidade,
            erro
        );

    }


    return null;

}


// ------------------------------------------------------------
// CENTRO DA GEOMETRIA
// ------------------------------------------------------------

function calcularCentroGeoJSON(
    geojson
) {

    const pontos = [];


    function coletar(
        coordenadas
    ) {

        if (
            !Array.isArray(
                coordenadas
            )
        ) {

            return;

        }


        // [longitude, latitude]

        if (
            coordenadas.length >= 2 &&
            typeof coordenadas[0] ===
                "number" &&
            typeof coordenadas[1] ===
                "number"
        ) {

            pontos.push(
                coordenadas
            );

            return;

        }


        coordenadas.forEach(
            item =>
                coletar(item)
        );

    }


    if (
        geojson?.features
    ) {

        geojson.features.forEach(
            feature => {

                if (
                    feature.geometry
                ) {

                    coletar(
                        feature.geometry.coordinates
                    );

                }

            }
        );

    } else if (
        geojson?.geometry
    ) {

        coletar(
            geojson.geometry.coordinates
        );

    }


    if (!pontos.length) {

        return null;

    }


    let longitude = 0;
    let latitude = 0;


    pontos.forEach(
        ponto => {

            longitude +=
                ponto[0];

            latitude +=
                ponto[1];

        }
    );


    return [
        latitude / pontos.length,
        longitude / pontos.length
    ];

}


// ============================================================
// COORDENADAS DOS ESTADOS
// ============================================================

function coordenadasEstado(
    uf
) {

    const coordenadas = {

        AC: [-9.02, -70.81],
        AL: [-9.57, -36.78],
        AP: [1.41, -51.77],
        AM: [-3.47, -65.10],
        BA: [-12.96, -41.65],
        CE: [-5.20, -39.53],
        DF: [-15.78, -47.93],
        ES: [-19.19, -40.34],
        GO: [-15.98, -49.86],
        MA: [-5.42, -45.44],
        MT: [-12.64, -55.42],
        MS: [-20.51, -54.54],
        MG: [-18.51, -44.55],
        PA: [-3.79, -52.48],
        PB: [-7.24, -36.78],
        PR: [-24.89, -51.55],
        PE: [-8.38, -37.86],
        PI: [-7.71, -42.73],
        RJ: [-22.25, -42.66],
        RN: [-5.81, -36.59],
        RS: [-30.17, -53.50],
        RO: [-10.83, -63.34],
        RR: [2.74, -62.08],
        SC: [-27.45, -50.95],
        SP: [-22.19, -48.79],
        SE: [-10.57, -37.45],
        TO: [-10.18, -48.33]

    };


    return coordenadas[
        uf
    ] || null;

}


// ============================================================
// TROCA ESTADO ↔ CIDADE
// ============================================================

function atualizarCamadaMapa() {

    if (!map) return;


    const zoom =
        map.getZoom();


    // --------------------------------------------------------
    // Remove tudo primeiro
    // --------------------------------------------------------

    marcadoresEstados.forEach(
        marcador => {

            if (
                map.hasLayer(
                    marcador
                )
            ) {

                map.removeLayer(
                    marcador
                );

            }

        }
    );


    marcadoresCidades.forEach(
        marcador => {

            if (
                map.hasLayer(
                    marcador
                )
            ) {

                map.removeLayer(
                    marcador
                );

            }

        }
    );


    // --------------------------------------------------------
    // AFASTADO
    // --------------------------------------------------------

    if (
        zoom < zoomCamadaCidades
    ) {

        marcadoresEstados.forEach(
            marcador => {

                marcador.addTo(
                    map
                );

            }
        );


        return;

    }


    // --------------------------------------------------------
    // APROXIMADO
    // --------------------------------------------------------

    marcadoresCidades.forEach(
        marcador => {

            marcador.addTo(
                map
            );

        }
    );

}


// ============================================================
// REALTIME
// ============================================================

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
                "Mapa atualizado em tempo real."
            );


            await carregarTudo();

        }
    )
    .subscribe();


// ============================================================
// RECARREGAR AO VOLTAR PARA A ABA
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            carregarTudo();

        }

    }
);


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )
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
