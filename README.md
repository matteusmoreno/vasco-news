# Vasco News

Site de notícias do Vasco da Gama. A capa, o arquivo, a busca e cada matéria vêm da News Engine API, no portal `vasco-news`.

## Rodar

O Vite encaminha `/v1` para a News Engine API. O endereço do proxy fica em `vite.config.js`.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

O slug do portal pode ser trocado com `VITE_PORTAL_SLUG`. Se o site for publicado em outra origem, defina `VITE_API_BASE` com a URL da API e libere essa origem em `CORS_ORIGINS`.
