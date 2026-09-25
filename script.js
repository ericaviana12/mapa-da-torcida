/* =========================================================
   MAPA DA TORCIDA
   JAVASCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   DADOS DE DEMONSTRAÇÃO
========================================================= */

const cityData = [

    {
        name: "São Paulo",
        state: "SP",
        lat: -23.5505,
        lng: -46.6333,
        supporters: 420,
        members: [
            {
                name: "Erica",
                age: 32,
                anonymous: false
            },
            {
                name: "Marina",
                age: 27,
                anonymous: false
            },
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            },
            {
                name: "Lucas",
                age: 25,
                anonymous: false
            }
        ]
    },

    {
        name: "Rio de Janeiro",
        state: "RJ",
        lat: -22.9068,
        lng: -43.1729,
        supporters: 280,
        members: [
            {
                name: "Camila",
                age: 29,
                anonymous: false
            },
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            }
        ]
    },

    {
        name: "Belo Horizonte",
        state: "MG",
        lat: -19.9167,
        lng: -43.9345,
        supporters: 145,
        members: [
            {
                name: "Ana",
                age: 31,
                anonymous: false
            },
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            }
        ]
    },

    {
        name: "Brasília",
        state: "DF",
        lat: -15.7939,
        lng: -47.8828,
        supporters: 98,
        members: [
            {
                name: "Juliana",
                age: 34,
                anonymous: false
            }
        ]
    },

    {
        name: "Salvador",
        state: "BA",
        lat: -12.9777,
        lng: -38.5016,
        supporters: 74,
        members: [
            {
                name: "Bianca",
                age: 24,
                anonymous: false
            }
        ]
    },

    {
        name: "Curitiba",
        state: "PR",
        lat: -25.4284,
        lng: -49.2733,
        supporters: 62,
        members: [
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            }
        ]
    },

    {
        name: "Recife",
        state: "PE",
        lat: -8.0476,
        lng: -34.8770,
        supporters: 51,
        members: [
            {
                name: "Fernanda",
                age: 28,
                anonymous: false
            }
        ]
    },

    {
        name: "Porto Alegre",
        state: "RS",
        lat: -30.0346,
        lng: -51.2177,
        supporters: 43,
        members: [
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            }
        ]
    },

    {
        name: "Manaus",
        state: "AM",
        lat: -3.1190,
        lng: -60.0217,
        supporters: 29,
        members: [
            {
                name: "Gabriel",
                age: 22,
                anonymous: false
            }
        ]
    },

    {
        name: "Belém",
        state: "PA",
        lat: -1.4558,
        lng: -48.4902,
        supporters: 22,
        members: [
            {
                name: "Torcedor",
                age: null,
                anonymous: true
            }
        ]
    }

];


/* =========================================================
   CONFIGURAÇÃO DO MAPA
========================================================= */

const map = L.map("map", {
    scrollWheelZoom: false
});


/*
   Centralização inicial aproximada no Brasil.
*/

map.setView(
    [-14.2, -51.9],
    4
);


/*
   Mapa base.
*/

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 18,
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


/* =========================================================
   MARCADORES
========================================================= */

function getMarkerSize(supporters) {

    if (supporters <= 10) {
        return 30;
    }

    if (supporters <= 50) {
        return 42;
    }

    if (supporters <= 150) {
        return 54;
    }

    if (supporters <= 300) {
        return 66;
    }

    return 78;
}


function createMarker(city) {

    const size =
        getMarkerSize(city.supporters);


    const icon = L.divIcon({

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

    });


    const marker = L.marker(
        [
            city.lat,
            city.lng
        ],
        {
            icon
        }
    );


    marker.addTo(map);


    marker.on(
        "click",
        function () {

            showCity(
                city
            );

        }
    );

}


cityData.forEach(
    createMarker
);


/* =========================================================
   PAINEL DA CIDADE
========================================================= */

function showCity(city) {

    const panel =
        document.getElementById(
            "cityPanel"
        );


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
                        `;

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
                    `;

                }
            )
            .join("");


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

            ${
                city.supporters >
                city.members.length
                ?

                `
                    <div class="member">

                        <span class="member-name">
                            + ${
                                city.supporters -
                                city.members.length
                            } torcedores
                        </span>

                        <span class="member-location">
                            Também estão aqui.
                        </span>

                    </div>
                `

                :

                ""
            }

        </div>

    `;


    /*
       Em celular, leva o usuário até o painel.
    */

    if (
        window.innerWidth <= 900
    ) {

        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   FORMULÁRIO — LOCALIZAÇÃO
========================================================= */

const locationRadios =
    document.querySelectorAll(
        'input[name="locationType"]'
    );


const brazilFields =
    document.getElementById(
        "brazilFields"
    );


const exteriorFields =
    document.getElementById(
        "exteriorFields"
    );


const stateSelect =
    document.getElementById(
        "state"
    );


const citySelect =
    document.getElementById(
        "city"
    );


const countrySelect =
    document.getElementById(
        "country"
    );


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
                    );

                    exteriorFields.classList.add(
                        "hidden"
                    );

                    stateSelect.required = true;

                    citySelect.required = true;

                    countrySelect.required = false;

                }


                if (
                    this.value ===
                    "exterior"
                ) {

                    brazilFields.classList.add(
                        "hidden"
                    );

                    exteriorFields.classList.remove(
                        "hidden"
                    );

                    stateSelect.required = false;

                    citySelect.required = false;

                    countrySelect.required = true;

                }

            }
        );

    }
);


/* =========================================================
   CIDADES
   DADOS DE DEMONSTRAÇÃO
========================================================= */


/*
   Aqui estamos colocando apenas algumas cidades para
   testar o funcionamento.

   Na próxima etapa, substituiremos isso pela lista
   completa dos municípios brasileiros.
*/

const citiesByState = {

    SP: [
        "São Paulo",
        "Campinas",
        "Santos",
        "Guarulhos",
        "Osasco",
        "São Bernardo do Campo"
    ],

    RJ: [
        "Rio de Janeiro",
        "Niterói",
        "Duque de Caxias",
        "Nova Iguaçu"
    ],

    MG: [
        "Belo Horizonte",
        "Uberlândia",
        "Contagem",
        "Juiz de Fora"
    ],

    BA: [
        "Salvador",
        "Feira de Santana",
        "Vitória da Conquista"
    ],

    PR: [
        "Curitiba",
        "Londrina",
        "Maringá",
        "Foz do Iguaçu"
    ],

    PE: [
        "Recife",
        "Olinda",
        "Jaboatão dos Guararapes"
    ],

    RS: [
        "Porto Alegre",
        "Caxias do Sul",
        "Pelotas"
    ],

    AM: [
        "Manaus",
        "Parintins",
        "Itacoatiara"
    ],

    PA: [
        "Belém",
        "Santarém",
        "Marabá"
    ],

    DF: [
        "Brasília"
    ]

};


stateSelect.addEventListener(
    "change",
    function () {

        const state =
            this.value;


        citySelect.innerHTML = `
            <option value="">
                Selecione a cidade
            </option>
        `;


        citySelect.disabled =
            true;


        if (
            !state ||
            !citiesByState[state]
        ) {

            return;

        }


        citiesByState[state]
            .forEach(
                city => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        city;

                    option.textContent =
                        city;

                    citySelect.appendChild(
                        option
                    );

                }
            );


        citySelect.disabled =
            false;

    }
);


/* =========================================================
   FORMULÁRIO — ENVIO DE DEMONSTRAÇÃO
========================================================= */

const form =
    document.getElementById(
        "supporterForm"
    );


const successMessage =
    document.getElementById(
        "successMessage"
    );


const successText =
    document.getElementById(
        "successText"
    );


form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value.trim();


        const locationType =
            document.querySelector(
                'input[name="locationType"]:checked'
            ).value;


        let locationText;


        if (
            locationType ===
            "brasil"
        ) {

            const city =
                citySelect.value;

            const state =
                stateSelect.value;


            locationText =
                `${city}, ${state}`;

        } else {

            locationText =
                countrySelect.value;

        }


        /*
           Por enquanto, NÃO enviamos para lugar nenhum.

           Esta versão apenas simula o cadastro.
        */


        form.classList.add(
            "hidden"
        );


        successMessage.classList.remove(
            "hidden"
        );


        successText.textContent =
            `${name.split(" ")[0]}, seu registro de demonstração foi criado para ${locationText}. Na próxima etapa, conectaremos isso aos dados reais.`;
        

        window.scrollTo({

            top:
                successMessage.offsetTop - 100,

            behavior:
                "smooth"

        });

    }
);


/* =========================================================
   ANIMAÇÃO SIMPLES DOS CONTADORES
========================================================= */

function animateCounter(
    element,
    target
) {

    let current = 0;

    const duration = 900;

    const start =
        performance.now();


    function update(
        timestamp
    ) {

        const progress =
            Math.min(
                (timestamp - start) /
                duration,
                1
            );


        current =
            Math.floor(
                progress * target
            );


        element.textContent =
            current.toLocaleString(
                "pt-BR"
            );


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/*
   Inicia a animação quando a página carrega.
*/

window.addEventListener(
    "load",
    function () {

        animateCounter(
            document.getElementById(
                "heroCounter"
            ),
            1284
        );


        animateCounter(
            document.getElementById(
                "totalSupporters"
            ),
            1284
        );


        animateCounter(
            document.getElementById(
                "totalCities"
            ),
            187
        );


        animateCounter(
            document.getElementById(
                "totalStates"
            ),
            27
        );


        animateCounter(
            document.getElementById(
                "foreignSupporters"
            ),
            46
        );

    }
);
