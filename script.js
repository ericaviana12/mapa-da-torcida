(async function () {
    const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    )

    const SUPABASE_URL = "https://yesrkhgvlxsbvhgumzxs.supabase.co"
    const SUPABASE_KEY = "sb_publishable_CfwYZzY99TFrJLcMe7ZsLw_m1LhD2Cy"

    const COORDINATES_URL =
        "https://raw.githubusercontent.com/GusFurtado/dab_assets/main/data/coordenadas.csv"

    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    )

    const map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([-14.235, -51.9253], 4)

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map)

    const markerLayer = L.layerGroup().addTo(map)

    let coordinateData = {}
    let mapData = []
    let currentCity = null

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

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("pt-BR")
    }

    function escapeHTML(value) {
        const div = document.createElement("div")
        div.textContent = value ?? ""
        return div.innerHTML
    }

    function parseCSV(text) {
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)

        if (!lines.length) {
            return []
        }

        const delimiter = lines[0].includes(";") ? ";" : ","

        const headers = lines[0]
            .split(delimiter)
            .map(header =>
                header
                    .trim()
                    .replace(/^"|"$/g, "")
            )

        return lines.slice(1).map(line => {
            const values = []
            let current = ""
            let insideQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]

                if (char === '"') {
                    insideQuotes = !insideQuotes
                    continue
                }

                if (char === delimiter && !insideQuotes) {
                    values.push(current.trim())
                    current = ""
                    continue
                }

                current += char
            }

            values.push(current.trim())

            const row = {}

            headers.forEach((header, index) => {
                row[header] = values[index] ?? ""
            })

            return row
        })
    }

    async function loadCoordinates() {
        try {
            const response = await fetch(COORDINATES_URL)

            if (!response.ok) {
                throw new Error("Não foi possível carregar as coordenadas")
            }

            const text = await response.text()
            const rows = parseCSV(text)

            coordinateData = {}

            rows.forEach(row => {
                const code =
                    row.CD_GEOCODMU ||
                    row.codigo_ibge ||
                    row.CODIGO_IBGE ||
                    row.code

                const lat =
                    row.LAT ||
                    row.latitude ||
                    row.LATITUDE

                const lng =
                    row.LONG ||
                    row.longitude ||
                    row.LONGITUDE ||
                    row.LON

                if (!code || !lat || !lng) {
                    return
                }

                coordinateData[String(code).padStart(7, "0")] = {
                    lat: Number(String(lat).replace(",", ".")),
                    lng: Number(String(lng).replace(",", "."))
                }
            })

            console.log(
                "Coordenadas carregadas:",
                Object.keys(coordinateData).length
            )
        } catch (error) {
            console.error("Erro ao carregar coordenadas:", error)

            coordinateData = {}
        }
    }

    function markerRadius(quantity) {
        if (quantity <= 10) {
            return 7
        }

        if (quantity <= 50) {
            return 11
        }

        return Math.min(
            24,
            11 + Math.log(quantity) * 2
        )
    }

    function createMarker(city) {
        const coordinates =
            coordinateData[String(city.codigo_ibge).padStart(7, "0")]

        if (!coordinates) {
            console.warn(
                "Coordenada não encontrada:",
                city.codigo_ibge,
                city.cidade
            )

            return
        }

        const marker = L.circleMarker(
            [
                coordinates.lat,
                coordinates.lng
            ],
            {
                radius: markerRadius(city.quantidade),
                color: "#ffffff",
                weight: 2,
                fillColor: "#009739",
                fillOpacity: 0.78
            }
        )

        marker.bindTooltip(
            `${escapeHTML(city.cidade)}, ${escapeHTML(city.estado_uf)}<br><strong>${formatNumber(city.quantidade)} torcedores</strong>`,
            {
                direction: "top",
                offset: [0, -8]
            }
        )

        marker.on("click", function () {
            showCityPanel(city)
        })

        marker.addTo(markerLayer)
    }

    function showCityPanel(city) {
        currentCity = city

        const panel = document.getElementById("cityPanel")

        if (!panel) {
            return
        }

        const people = mapData.filter(person =>
            String(person.codigo_ibge).padStart(7, "0") ===
            String(city.codigo_ibge).padStart(7, "0")
        )

        people.sort((a, b) => {
            const nameA = String(a.nome_exibicao || "")
            const nameB = String(b.nome_exibicao || "")

            return nameA.localeCompare(
                nameB,
                "pt-BR"
            )
        })

        const membersHTML = people.map(person => {
            const isAnonymous =
                person.nome_exibicao === "Torcedor"

            const nameClass = isAnonymous
                ? "member-name anonymous-name"
                : "member-name"

            const name = escapeHTML(
                person.nome_exibicao
            )

            const age = Number(person.idade)

            return `
                <div class="member">
                    <span class="${nameClass}">
                        ${name}
                    </span>

                    <span class="member-location">
                        ${Number.isFinite(age) ? `${age} anos` : ""}
                    </span>
                </div>
            `
        }).join("")

        panel.innerHTML = `
            <div class="city-header">
                <small>CIDADE</small>

                <h3>
                    ${escapeHTML(city.cidade)}, ${escapeHTML(city.estado_uf)}
                </h3>

                <strong>
                    ${formatNumber(city.quantidade)}
                    ${city.quantidade === 1 ? "torcedor" : "torcedores"}
                </strong>
            </div>

            <div class="city-members">
                ${membersHTML}
            </div>
        `
    }

    function clearCityPanel() {
        currentCity = null

        const panel = document.getElementById("cityPanel")

        if (!panel) {
            return
        }

        panel.innerHTML = `
            <div class="empty-city">
                <span class="city-panel-icon">
                    📍
                </span>

                <h3>
                    Explore o mapa
                </h3>

                <p>
                    Clique em uma cidade para descobrir
                    quem está torcendo de lá.
                </p>
            </div>
        `
    }

    async function loadMapData() {
        const {
            data,
            error
        } = await supabase.rpc("dados_mapa")

        if (error) {
            console.error(
                "Erro ao carregar dados do mapa:",
                error
            )

            return
        }

        mapData = data || []

        markerLayer.clearLayers()

        const cities = {}

        mapData.forEach(person => {
            const code = String(
                person.codigo_ibge
            ).padStart(7, "0")

            if (!cities[code]) {
                cities[code] = {
                    codigo_ibge: code,
                    cidade: person.cidade,
                    estado_uf: person.estado_uf,
                    quantidade: 0
                }
            }

            cities[code].quantidade++
        })

        Object.values(cities).forEach(createMarker)

        if (currentCity) {
            const updatedCity =
                Object.values(cities).find(city =>
                    city.codigo_ibge === currentCity.codigo_ibge
                )

            if (updatedCity) {
                showCityPanel(updatedCity)
            } else {
                clearCityPanel()
            }
        }
    }

    function setElementText(id, value) {
        const element = document.getElementById(id)

        if (element) {
            element.textContent = value
        }
    }

    function setBar(id, percentage) {
        const element = document.getElementById(id)

        if (element) {
            element.style.width = `${percentage}%`
        }
    }

    async function loadStatistics() {
        const {
            data,
            error
        } = await supabase.rpc("estatisticas_mapa")

        if (error) {
            console.error(
                "Erro ao carregar estatísticas:",
                error
            )

            return
        }

        const stats = data || {}

        const total = Number(stats.total || 0)
        const brasil = Number(stats.brasil || 0)
        const exterior = Number(stats.exterior || 0)

        const brazilPercentage =
            total > 0
                ? Math.round((brasil / total) * 100)
                : 0

        const worldPercentage =
            total > 0
                ? 100 - brazilPercentage
                : 0

        setElementText(
            "heroCounter",
            formatNumber(total)
        )

        setElementText(
            "totalSupporters",
            formatNumber(total)
        )

        setElementText(
            "totalCities",
            formatNumber(stats.cidades)
        )

        setElementText(
            "totalStates",
            formatNumber(stats.estados)
        )

        setElementText(
            "foreignSupporters",
            formatNumber(exterior)
        )

        setElementText(
            "genderTotal",
            formatNumber(total)
        )

        const female =
            Number(stats.genero_feminino || 0)

        const male =
            Number(stats.genero_masculino || 0)

        const nonBinary =
            Number(stats.genero_nao_binario || 0)

        const other =
            Number(stats.genero_outro || 0)

        const privateGender =
            Number(stats.genero_nao_informado || 0)

        const percentage = value => {
            if (!total) {
                return 0
            }

            return Math.round(
                (value / total) * 100
            )
        }

        const femalePercent = percentage(female)
        const malePercent = percentage(male)
        const nonBinaryPercent = percentage(nonBinary)
        const otherPercent = percentage(other)
        const privatePercent = percentage(privateGender)

        setElementText(
            "genderFemalePercent",
            `${femalePercent}%`
        )

        setElementText(
            "genderMalePercent",
            `${malePercent}%`
        )

        setElementText(
            "genderNonBinaryPercent",
            `${nonBinaryPercent}%`
        )

        setElementText(
            "genderOtherPercent",
            `${otherPercent}%`
        )

        setElementText(
            "genderPrivatePercent",
            `${privatePercent}%`
        )

        setBar(
            "genderFemaleBar",
            femalePercent
        )

        setBar(
            "genderMaleBar",
            malePercent
        )

        setBar(
            "genderNonBinaryBar",
            nonBinaryPercent
        )

        setBar(
            "genderOtherBar",
            otherPercent
        )

        setBar(
            "genderPrivateBar",
            privatePercent
        )

        setElementText(
            "brazilPercentage",
            `${brazilPercentage}%`
        )

        setElementText(
            "brazilCount",
            formatNumber(brasil)
        )

        setElementText(
            "worldCount",
            formatNumber(exterior)
        )

        setBar(
            "originBrazilBar",
            brazilPercentage
        )

        setBar(
            "originWorldBar",
            worldPercentage
        )
    }

    async function loadCountries() {
        const {
            data,
            error
        } = await supabase.rpc(
            "torcida_por_pais"
        )

        if (error) {
            console.error(
                "Erro ao carregar países:",
                error
            )

            return
        }

        const grid =
            document.getElementById("countriesGrid")

        if (!grid) {
            return
        }

        const countries = data || []

        if (!countries.length) {
            grid.innerHTML = `
                <div class="country-card">
                    <span>🌎</span>

                    <strong>
                        Ainda não há registros
                    </strong>

                    <small>
                        0 torcedores
                    </small>
                </div>
            `

            return
        }

        const countryEmojis = {
            Argentina: "🇦🇷",
            Austrália: "🇦🇺",
            Canadá: "🇨🇦",
            Chile: "🇨🇱",
            Colômbia: "🇨🇴",
            Espanha: "🇪🇸",
            "Estados Unidos": "🇺🇸",
            França: "🇫🇷",
            Itália: "🇮🇹",
            Japão: "🇯🇵",
            México: "🇲🇽",
            Portugal: "🇵🇹",
            "Reino Unido": "🇬🇧",
            Uruguai: "🇺🇾",
            Outro: "🌎"
        }

        grid.innerHTML = countries.map(country => {
            const emoji =
                countryEmojis[country.pais] || "🌎"

            return `
                <div class="country-card">
                    <span>${emoji}</span>

                    <strong>
                        ${escapeHTML(country.pais)}
                    </strong>

                    <small>
                        ${formatNumber(country.quantidade)}
                        ${country.quantidade === 1 ? "torcedor" : "torcedores"}
                    </small>
                </div>
            `
        }).join("")
    }

    async function reloadEverything() {
        await Promise.all([
            loadMapData(),
            loadStatistics(),
            loadCountries()
        ])

        setTimeout(() => {
            map.invalidateSize()
        }, 100)
    }

    async function loadCities(uf) {
        const citySelect =
            document.getElementById("city")

        if (!citySelect) {
            return
        }

        citySelect.disabled = true

        citySelect.innerHTML = `
            <option value="">
                Carregando cidades...
            </option>
        `

        const stateCode = stateCodes[uf]

        if (!stateCode) {
            citySelect.innerHTML = `
                <option value="">
                    Primeiro selecione o estado
                </option>
            `

            return
        }

        try {
            const response = await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`
            )

            if (!response.ok) {
                throw new Error(
                    "Erro ao consultar municípios"
                )
            }

            const cities = await response.json()

            cities.sort((a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
            )

            citySelect.innerHTML = `
                <option value="">
                    Selecione a cidade
                </option>
            `

            cities.forEach(city => {
                const option =
                    document.createElement("option")

                option.value = String(city.id)
                    .padStart(7, "0")

                option.textContent = city.nome

                option.dataset.name =
                    city.nome

                citySelect.appendChild(option)
            })

            citySelect.disabled = false
        } catch (error) {
            console.error(
                "Erro ao carregar cidades:",
                error
            )

            citySelect.innerHTML = `
                <option value="">
                    Não foi possível carregar as cidades
                </option>
            `
        }
    }

    function updateLocationFields() {
        const locationType =
            document.querySelector(
                'input[name="locationType"]:checked'
            )?.value

        const brazilFields =
            document.getElementById(
                "brazilFields"
            )

        const exteriorFields =
            document.getElementById(
                "exteriorFields"
            )

        const state =
            document.getElementById("state")

        const city =
            document.getElementById("city")

        const country =
            document.getElementById("country")

        const isBrazil =
            locationType === "brasil"

        brazilFields.classList.toggle(
            "hidden",
            !isBrazil
        )

        exteriorFields.classList.toggle(
            "hidden",
            isBrazil
        )

        state.disabled = !isBrazil
        city.disabled = !isBrazil
        country.disabled = isBrazil

        state.required = isBrazil
        city.required = isBrazil
        country.required = !isBrazil

        if (isBrazil) {
            country.value = ""
        } else {
            state.value = ""

            city.innerHTML = `
                <option value="">
                    Primeiro selecione o estado
                </option>
            `

            city.disabled = true
        }
    }

    function normalizeGender(value) {
        const map = {
            "feminino": "Feminino",
            "masculino": "Masculino",
            "nao-binario": "Não binário",
            "não-binário": "Não binário",
            "outro": "Outro",
            "prefiro-nao-informar":
                "Prefiro não me identificar",
            "prefiro não me identificar":
                "Prefiro não me identificar"
        }

        return map[value] || value
    }

    function normalizeDisplay(value) {
        if (value === "nome") {
            return "nome"
        }

        if (value === "anonimo") {
            return "anonimo"
        }

        return value
    }

    async function submitForm(event) {
        event.preventDefault()

        const form =
            document.getElementById(
                "supporterForm"
            )

        const submitButton =
            form.querySelector(
                ".submit-button"
            )

        const name =
            document.getElementById(
                "name"
            ).value.trim()

        const age =
            Number(
                document.getElementById(
                    "age"
                ).value
            )

        const locationType =
            document.querySelector(
                'input[name="locationType"]:checked'
            )?.value

        const state =
            document.getElementById(
                "state"
            ).value

        const citySelect =
            document.getElementById(
                "city"
            )

        const city =
            citySelect.selectedOptions[0]
                ?.dataset.name || ""

        const codigoIbge =
            citySelect.value || ""

        const country =
            document.getElementById(
                "country"
            ).value

        const gender =
            normalizeGender(
                document.getElementById(
                    "gender"
                ).value
            )

        const display =
            normalizeDisplay(
                document.getElementById(
                    "visibility"
                ).value
            )

        const consent =
            document.getElementById(
                "consent"
            ).checked

        if (!name) {
            alert("Digite seu nome.")
            return
        }

        if (
            !Number.isInteger(age) ||
            age < 13 ||
            age > 120
        ) {
            alert(
                "Informe uma idade válida entre 13 e 120 anos."
            )

            return
        }

        if (!locationType) {
            alert(
                "Selecione onde você está torcendo."
            )

            return
        }

        if (locationType === "brasil") {
            if (!state) {
                alert(
                    "Selecione seu estado."
                )

                return
            }

            if (!city || !codigoIbge) {
                alert(
                    "Selecione sua cidade."
                )

                return
            }
        }

        if (locationType === "exterior") {
            if (!country) {
                alert(
                    "Selecione seu país."
                )

                return
            }
        }

        if (!gender) {
            alert(
                "Selecione seu gênero."
            )

            return
        }

        if (!display) {
            alert(
                "Escolha como você quer aparecer."
            )

            return
        }

        if (!consent) {
            alert(
                "É necessário autorizar a utilização das informações."
            )

            return
        }

        submitButton.disabled = true
        submitButton.textContent =
            "REGISTRANDO..."

        try {
            const {
                data,
                error
            } = await supabase.rpc(
                "cadastrar_participante",
                {
                    p_nome: name,
                    p_idade: age,
                    p_local_tipo:
                        locationType === "brasil"
                            ? "Brasil"
                            : "Exterior",
                    p_estado_uf:
                        locationType === "brasil"
                            ? state
                            : null,
                    p_cidade:
                        locationType === "brasil"
                            ? city
                            : null,
                    p_codigo_ibge:
                        locationType === "brasil"
                            ? codigoIbge
                            : null,
                    p_pais:
                        locationType === "exterior"
                            ? country
                            : null,
                    p_genero: gender,
                    p_exibicao: display,
                    p_consentimento: consent
                }
            )

            if (error) {
                console.error(
                    "Erro ao cadastrar:",
                    error
                )

                throw error
            }

            const successMessage =
                document.getElementById(
                    "successMessage"
                )

            const successText =
                document.getElementById(
                    "successText"
                )

            const firstName =
                name.split(/\s+/)[0]

            if (locationType === "brasil") {
                successText.textContent =
                    `${firstName}, sua participação foi registrada em ${city}, ${state}.`
            } else {
                successText.textContent =
                    `${firstName}, sua participação foi registrada como torcida pelo ${country}.`
            }

            form.classList.add("hidden")
            successMessage.classList.remove(
                "hidden"
            )

            form.reset()

            document.querySelector(
                'input[name="locationType"][value="brasil"]'
            ).checked = true

            updateLocationFields()

            await reloadEverything()
        } catch (error) {
            alert(
                "Não foi possível registrar sua participação. Tente novamente."
            )

            console.error(error)
        } finally {
            submitButton.disabled = false
            submitButton.textContent =
                "ENTRAR NO MAPA"
        }
    }

    function setupForm() {
        const state =
            document.getElementById("state")

        const form =
            document.getElementById(
                "supporterForm"
            )

        document
            .querySelectorAll(
                'input[name="locationType"]'
            )
            .forEach(input => {
                input.addEventListener(
                    "change",
                    updateLocationFields
                )
            })

        state.addEventListener(
            "change",
            event => {
                loadCities(
                    event.target.value
                )
            }
        )

        form.addEventListener(
            "submit",
            submitForm
        )

        updateLocationFields()
    }

    function setupRealtime() {
        supabase
            .channel("mapa-da-torcida")
            .on(
                "broadcast",
                {
                    event: "atualizacao"
                },
                async () => {
                    console.log(
                        "Mapa atualizado em tempo real"
                    )

                    await reloadEverything()
                }
            )
            .subscribe(status => {
                console.log(
                    "Realtime:",
                    status
                )
            })
    }

    async function initialize() {
        setupForm()
        setupRealtime()

        await loadCoordinates()
        await reloadEverything()

        setTimeout(() => {
            map.invalidateSize()
        }, 300)
    }

    initialize()
})()
