# Datos
- `data/colon_locales.csv`, `data/colon_mesas.csv`: escuelas y mesas del Departamento Colón extraídas del CSV nacional de mesas de la Cámara Electoral (elección anterior a 2023; **reemplazar** con el listado actual).
- Asignación de escuelas a municipios: por rangos de numeración de mesa (heurística). Rangos marcados "a confirmar": 3418–3443 (Ascochinga/La Granja), 3510–3521 (Calera–Caroya), 3565–3584 (Colonia Tirolesa y zona).
- Circuitos electorales: polígonos de `tartagalensis/circuitos_electorales_AR` (2025, Córdoba, depto 003), 23 circuitos de Colón, simplificados y proyectados a SVG; incluidos en `apps/centro/js/data.js`.
- La Calera 2023: Rambaldi 32,60 % (~7.725), Morán 31,09 % (~7.367), F. Rufeil 27,01 % (~6.399); padrón ~37.000; 108 mesas; 12 escuelas.

## Legislativas 2025 (diputados nacionales)
- `data/colon_diputados_2025_depto.csv`: resultados del Departamento Colón y de la provincia de Córdoba, escrutinio provisorio de la Dirección Nacional Electoral, tomados del dataset del repo público `azha2005/257arg` (`mapas/mapa2025/dataset_2025.json`). Porcentajes sobre votos positivos. Colón: 263.465 inscriptos, 174.287 votantes (66,15 %).
- **No incluye** resultados por municipio, escuela ni mesa: ese nivel está en el sitio de resultados del Ministerio del Interior y en datos.gob.ar (no accesibles desde el entorno de trabajo). Para cargarlos: descargar el CSV por mesa y cruzarlo con `data/colon_mesas.csv` (número de mesa) para obtener resultados por escuela y municipio.
