# sizatek.com · sitio estático

Carpeta `site/` = raíz web (`public_html`) de sizatek.com. Se publica automáticamente en HostPapa
(cPanel Git Version Control + cron cada 5 min con rsync). No se sincronizan: `.well-known`, `cgi-bin`,
`nidix`, `wordpress`, `_wp-anterior`, `geofeed.csv`, `geoFeed.json.txt`, ni `wp-content/uploads/2024|2025`.

Regla editorial: ningún texto nuevo que no exista en el sitio original, flyers o formatos IFT (Profeco).

Regla de caché: el servidor manda `max-age` de **7 días** para CSS y JS. Cada vez que cambies un archivo
de `site/assets/` (`.css` o `.js`), **sube su `?v=N` en todas las páginas que lo cargan**. Si no, quien ya
visitó el sitio sigue viendo la versión vieja una semana (pasó el 4-oct-2026: `site.css` cambió cuatro veces
con `?v=15` y en Safari la portada del Duo salía sin estilos).
