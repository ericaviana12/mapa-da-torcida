// ============================================
// MAPA DA TORCIDA
// script.js
// ============================================

// ---------- SUPABASE ----------

const SUPABASE_URL = "https://yesrkhgvlxsbvhgumzxs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ---------- ESTADOS DO BRASIL ----------

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


// ---------- PAÍSES ----------

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


// ---------- VARIÁVEIS ----------

let mapa;
let marcadores = [];
let dadosMapa = [];


// ---------- ELEMENTOS ----------

const form = document.getElementById("formCadastro");

const localTipo = document.getElementById("localTipo");

const estado = document.getElementById("estado");

const cidade = document.getElementById("cidade");

const codigoIbge = document.getElementById("codigoIbge");

const pais = document.getElementById("pais");

const cidadeContainer = document.getElementById("cidadeContainer");

const estadoContainer = document.getElementById("estadoContainer");

const paisContainer = document.getElementById("paisContainer");

const mensagem = document.getElementById("mensagem");


// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    preencherEstados();

    preencherPaises();

    inicializarMapa();

    configurarEventos();

    await carregarDados();

    atualizarEstatisticas();

    iniciarRealtime();

});


// ============================================
// ESTADOS
// ============================================

function preencherEstados() {

    if (!estado) return;

    estado.innerHTML =
        '<option value="">Selecione o estado</option>';

    Object.entries(estados)
        .sort((a, b) => a[1].localeCompare(b[1]))
        .forEach(([uf, nome]) => {

            const option =
                document.createElement("option");

            option.value = uf;

            option.textContent =
                `${nome} (${uf})`;

            estado.appendChild(option);

        });
}


// ============================================
// PAÍSES
// ============================================

function preencherPaises() {

    if (!pais) return;

    pais.innerHTML =
        '<option value="">Selecione o país</option>';

    paises.forEach(nome => {

        const option =
            document.createElement("option");

        option.value = nome;

        option.textContent = nome;

        pais.appendChild(option);

    });
}


// ============================================
// EVENTOS
// ============================================

function configurarEventos() {

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
            enviarCadastro
        );

    }

}


// ============================================
// BRASIL / EXTERIOR
// ============================================

function alterarTipoLocal() {

    const valor = localTipo.value;

    if (valor === "Brasil") {

        estadoContainer?.classList.remove("hidden");

        cidadeContainer?.classList.remove("hidden");

        paisContainer?.classList.add("hidden");

        if (pais) {
            pais.value = "";
        }

    } else if (valor === "Exterior") {

        estadoContainer?.classList.add("hidden");

        cidadeContainer?.classList.add("hidden");

        paisContainer?.classList.remove("hidden");

        if (estado) {
            estado.value = "";
        }

        if (cidade) {
            cidade.innerHTML =
                '<option value="">Selecione o estado primeiro</option>';
        }

        if (codigoIbge) {
            codigoIbge.value = "";
        }

    } else {

        estadoContainer?.classList.add("hidden");

        cidadeContainer?.classList.add("hidden");

        paisContainer?.classList.add("hidden");

    }

}


// ============================================
// MUNICÍPIOS DO IBGE
// ============================================

async function carregarCidades() {

    if (!estado || !cidade || !codigoIbge) {
        return;
    }

    const uf = estado.value;

    cidade.innerHTML =
        '<option value="">Carregando cidades...</option>';

    codigoIbge.value = "";

    if (!uf) {

        cidade.innerHTML =
            '<option value="">Selecione o estado primeiro</option>';

        return;

    }

    try {

        const resposta = await fetch(
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
            .sort((a, b) =>
                a.nome.localeCompare(b.nome)
            )
            .forEach(municipio => {

                const option =
                    document.createElement("option");

                option.value =
                    municipio.id;

                option.textContent =
                    municipio.nome;

                cidade.appendChild(option);

            });

    } catch (error) {

        console.error(
            "Erro ao carregar cidades:",
            error
        );

        cidade.innerHTML =
            '<option value="">Erro ao carregar cidades</option>';

    }

}


// ============================================
// MAPA
// ============================================

function inicializarMapa() {

    const elementoMapa =
        document.getElementById("map");

    if (!elementoMapa) {
        return;
    }

    mapa = L.map("map", {
        zoomControl: true
    }).setView(
        [-14.2350, -51.9253],
        4
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(mapa);

}


// ============================================
// CARREGAR DADOS
// ============================================

async function carregarDados() {

    try {

        await Promise.all([
            carregarDadosMapa(),
            carregarEstatisticas(),
            carregarPaises()
        ]);

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

    }

}


// ============================================
// DADOS DO MAPA
// ============================================

async function carregarDadosMapa() {

    const { data, error } =
        await db.rpc("dados_mapa");

    if (error) {

        console.error(
            "Erro dados_mapa:",
            error
        );

        throw error;

    }

    dadosMapa = data || [];

    await desenharMarcadores();

}


// ============================================
// DESENHAR MARCADORES
// ============================================

async function desenharMarcadores() {

    if (!mapa) return;

    marcadores.forEach(
        marcador => mapa.removeLayer(marcador)
    );

    marcadores = [];

    const cidadesAgrupadas = {};

    dadosMapa.forEach(item => {

        if (!item.codigo_ibge) {
            return;
        }

        const codigo =
            String(item.codigo_ibge);

        if (!cidadesAgrupadas[codigo]) {

            cidadesAgrupadas[codigo] = {
                codigo,
                cidade: item.cidade,
                estado: item.estado_uf,
                participantes: []
            };

        }

        cidadesAgrupadas[codigo]
            .participantes
            .push(item);

    });


    const cidades =
        Object.values(cidadesAgrupadas);


    const promessas =
        cidades.map(async cidadeInfo => {

            try {

                const coordenadas =
                    await obterCoordenadasMunicipio(
                        cidadeInfo.codigo,
                        cidadeInfo.estado
                    );

                if (!coordenadas) {
                    return;
                }

                const quantidade =
                    cidadeInfo.participantes.length;

                const tamanho =
                    Math.max(
                        28,
                        Math.min(
                            70,
                            25 +
                            Math.sqrt(quantidade) * 9
                        )
                    );

                const icone =
                    L.divIcon({
                        className: "",
                        html: `
                            <div
                                class="city-marker"
                                style="
                                    width:${tamanho}px;
                                    height:${tamanho}px;
                                    font-size:${Math.max(
                                        12,
                                        Math.min(
                                            24,
                                            tamanho / 3
                                        )
                                    )}px;
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
                    ).addTo(mapa);


                marcador.on(
                    "click",
                    () => {

                        abrirModalCidade(
                            cidadeInfo
                        );

                    }
                );


                marcadores.push(
                    marcador
                );

            } catch (error) {

                console.error(
                    "Erro ao criar marcador:",
                    error
                );

            }

        });


    await Promise.all(promessas);

}


// ============================================
// COORDENADAS DO MUNICÍPIO
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
                "Não foi possível obter a geometria."
            );
        }

        const geojson =
            await resposta.json();

        const coordenadas =
            encontrarCentroGeoJSON(
                geojson
            );

        if (coordenadas) {
            return coordenadas;
        }

    } catch (error) {

        console.warn(
            `Não foi possível localizar ${codigo}:`,
            error
        );

    }


    return coordenadaEstado(uf);

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
            !Array.isArray(coordenadas)
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


    pontos.forEach(ponto => {

        latitude += ponto[0];

        longitude += ponto[1];

    });


    return [
        latitude / pontos.length,
        longitude / pontos.length
    ];

}


// ============================================
// COORDENADAS DOS ESTADOS
// ============================================

function coordenadaEstado(uf) {

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

    return coordenadas[uf] || null;

}


// ============================================
// ESTATÍSTICAS
// ============================================

let estatisticasAtuais = null;


async function carregarEstatisticas() {

    const { data, error } =
        await db.rpc(
            "estatisticas_mapa"
        );


    if (error) {

        console.error(
            "Erro estatisticas_mapa:",
            error
        );

        throw error;

    }


    estatisticasAtuais =
        data || {};

    atualizarEstatisticas();

}


// ============================================
// ATUALIZAR ESTATÍSTICAS NA TELA
// ============================================

function atualizarEstatisticas() {

    const dados =
        estatisticasAtuais;

    if (!dados) return;


    atualizarElemento(
        "totalTorcedores",
        dados.total ?? 0
    );

    atualizarElemento(
        "totalCidades",
        dados.cidades ?? 0
    );

    atualizarElemento(
        "totalEstados",
        dados.estados ?? 0
    );

    atualizarElemento(
        "totalExterior",
        dados.exterior ?? 0
    );


    atualizarElemento(
        "generoFeminino",
        dados.genero_feminino ?? 0
    );

    atualizarElemento(
        "generoMasculino",
        dados.genero_masculino ?? 0
    );

    atualizarElemento(
        "generoNaoBinario",
        dados.genero_nao_binario ?? 0
    );

    atualizarElemento(
        "generoOutro",
        dados.genero_outro ?? 0
    );

    atualizarElemento(
        "generoNaoInformado",
        dados.genero_nao_informado ?? 0
    );

}


function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            Number(valor).toLocaleString(
                "pt-BR"
            );

    }

}


// ============================================
// PAÍSES
// ============================================

async function carregarPaises() {

    const { data, error } =
        await db.rpc(
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


    (data || []).forEach(item => {

        const linha =
            document.createElement("div");

        linha.className =
            "country-row";


        linha.innerHTML = `
            <span>${escapeHTML(
                item.pais
            )}</span>

            <strong>
                ${Number(
                    item.quantidade
                ).toLocaleString("pt-BR")}
            </strong>
        `;


        container.appendChild(
            linha
        );

    });

}


// ============================================
// ENVIO DO CADASTRO
// ============================================

async function enviarCadastro(
    event
) {

    event.preventDefault();


    if (!form) {
        return;
    }


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


    const tipo =
        localTipo?.value;


    const genero =
        document.getElementById(
            "genero"
        )?.value;


    const exibicao =
        document.getElementById(
            "exibicao"
        )?.value;


    const consentimento =
        document.getElementById(
            "consentimento"
        )?.checked;


    let estadoUF = null;

    let nomeCidade = null;

    let ibge = null;

    let nomePais = null;


    if (tipo === "Brasil") {

        estadoUF =
            estado?.value || null;


        const optionCidade =
            cidade?.options[
                cidade.selectedIndex
            ];


        nomeCidade =
            optionCidade?.textContent || null;


        ibge =
            cidade?.value || null;

    }


    if (tipo === "Exterior") {

        nomePais =
            pais?.value || null;

    }


    // ---------- VALIDAÇÕES ----------

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


    if (!tipo) {

        mostrarMensagem(
            "Selecione onde você está torcendo."
        );

        return;

    }


    if (
        tipo === "Brasil" &&
        (
            !estadoUF ||
            !nomeCidade ||
            !ibge
        )
    ) {

        mostrarMensagem(
            "Selecione o estado e a cidade."
        );

        return;

    }


    if (
        tipo === "Exterior" &&
        !nomePais
    ) {

        mostrarMensagem(
            "Selecione o país."
        );

        return;

    }


    if (!genero) {

        mostrarMensagem(
            "Selecione uma opção de gênero."
        );

        return;

    }


    if (!exibicao) {

        mostrarMensagem(
            "Escolha como seu nome aparecerá no mapa."
        );

        return;

    }


    if (!consentimento) {

        mostrarMensagem(
            "É necessário autorizar a utilização dos dados."
        );

        return;

    }


    // ---------- BOTÃO ----------

    const botao =
        form.querySelector(
            'button[type="submit"]'
        );


    const textoOriginal =
        botao?.textContent;


    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "CADASTRANDO...";

    }


    try {

        const { data, error } =
            await db.rpc(
                "cadastrar_participante",
                {
                    p_nome: nome,
                    p_idade: idade,
                    p_local_tipo: tipo,
                    p_estado_uf: estadoUF,
                    p_cidade: nomeCidade,
                    p_codigo_ibge: ibge,
                    p_pais: nomePais,
                    p_genero: genero,
                    p_exibicao: exibicao,
                    p_consentimento: true
                }
            );


        console.log(
            "Resposta do cadastro:",
            {
                data,
                error
            }
        );


        if (error) {

            throw error;

        }


        // ---------- SUCESSO ----------

        form.reset();

        alterarTipoLocal();

        if (cidade) {

            cidade.innerHTML =
                '<option value="">Selecione o estado primeiro</option>';

        }


        if (codigoIbge) {
            codigoIbge.value = "";
        }


        mostrarSucesso();


        // Atualiza imediatamente
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


        // MOSTRA O ERRO REAL NA TELA
        mostrarMensagem(
            detalhes ||
            "O Supabase retornou um erro sem detalhes."
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                textoOriginal ||
                "FAÇA PARTE DO MAPA";

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
        mensagem ||
        document.getElementById(
            "mensagem"
        );


    if (!elemento) {

        alert(texto);

        return;

    }


    elemento.classList.remove(
        "hidden"
    );


    elemento.classList.remove(
        "sucesso"
    );


    elemento.textContent =
        texto;


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function mostrarSucesso() {

    const sucesso =
        document.getElementById(
            "sucesso"
        );


    if (sucesso) {

        sucesso.classList.remove(
            "hidden"
        );


        sucesso.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ============================================
// MODAL DA CIDADE
// ============================================

function abrirModalCidade(
    cidadeInfo
) {

    const modal =
        document.getElementById(
            "modalCidade"
        );


    if (!modal) {
        return;
    }


    const titulo =
        document.getElementById(
            "modalTitulo"
        );


    const conteudo =
        document.getElementById(
            "modalConteudo"
        );


    if (titulo) {

        titulo.textContent =
            `${cidadeInfo.cidade} - ${cidadeInfo.estado}`;

    }


    if (conteudo) {

        conteudo.innerHTML = "";


        cidadeInfo.participantes
            .forEach(participante => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "participant-item";


                const nome =
                    participante.nome_exibicao ||
                    "Torcedor";


                const idade =
                    participante.idade;


                item.innerHTML = `
                    <strong>
                        ${escapeHTML(nome)}
                    </strong>

                    <span>
                        ${idade} anos
                    </span>
                `;


                conteudo.appendChild(
                    item
                );

            });

    }


    modal.classList.remove(
        "hidden"
    );

}


function fecharModalCidade() {

    const modal =
        document.getElementById(
            "modalCidade"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// ============================================
// FECHAR MODAL CLICANDO FORA
// ============================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "modalCidade"
            );


        if (
            modal &&
            event.target === modal
        ) {

            fecharModalCidade();

        }

    }
);


// ============================================
// REALTIME
// ============================================

function iniciarRealtime() {

    try {

        db
            .channel("mapa-da-torcida")
            .on(
                "broadcast",
                {
                    event: "atualizacao"
                },
                async payload => {

                    console.log(
                        "Atualização recebida:",
                        payload
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
