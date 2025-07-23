# VR Video Inventory - A-Frame

O aplicație VR pentru gestionarea și redarea video-urilor folosind A-Frame.

## Funcționalități

- **Player Video VR**: Redare video în spațiul 3D
- **Carousel de Navigare**: Navigare prin video-uri cu focus vizual
- **Sistem de Inventar**: Sloturi pentru salvarea video-urilor favorite
- **Controale Interactive**: Butoane pentru play/pause și toggle vizibilitate
- **Suport Mouse/VR**: Funcționează cu mouse și controlere VR

## Video-uri Incluse

- **Alahuahbar**: Video de test
- **MotoTestRide**: Test cu motocicletă
- **OneHandRidingTransfagarasanTunnel**: Conducere cu o mână
- **QuackedTooHard**: Video amuzant

## Cum să Rulezi

1. **Pornește serverul local**:
   ```bash
   cd vr-video-aframe
   python3 -m http.server 8000
   ```

2. **Deschide browserul**:
   ```
   http://localhost:8000
   ```

3. **Folosește mouse-ul** pentru a naviga și interacționa

## Instrucțiuni de Utilizare

### Navigare
- **Click pe thumbnail** în carousel pentru a selecta video-ul
- **Click pe săgețile roșii** pentru a naviga prin carousel
- **Butonul turcoaz (C)** - toggle vizibilitate carousel
- **Butonul albastru (I)** - toggle vizibilitate inventar

### Player Video
- **Butonul verde (▶)** - play/pause video
- **Video-ul se pornește** automat când selectezi unul nou

### Inventar
- **Click pe slot cu video** pentru a selecta și reda video-ul în player
- **Alt + Click și trage** din carousel în slot de inventar pentru a adăuga video-uri
- **Alt + Click și trage** între sloturi pentru a le reordona
- **Alt + Click și trage** din inventar în afară pentru a șterge video-ul

### Controale VR
- **Look controls** - rotește camera cu mouse-ul
- **Cursor** - pentru interacțiuni cu obiectele 3D

### Metode Alternative pentru Drag & Drop

Pentru a evita conflictele cu navigarea prin interfață, am implementat următoarele metode:

#### Metoda 1: Alt + Click (Implementată)
- **Alt + Click și trage** pentru drag & drop
- **Click normal** pentru navigare și selectare
- **Avantaje**: Simplu, intuitiv, nu interferează cu navigarea sau meniul contextual
- **Dezavantaje**: Necesită tasta Alt

#### Metode Alternative (Pentru Implementare Viitoare)

**Metoda 2: Toggle Mode**
- Buton pentru a comuta între "navigare" și "drag" mode
- **Avantaje**: Separare clară a funcționalităților
- **Dezavantaje**: Necesită buton suplimentar

**Metoda 3: Zona de Drag**
- Zonă specifică pentru drag & drop (ex: marginea ecranului)
- **Avantaje**: Separare fizică a funcționalităților
- **Dezavantaje**: Limitează spațiul de lucru

**Metoda 4: Double Click**
- Double click pentru a activa drag mode
- **Avantaje**: Nu necesită taste suplimentare
- **Dezavantaje**: Poate fi confuz cu selectarea

**Metoda 5: Right Click**
- Right click pentru drag & drop
- **Avantaje**: Separare clară de click-ul normal
- **Dezavantaje**: Poate fi blocat de browser

## Tehnologii

- **A-Frame 1.5.0** - Framework VR pentru web
- **HTML5 Video** - Redare video
- **Vanilla JavaScript** - Logica aplicației
- **CSS3** - Stilizare

## Structura Proiectului

```
vr-video-aframe/
├── index.html          # Pagina principală cu A-Frame
├── script.js           # Logica aplicației
├── style.css           # Stiluri CSS
├── README.md           # Documentația
└── public/             # Media assets
    ├── videos/         # Fișiere video
    ├── thumbs/         # Thumbnail-uri
    └── videos.json     # Metadata video-uri
```

## Extensibilitate

- **Adaugă video-uri**: Pune fișierele în `public/videos/` și thumbnail-urile în `public/thumbs/`
- **Modifică metadata**: Editează `public/videos.json`
- **Personalizează UI**: Modifică pozițiile și culorile în `index.html`
- **Adaugă funcționalități**: Extinde logica în `script.js`

## Compatibilitate

- **Browser-uri**: Chrome, Firefox, Safari, Edge
- **VR Headsets**: Oculus Quest, HTC Vive, etc.
- **Dispozitive**: Desktop, mobile, VR 