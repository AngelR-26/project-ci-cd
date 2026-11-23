# PDF Tool — Proyecto CI/CD

Repositorio de automatización para [PDF Tool](https://github.com/AngelR-26/pdf-tool).

## Arquitectura
- Código fuente: `AngelR-26/pdf-tool`, rama `master`.
- CI/CD: GitHub Actions (`.github/workflows/pipeline.yml`).
- Entorno reproducible: Docker.
- Despliegue: Vercel CLI.
- Secretos: GitHub Actions Secrets y Environment `production`.

El código de la aplicación no se duplica. El pipeline lo descarga en `app/` antes de instalar dependencias, ejecutar verificaciones y construir la imagen Docker.

## Requisitos
Git, Node.js 22, pnpm 12.3.4 y Docker.

## Ejecución local (CMD de Windows)
```cmd
git clone -b devops/ci-cd https://github.com/AngelR-26/project-ci-cd.git
cd project-ci-cd
git clone --depth 1 --branch master https://github.com/AngelR-26/pdf-tool.git app
corepack enable
corepack prepare pnpm@12.3.4 --activate
cd app
pnpm install --frozen-lockfile
pnpm lint
pnpm build
cd ..
node scripts/prepare-release.mjs
node scripts/test-release.mjs
```

## Configuración de Vercel
Crea/importa el proyecto de PDF Tool en Vercel. En GitHub, abre **Settings → Secrets and variables → Actions** y agrega:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Crea también el Environment `production` en **Settings → Environments**. Se recomienda requerir aprobación para producción si el plan lo permite.

El workflow despliega al hacer push a `devops/ci-cd`, solo después de superar las verificaciones. También admite ejecución manual desde Actions.

## Alcance de las verificaciones
La aplicación declara `lint` y `build`, pero no declara framework ni script de pruebas automatizadas. El pipeline ejecuta ESLint, build de producción y prueba de humo HTTP del contenedor. Esta última confirma arranque y respuesta HTTP; no sustituye pruebas unitarias ni end-to-end.
