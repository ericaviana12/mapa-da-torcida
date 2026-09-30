# 🗺️ Mapa da Torcida

> **Uma torcida. Milhares de lugares. Uma só paixão. 💚💛**

O **Mapa da Torcida** é um projeto independente criado para representar, de forma visual e interativa, onde estão os torcedores que participam da iniciativa.

A proposta é transformar os registros da torcida em um mapa vivo, mostrando a distribuição dos participantes pelo Brasil e também reunindo estatísticas gerais dos participantes que estão no exterior.

O projeto foi desenvolvido com foco na **Copa do Mundo Feminina de 2027 no Brasil** e na valorização da torcida do futebol feminino.

---

## 🎯 Objetivo

Criar um espaço simples, acessível e responsivo onde cada torcedor possa registrar de onde está acompanhando o futebol feminino e, ao mesmo tempo, visualizar a dimensão e a distribuição dessa torcida.

A ideia é que o mapa seja mais do que uma representação geográfica: seja uma forma de mostrar que, independentemente da cidade ou do estado, existe torcida espalhada por diferentes lugares.

---

## ✨ Funcionalidades

- 🗺️ **Mapa interativo do Brasil**
  - Cada estado possui um marcador com a quantidade de participantes.
  - Ao selecionar um estado, é possível visualizar os participantes agrupados por cidade.

- 👤 **Participação individual**
  - Cadastro de nome, idade e localização.
  - Possibilidade de escolher entre identificação ou anonimato.

- 🔒 **Exibição pública limitada**
  - Participantes identificados aparecem pelo primeiro nome.
  - Participantes anônimos aparecem como **"Torcedor"**.
  - A visualização pública utiliza cidade e estado, sem exibir o nome completo.

- 🌎 **Participantes do exterior**
  - Pessoas fora do Brasil também podem participar.
  - Os registros internacionais são utilizados nas estatísticas por país, mas não aparecem no mapa brasileiro.

- 📊 **Estatísticas da torcida**
  - Total de participantes.
  - Distribuição entre Brasil e exterior.
  - Quantidade de cidades e estados representados.
  - Distribuição por gênero de forma exclusivamente estatística.
  - Participação por país.

- ⚡ **Atualização em tempo real**
  - Novos registros podem atualizar os dados apresentados no mapa e nas estatísticas sem depender de uma atualização manual da página.

- 📱 **Design responsivo**
  - Adaptado para celular, tablet e computador.

---

## 🧭 Como funciona

O participante preenche o formulário informando sua localização e os demais dados solicitados.

### 🇧🇷 Se estiver no Brasil

É possível selecionar:

1. Estado;
2. Cidade;
3. Dados pessoais solicitados pelo formulário;
4. Forma de exibição no mapa.

A cidade é associada ao seu respectivo código do **IBGE**, permitindo uma identificação mais precisa da localização.

### 🌎 Se estiver no exterior

O participante informa o país onde está.

Esses registros não aparecem no mapa dos estados brasileiros, mas fazem parte das estatísticas gerais da torcida.

---

## 🔐 Privacidade

A exposição pública dos dados foi pensada para reduzir a quantidade de informações pessoais apresentadas no mapa.

Quando o participante permite sua identificação, o mapa utiliza apenas:

- Primeiro nome;
- Idade;
- Cidade;
- Estado/UF.

Quando o participante escolhe permanecer anônimo, sua identificação pública aparece como:

> **Torcedor**

Informações como gênero são utilizadas apenas para composição das estatísticas e não são exibidas individualmente no mapa.

O nome completo não é apresentado publicamente.

---

## 🛠️ Tecnologias utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- OpenStreetMap

### Back-end e dados

- Supabase
- PostgreSQL
- Supabase Realtime

### Dados geográficos

- API de municípios do IBGE

### Hospedagem e versionamento

- Vercel
- GitHub

---

## 🗺️ Visualização do mapa

O mapa utiliza os estados brasileiros como principal unidade de visualização.

Cada estado recebe um marcador proporcional à quantidade de participantes registrados.

Ao clicar em um estado, uma janela lateral apresenta os dados correspondentes àquela região, organizando os participantes por cidade.

Essa abordagem permite visualizar tanto a dimensão geral da torcida quanto sua distribuição geográfica.

---

## 📈 Dados e atualizações

Os dados cadastrados são armazenados no Supabase e utilizados pela aplicação para gerar o mapa e as estatísticas.

O projeto utiliza recursos de atualização em tempo real para que novos participantes possam ser refletidos na aplicação sem depender exclusivamente de uma nova carga manual dos dados.

---

## 📱 Responsividade

O projeto foi desenvolvido para funcionar em diferentes dispositivos:

- 📱 Smartphones
- 📲 Tablets
- 💻 Notebooks
- 🖥️ Desktops

A interface se adapta ao tamanho da tela, mantendo o mapa, formulário, estatísticas e demais componentes acessíveis.

---

## 🚀 Publicação

O projeto é versionado no GitHub e publicado através da Vercel.

A aplicação está disponível em:

**mapadatorcida.vercel.app**

---

## 📌 Status

**Em desenvolvimento.**

O projeto continua recebendo ajustes visuais, melhorias de experiência e aperfeiçoamentos na apresentação dos dados.

---

## 💚 Sobre o projeto

O **Mapa da Torcida** nasceu da ideia de transformar uma torcida espalhada por diferentes lugares em algo que pudesse ser visto.

Cada registro representa uma pessoa, uma cidade e uma história.

No fim, o mapa é uma forma simples de responder visualmente a uma pergunta:

> **Onde está a nossa torcida?**

---

## 👩🏻‍💻 Autora

**Erica Viana**

Projeto desenvolvido de forma independente, com foco em desenvolvimento web, integração de dados e visualização interativa.

---

## 📄 Licença

Este projeto está distribuído sob a licença **Apache License 2.0**.

Consulte o arquivo [`LICENSE`](LICENSE) para obter os termos completos da licença.
