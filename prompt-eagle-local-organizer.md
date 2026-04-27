# Introduzione

Io utilizzo eagle.cool per catalogare le foto. Voglio creare un plugin che mi esporta sul mio pc le foto/video seguendo la struttura gerarchica di anno/mese (o altre strutture personalizzate). Non deve funzionare solo per foto/video ma per qualsiasi tipologia di file. 

---

# Obiettivo (Riassunto breve)
Devo Scrivere un plugin javacript per eagle.cool (di tipo finestra) che mi permetta di esportare i contenuti eagle.cool sul mio pc con un certa struttura di cartelle.

Inoltre è prevista l'aggiunta di funzionalità avanzate come la generazione dei file sidecar.

Questo sarà un plugin utilizzato da centinaia di utenti. Deve essere qualcosa di professionale, sicuro, stabile e funzionante al 100%.

Il nome del plugin è "Local Organizer".
La lingua del plugin è l'inglese.
Il logo lo trovi nella cartella resources/logo.png.

---

# Tecnologie
Il plugin deve essere sviluppato utilizzando le tecnologie più moderne e adatte per lo sviluppo di plugin per eagle.cool, ovvero Javascript con React per il frontend. Utilizza typescript e tutte le tecnologie che ritieni più adatte per lo sviluppo di un plugin professionale, stabile e sicuro. Prendi come base il template del plugin di tipo finestra di eagle.cool. Ci saranno fare dei test automatici, quindi prevedi l'utilizzo di tecnologie adatte per lo sviluppo di test automatici (es. Jest, Testing Library, ecc...).

---

# Contenuto del plugin (Frontend)

## Introduzione
Il plugin deve essere creato con REACT utilizzando tecnologie moderne. Deve essere responsive. La ui deve essere moderna e adatta per un plugin eagle.cool (se riesci a prendere spunto da altri plugin di tipo finestra sarebbe perfetto, magari da quelle ufficiali eagle?).

Inizio ora a elencare i vari elementi che devono essere presenti nella ui del plugin, partendo dalla barra del titolo, passando per l'area principale del plugin, fino ad arrivare alla status bar in fondo al plugin.

## Barra del titolo
La barra del titolo deve contenere:
- a sx -> Il nome del plugin
- a dx -> una serie di pulsanti (icona + testo o solo icona) per accedere alle varie funzionalità del plugin. I pulsanti devono essere disposti in orizzontale e devono essere facilmente accessibili. i pulsanti (da sx a dx) sono:
  - "Add" -> (icona + testo) apre il dialog "AddElements"
  - "Export" -> (icona + testo)
  - "Update" -> (solo icona)
  - History (solo icona) apre un dropdown menu con la lista di tutte le esportazioni fatte in passato con il plugin, con la possibilità di cliccare su ogni esportazione per vedere i dettagli dell'esportazione (es. data e ora dell'esportazione, numero di media esportati, cartella di destinazione, struttura di cartelle, ecc...). Deve aprire il "Dialog history"
  - "Clear" -> (solo icona)
  - "Sidecar" -> (solo icona ) apre un dropdown menu con le seguenti opzioni:
    - "Link eagle sidecars" -> (icona + testo)
    - "Generate sidecars" -> (icona + testo)
    - "Remove sidecars" -> (icona + testo)
  - "Settings" -> (solo icona)
  - "Other options" -> (solo icona) apre un dropdown menu con le seguenti opzioni:
    - "Clear cache" -> (icona + testo)
    - "Reset plugin" -> (icona + testo)
    - "Info" -> (icona + testo) 

infine vi deve essere Il pulsante per chiudere il plugin deve essere composto da un'icona (es. X). Quando premuto deve chiudere il plugin.


## Dialog "AddElements"
Il dialog "AddElements" deve essere un dialog modale che permette all'utente di aggiungere media dentro il plugin. Il dialog deve contenere i seguenti elementi:
1. Un testo descrittivo (es. "Select the mode to add media")
2. Una combobox con i 3 modi per aggiungere media dentro il plugin (es. "Selected items", "Folder", "Tag")
3. Un pulsante di conferma (es. "Add")
4. un pulsante di chiusura del dialog ( la "x" in alto a dx del dialog)

In base alla selezione fatta nella combobox, sotto la combobox devono apparire dei campi di input specifici per ogni modalità di inserimento media.

1. Se viene selezionata la modalità "Selected items", non devono apparire campi di input aggiuntivi. Se non sono selezionati elementi, il pulsante "Add" deve essere disabilitato. Se invece sono selezionati elementi, il pulsante "Add" deve essere abilitato e quando premuto deve inserire dentro il plugin tutti gli elementi attualmente selezionati in eagle.cool.
2. Se viene selezionata la modalità "Folder", deve apparire una combobox con la lista di tutte le cartelle presenti in eagle.cool. L'utente deve poter selezionare una cartella dalla lista.
3. Se viene selezionata la modalità "Tag", deve apparire una combobox con la lista di tutti i tag presenti in eagle.cool. L'utente deve poter selezionare un tag dalla lista. Dato che ci possono essere migliaia di tag, la combobox deve essere dotata di una funzionalità di ricerca per permettere all'utente di trovare facilmente il tag desiderato.


## Dialog "Settings"
Il dialog "Settings" deve essere un dialog modale che permette all'utente di configurare le impostazioni del plugin. Il dialog deve contenere i seguenti elementi:

- Sezione "Export settings" con dentro:
1. Label con scritto "Export destination folder".
2. Un campo di input per inserire la cartella di destinazione dove esportare i media + un puslante per scegliere la cartella tramite un file picker
3. Label con scritto "Export folder structure"
4. Una combobox con dentro le seguenti opzioni per scegliere la struttura di cartelle per l'esportazione dei media:
- "Year/Month" (es. "2024/06")
- "Year/Month/Day" (es. "2024/06/15")
- "Tag" (es. "vacation, family, ecc...")
- "No structure" (es. tutti i media vengono esportati nella stessa cartella di destinazione, senza sottocartelle)

- Execution settings con dentro:
1. Un toggle per abilitare/disabilitare la DRY-run

- Sezione "Sidecar settings" con dentro:
1. Un toggle per abilitare/disabilitare l'importazione dentro eagle.cool dei file sidecar generati dentro il plugin


Infine un pulsante "applica" che salva le impostazioni inserite e chiude il dialog.

## Dialog "Info"
Il dialog "Info" deve essere un dialog modale che mostra le informazioni sul plugin, come ad esempio la versione del plugin, il nome dell'autore, un link alla documentazione del plugin, un link alla pagina github del plugin, ecc... Deve essere un dialog semplice e informativo, con un design pulito e professionale. Deve contenere un pulsante per chiudere il dialog (la "x" in alto a dx del dialog) e un pulsante "Close" in basso a dx del dialog.

## Dialog "History"
Il dialog "History" deve essere un dialog modale che mostra tutti i dettagli possibili e immaginabili di una singolo esportazione effettuata dal plugin. Deve essere un dialog semplice e informativo, con un design pulito e professionale. Deve contenere un pulsante per chiudere il dialog (la "x" in alto a dx del dialog) e un pulsante "Close" in basso a dx del dialog.

Dentro il dialog ci deve essere una tabella con tutti i file esportati in quella sessione di esportazione. Per ogni file esportato devono essere mostrati i seguenti dettagli:
- Icona che rappresenta lo stato dell'esportazione di quel file (es. se il file è stato esportato correttamente, se c'è stato un errore durante l'esportazione di quel file, ecc...) o se è un file duplicato (es. se il file è già presente nella cartella di destinazione, ecc...)
- Il nome del file
- Il percorso di esportazione del file (es. "C:/foto/2024/06/foto.jpg")
- La data e ora di esportazione del file
- Eventuali errori riscontrati durante l'esportazione di quel file (es. "Export failed: insufficient disk space", "Export failed: file in use", ecc...)


## Area principale del plugin
L'area principale del plugin deve contenere una tabella con dentro la lista di tutti i media inseriti dentro il plugin. La tabella deve contenere le seguenti colonne:

- Thumbnail del media. Dato che ci possono essere solo foto e video, per le foto deve essere mostrata la thumbnail della foto, mentre per i video deve essere mostrata un'icona che rappresenta un video. Se clicco sulla thumbnail del media, deve aprirsi un dialog con dentro la preview del media (foto o video). Potrebbe esserci anche file sidecar. in questo caso per i file sidecar deve essere mostrata un'icona che rappresenta un file.
- Il nome del media
- Type del media (es. foto, video, file sidecar, ecc...)
- La data di creazione del media. (prendila dai metadati exif del media, se presenti. Se non sono presenti, prendi la data di creazione del file)
- Cartella di destinazione dove verrà esportato il media (es. "C:/foto/2024/06")
- Exif (se ha metadati exif). In questa colonna deve esserci una icona che rappresenta i metadati exif.



In ogni colonna della tabella deve essere possibile ordinare i media in base al valore della colonna (es. ordinare i media in base alla data di creazione, in ordine crescente o decrescente).


Se faccio tasto destro su una riga della tabella, deve apparire un menu contestuale con dentro le seguenti opzioni:
- Rimuovi media: rimuove il media dalla lista del plugin, ma non elimina il media da eagle.cool (deve solo rimuovere il media dalla lista del plugin, ma i media devono rimanere dentro eagle.cool)
- Apri media in eagle.cool: apre il media direttamente dentro eagle.cool
- Vedi metadati: apre un dialog con dentro tutti i metadati del media (es. metadati exif, metadati xmp, ecc...). Se il media non ha metadati, nel dialog deve essere mostrato un messaggio che dice "No metadata available for this media". in questa schermata voglio anche le seguenti informazioni:
  - Data di creazione del media
  - data di modifica del media
  - Data di aggiunta del media dentro eagle.cool
  - Data di creazione presa dai metadati exif del media (se presenti)
  - Data di modifica presa dai metadati exif del media (se presenti)


## Status bar
Ci deve essere una status bar in fondo al plugin che mostra il numero di media inseriti dentro il plugin (es. "10 media inserted") e il numero di media selezionati (es. "3 media selected"). La status bar deve essere aggiornata in tempo reale quando vengono aggiunti o rimossi item dentro il plugin, o quando vengono selezionati o deselezionati i media dentro la tabella.

La status bar deve essere visibile solo se ci sono media inseriti dentro il plugin. Dentro la status bar, quando l'esportazione è in corso, deve essere mostrato un indicatore di progresso (es. una barra di progresso o un indicatore circolare) che mostra l'avanzamento dell'esportazione (es. "Exporting... 50%"). Quando l'esportazione è completata, deve essere mostrato un messaggio di conferma (es. "Export completed"). oltre alla barra di progresso, di fianco ci deve andare un testo che mostra l'operazione attualmente in corso (es. "Exporting media...").

NOTA: La progress e il testo di progress devono essere visibili solo durante l'esportazione. Quando non è in corso nessuna esportazione, deve essere mostrato solo il numero di media inseriti e selezionati.

NOTA: in generale, qualsiasi operazione "pesante" che richiede computazione deve essere visibile in questa status bar, con un indicatore di progresso e un testo che spiega l'operazione in corso. Ad esempio, anche la generazione dei file sidecar potrebbe essere un'operazione "pesante" che richiede computazione, quindi durante la generazione dei file sidecar deve essere mostrato un indicatore di progresso e un testo che spiega che i file sidecar stanno venendo generati (es. "Generating sidecars... 50%"). Quando la generazione dei file sidecar è completata, deve essere mostrato un messaggio di conferma (es. "Sidecars generated"). 

NOTA: durante una qualsiasi operazione, i pulsanti principali del plugin (es. "Add", "Export", "Clear", "Settings", ecc...) devono essere disabilitati, in modo da evitare che l'utente possa avviare più operazioni contemporaneamente o avviare un'operazione mentre un'altra è ancora in corso. Quando l'operazione è completata, i pulsanti devono essere riabilitati.

---

# Funzionalità del plugin (Backend)

## Introduzione
Nelle seguenti sezioni elenco le funzionalità che il plugin deve avere. Per ogni funzionalità, se necessario, fornisco ulteriori dettagli su come deve funzionare la funzionalità stessa. In particolare ti dirò cosa deve fare ogni singolo pulsante.

## Pulsante di Aggiunta elementi
Il pulsante "Add" deve permettere all'utente di aggiungere media dentro il plugin. Quando viene premuto, deve aprire il dialog "AddElements".
Il dialog "AddElements" deve permettere all'utente di aggiungere media dentro il plugin. in base alla modalità di inserimento media selezionata, il plugin deve recuperare gli elementi da eagle.cool e inserirli dentro il plugin. Gli elementi inseriti dentro il plugin devono essere visibili nell'area principale del plugin (tabella). Gli elementi inseriti dentro il plugin devono essere memorizzati in una struttura dati che rappresenta lo stato del plugin (es. un array di oggetti, ecc...).

Una volta premuto il pulsante add, il dialog si chiude e piano piano la tabella nella parte principale del plugin si popola con gli elementi appena aggiunti. Se la modalità di inserimento media è "Selected items", il plugin deve recuperare tutti gli elementi attualmente selezionati in eagle.cool e inserirli dentro il plugin. Se la modalità di inserimento media è "Folder", il plugin deve recuperare tutti gli elementi presenti nella cartella selezionata e inserirli dentro il plugin. Se la modalità di inserimento media è "Tag", il plugin deve recuperare tutti gli elementi associati al tag selezionato e inserirli dentro il plugin.

## Pulsante Aggiorna
Un pulsante (solo icona) per aggiornare la lista dei media inseriti dentro il plugin (es. se ho aggiunto nuovi media dentro eagle.cool, quando premo questo pulsante devono essere aggiunti anche dentro il plugin).

Nel caso in cui la modalità di inserimento media utilizzata è "Tag", quando premo questo pulsante devono essere aggiunti dentro il plugin anche i nuovi media che hanno quel tag e che sono stati aggiunti dentro eagle.cool dopo l'inserimento iniziale dei media dentro il plugin.

Nel caso in cui la modalità di inserimento media utilizzata è "Cartella", quando premo questo pulsante devono essere aggiunti dentro il plugin anche i nuovi media che sono stati aggiunti dentro quella cartella di eagle.cool dopo l'inserimento iniziale dei media dentro il plugin.

Nel caso in cui la modalità di inserimento media utilizzata è "Selected items", quando premo questo pulsante non devono essere aggiunti dentro il plugin i nuovi media selezionati dentro eagle.cool dopo l'inserimento iniziale dei media dentro il plugin

Questo pulsante deve essere visibili solo se ci sono media inseriti dentro il plugin.

## Pulsante Esporta
Un pulsante (icona + testo) per esportare gli elementi inseriti dentro il plugin. Quando premuto deve iniziare il processo di esportazione dei media inseriti dentro il plugin, seguendo le impostazioni di esportazione definite dall'utente (es. cartella di destinazione, struttura di cartelle, ecc...). Questo pulsante deve essere visibili solo se ci sono media inseriti dentro il plugin.

Il processo di esportazione funziona nel seguente modo:
1. Quando viene premuto il pulsante "Export", deve essere mostrato un messaggio di conferma (es. "Are you sure you want to export the media?") con i pulsanti "Yes" e "No". Se l'utente preme "Yes", deve iniziare il processo di esportazione. Se l'utente preme "No", il processo di esportazione non deve iniziare e il messaggio di conferma deve essere chiuso.
2. Durante il processo di esportazione, nella status bar deve essere mostrato un indicatore di progresso che mostra l'avanzamento dell'esportazione (es. "Exporting... 50%"). Quando l'esportazione è completata, deve essere mostrato un messaggio di conferma (es. "Export completed"). Durante il processo di esportazione, tutti i pulsanti che "eseguono operazioni" dentro il plugin (es. esportazione, aggiornamento, aggiunta di media, ecc...) devono essere disabilitati, in modo da evitare che l'utente esegua altre operazioni mentre è in corso l'esportazione.
3. Il processo di esportazione deve esportare i media seguendo le impostazioni di esportazione definite dall'utente (es. cartella di destinazione, struttura di cartelle, ecc...). Ad esempio, se l'utente ha scelto la struttura di cartelle "Year/Month", i media devono essere esportati seguendo la struttura di cartelle "Year/Month" (es. "2024/06"). Se l'utente ha scelto la struttura di cartelle "Tag", i media devono essere esportati seguendo la struttura di cartelle basata sui tag associati ai media (es. se un media ha i tag "vacation" e "family", deve essere esportato nella cartella "vacation/family"). Se l'utente ha scelto la struttura di cartelle "No structure", tutti i media devono essere esportati nella stessa cartella di destinazione, senza sottocartelle.

NOTA: il processo di esportazione deve essere eseguito in modo sicuro, senza causare problemi al funzionamento del plugin o del computer dell'utente. Ad esempio, se durante il processo di esportazione si verifica un errore (es. spazio insufficiente sul disco, file in uso, ecc...), deve essere mostrato un messaggio di errore che spiega il problema e il processo di esportazione deve essere interrotto in modo sicuro, senza causare problemi al funzionamento del plugin o del computer dell'utente.

NOTA: durante il processo di esportazione, i media devono essere esportati uno alla volta, in modo da poter mostrare l'avanzamento dell'esportazione in tempo reale nella status bar. Ad esempio, se ci sono 10 media da esportare, quando viene esportato il primo media deve essere mostrato "Exporting %nome file%... 10%", quando viene esportato il secondo media deve essere mostrato "Exporting %nome file%... 20%", e così via fino al completamento dell'esportazione.

NOTA: il processo di esportazione deve essere solido e stabile, in modo da poter gestire anche grandi quantità di media senza causare problemi al funzionamento del plugin o del computer dell'utente. Ad esempio, se ci sono 10000000 media da esportare, il processo di esportazione deve essere in grado di gestire questa quantità di media senza causare problemi al funzionamento del plugin o del computer dell'utente.

NOTA: quando l'esportazione finisce, la sessione di esportazione appena completata deve essere salvata nella cronologia delle esportazioni, in modo che l'utente possa accedere ai dettagli dell'esportazione tramite il dialog "History". la cronologia delle esportazioni deve essere salvata in modo persistente, in modo che quando l'utente chiude e riapre il plugin la cronologia delle esportazioni rimane salvata.

## Pulsante pulisci
Un pulsante (solo icona) per rimuovere tutti gli elementi inseriti dentro il plugin (es. un pulsante "clear" che svuota la lista dei media inseriti dentro il plugin). Quando premuto deve svuotare la lista dei media inseriti dentro il plugin, ma non deve eliminare i media da eagle.cool (deve solo rimuovere i media dalla lista del plugin, ma i media devono rimanere dentro eagle.cool). Questo pulsante deve essere visibili solo se ci sono media inseriti dentro il plugin.

## Pulsante Impostazioni
Deve essere presente un pulsante (solo icona) per accedere alle impostazioni del plugin. Quando premuto deve aprire il dialog "Settings" che permette all'utente di configurare le impostazioni del plugin (es. cartella di destinazione per l'esportazione, abilitazione/disabilitazione della dry-run, ecc...).

NOTA: la directory di esportazione di default deve essere la cartella "Documenti" del pc dell'utente. L'utente deve poter modificare questa cartella di destinazione inserendo un percorso manualmente o scegliendo la cartella tramite un file picker.

NOTA: quando l'utente preme applica le impostazioni devono essere salvate in modo persistente, in modo che quando l'utente chiude e riapre il plugin le impostazioni rimangono salvate.

## Pulsante History
Deve essere presente un pulsante (solo icona) per accedere alla cronologia delle esportazioni effettuate con il plugin. Quando premuto deve apparire un dropdown con la lista di tutte le esportazioni fatte in passato con il plugin, con la possibilità di cliccare su ogni esportazione per vedere i dettagli dell'esportazione (es. data e ora dell'esportazione, numero di media esportati, cartella di destinazione, struttura di cartelle, ecc...). Quando clicco su una voce della lista, deve aprirsi il dialog "History" con dentro tutti i dettagli dell'esportazione selezionata.

## Pulsante "Altre opzioni"
Cliccando sul pulsante "Other options" deve aprirsi un dropdown con dentro le seguenti opzioni:
- Un'opzione "Clear cache" che permette di cancellare la cache del plugin (es. se il plugin utilizza una cache per memorizzare alcune cose temporaneamente, questa opzione permette di cancellare la cache del plugin). La cache del plugin deve essere cancellata in modo sicuro, senza causare problemi al funzionamento del plugin. Quando viene premuta questa opzione, deve essere mostrato un messaggio di conferma (es. "Are you sure you want to clear the cache? This action cannot be undone.") con i pulsanti "Yes" e "No". Se l'utente preme "Yes", la cache del plugin deve essere cancellata e deve essere mostrato un messaggio di conferma (es. "Cache cleared successfully"). Se l'utente preme "No", la cache del plugin non deve essere cancellata e il dropdown deve essere chiuso.
- Un'opzione "Reset plugin" che permette di resettare il plugin, ovvero di cancellare tutti i dati inseriti dentro il plugin e di riportare il plugin allo stato iniziale (es. come se fosse stato appena installato). Quando viene premuta questa opzione, deve essere mostrato un messaggio di conferma (es. "Are you sure you want to reset the plugin? This action cannot be undone.") con i pulsanti "Yes" e "No". Se l'utente preme "Yes", il plugin deve essere resettato e deve essere mostrato un messaggio di conferma (es. "Plugin reset successfully"). Se l'utente preme "No", il plugin non deve essere resettato e il dropdown deve essere chiuso.



---

# Testing
Tutte le funzionalità del plugin devono essere testate tramite test automatici. I test devono coprire tutte le funzionalità del plugin. Dato che non puoi interagire direttamente con il plugin, fai in modo che i test coprano il 100% delle funzionalità integrate nel plugin. Dato che per simulare i comportamenti ti servono foto/video/file di prova, ogni volta che viene lanciato un test, questo deve creare in modo dinamico dei file di prova (es. foto, video, file) da utilizzare per i test, e una volta che il test è completato questi file di prova devono essere eliminati in modo sicuro. I test devono essere eseguiti in modo isolato, in modo che l'esecuzione di un test non influenzi l'esecuzione di altri test. Ad esempio, se un test modifica lo stato del plugin (es. aggiunge media dentro il plugin, modifica le impostazioni del plugin, ecc...), alla fine del test lo stato del plugin deve essere riportato allo stato iniziale, in modo che il test successivo possa essere eseguito su uno stato pulito del plugin. I test devono essere eseguiti in modo affidabile, in modo che se un test fallisce, questo fallimento sia dovuto a un problema reale nel plugin e non a un problema nei test stessi (es. test che falliscono in modo casuale, ecc...). I test devono essere eseguiti in modo efficiente, in modo da poter essere eseguiti rapidamente durante lo sviluppo del plugin. Ad esempio, se ci sono 100 test, l'esecuzione di tutti i test deve richiedere un tempo ragionevole (es. meno di 5 minuti). I test devono essere ben documentati, con commenti chiari e concisi che spiegano il funzionamento di ogni test e cosa viene testato. I test devono essere organizzati in modo chiaro e modulare, con una struttura di cartelle che separa chiaramente i diversi tipi di test (es. test unitari, test di integrazione, test end-to-end, ecc...).

I file di test (foto/vide) di esempio scaricali da siti conosciuti. 

---

# Architettura del codice
Il codice del plugin deve essere organizzato in modo chiaro e modulare. Utilizza una struttura di cartelle che separa chiaramente le diverse parti del codice (es. componenti, servizi, utils, ecc...). Utilizza le best practices per la scrittura del codice in Javascript e React, come ad esempio l'utilizzo di hooks, componenti funzionali, ecc... Utilizza TypeScript per garantire la tipizzazione statica del codice e migliorare la qualità del codice. Assicurati che il codice sia ben documentato, con commenti chiari e concisi che spiegano il funzionamento delle diverse parti del codice. Utilizza un sistema di linting per garantire la qualità del codice e prevenire errori comuni. Assicurati che il codice sia facilmente estendibile e manutenibile, in modo da poter aggiungere nuove funzionalità in futuro senza dover riscrivere il codice esistente. Usa i pricipi SOLID per garantire che il codice sia ben strutturato e facile da mantenere.


# Documentazione
- [La pagina ufficiale di sviluppo plugin di eagle.cool](https://developer.eagle.cool/plugin-api)
- [La pagina ufficiale di sviluppo plugin di eagle.cool (Plugin di tipo finestre)](https://developer.eagle.cool/plugin-api/get-started/plugin-types/window)
- [Pagina ufficiale del template eagle.cool su Github (plugin di tipo finestre)](https://github.com/eagle-app/eagle-plugin-examples/tree/main/Window)
- [Pagina ufficiale del template eagle.cool su Github](https://github.com/eagle-app/eagle-plugin-examples)

## Regole per gli agenti di sviluppo AI
- Ogni volta che scrivi del codice, assicurati di scrivere anche i test automatici per quel codice ( o aggiornare quelli esistenti), in modo da garantire che il codice sia testato e funzionante al 100%.
- Ogni volta che ti chiedo di aggiungere funzionalità, scrivi in questo documento nella relativa sezione quello che ti ho chiesto. Questo file deve essere sempre aggiornato con tutte le funzionalità che ti chiedo di aggiungere, in modo da avere un documento completo e aggiornato con tutte le funzionalità del plugin.