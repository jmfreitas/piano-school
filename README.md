# Piano School

App para ajudar crianças a dar os primeiros passos no piano: mostra, de forma muito clara, que teclas tocar em cada parte de uma música, com o nome das notas, a letra da canção e pistas visuais de ritmo e de melodia.

Pensada para usar no telemóvel ou tablet Android pousado no suporte da pauta do piano, e também num PC Windows com ecrã tátil (ex.: Surface).

---

## Princípios

1. **Simples e kids friendly.** Um ecrã de cada vez, poucos botões, botões grandes. O botão mais usado (*Seguinte*) é o maior.
2. **Legibilidade primeiro.** Letras grandes, fonte arredondada (Nunito), bom contraste. Tudo se lê a um braço de distância.
3. **Das letras aos nomes das notas.** Cada nota mostra a letra da tecla (C, D, E…) *e* o nome (Dó, Ré, Mi…). Com o tempo, as letras podem esconder-se para que fique só o nome.
4. **Ritmo e melodia sem pauta.** As pausas aparecem como um ponto entre notas, e as notas seguidas ficam agrupadas. As notas de outra oitava sobem ou descem ligeiramente e levam uma seta (▲/▼), para se ver a "forma" da melodia.
5. **Encorajar, nunca castigar.** Feedback positivo, nada de sons de erro agressivos.
6. **Privada e sem distrações.** Sem conta, sem anúncios, funciona offline. Quando houver reconhecimento de som, o áudio é processado no próprio dispositivo e nunca sai dele.
7. **Livre.** Código aberto sob GPL-3.0.

---

## Como funciona

### Ecrã de tocar

- A música está dividida em **partes** (frases curtas). Cada ecrã mostra uma parte.
- Cada nota é um **cartão** com:
  - a letra da tecla (ex.: **C**),
  - o nome da nota (ex.: **Dó**),
  - uma **cor própria da nota**, sempre a mesma em toda a app,
  - a **sílaba da letra da música** por baixo (ex.: *wish*), sempre alinhada na mesma linha.
- **Pausas:** um ponto preto pequeno entre duas notas, com um pouco mais de espaço.
- **Oitavas:** a oitava "de casa" começa no Dó central (C4). Uma nota da oitava acima leva ▲ e sobe um pouco; uma da oitava abaixo leva ▼ e desce um pouco.
- **Teclado de referência:** mostra as oitavas de que a música precisa e acende, na cor de cada nota, as teclas usadas na parte atual. O Dó central tem uma ⭐, o mesmo símbolo que se pode colar no piano real.
- **Botões:**
  - **Seguinte**: o maior, em verde; avança para a parte seguinte. Na última parte diz "Terminar".
  - **Atrás**: volta à parte anterior.
  - **Início**: recomeça a música.
- No fim da música aparece "Muito bem!" com estrelas.
- **Duas orientações:**
  - **Vertical:** cartões em grelha, teclado e botões em baixo.
  - **Horizontal:** pensada para o suporte do piano. As notas ficam numa fila e o teclado por baixo, com os botões numa coluna à direita.

### Opções de aprendizagem

| Opção | Efeito |
|---|---|
| Mostrar letras (C, D, E…) | Desligada: mostra só o nome da nota (Dó, Ré…) |
| Cores das notas | Desligada: cartões neutros, a preto e branco |
| Letra da música | Desligada: esconde as sílabas |

### Cores das notas

| Nota | Letra | Cor |
|---|---|---|
| Dó | C | vermelho |
| Ré | D | laranja |
| Mi | E | amarelo |
| Fá | F | verde |
| Sol | G | azul |
| Lá | A | índigo |
| Si | B | rosa |

### Mockups

Mockups interativos aprovados (vertical e horizontal): <https://claude.ai/artifact/BSRwWFL3m2AReCBJMH1bKP>

---

## Formato das músicas

Na fase 1 as músicas vêm incluídas na app. Na fase 2 (editor de músicas) podem ser escritas à mão neste formato de texto simples, ou importadas (ver Roadmap).

```text
titulo: We Wish You a Merry Christmas
tom: C

G3:We C4:wish C4:you . D4:a C4:mer- B3:ry A3:Christ- A3:mas
A3:We D4:wish D4:you . E4:a D4:mer- C4:ry B3:Christ- G3:mas
G3:We E4:wish E4:you . F4:a E4:mer- D4:ry C4:Christ- A3:mas
G3:And G3:a . A3:hap- D4:py B3:New . C4:Year
```

Regras:

- **Cada linha é uma parte** (um ecrã).
- **Nota:** letra (`C`–`B`), sustenido opcional (`#`) e oitava (`C4` é o Dó central). Sem oitava, assume-se `4`. Exemplos: `C4`, `F#4`, `G3`.
- **`:sílaba`** (opcional): a sílaba da letra da música para essa nota. Um hífen no fim (`mer-`) indica que a palavra continua na nota seguinte.
- **`.`**: pausa entre duas notas.
- **`//`**: comentário até ao fim da linha.

Os formatos MusicXML, ABC e MIDI guardam a duração das notas, as pausas e a oitava, e o MusicXML e o ABC guardam também a letra. Na importação, a app converte-os para este modelo, e as pausas e as setas de oitava aparecem automaticamente.

---

## Plataforma

**Decisão: PWA (Progressive Web App)**, uma única base de código web que se instala como app:

- **Android (telemóvel/tablet):** instala-se a partir do Chrome ("Adicionar ao ecrã principal") e abre em ecrã inteiro como uma app normal. Se um dia fizer sentido, pode ir para a Play Store embrulhada como TWA, sem reescrever nada.
- **Windows (Surface, ecrã tátil):** instala-se a partir do Edge ou do Chrome como app, com janela própria, ícone no menu Iniciar e suporte de toque.
- **Offline:** service worker e músicas guardadas localmente (IndexedDB).
- **Fase 3:** o microfone funciona via Web Audio (`getUserMedia` + deteção de frequência YIN/MPM, ex.: biblioteca `pitchy`). A ligação MIDI ao piano funciona via Web MIDI, suportado no Chrome e no Edge, em Android e Windows.
- **Distribuição:** alojamento gratuito no GitHub Pages; cada `git push` publica uma nova versão.
- **Stack:** TypeScript sem framework, compilado com `tsc` para módulos ES que o browser carrega diretamente. Não há bundler nem dependências em tempo de execução: a única dependência de desenvolvimento é o `typescript`.

Alternativas consideradas:

| Opção | Android | Windows | Prós | Contras |
|---|---|---|---|---|
| **PWA (escolhida)** | ✔ | ✔ | Um só código, sem lojas, atualização instantânea, também funciona em iPad/Mac | Latência de áudio um pouco maior em alguns Android (não é crítico para deteção de notas) |
| Flutter | ✔ | ✔ | App nativa, boa performance | Duas compilações, plugins de áudio/MIDI menos maduros no Windows |
| Kotlin + Compose Multiplatform | ✔ | ✔ (JVM) | Melhor acesso ao áudio e MIDI no Android | Mais complexo; a versão desktop é mais pesada |

---

## Desenvolvimento

Requisitos: [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
npm install      # instala o TypeScript (única dependência)
npm start        # compila e abre em http://localhost:5173
npm run watch    # recompila a cada alteração (noutro terminal: npm run serve)
npm test         # compila e corre os testes do leitor de músicas
```

Para experimentar no telemóvel ou tablet na mesma rede: `npm run build && node scripts/serve.mjs --host` e abre `http://<ip-do-pc>:5173`. A instalação como app e o modo offline só funcionam em `https` ou `localhost`, por isso para isso usa a versão publicada.

**Publicar:** cada `push` para `main` corre os testes e publica a pasta `app/` no GitHub Pages (`.github/workflows/deploy.yml`). Da primeira vez, em *Settings → Pages*, escolhe **Source: GitHub Actions**.

**Instalar:**
- **Android:** abre o endereço no Chrome e escolhe ⋮ → *Adicionar ao ecrã principal* (ou *Instalar app*).
- **Windows:** abre o endereço no Edge e escolhe ⋯ → *Aplicações* → *Instalar este site como aplicação*.

**Atalhos de teclado** (também funcionam com pedais Bluetooth de virar páginas):
- `→`, `Espaço` ou `Page Down`: seguinte
- `←` ou `Page Up`: atrás
- `Home`: início
- `Esc`: voltar à lista

### Estrutura

```text
app/                  ← o que é publicado
  index.html, styles.css, manifest.webmanifest, sw.js, icons/
  js/                 ← gerado pelo tsc (não vai para o git)
src/
  notes.ts            ← nomes, cores e oitavas das notas
  song.ts             ← leitor do formato de texto das músicas
  library.ts          ← músicas incluídas
  settings.ts         ← opções (guardadas no dispositivo)
  favorites.ts        ← músicas favoritas (guardadas no dispositivo)
  views/home.ts       ← lista de músicas e opções
  views/play.ts       ← ecrã de tocar e teclado
tests/                ← testes (node --test)
scripts/serve.mjs     ← servidor local sem dependências
```

---

## Roadmap

### Fase 1 — MVP: tocar músicas
- [x] Lista de músicas (8 músicas incluídas)
- [x] Ecrã de tocar por partes, com os botões Seguinte / Atrás / Início
- [x] Cartões de nota: letra, nome, cor e sílaba
- [x] Pausas (ponto) e oitavas (▲/▼ e desvio vertical)
- [x] Teclado de referência com as teclas da parte acesas e ⭐ no Dó central
- [x] Layouts vertical e horizontal
- [x] Opções de aprendizagem: letras, cores, letra da música
- [x] Instalável e a funcionar offline (Android + Windows)
- [x] Músicas favoritas: ⭐ no cartão e no ecrã de tocar, filtro "Favoritas" na lista

### Fase 2 — Editor de músicas
- [ ] Editor manual no formato de texto acima, com pré-visualização
- [ ] Importação de MusicXML, ABC e MIDI (pausas, oitavas e letra automáticas)
- [ ] Exportar/partilhar músicas

### Fase 3 — Ouvir e acompanhar
- [ ] Reconhecimento da nota tocada pelo microfone (YIN/MPM, no dispositivo)
- [ ] Deteção de novo ataque, para notas repetidas (ex.: Dó-Dó)
- [ ] A app só avança quando a nota certa é tocada; nota atual destacada
- [ ] Modo fácil (aceita qualquer oitava) e modo normal
- [ ] Ligação ao piano por MIDI (USB/Bluetooth), quando existir, para uma deteção perfeita
- [ ] Feedback de acerto ("Boa!") e de tentativa ("Quase! Procura o Dó")
- [ ] Estrelas e progresso por música


---

## Licença

[GPL-3.0](LICENSE)
