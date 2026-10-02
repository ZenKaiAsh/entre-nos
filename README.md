# Entre Nós

Player de música pessoal para um casal, em HTML, CSS e JavaScript puros. Sem backend, sem build, sem login, sem analytics.

## Privacidade
Suas músicas permanecem no seu dispositivo. O Entre Nós não envia seus arquivos MP3 para nenhum servidor.
O GitHub Pages hospeda somente o código. Os áudios selecionados ficam no IndexedDB do navegador do aparelho e tocam por URL.createObjectURL().
Se o navegador limpar os dados do site, basta selecionar os arquivos de novo.

## Publicar no GitHub Pages
1. Crie um repositório no GitHub (por exemplo `entre-nos`).
2. Envie todos os arquivos desta pasta (Add file > Upload files), mantendo `index.html` na raiz.
3. Abra **Settings**.
4. Abra **Pages**.
5. Em **Source**, escolha **Deploy from a branch** e selecione a branch **main**, pasta **/ (root)**.
6. Clique em **Save** e aguarde cerca de um minuto.
7. Acesse `https://SEU-USUARIO.github.io/entre-nos/`.

## Instalar como app (PWA)
No Chrome do Android: menu de três pontos > **Instalar app** (ou Adicionar à tela inicial). No iPhone (Safari): Compartilhar > **Adicionar à Tela de Início**.
O service worker guarda em cache apenas os arquivos do aplicativo, nunca os seus MP3.

## Editar os textos
Abra `js/romanticTexts.js`. Cada texto é um objeto com `id`, `title`, `icon`, `text` e, opcionalmente, `unlockDate` ("AAAA-MM-DD"). O bloqueio usa a data do aparelho.
Ícones disponíveis: mail, moon, heart, heartf, sun, thought, key, calendar.
Ao mudar arquivos depois de publicar, aumente `V` em `service-worker.js` (ex.: `entre-nos-v2`) para atualizar o cache.

## Metadados ID3 (capas e tags)
Hoje o título e o artista vêm do nome do arquivo (formato `Artista - Música.mp3`). Para ler ID3, adicione uma função em `Library.parsers` (`js/library.js`) que receba o arquivo e devolva `{title, artist, album, cover}`.
