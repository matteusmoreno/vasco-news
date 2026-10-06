# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Torcedores do Vasco da Gama que abrem o site no celular ou no computador para saber o que saiu sobre o clube: jogo, elenco, bastidor e o que a imprensa publicou.

## Product Purpose

O Vasco News é um portal independente de notícias do Club de Regatas Vasco da Gama. Ele existe para reunir, em um só lugar, as matérias que a API do News Engine já publicou, e para levar o leitor até a fonte original. Sucesso é a pessoa ler a matéria certa, entender de onde ela veio e seguir para a próxima sem o site inventar conteúdo.

## Positioning

Não é o site oficial do clube. O mecanismo é a edição de um feed já publicado: cada matéria chega com título, resumo, corpo, data, importância, palavras-chave, fontes e, quando existe, foto. O portal aponta a reportagem original em vez de se apresentar como a redação que a produziu.

## Operating Context

Leitura em português, em qualquer tela, com datas no fuso America/Sao_Paulo. A capa, as últimas, a categoria, a busca e a matéria são o percurso. A pessoa chega, escolhe uma história e, se quiser, abre a fonte citada.

## Capabilities and Constraints

- Rotas: capa (`/`), últimas (`/ultimas`), categoria (`/categoria/:slug`), matéria (`/noticia/:slug`), busca (`/busca`).
- Dados só da API News Engine, portal `vasco-news`, via proxy `/v1`. Nada de matéria inventada, foto inventada ou texto de exemplo no lugar de uma notícia.
- Foto só quando a matéria traz `imageUrl`. Sem imagem, a matéria segue sem placa falsa.
- A capa não mostra palavras-chave. Palavras-chave ficam na página da matéria.
- Não há botão de copiar link.
- A lista deduplica por id e por título normalizado. A manchete da capa é a mais recente de importância alta; se não houver, a mais recente.
- O slug, o título, o resumo, o corpo, a data, a fonte e a foto vêm da API. O corpo é texto puro, em parágrafos.

## Brand Commitments

- Nome: Vasco News.
- Marca: a cruz de Malta em `public/cruz-de-malda-no-bg.png`, no cabeçalho, no rodapé e no favicon. A cruz não substitui foto de matéria.
- Visual escuro, sem chegar no preto fechado e sem virar branco ou creme.
- Voz de portal independente: cada história cita a fonte original. O rodapé deixa claro que o site não é o clube.

## Evidence on Hand

- API em produção: `https://news-engine-api-latest.onrender.com/`, consumida pelo proxy `/v1`.
- Cruz de Malta real: `public/cruz-de-malda-no-bg.png`.
- Não há depoimentos, números de audiência, preços ou selo oficial para inventar.

## Product Principles

- Só entra na tela o que a API publicou.
- A fonte original aparece junto da matéria.
- O portal é independente do clube e diz isso.
- A leitura funciona em qualquer largura de tela.
- A cruz é a marca; a foto é a foto da matéria, ou não existe.
