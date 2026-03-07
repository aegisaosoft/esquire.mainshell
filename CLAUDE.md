# esquire.mainshell

## Роль
**Module Federation HOST.** Владеет Keycloak lifecycle. Предоставляет auth всем плагинам.

## Структура файлов
```
esquire.mainshell\
├── packages\
│   └── esq-auth-context\src\
│       ├── types.ts          ← EsqAuthUser, EsqRole, EsqPermission, CMD_* константы
│       ├── EsqAuthContext.ts ← EsqAuthCtx, useEsqAuth()
│       └── index.ts
├── frontend\
│   ├── src\
│   │   ├── index.ts          ← MF async shim (import('./bootstrap'))
│   │   ├── bootstrap.tsx     ← loadRuntimeConfig() → createRoot → <App>
│   │   ├── App.tsx           ← <EsqAuthProvider> + <Shell>
│   │   ├── auth\
│   │   │   ├── EsqAuthProvider.tsx   ← keycloak-js init, token refresh, context
│   │   │   └── fetchAccessProfile.ts ← GET /api/keysmith/v1/access-profile
│   │   ├── shell\
│   │   │   ├── Header.tsx    ← user name, roles, sign out
│   │   │   ├── NavBar.tsx    ← из манифестов, фильтр по ролям
│   │   │   ├── Toolbar.tsx   ← из активного плагина, postMessage
│   │   │   ├── PluginArea.tsx← loadPlugin() + Suspense
│   │   │   └── loadPlugin.ts ← fetchManifests() + dynamic MF loader
│   │   └── types\
│   │       ├── PluginManifest.ts
│   │       └── RuntimeConfig.ts
│   ├── public\assets\
│   │   ├── config.json           ← dev конфиг
│   │   └── config.json.template  ← Docker шаблон
│   ├── webpack.config.js  ← MF HOST, shared: { eager: true }
│   ├── tsconfig.json
│   └── package.json
├── proxy\
│   ├── server.js   ← /assets/config.json, /plugins.config.json, /api proxy
│   └── package.json
├── plugins.config.json  ← volume-mounted, список плагинов
├── Dockerfile
└── compose.yaml
```

## Порты
- `3000` — mainshell (React UI + Node proxy)
- `7070` — Java gateway (через `/api` proxy)
- `8080` — Keycloak (браузер обращается напрямую для OIDC)

## Env vars (Docker)
```
KEYCLOAK_URL=http://esq-keycloak:8080
KEYCLOAK_REALM=esquire
KEYCLOAK_CLIENT_ID=esq-react
API_BASE_PATH=http://esq-gateway:7070
PLUGINS_CONFIG_FILE=/app/plugins.config.json
```

## Команды
```bash
cd frontend && npm install          # установка
cd frontend && npm run build        # webpack production build
cd frontend && npm start            # webpack dev server :3000
cd frontend && npx tsc --noEmit     # typecheck без сборки
cd proxy && npm start               # Node proxy standalone
docker build -t esquire.mainshell . # Docker build
```

## Как добавить плагин (без пересборки mainshell)
1. Добавить строку в `plugins.config.json`
2. Запустить контейнер плагина в той же Docker сети
3. Mainshell подхватит при следующем poll (≤ 30 сек)
