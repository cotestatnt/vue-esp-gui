# vue-esp-gui

**Introduzione**

Premessa d’obbligo! Io non sono uno sviluppatore web, la pagnotta la porto a casa in altro modo. Metto le mani avanti per due motivi.
Per i più esperti su questi temi: se ho scritto qualche stupidaggine, non me ne vogliate a male :)
Per i principianti: con un po’ di impegno e volontà si porta a casa qualsiasi risultato ci si prefigge.

Uno tra gli argomenti più “caldi” nel mondo Arduino & co. è come far fare alla nostra board qualcosa in risposta ad un comando impartito da remoto, come ad esempio attraverso una pagina web o una _“single page application”_.
La rete è piena di tutorial e video tutorial su questo argomento, ma la maggior parte di questi non sono altro che un continuo copia e incolla di altri tutorial fatti a partire dagli esempi inclusi nelle librerie o poco più (dove giustamente vengono illustrate solo le funzionalità “di base”).

Per non parlare poi di quelli dove c’è una variabile String con tutto il codice HTML concatenato e generato a runtime: leggibilità del codice inesistente, manutenibilità non pervenuta, scalabilità nemmeno a parlarne, ergonomia cognitiva della pagina lasciamo perdere…

Ho deciso quindi di aggiungere il “metodo” che ho deciso di adottare io in questo mare magnum, usando un approccio che consente di ottenere firmware più efficienti con pagine realmente dinamiche ed esteticamente gradevoli allo stesso tempo.
Inoltre, il contenuto delle pagine web potrà essere zippato e memorizzato direttamente in flash, se il microcontrollore ne ha a sufficienza, oppure salvato su una memoria esterna come ad esempio una SD.

In realtà, come vedremo più avanti, la pagina web generata le possiamo mettere ovunque.
Ci sono molti servizi completamente gratuiti che consentono di caricare delle webpage “statiche”, anche lo stesso Github ad esempio. Sfruttando dei servizi “serverless” che fanno da ponte, potremo raggiungere il nostro microcontrollore da ovunque.
Io ad esempio uso [**pipedream**](https://pipedream.com/) che con il piano gratuito che consente di fare un numero di invocazioni giornaliere ampiamente sufficiente per le esigenze più comuni.
Il principio è più o meno quello di Blynk, ma ovviamente in questo caso abbiamo noi il pieno controllo di cosa e come fare.

**Parte 1**

Lo sviluppo della nostra applicazione sarà quindi eseguita in due step distinti:
sviluppo del firmware del microcontrollore.
sviluppo dell’interfaccia grafica aka pagina/e web che sarà “servita” al client;

La prima parte la sorvoliamo per ora perchè è la più semplice: in pratica il nostro microcontrollore non dovrà far altro che recuperare dalla memoria flash un array di byte che rappresenta il contenuto della pagina zippato (tutti i browser supportano in modo nativo pagine HTML compresse in formato gzip), oppure i file che compongono il nostro web server da una memoria esterna.


Gli strumenti che andremo ad utilizzare sono essenzialmente 3.

- **Visual Studio code** (+ il plugin platformio).

VSCode è un IDE gratuito che da quando è stato introdotto (2015) ha guadagnato un numero sempre crescente di utilizzatori diventando in poco tempo uno degli editor più utilizzati. VSCode ci consentirà di gestire con lo stesso editor sia il progetto per il microcontrollore che quello per l’interfaccia grafica
- **Node.js**

Un runtime system open source multipiattaforma orientato agli eventi per l'esecuzione di codice JavaScript (wikipedia). In pratica ci consente di eseguire del codice Javascript senza un browser. Altro tool di enorme successo, con moduli per fare praticamente ogni cosa ed una estesa community di sviluppatori.
Non andremo a scrivere direttamente del codice con node.js, ma sarà “il motore” con cui andremo a realizzare la nostra pagina web dinamica.
- **Vue.js**

Un framework JavaScript open-source in configurazione Model–view–viewmodel per la creazione di interfacce utente e single-page applications (wikipedia).
Ho scelto di adottare Vue come framework perché rispetto ad altri “concorrenti” (React, Angular etc etc), ha una curva di apprendimento molto “docile” e si ottengono rapidamente ottimi risultati: io non avevo mai fatto sviluppo web in vita mia prima di iniziare ad usarlo!


Iniziamo!

Come prima cosa, se non è già installato nel vostro PC, dovrete installare Visual Studio Code. Una volta finita l’installazione, aprite la tab “estensioni” ed aggiungete PlatformIO e Vetur.

Installate quindi il runtime node.js. L’installer di node, aggiungerà anche l’indispensabile npm (dovrebbe essere node-packet-manager) che ci consentirà poi di aggiungere tutti i moduli necessari al nostro progetto compreso il framework Vue.

Ora siamo pronti per iniziare!
Apriamo un terminale o una powershell e creiamo una cartella che andrà a contenere i sorgenti dei nostri progetti (se lo ritenete utile) e ci posizioniamoci all’interno di essa.

	mkdir vue-projects

	cd vue-projects

Quindi installiamo il modulo vue ma accessibile a livello globale; i moduli infatti di default vengono salvati localmente nella cartella del progetto.
	
	npm install vue --global

Nota: se il sistema non dovesse riconoscere il comando npm significa che non è stato impostato automaticamente il PATH dell’eseguibile come variabile di sistema, quindi controllate se è un’opzione dell’installer o se è necessario farlo manualmente.

Adesso possiamo creare il progetto con il seguente comando

	vue create demo-gui

Si avvierà una specie di procedura guidata al termine della quale avremo il nostro primo progetto di prova configurato e funzionante (con una pagina demo installata automaticamente dal framework). Lasciate il preset proposto di default per iniziare.

Provate ad avviare il progetto seguendo le indicazioni a schermo ed aprite l’indirizzo proposto nel vostro browser. Avete appena sviluppato la vostra prima Single Application Page con Vue!!!
Scherzi a parte, adesso siamo pronti per iniziare a sviluppare la nostra pagina per davvero.

Se da linea di comando digitate (per chiudere il webserver di prova CTRL + C)
code .
si avvierà VSCode caricando la cartella corrente come progetto (e riconoscendo in modo automatico che è un progetto Vue grazie al plugin Vetur) all’interno del quale potremo vedere tutti i file generati prima. Possiamo chiudere il terminale, ora quando necessario possiamo usare quello incluso in VSCode (Terminal -> New Terminal).. in realtà potevamo farlo anche prima :-)

Facciamo una rapida rassegna dei file che sono stati generati.
Tutto ciò che riguarda la compilazione del progetto sarà descritto nel file package.json, dipendenze, script da eseguire, regole di compilazione etc etc. I sorgenti della pagina invece sono nella cartella /src e come potete vedere sono organizzati per “componenti” all’interno di sottocartelle. Nella cartella /public invece ci sono dei componenti statici che verranno inclusi in fase di compilazione.

Noi andremo poi ad aggiungere anche qualche altro file per “istruire” il compilatore e fare in modo di generare in modo automatico un file “webpage.h” dove sarà definito il famoso array di byte, oltre ovviamente ai diversi file .vue per ciascun componente del nostro progetto che in questo semplice esempio sarà soltanto uno.

Andiamo subito a configurare il progetto in tal senso prima di mettere mani al codice vero e proprio: aggiungete anche questi due file nella cartella finalize.js e vue.config.js
Aggiungiamo quindi al progetto i seguenti moduli che saranno necessari per la compilazione

	npm install --save webpack-shell-plugin @gfx/zopfli gzip axios

A questo punto se provate ad eseguire il comando (con npm run serve si avvia il webserver temporaneo per il debug)
	
npm run build

sarà creata una cartella dist che contiene tutti i file HTML, Javascript e CSS necessari per il webserver ed il nostro agognato file webpage.h da importare.
Con il file finalize.js proposto, webpage.h verrà creato nella cartella principale, ma potete modificare il percorso come volete.

Ad esempio, io di solito faccio in questo modo
nome_progetto
sorgente_micro
sorgente_gui

usando il percorso relativo nel file finalize.js 	'../sorgente_micro/webpage.h'
il file compilato e aggiornato verrà automaticamente sovrascritto così evito di fare copia e incolla.

Parte 2
E’ giunto il momento di iniziare a mettere mani al sorgente Vue.
Vue, come dicevo è abbastanza semplice da usare e ci sono centinaia di esempi già pronti all’uso (una risorsa eccezionale sul web, non solo per Vue, è https://codesandbox.io/), ma ovviamente se non si conosce per niente un sistema di sviluppo un minimo ci si dovrà documentare.
Io ad esempio ho seguito queste videolezioni che spiegano in modo chiaro come muovere i primi passi, anche se i riferimenti sono un po’ datati e qualcosa potrebbe non tornare con la versione attuale di Vue.

Acquisito un minimo di conoscenze di base, iniziamo con il nostro progetto di prova definendo i requisiti funzionali della nostra webpage. Come MCU useremo il classico ESP8266, perché molto diffuso e pratico con il WiFi integrato, ma ovviamente si può estendere a qualsiasi microcontrollore.

Visualizzeremo la classica pagina che mostra lo stato dei GPIO selezionati nello sketch.
Se il GPIO è configurato come uscita, ci sarà un “led” di stato. e n pulsante per attivare/disattivare l’uscita
Se il GPIO è un ingresso invece ci sarà solo un “led” acceso/spento in funzione dello livello del segnale.
La pagina dovrà essere dinamica, ovvero aggiornarsi automaticamente in modo asincrono e senza refresh “imposti”.
In qualsiasi momento, potrò ridefinire ingressi e uscite nel firmware della MCU e la pagina dovrà adeguarsi in automatico senza necessità di  modificare il codice lato GUI
Dovrà avere un aspetto estetico “gradevole”. Ci sono molti framework di stile CSS disponibili, in questo esempio userò Bulma perché leggero, molto accattivante graficamente e soprattutto modulare.

Voglio infatti che le dimensioni del file webpage.h siano il più contenute possibile e quindi andrò ad utilizzare i singoli moduli CSS importando solo quello che viene realmente usato e non tutto il pacchetto completo.

Creiamo quindi una cartella style all’interno di src e in questa cartella aggiungiamo il file bulma.scss dove andremo a definire quali moduli importare in funzione delle esigenze.

Ovviamente è necessario aggiungere al progetto anche i moduli node necessari nel solito modo (occhio alle versioni di sass-loader e webpack altrimenti non compila)

	npm install --save webpack@4 sass-loader@10 sass bulma 

Come detto la nostra pagina dovrà essere dinamica ovvero aggiornarsi in tempo reale senza l’interazione dell’utente. In questo esempio però ci sono due scenari diversi:
L’utente esegue un’azione sulla pagina e la MCU deve reagire di conseguenza
Lo stato degli ingressi/uscite della MCU variano in funzione del firmware ed è necessario dare feedback alla pagina.
	
Il primo scenario è il più semplice, basterà fare una chiamata al server con gli opportuni parametri il quale reagirà di conseguenza.
Il secondo caso invece non è così banale perché le connessioni browser/server sono tipicamente mono-direzionali: il browser chiede una pagina al server, questo la prepara e la invia, il browser chiude la connessione, fine.

Il metodo che si vede più comunemente in giro è fare l’odioso refresh della pagina; rozzo, antiquato e decisamente non “reactive”.

Una seconda opzione è far eseguire delle chiamate asincrone AJAX al browser in background e aggiornare dinamicamente gli elementi della pagina con qualche riga Javascript. 
Molto molto meglio, ma rimane comunque la necessità di fare il “polling” di continuo al server per richiedere i dati aggiornati a causa del meccanismo browser/server di cui prima.

Noi però vogliamo che il funzionamento sia completamente asincrono e bidirezionale; ecco che ci viene quindi in aiuto WebSocket, largamente supportato dal 99% dei browser moderni (certo se usate ancora Netscape Navigator non funzionerà …).

WebSocket è una tecnologia web che fornisce canali di comunicazione full-duplex attraverso una singola connessione TCP (wikipedia)
Useremo quindi questo canale full-duplex WebSocket per “veicolare” tutte le informazioni necessarie per renderizzare correttamente la pagina in risposta a quello che accade fisicamente lato microcontrollore.
A questo punto, visto che il canale è già aperto, lo useremo anche nel senso contrario ovvero per inoltrare le richiesta dal browser al microcontrollore così da mantenere lo stesso approccio.

WebSocket è nativamente supportato dal Javascript e quindi da Vue. Non ci sarebbe necessità di installare moduli aggiuntivi, noi però andremo comunque ad installare vue-native-websocket che ci semplifica un po’ la gestione del sorgente Vue oltre ad avere delle funzionalità di base già implementate (auto-reconnect, formattazione dei dati etc etc).

Le informazioni scambiate tra microcontrollore e browser saranno formattate secondo lo standard JSON, anch’esso nativamente supportato da Javascript mentre lato microcontrollore vi consiglio di installare l’ottima libreria ArduinoJson
Per quanto riguarda il server WebSocket ho invece usato questa libreria Links2004/arduinoWebSockets


