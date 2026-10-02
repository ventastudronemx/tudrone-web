# tudrone.mx — landing "Una pasada"

Landing page (sitio estático, sin build) para la venta de drones agrícolas
**DJI AGRAS** (T25P / T70P / T100). Apertura con scroll continuo (scrollytelling)
y luego secciones de información + captación de leads.

## Estructura

```
index.html              Página completa
assets/
  css/styles.css         Estilos (paleta verde campo, tipografía Open Sans)
  js/reel.js             Motor del scroll de la apertura + formulario
  img/                   Logos + renders de producto (agras-*.png)
  video/                 Video de la apertura (pasada-*.mp4 + póster)
_headers                 Cabeceras de caché para Cloudflare Pages
```

> Todo el material crudo (videos .mov/.mp4, renders, capturas, fotos) vive en la
> raíz del proyecto y está **ignorado por git** (`.gitignore`). Solo `/assets/`
> se versiona.

Sin dependencias, sin `npm`, sin paso de compilación.

## Ver en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx serve .
# o
python -m http.server 8080
```

Abrir `http://localhost:8080`.

## Deploy en Cloudflare Pages

1. Sube esta carpeta a un repositorio de GitHub.
2. En Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
3. Configuración de build:
   - **Framework preset:** None
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
4. Deploy. Cada push a la rama principal publica automáticamente.
5. En **Custom domains** agrega `tudrone.mx` y `www.tudrone.mx`.

## Video de la apertura

**Ya montado.** Origen: `raw-video/45-original.mov`, segundos 4–8 (dron sobre
naranjos) + 9–11 (dron asperjando sobre campo). Salidas en `assets/video/`:

| archivo | uso | detalle |
|---|---|---|
| `pasada-desktop.mp4` | escritorio | 1198×592, 30 fps, all-intra (`-g 1`) para scrub instantáneo |
| `pasada-mobile.mp4`  | ≤820 px | 854×422 |
| `pasada-poster.jpg`  | primer frame | se ve antes de hacer scroll |

Comando usado (recortar + concatenar + all-intra):

```bash
ffmpeg -i "raw-video/45-original.mov" -filter_complex \
 "[0:v]trim=4:8,setpts=PTS-STARTPTS[a];[0:v]trim=9:11,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]" \
 -map "[v]" -r 30 -c:v libx264 -preset slow -crf 20 -g 1 -pix_fmt yuv420p -movflags +faststart \
 assets/video/pasada-desktop.mp4
```

El scroll controla `video.currentTime` proporcional al progreso (0–1). Para
cambiar el clip: reemplaza los MP4 y el póster; si dura distinto no hay que
tocar código. Para volver al placeholder de canvas: `data-has-video="false"`
en `#reel` (en `index.html`).

Los `.mov` originales están en la raíz y en `raw-video/` — **ignorados por git**
(`.gitignore`), no se suben al repo.

## Datos reales ya cargados

- **Precios** (de `precios.jpg`): T25P $167k / kit $283k · T70P $192k / kit $438k · T100 $310k / kit $556k. Kit = dron + 3 baterías + generador DJI.
- **Toma a cuenta**: AGRAS T40/T50 y vehículos 2018–2025.
- **Renders de producto**: `assets/img/agras-t25p|t70p|t100|t30.png`.
- **Video de la apertura**: clip real (ver arriba).

## Pendientes antes de publicar

- [ ] Confirmar el ancho de aspersión real por modelo (hoy "hasta X m" aproximado)
- [ ] Números reales del bloque de stats (14.2 ha / 1,240 L / 22 min) y de los contadores del hero
- [ ] Destino real del formulario (correo, Formspree o CRM) — hoy solo muestra confirmación en el navegador
- [ ] WhatsApp / teléfono reales + estados con cobertura reales
- [ ] Favicon propio, imagen Open Graph, aviso de privacidad, nombre fiscal
- [ ] Elegir fotos de campo para secciones (hay muchas en la raíz: Mazatlán, Nayarit, Venustiano…)
- [ ] ¿Sumar T30/T40 o línea de mapeo (Mavic 3M, Matrice)? Hay material.
- [ ] Logo en SVG (hoy es JPG/PNG raster)

## Créditos de estilo

- Tipografía **Open Sans** — misma familia que ag.dji.com.
- Botones tipo píldora con degradado y glow — inspirados en hyper3d.ai, adaptados al verde de marca.
