/* =========================================================
   MAPA DA TORCIDA
   JAVASCRIPT PRINCIPAL
========================================================= */

(async function () {

    "use strict"


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const SUPABASE_URL =
        "https://yesrkhgvlxsbvhgumzxs.supabase.co"

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy"


    /*
       Base de coordenadas dos municípios.
    */

    const COORDINATES_URL =
        "https://raw.githubusercontent.com/GusFurtado/dab_assets/main/data/coordenadas.csv"


    /* =====================================================
       SUPABASE
    ===================================================== */

    let supabase

    try {

        const module =
            await import(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
            )

        supabase =
            module.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            )

    } catch (error) {

        console.error(
            "Não foi possível carregar o Supabase:",
            error
        )

        return
    }


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const form =
        document.getElementById(
            "supporterForm"
        )

    const successMessage =
        document.getElementById(
            "successMessage"
        )

    const successText =
        document.getElementById(
            "successText"
        )

    const brazilFields =
        document.getElementById(
            "brazilFields"
        )

    const exteriorFields =
        document.getElementById(
            "exteriorFields"
        )

    const stateSelect =
        document.getElementById(
            "state"
        )

    const citySelect =
        document.getElementById(
            "city"
        )

    const countrySelect =
        document.getElementById(
            "country"
        )


    /* =====================================================
       ESTADOS — CÓDIGOS IBGE
    ===================================================== */

    const stateCodes = {

        AC: 12,
        AL: 27,
        AP: 16,
        AM: 13,
        BA: 29,
        CE: 23,
        DF: 53,
        ES: 32,
        GO: 52,
        MA: 21,
        MT: 51,
        MS: 50,
        MG: 31,
        PA: 15,
        PB: 25,
        PR: 41,
        PE: 26,
        PI: 22,
        RJ: 33,
        RN: 24,
        RS: 43,
        RO: 11,
        RR: 14,
        SC: 42,
        SP: 35,
        SE: 28,
        TO: 17

    }


    /* =====================================================
       MAPA
    ===================================================== */

    const map =
        L.map(
            "map",
            {
                scrollWheelZoom: false
            }
        )


    map.setView(
        [-14.2, -51.9],
        4
    )


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map)


    /* =====================================================
       DADOS
    ===================================================== */

    let cityData = []

    const coordinateData =
        new Map()


    /* =====================================================
       CSV — LEITURA
    ===================================================== */

    function parseCSV(text) {

        const rows = []

        let row = []

        let field = ""

        let insideQuotes = false


        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const char =
                text[i]

            const next =
                text[i + 1]


            if (
                char === '"'
            ) {

                if (
                    insideQuotes &&
                    next === '"'
                ) {

                    field += '"'

                    i++

                } else {

                    insideQuotes =
                        !insideQuotes

                }

                continue
            }


            if (
                char === ";" &&
                !insideQuotes
            ) {

                row.push(
                    field
                )

                field = ""

                continue
            }


            if (
                (
                    char === "\n" ||
                    char === "\r"
                ) &&
                !insideQuotes
            ) {

                if (
                    char === "\r" &&
                    next === "\n"
                ) {

                    i++

                }


                row.push(
                    field
                )

                field = ""


                if (
                    row.some(
                        value =>
                            value.trim() !== ""
                    )
                ) {

                    rows.push(
                        row
                    )

                }


                row = []

                continue
            }


            field += char

        }


        if (
            field !== "" ||
            row.length > 0
        ) {

            row.push(
                field
            )

            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {

                rows.push(
                    row
                )

            }

        }


        return rows

    }


    /* =====================================================
       COORDENADAS DOS MUNICÍPIOS
    ===================================================== */

    async function loadCoordinates() {

        try {

            const response =
                await fetch(
                    COORDINATES_URL
                )


            if (
                !response.ok
            ) {

                throw new Error(
                    "Não foi possível carregar a base de coordenadas."
                )

            }


            const text =
                await response.text()


            const rows =
                parseCSV(
                    text
                )


            if (
                rows.length < 2
            ) {

                throw new Error(
                    "Base de coordenadas vazia."
                )

            }


            const headers =
                rows[0].map(
                    header =>
                        header
                            .trim()
                            .toUpperCase()
                )


            const indexOf =
                function (names) {

                    for (
                        const name of names
                    ) {

                        const index =
                            headers.indexOf(
                                name
                            )

                        if (
                            index !== -1
                        ) {

                            return index

                        }

                    }

                    return -1

                }


            const municipalityCodeIndex =
                indexOf([
                    "CD_GEOCODMU",
                    "CD_GEOCODM"
                ])


            const localityNameIndex =
                indexOf([
                    "NM_LOCALIDADE",
                    "NM_LOCALID"
                ])


            const municipalityNameIndex =
                indexOf([
                    "NM_MUNICIPIO",
                    "NM_MUNICIP"
                ])


            const latitudeIndex =
                indexOf([
                    "LAT",
                    "LATITUDE"
                ])


            const longitudeIndex =
                indexOf([
                    "LONG",
                    "LONGITUDE"
                ])


            if (
                municipalityCodeIndex === -1 ||
                latitudeIndex === -1 ||
                longitudeIndex === -1
            ) {

                throw new Error(
                    "Colunas necessárias não encontradas na base de coordenadas."
                )

            }


            const fallback =
                new Map()


            for (
                let i = 1;
                i < rows.length;
                i++
            ) {

                const row =
                    rows[i]


                const code =
                    String(
                        row[
                            municipalityCodeIndex
                        ] || ""
                    )
                    .trim()


                if (
                    !code
                ) {

                    continue

                }


                const lat =
                    Number(
                        String(
                            row[
                                latitudeIndex
                            ] || ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                    )


                const lng =
                    Number(
                        String(
                            row[
                                longitudeIndex
                            ] || ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                    )


                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lng)
                ) {

                    continue

                }


                const municipalityName =
                    municipalityNameIndex !== -1
                        ? String(
                            row[
                                municipalityNameIndex
                            ] || ""
                        )
                        .trim()
                        .toLowerCase()
                        : ""


                const localityName =
                    localityNameIndex !== -1
                        ? String(
                            row[
                                localityNameIndex
                            ] || ""
                        )
                        .trim()
                        .toLowerCase()
                        : ""


                const coordinate = {
                    lat,
                    lng
                }


                if (
                    !fallback.has(code)
                ) {

                    fallback.set(
                        code,
                        coordinate
                    )

                }


                if (
                    municipalityName &&
                    localityName &&
                    municipalityName === localityName
                ) {

                    coordinateData.set(
                        code,
                        coordinate
                    )

                }

            }


            fallback.forEach(
                (
                    coordinate,
                    code
                ) => {

                    if (
                        !coordinateData.has(code)
                    ) {

                        coordinateData.set(
                            code,
                            coordinate
                        )

                    }

                }
            )


            console.log(
                `Coordenadas carregadas: ${coordinateData.size}`
            )

        } catch (error) {

            console.error(
                "Erro ao carregar coordenadas:",
                error
            )

        }

    }


    /* =====================================================
       TAMANHO DOS MARCADORES
    ===================================================== */

    function getMarkerSize(
        supporters
    ) {

        if (
            supporters <= 10
        ) {

            return 30

        }

        if (
            supporters <= 50
        ) {

            return 42

        }

        if (
            supporters <= 150
        ) {

            return 54

        }

        if (
            supporters <= 300
        ) {

            return 66

        }

        return 78

    }


    /* =====================================================
       MARCADOR
    ===================================================== */

    function createMarker(
        city
    ) {

        const size =
            getMarkerSize(
                city.supporters
            )


        const icon =
            L.divIcon({

                className: "",

                html: `
                    <div
                        class="custom-marker"
                        style="
                            width:${size}px;
                            height:${size}px;
                            margin-left:-${size / 2}px;
                            margin-top:-${size / 2}px;
                        "
                    >
                        <span>
                            ${city.supporters}
                        </span>
                    </div>
                `,

                iconSize: [
                    size,
                    size
                ],

                iconAnchor: [
                    size / 2,
                    size / 2
                ]

            })


        const marker =
            L.marker(
                [
                    city.lat,
                    city.lng
                ],
                {
                    icon
                }
            )


        marker.addTo(
            map
        )


        marker.on(
            "click",
            function () {

                showCity(
                    city
                )

            }
        )

    }


    /* =====================================================
       PAINEL DA CIDADE
    ===================================================== */

    function showCity(
        city
    ) {

        const panel =
            document.getElementById(
                "cityPanel"
            )


        if (
            !panel
        ) {

            return

        }


        const members =
            city.members
                .map(
                    member => {

                        if (
                            member.anonymous
                        ) {

                            return `
                                <div class="member">

                                    <span class="member-name anonymous-name">
                                        Torcedor
                                    </span>

                                    <span class="member-location">
                                        ${city.name}, ${city.state}
                                    </span>

                                </div>
                            `

                        }


                        return `
                            <div class="member">

                                <span class="member-name">
                                    ${member.name}, ${member.age}
                                </span>

                                <span class="member-location">
                                    ${city.name}, ${city.state}
                                </span>

                            </div>
                        `

                    }
                )
                .join("")


        panel.innerHTML = `

            <div class="city-header">

                <small>
                    CIDADE
                </small>

                <h3>
                    ${city.name}
                </h3>

                <strong>
                    ${city.supporters}
                    torcedores no mapa
                </strong>

            </div>

            <div class="city-members">

                ${members}

            </div>

        `


        if (
            window.innerWidth <= 900
        ) {

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })

        }

    }


    /* =====================================================
       CARREGAR DADOS DO MAPA
    ===================================================== */

    async function loadMapData() {

        const {
            data,
            error
        } =
            await supabase.rpc(
                "dados_mapa"
            )


        if (
            error
        ) {

            console.error(
                "Erro ao carregar mapa:",
                error
            )

            return

        }


        const grouped =
            new Map()


        data.forEach(
            participant => {

                const code =
                    String(
                        participant.codigo_ibge
                    )


                if (
                    !grouped.has(code)
                ) {

                    grouped.set(
                        code,
                        {
                            name:
                                participant.cidade,

                            state:
                                participant.estado_uf,

                            code,

                            supporters: 0,

                            members: []
                        }
                    )

                }


                const city =
                    grouped.get(
                        code
                    )


                city.supporters++


                city.members.push({

                    name:
                        participant.nome_exibicao,

                    age:
                        participant.idade,

                    anonymous:
                        participant.nome_exibicao ===
                        "Torcedor"

                })

            }
        )


        cityData =
            Array.from(
                grouped.values()
            )


        cityData.forEach(
            city => {

                const coordinates =
                    coordinateData.get(
                        city.code
                    )


                if (
                    !coordinates
                ) {

                    console.warn(
                        "Coordenada não encontrada para:",
                        city.name,
                        city.code
                    )

                    return

                }


                city.lat =
                    coordinates.lat

                city.lng =
                    coordinates.lng


                createMarker(
                    city
                )

            }
        )

    }


    /* =====================================================
       CONTADORES
    ===================================================== */

    function animateCounter(
        element,
        target
    ) {

        if (
            !element
        ) {

            return

        }


        let current = 0

        const duration = 900

        const start =
            performance.now()


        function update(
            timestamp
        ) {

            const progress =
                Math.min(
                    (
                        timestamp -
                        start
                    ) /
                    duration,
                    1
                )


            current =
                Math.floor(
                    progress *
                    target
                )


            element.textContent =
                current.toLocaleString(
                    "pt-BR"
                )


            if (
                progress < 1
            ) {

                requestAnimationFrame(
                    update
                )

            }

        }


        requestAnimationFrame(
            update
        )

    }


    function updateElement(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            )


        if (
            !element
        ) {

            return

        }


        animateCounter(
            element,
            Number(value) || 0
        )

    }


    /* =====================================================
       ESTATÍSTICAS
    ===================================================== */

    async function loadStatistics() {

        const {
            data,
            error
        } =
            await supabase.rpc(
                "estatisticas_mapa"
            )


        if (
            error
        ) {

            console.error(
                "Erro ao carregar estatísticas:",
                error
            )

            return

        }


        const stats =
            typeof data === "string"
                ? JSON.parse(data)
                : data


        updateElement(
            "heroCounter",
            stats.total
        )

        updateElement(
            "totalSupporters",
            stats.total
        )

        updateElement(
            "totalCities",
            stats.cidades
        )

        updateElement(
            "totalStates",
            stats.estados
        )

        updateElement(
            "foreignSupporters",
            stats.exterior
        )


        updateElement(
            "genderFemale",
            stats.genero_feminino
        )

        updateElement(
            "genderMale",
            stats.genero_masculino
        )

        updateElement(
            "genderNonBinary",
            stats.genero_nao_binario
        )

        updateElement(
            "genderOther",
            stats.genero_outro
        )

        updateElement(
            "genderNoAnswer",
            stats.genero_nao_informado
        )

    }


    /* =====================================================
       RECARREGAR MAPA
    ===================================================== */

    async function reloadEverything() {

        cityData.length = 0


        map.eachLayer(
            layer => {

                if (
                    layer instanceof
                    L.Marker
                ) {

                    map.removeLayer(
                        layer
                    )

                }

            }
        )


        await Promise.all([
            loadMapData(),
            loadStatistics()
        ])

    }


    /* =====================================================
       LOCALIZAÇÃO — BRASIL / EXTERIOR
    ===================================================== */

    const locationRadios =
        document.querySelectorAll(
            'input[name="locationType"]'
        )


    locationRadios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                function () {

                    if (
                        this.value ===
                        "brasil"
                    ) {

                        brazilFields.classList.remove(
                            "hidden"
                        )

                        exteriorFields.classList.add(
                            "hidden"
                        )


                        if (
                            stateSelect
                        ) {

                            stateSelect.required =
                                true

                        }


                        if (
                            citySelect
                        ) {

                            citySelect.required =
                                true

                        }


                        if (
                            countrySelect
                        ) {

                            countrySelect.required =
                                false

                        }

                    }


                    if (
                        this.value ===
                        "exterior"
                    ) {

                        brazilFields.classList.add(
                            "hidden"
                        )

                        exteriorFields.classList.remove(
                            "hidden"
                        )


                        if (
                            stateSelect
                        ) {

                            stateSelect.required =
                                false

                        }


                        if (
                            citySelect
                        ) {

                            citySelect.required =
                                false

                        }


                        if (
                            countrySelect
                        ) {

                            countrySelect.required =
                                true

                        }

                    }

                }
            )

        }
    )


    /* =====================================================
       MUNICÍPIOS — IBGE
    ===================================================== */

    async function loadCities(
        uf
    ) {

        citySelect.innerHTML = `
            <option value="">
                Carregando cidades...
            </option>
        `


        citySelect.disabled =
            true


        const stateCode =
            stateCodes[
                uf
            ]


        if (
            !stateCode
        ) {

            citySelect.innerHTML = `
                <option value="">
                    Selecione a cidade
                </option>
            `

            return

        }


        try {

            const response =
                await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`
                )


            if (
                !response.ok
            ) {

                throw new Error(
                    "Erro ao consultar municípios do IBGE."
                )

            }


            const cities =
                await response.json()


            citySelect.innerHTML = `
                <option value="">
                    Selecione a cidade
                </option>
            `


            cities
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.nome.localeCompare(
                            b.nome,
                            "pt-BR"
                        )
                )
                .forEach(
                    city => {

                        const option =
                            document.createElement(
                                "option"
                            )


                        option.value =
                            city.id


                        option.textContent =
                            city.nome


                        option.dataset.name =
                            city.nome


                        citySelect.appendChild(
                            option
                        )

                    }
                )


            citySelect.disabled =
                false

        } catch (error) {

            console.error(
                "Erro ao carregar municípios:",
                error
            )


            citySelect.innerHTML = `
                <option value="">
                    Não foi possível carregar as cidades
                </option>
            `

        }

    }


    if (
        stateSelect
    ) {

        stateSelect.addEventListener(
            "change",
            function () {

                loadCities(
                    this.value
                )

            }
        )

    }


    /* =====================================================
       FORMULÁRIO — VALORES AUXILIARES
    ===================================================== */

    function getCheckedValue(
        selectors
    ) {

        for (
            const selector of selectors
        ) {

            const element =
                document.querySelector(
                    `${selector}:checked`
                )


            if (
                element
            ) {

                return element.value

            }

        }


        return ""

    }


    function normalizeDisplay(
        value
    ) {

        const normalized =
            String(
                value || ""
            )
            .trim()
            .toLowerCase()


        if (
            [
                "nome",
                "identificado",
                "name"
            ].includes(
                normalized
            )
        ) {

            return "nome"

        }


        if (
            [
                "anonimo",
                "anônimo",
                "anonymous"
            ].includes(
                normalized
            )
        ) {

            return "anonimo"

        }


        return normalized

    }


    /* =====================================================
       FORMULÁRIO — ENVIO REAL
    ===================================================== */

    if (
        form
    ) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault()


                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    )


                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        true

                }


                try {

                    const name =
                        document.getElementById(
                            "name"
                        )
                        .value
                        .trim()


                    const age =
                        Number(
                            document.getElementById(
                                "age"
                            )
                            .value
                        )


                    const locationType =
                        document.querySelector(
                            'input[name="locationType"]:checked'
                        )


                    if (
                        !locationType
                    ) {

                        throw new Error(
                            "Selecione Brasil ou Exterior."
                        )

                    }


                    const locationValue =
                        locationType.value


                    const gender =
                        getCheckedValue([
                            'input[name="gender"]',
                            'input[name="genero"]'
                        ])


                    const display =
                        normalizeDisplay(
                            getCheckedValue([
                                'input[name="display"]',
                                'input[name="exibicao"]'
                            ])
                        )


                    const consent =
                        document.querySelector(
                            '#consent, #consentimento, input[name="consent"], input[name="consentimento"]'
                        )


                    const consentValue =
                        consent
                            ? consent.checked
                            : false


                    let state = null

                    let city = null

                    let cityCode = null

                    let country = null


                    if (
                        locationValue ===
                        "brasil"
                    ) {

                        state =
                            stateSelect.value


                        const selectedCity =
                            citySelect
                                .selectedOptions[0]


                        if (
                            selectedCity
                        ) {

                            city =
                                selectedCity.dataset.name ||
                                selectedCity.textContent

                            cityCode =
                                selectedCity.value

                        }

                    } else {

                        country =
                            countrySelect.value

                    }


                    if (
                        !name
                    ) {

                        throw new Error(
                            "Informe seu nome."
                        )

                    }


                    if (
                        !Number.isInteger(age) ||
                        age < 13 ||
                        age > 120
                    ) {

                        throw new Error(
                            "Informe uma idade válida."
                        )

                    }


                    if (
                        !gender
                    ) {

                        throw new Error(
                            "Selecione uma opção de gênero."
                        )

                    }


                    if (
                        !display
                    ) {

                        throw new Error(
                            "Escolha como deseja aparecer no mapa."
                        )

                    }


                    if (
                        !consentValue
                    ) {

                        throw new Error(
                            "É necessário autorizar o uso das informações para as estatísticas do mapa."
                        )

                    }


                    if (
                        locationValue ===
                        "brasil" &&
                        (
                            !state ||
                            !city ||
                            !cityCode
                        )
                    ) {

                        throw new Error(
                            "Selecione o estado e a cidade."
                        )

                    }


                    if (
                        locationValue ===
                        "exterior" &&
                        !country
                    ) {

                        throw new Error(
                            "Selecione o país."
                        )

                    }


                    const {
                        data,
                        error
                    } =
                        await supabase.rpc(
                            "cadastrar_participante",
                            {
                                p_nome:
                                    name,

                                p_idade:
                                    age,

                                p_local_tipo:
                                    locationValue ===
                                    "brasil"
                                        ? "Brasil"
                                        : "Exterior",

                                p_estado_uf:
                                    state,

                                p_cidade:
                                    city,

                                p_codigo_ibge:
                                    cityCode,

                                p_pais:
                                    country,

                                p_genero:
                                    gender,

                                p_exibicao:
                                    display,

                                p_consentimento:
                                    consentValue
                            }
                        )


                    if (
                        error
                    ) {

                        console.error(
                            "Erro retornado pelo Supabase:",
                            error
                        )

                        throw new Error(
                            error.message ||
                            "Não foi possível realizar o cadastro."
                        )

                    }


                    form.classList.add(
                        "hidden"
                    )


                    if (
                        successMessage
                    ) {

                        successMessage.classList.remove(
                            "hidden"
                        )

                    }


                    const firstName =
                        name
                            .split(
                                /\s+/
                            )[0]


                    const locationText =
                        locationValue ===
                        "brasil"

                            ? `${city}, ${state}`

                            : country


                    if (
                        successText
                    ) {

                        successText.textContent =
                            `${firstName}, você está no mapa! Seu registro foi incluído em ${locationText}.`

                    }


                    await reloadEverything()


                    if (
                        successMessage
                    ) {

                        window.scrollTo({

                            top:
                                successMessage.offsetTop -
                                100,

                            behavior:
                                "smooth"

                        })

                    }


                } catch (error) {

                    console.error(
                        error
                    )


                    alert(
                        error.message ||
                        "Não foi possível concluir o cadastro."
                    )


                } finally {

                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            false

                    }

                }

            }
        )

    }


    /* =====================================================
       TEMPO REAL
    ===================================================== */

    supabase
        .channel(
            "mapa-da-torcida"
        )
        .on(
            "broadcast",
            {
                event:
                    "atualizacao"
            },
            async function () {

                console.log(
                    "Mapa atualizado em tempo real."
                )

                await reloadEverything()

            }
        )
        .subscribe(
            function (status) {

                console.log(
                    "Realtime:",
                    status
                )

            }
        )


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    try {

        await loadCoordinates()

        await Promise.all([
            loadMapData(),
            loadStatistics()
        ])

    } catch (error) {

        console.error(
            "Erro durante a inicialização:",
            error
        )

    }

})()
