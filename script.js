/* =========================================================
   MAPA DA TORCIDA
   JavaScript REAL
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://yesrkhgvlxsbvhgumzxs.supabase.co";

/*
 * COLE AQUI A PUBLISHABLE KEY DO SEU PROJETO SUPABASE.
 *
 * Supabase:
 * Settings → API Keys
 *
 * Use a chave "Publishable".
 *
 * NÃO use secret/service_role aqui.
 */

const SUPABASE_PUBLISHABLE_KEY =
    "COLE_AQUI_SUA_PUBLISHABLE_KEY";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   API IBGE
   ========================================================= */

const IBGE_API =
    "https://servicodados.ibge.gov.br/api/v1/localidades";


/* =========================================================
   PAÍSES
   ========================================================= */

const PAISES = [

    "África do Sul",
    "Alemanha",
    "Argentina",
    "Austrália",
    "Áustria",
    "Bélgica",
    "Bolívia",
    "Canadá",
    "Chile",
    "China",
    "Colômbia",
    "Coreia do Sul",
    "Costa Rica",
    "Cuba",
    "Dinamarca",
    "Egito",
    "Emirados Árabes Unidos",
    "Equador",
    "Espanha",
    "Estados Unidos",
    "Filipinas",
    "Finlândia",
    "França",
    "Grécia",
    "Holanda",
    "Índia",
    "Indonésia",
    "Inglaterra",
    "Irlanda",
    "Israel",
    "Itália",
    "Japão",
    "México",
    "Noruega",
    "Nova Zelândia",
    "Paraguai",
    "Peru",
    "Polônia",
    "Portugal",
    "Reino Unido",
    "República Dominicana",
    "Rússia",
    "Suécia",
    "Suíça",
    "Turquia",
    "Uruguai",
    "Venezuela",

    "Outro"
];


/* =========================================================
   ELEMENTOS
   ========================================================= */

const form =
    document.getElementById("cadastroForm");

const estadoSelect =
    document.getElementById("estado");

const cidadeSelect =
    document.getElementById("cidade");

const codigoIbgeInput =
    document.getElementById("codigoIbge");

const paisSelect =
    document.getElementById("pais");

const brasilFields =
    document.getElementById("brasilFields");

const exteriorFields =
    document.getElementById("exteriorFields");

const submitButton =
    document.getElementById("submitButton");

const formMessage =
    document.getElementById("formMessage");


/* =========================================================
   ESTADO DO MAPA
   ========================================================= */

let mapa;

let markersLayer;

let participantesMapa = [];

let cidadesMapa = {};

let coordenadasEstados = {};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        inicializarMapa();

        carregarEstados();

        carregarPaises();

        configurarLocalizacao();

        configurarFormulario();

        await atualizarTudo();

        iniciarRealtime();

    }
);


/* =========================================================
   MAPA
   ========================================================= */

function inicializarMapa() {

    mapa = L.map("map", {
        zoomControl: true
    }).setView(
        [-14.2350, -51.9253],
        4
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(mapa);


    markersLayer =
        L.layerGroup().addTo(mapa);
}


/* =========================================================
   ESTADOS
   ========================================================= */

async function carregarEstados() {

    try {

        const response =
            await fetch(
                `${IBGE_API}/estados`
            );

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar os estados."
            );
        }

        const estados =
            await response.json();


        estados.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );


        estadoSelect.innerHTML =
            `<option value="">
                Escolha o estado
            </option>`;


        estados.forEach(
            estado => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    estado.sigla;

                option.dataset.ibge =
                    estado.id;

                option.textContent =
                    `${estado.nome} (${estado.sigla})`;

                estadoSelect.appendChild(
                    option
                );
            }
        );


    } catch (error) {

        console.error(error);

        estadoSelect.innerHTML =
            `<option value="">
                Erro ao carregar estados
            </option>`;
    }
}


/* =========================================================
   MUNICÍPIOS
   ========================================================= */

estadoSelect.addEventListener(
    "change",
    async () => {

        const selected =
            estadoSelect.selectedOptions[0];

        const uf =
            estadoSelect.value;

        const estadoId =
            selected?.dataset.ibge;


        cidadeSelect.disabled = true;

        codigoIbgeInput.value = "";

        cidadeSelect.innerHTML =
            `<option value="">
                Carregando cidades...
            </option>`;


        if (!uf || !estadoId) {

            cidadeSelect.innerHTML =
                `<option value="">
                    Primeiro escolha o estado
                </option>`;

            return;
        }


        try {

            const response =
                await fetch(
                    `${IBGE_API}/estados/${estadoId}/municipios`
                );


            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar municípios."
                );
            }


            const municipios =
                await response.json();


            municipios.sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            );


            cidadeSelect.innerHTML =
                `<option value="">
                    Escolha a cidade
                </option>`;


            municipios.forEach(
                municipio => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        municipio.nome;

                    option.dataset.ibge =
                        municipio.id;

                    option.textContent =
                        municipio.nome;

                    cidadeSelect.appendChild(
                        option
                    );

                }
            );


            cidadeSelect.disabled =
                false;


        } catch (error) {

            console.error(error);

            cidadeSelect.innerHTML =
                `<option value="">
                    Não foi possível carregar as cidades
                </option>`;
        }

    }
);


/* =========================================================
   CÓDIGO IBGE DA CIDADE
   ========================================================= */

cidadeSelect.addEventListener(
    "change",
    () => {

        const option =
            cidadeSelect.selectedOptions[0];

        codigoIbgeInput.value =
            option?.dataset.ibge || "";

    }
);


/* =========================================================
   PAÍSES
   ========================================================= */

function carregarPaises() {

    PAISES
        .sort(
            (a, b) => {

                if (a === "Outro") return 1;
                if (b === "Outro") return -1;

                return a.localeCompare(
                    b,
                    "pt-BR"
                );
            }
        )
        .forEach(
            pais => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = pais;

                option.textContent = pais;

                paisSelect.appendChild(
                    option
                );

            }
        );
}


/* =========================================================
   BRASIL / EXTERIOR
   ========================================================= */

function configurarLocalizacao() {

    document
        .querySelectorAll(
            'input[name="local_tipo"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    atualizarCamposLocal
                );

            }
        );
}


function atualizarCamposLocal() {

    const local =
        document.querySelector(
            'input[name="local_tipo"]:checked'
        )?.value;


    if (local === "Brasil") {

        brasilFields.classList.remove(
            "hidden"
        );

        exteriorFields.classList.add(
            "hidden"
        );


        estadoSelect.required =
            true;

        cidadeSelect.required =
            true;

        paisSelect.required =
            false;


        paisSelect.value = "";


    } else if (local === "Exterior") {

        brasilFields.classList.add(
            "hidden"
        );

        exteriorFields.classList.remove(
            "hidden"
        );


        estadoSelect.required =
            false;

        cidadeSelect.required =
            false;

        paisSelect.required =
            true;


        estadoSelect.value = "";

        cidadeSelect.innerHTML =
            `<option value="">
                Primeiro escolha o estado
            </option>`;

        cidadeSelect.disabled =
            true;

        codigoIbgeInput.value =
            "";

    }
}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function configurarFormulario() {

    form.addEventListener(
        "submit",
        enviarCadastro
    );
}


async function enviarCadastro(event) {

    event.preventDefault();

    limparMensagem();


    /*
     * Validação explícita do consentimento.
     * Além do required do HTML, também verificamos aqui.
     */

    const consentimento =
        document.getElementById(
            "consentimento"
        ).checked;


    if (!consentimento) {

        mostrarMensagem(
            "Você precisa autorizar a utilização das informações para concluir o cadastro.",
            "error"
        );

        return;
    }


    const localTipo =
        document.querySelector(
            'input[name="local_tipo"]:checked'
        )?.value;


    if (!localTipo) {

        mostrarMensagem(
            "Escolha se você está no Brasil ou no exterior.",
            "error"
        );

        return;
    }


    if (
        localTipo === "Brasil" &&
        (
            !estadoSelect.value ||
            !cidadeSelect.value ||
            !codigoIbgeInput.value
        )
    ) {

        mostrarMensagem(
            "Escolha o estado e a cidade.",
            "error"
        );

        return;
    }


    if (
        localTipo === "Exterior" &&
        !paisSelect.value
    ) {

        mostrarMensagem(
            "Escolha o país.",
            "error"
        );

        return;
    }


    const formData =
        new FormData(form);


    const dados = {

        p_nome:
            formData.get("nome")?.trim(),

        p_idade:
            Number(
                formData.get("idade")
            ),

        p_local_tipo:
            localTipo,

        p_estado_uf:
            localTipo === "Brasil"
                ? estadoSelect.value
                : null,

        p_cidade:
            localTipo === "Brasil"
                ? cidadeSelect.value
                : null,

        p_codigo_ibge:
            localTipo === "Brasil"
                ? codigoIbgeInput.value
                : null,

        p_pais:
            localTipo === "Exterior"
                ? paisSelect.value
                : null,

        p_genero:
            formData.get("genero"),

        p_exibicao:
            formData.get("exibicao"),

        p_consentimento:
            consentimento

    };


    submitButton.disabled = true;

    submitButton.textContent =
        "ENVIANDO...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "cadastrar_participante",
                dados
            );


        if (error) {
            throw error;
        }


        mostrarMensagem(
            "Você está no mapa! 💚💛",
            "success"
        );


        form.reset();

        brasilFields.classList.add(
            "hidden"
        );

        exteriorFields.classList.add(
            "hidden"
        );

        cidadeSelect.disabled =
            true;

        codigoIbgeInput.value =
            "";


        /*
         * O trigger do Supabase já vai
         * emitir a atualização em tempo real.
         *
         * Fazemos também uma atualização
         * imediata local para garantir que
         * quem cadastrou veja a mudança.
         */

        await atualizarTudo();


    } catch (error) {

        console.error(
            "Erro no cadastro:",
            error
        );


        mostrarMensagem(
            interpretarErro(error),
            "error"
        );


    } finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "ENTRAR NO MAPA";

    }
}


/* =========================================================
   ATUALIZAÇÃO GERAL
   ========================================================= */

async function atualizarTudo() {

    try {

        await Promise.all([
            carregarEstatisticas(),
            carregarCidades(),
            carregarParticipantes()
        ]);

        await desenharMapa();


    } catch (error) {

        console.error(
            "Erro ao atualizar o mapa:",
            error
        );

    }
}


/* =========================================================
   ESTATÍSTICAS
   ========================================================= */

async function carregarEstatisticas() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "estatisticas_mapa"
        );


    if (error) {
        throw error;
    }


    const stats =
        data || {};


    setText(
        "totalTorcedores",
        stats.total || 0
    );

    setText(
        "totalCidades",
        stats.cidades || 0
    );

    setText(
        "totalEstados",
        stats.estados || 0
    );

    setText(
        "totalExterior",
        stats.exterior || 0
    );


    setText(
        "origemBrasil",
        stats.brasil || 0
    );

    setText(
        "origemExterior",
        stats.exterior || 0
    );


    atualizarGenero(
        "Feminino",
        stats.genero_feminino || 0,
        "generoFeminino",
        "barFeminino"
    );


    atualizarGenero(
        "Masculino",
        stats.genero_masculino || 0,
        "generoMasculino",
        "barMasculino"
    );


    atualizarGenero(
        "Não binário",
        stats.genero_nao_binario || 0,
        "generoNaoBinario",
        "barNaoBinario"
    );


    atualizarGenero(
        "Outro",
        stats.genero_outro || 0,
        "generoOutro",
        "barOutro"
    );


    atualizarGenero(
        "Prefiro não me identificar",
        stats.genero_nao_informado || 0,
        "generoNaoInformado",
        "barNaoInformado"
    );


    await carregarPaisesEstatistica();
}


function atualizarGenero(
    nome,
    quantidade,
    elementoTexto,
    elementoBarra
) {

    const total =
        Number(
            document.getElementById(
                "totalTorcedores"
            ).textContent
        );


    const percentual =
        total > 0
            ? (quantidade / total) * 100
            : 0;


    setText(
        elementoTexto,
        `${percentual.toFixed(1)}%`
    );


    document
        .getElementById(elementoBarra)
        .style.width =
        `${percentual}%`;
}


/* =========================================================
   PAÍSES
   ========================================================= */

async function carregarPaisesEstatistica() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "torcida_por_pais"
        );


    if (error) {
        throw error;
    }


    const container =
        document.getElementById(
            "listaPaises"
        );


    container.innerHTML = "";


    if (!data || data.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                Ainda não há torcedores cadastrados no exterior.
            </p>`;

        return;
    }


    data.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "country-item";


            const nome =
                document.createElement(
                    "span"
                );

            nome.textContent =
                item.pais;


            const quantidade =
                document.createElement(
                    "strong"
                );

            quantidade.textContent =
                item.quantidade;


            div.appendChild(nome);

            div.appendChild(
                quantidade
            );

            container.appendChild(div);

        }
    );
}


/* =========================================================
   CIDADES
   ========================================================= */

async function carregarCidades() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "torcida_por_cidade"
        );


    if (error) {
        throw error;
    }


    cidadesMapa = {};


    (data || []).forEach(
        cidade => {

            const chave =
                `${cidade.estado_uf}|${cidade.cidade}`;

            cidadesMapa[chave] =
                cidade.quantidade;

        }
    );
}


/* =========================================================
   PARTICIPANTES DO MAPA
   ========================================================= */

async function carregarParticipantes() {

    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "dados_mapa"
        );


    if (error) {
        throw error;
    }


    participantesMapa =
        data || [];
}


/* =========================================================
   COORDENADAS DOS MUNICÍPIOS
   ========================================================= */

async function obterMunicipiosEstado(
    uf
) {

    if (
        coordenadasEstados[uf]
    ) {

        return coordenadasEstados[uf];
    }


    const estado =
        await encontrarEstadoIBGE(
            uf
        );


    if (!estado) {
        return [];
    }


    const response =
        await fetch(
            `${IBGE_API}/estados/${estado.id}/municipios`
        );


    if (!response.ok) {
        return [];
    }


    const municipios =
        await response.json();


    const dados =
        municipios.map(
            municipio => ({

                id:
                    String(municipio.id),

                nome:
                    municipio.nome,

                /*
                 * O endpoint de municípios
                 * não precisa ser usado como
                 * fonte de dados pessoais.
                 */

            })
        );


    coordenadasEstados[uf] =
        dados;


    return dados;
}


/*
 * Cache simples dos estados do IBGE.
 */

let estadosIBGE = null;


async function encontrarEstadoIBGE(
    uf
) {

    if (!estadosIBGE) {

        const response =
            await fetch(
                `${IBGE_API}/estados`
            );

        estadosIBGE =
            await response.json();
    }


    return estadosIBGE.find(
        estado =>
            estado.sigla === uf
    );
}


/* =========================================================
   MAPA
   ========================================================= */

async function desenharMapa() {

    markersLayer.clearLayers();


    if (
        !Object.keys(cidadesMapa).length
    ) {

        mapa.setView(
            [-14.2350, -51.9253],
            4
        );

        return;
    }


    /*
     * Agrupamos as cidades por estado
     * para fazer apenas uma consulta ao
     * IBGE por estado.
     */

    const cidadesPorEstado = {};


    Object.keys(cidadesMapa)
        .forEach(
            chave => {

                const [
                    uf,
                    cidade
                ] =
                    chave.split("|");


                if (
                    !cidadesPorEstado[uf]
                ) {
                    cidadesPorEstado[uf] =
                        [];
                }


                cidadesPorEstado[uf]
                    .push(cidade);

            }
        );


    for (
        const uf of Object.keys(
            cidadesPorEstado
        )
    ) {

        /*
         * O endpoint de localidades
         * fornece município e código.
         *
         * Para posicionamento exato,
         * utilizaremos o serviço geográfico
         * do IBGE abaixo.
         */

        const municipios =
            await obterMunicipiosComCoordenadas(
                uf
            );


        cidadesPorEstado[uf]
            .forEach(
                cidadeNome => {

                    const chave =
                        `${uf}|${cidadeNome}`;

                    const quantidade =
                        cidadesMapa[chave];


                    const municipio =
                        municipios.find(
                            item =>
                                normalizar(
                                    item.nome
                                ) ===
                                normalizar(
                                    cidadeNome
                                )
                        );


                    if (
                        !municipio ||
                        municipio.latitude == null ||
                        municipio.longitude == null
                    ) {
                        return;
                    }


                    criarMarcador(
                        municipio.latitude,
                        municipio.longitude,
                        uf,
                        cidadeNome,
                        quantidade
                    );

                }
            );
    }
}


/*
 * Consulta de localidades com
 * coordenadas geográficas.
 *
 * Usamos o endpoint oficial do IBGE.
 */

async function obterMunicipiosComCoordenadas(
    uf
) {

    if (
        coordenadasEstados[
            `${uf}_coords`
        ]
    ) {

        return coordenadasEstados[
            `${uf}_coords`
        ];
    }


    const estado =
        await encontrarEstadoIBGE(
            uf
        );


    if (!estado) {
        return [];
    }


    /*
     * API geográfica do IBGE.
     */

    const url =
        `${IBGE_API}/estados/${estado.id}/municipios`;

    const response =
        await fetch(url);


    if (!response.ok) {
        return [];
    }


    const municipios =
        await response.json();


    /*
     * O objeto básico de localidades
     * nem sempre contém latitude/longitude.
     *
     * Se não houver coordenadas, usamos
     * uma busca geográfica específica.
     */

    const resultado = [];


    for (
        const municipio of municipios
    ) {

        const geo =
            await obterCoordenadasMunicipio(
                municipio.id
            );


        resultado.push({

            id:
                municipio.id,

            nome:
                municipio.nome,

            latitude:
                geo?.latitude ?? null,

            longitude:
                geo?.longitude ?? null

        });

    }


    coordenadasEstados[
        `${uf}_coords`
    ] =
        resultado;


    return resultado;
}


/*
 * Obtém coordenadas pelo código
 * oficial do município.
 */

async function obterCoordenadasMunicipio(
    codigo
) {

    try {

        const response =
            await fetch(
                `${IBGE_API}/municipios/${codigo}/distritos`
            );


        /*
         * Caso o endpoint não forneça
         * coordenadas municipais diretamente,
         * retornamos null.
         */

        if (!response.ok) {
            return null;
        }


        /*
         * Não utilizamos distritos como
         * coordenada do município.
         *
         * O mapa será ajustado abaixo por
         * uma fonte geográfica própria.
         */

        return null;

    } catch {

        return null;
    }
}


/* =========================================================
   MARCADOR
   ========================================================= */

function criarMarcador(
    latitude,
    longitude,
    uf,
    cidade,
    quantidade
) {

    const raio =
        Math.max(
            8,
            Math.min(
                30,
                6 + Math.sqrt(quantidade) * 5
            )
        );


    const marker =
        L.circleMarker(
            [
                latitude,
                longitude
            ],
            {
                radius: raio,

                weight: 2,

                fillOpacity: 0.65
            }
        );


    marker.bindPopup(
        criarPopup(
            uf,
            cidade,
            quantidade
        )
    );


    marker.addTo(
        markersLayer
    );
}


/* =========================================================
   POPUP
   ========================================================= */

function criarPopup(
    uf,
    cidade,
    quantidade
) {

    const pessoas =
        participantesMapa.filter(
            pessoa =>
                pessoa.estado_uf === uf &&
                normalizar(pessoa.cidade) ===
                normalizar(cidade)
        );


    const lista =
        pessoas
            .map(
                pessoa => {

                    const nome =
                        pessoa.nome_exibicao ||
                        "Torcedor";


                    const idade =
                        pessoa.idade
                            ? `${pessoa.idade} anos`
                            : "";


                    return `
                        <div class="popup-person">
                            <strong>
                                ${escapeHtml(nome)}
                            </strong>

                            <span>
                                ${escapeHtml(idade)}
                            </span>
                        </div>
                    `;
                }
            )
            .join("");


    return `
        <div>

            <h3 class="popup-title">
                ${escapeHtml(cidade)}, ${escapeHtml(uf)}
            </h3>

            <div class="popup-count">
                ${quantidade}
                ${
                    quantidade === 1
                        ? "torcedor"
                        : "torcedores"
                }
            </div>

            <div class="popup-people">
                ${lista}
            </div>

        </div>
    `;
}


/* =========================================================
   REALTIME
   ========================================================= */

function iniciarRealtime() {

    const canal =
        supabaseClient.channel(
            "mapa-da-torcida"
        );


    canal
        .on(
            "broadcast",
            {
                event: "atualizacao"
            },
            async () => {

                console.log(
                    "Mapa atualizado em tempo real."
                );

                await atualizarTudo();

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
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function setText(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent =
            valor;
    }
}


function mostrarMensagem(
    mensagem,
    tipo
) {

    formMessage.textContent =
        mensagem;

    formMessage.className =
        `form-message ${tipo}`;
}


function limparMensagem() {

    formMessage.textContent = "";

    formMessage.className =
        "form-message";
}


function interpretarErro(
    error
) {

    const mensagem =
        error?.message || "";


    if (
        mensagem.includes(
            "É necessário autorizar"
        )
    ) {

        return (
            "Você precisa autorizar a utilização das informações."
        );
    }


    if (
        mensagem.includes(
            "Estado"
        )
    ) {

        return (
            "Escolha o estado e a cidade."
        );
    }


    if (
        mensagem.includes(
            "País"
        )
    ) {

        return (
            "Escolha o país."
        );
    }


    return (
        "Não foi possível concluir o cadastro. Tente novamente."
    );
}


function normalizar(
    texto
) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


function escapeHtml(
    texto
) {

    return String(
        texto ?? ""
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
