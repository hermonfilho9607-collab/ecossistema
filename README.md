# Mentoria Multiplicador Empresarial — Site

Landing page da Mentoria Multiplicador Empresarial, de Sérgio Pessoa.
Site estático (HTML, CSS e JavaScript puros), sem dependências nem build.

## Estrutura

```
index.html        Página única com todas as seções
styles.css        Estilos (identidade do brandbook: verde profundo + dourado)
main.js           Menu mobile, animações, contadores e formulário
assets/
  fonts/          The Seasons (títulos) e Calibre (textos)
  img/            Fotos e imagens dos cards (WebP)
  logo/           Logo e símbolo em SVG
```

## Rodar localmente

```bash
python -m http.server 5173
```

Depois abra http://localhost:5173.

## Formulário de aplicação

Ao enviar, o formulário abre o WhatsApp do Sérgio com uma mensagem pronta contendo
os dados preenchidos. O número de destino fica no atributo `data-whatsapp` do
`<form id="apply-form">` em `index.html` (formato: DDI + DDD + número, só dígitos).

## Publicar

Suba todo o conteúdo desta pasta para qualquer hospedagem de site estático
(Hostinger, Netlify, Vercel, GitHub Pages). Ao alterar CSS ou JS, aumente o
`?v=` nos links de `index.html` para que os visitantes não vejam a versão em cache.
