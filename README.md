# Мини-трекер заявок

## Project Overview

Мини-трекер заявок — fullstack-приложение для создания и отслеживания заявок (в коде они называются `Ticket`).

Возможности:

- просматривать список заявок и фильтровать его по статусу;
- создавать заявку с названием и необязательным описанием;
- открывать подробности заявки по её ID;
- менять статус заявки;
- сохранять данные на backend в JSON-файле.

## Tech Stack

### Frontend

- **React 19** — интерфейс из переиспользуемых компонентов и страниц.
- **TypeScript** — типизация приложения и shared-модели.
- **Vite** — dev-сервер, proxy к API и production-сборка.
- **Zustand** — общее состояние списка, текущей заявки, фильтра, загрузки и ошибки; небольшой store без отдельного boilerplate.
- **React Router** — клиентские маршруты `/requests`, `/requests/new` и `/requests/:id` без полной перезагрузки страницы.

### Backend

- **Node.js** — среда выполнения сервера.
- **Express 5** — HTTP-маршруты и JSON middleware для REST API.
- **TypeScript** — типизация backend-кода.
- **tsx** — запуск TypeScript-сервера в режимах разработки и старта без отдельного этапа компиляции.
- **Node.js `fs/promises`** — чтение и запись JSON-хранилища; отдельная библиотека для этого не нужна.

Общие типы и допустимые статусы определены в `shared/ticket.ts` и используются frontend и backend.

## Project Structure

```text
.
├── client/
│   ├── src/
│   │   ├── api/tickets.ts             # HTTP API layer
│   │   ├── components/                # общий layout и отображение статуса
│   │   ├── pages/                     # список, создание и подробности заявки
│   │   ├── stores/ticketStore.ts       # Zustand store и actions
│   │   ├── App.tsx                     # React Router routes
│   │   └── main.tsx                    # точка входа React
│   ├── index.html
│   ├── vite.config.ts                  # alias @shared и /api proxy
│   ├── package.json
│   └── package-lock.json
├── server/
│   ├── data/tickets.json               # постоянное хранилище заявок
│   ├── src/
│   │   ├── repositories/ticketRepository.ts # операции с JSON-файлом
│   │   ├── routes/ticketRoutes.ts      # REST API и входная валидация
│   │   └── index.ts                    # настройка и запуск Express
│   ├── package.json
│   └── package-lock.json
├── shared/
│   └── ticket.ts                       # Ticket, inputs и статусы
├── .github/
│   └── copilot-instructions.md         # инструкции для Copilot Agent
└── package.json                        # корневые scripts
```

Frontend, backend и общие типы разделены по каталогам. UI-компоненты не обращаются к файлам сервера и не выполняют HTTP-запросы напрямую.

## Installation and Running

Требуется установленный Node.js и npm. Зависимости устанавливаются отдельно в каждом workspace:

```sh
npm ci --prefix client
npm ci --prefix server
```

Каждая команда устанавливает зависимости соответствующего каталога по его `package-lock.json`; корневого lock-файла нет.

Запустите backend и frontend в отдельных терминалах из корня проекта:

```sh
npm run dev:server
```

```sh
npm run dev:client
```

Vite обслуживает frontend, а запросы с префиксом `/api` перенаправляет на `http://localhost:3001`.

Доступные корневые команды:

```sh
npm run typecheck
npm run build:client
```

`typecheck` запускает проверки TypeScript клиента и сервера. `build:client` выполняет typecheck клиента и создаёт production-сборку в `client/dist`.

Также доступны команды workspace:

```sh
npm --prefix client run dev
npm --prefix client run build
npm --prefix client run typecheck
npm --prefix client run preview

npm --prefix server run dev
npm --prefix server start
npm --prefix server run typecheck
```

В root `package.json` нет script с именем `build`; используйте существующий `build:client` либо `npm --prefix client run build`.

## Architecture and Data Storage

### Frontend

Страницы вызывают actions из `client/src/stores/ticketStore.ts`. Store обращается к функциям `client/src/api/tickets.ts`, где сосредоточены HTTP-запросы к `/api/tickets`. Vite proxy перенаправляет их Express-серверу.

Zustand хранит список `tickets`, выбранную заявку `currentTicket`, `selectedStatus`, `isLoading` и `error`. После успешного создания или изменения статуса store обновляет локальное состояние из ответа API — дополнительный GET для этого не выполняется. Компонентам остаётся отобразить состояние и передать пользовательские действия store.

Общее состояние заявок хранится на сервере; `localStorage` для их хранения не используется. React Router переключает страницы без полной перезагрузки.

### Backend and JSON file

`server/src/index.ts` подключает JSON middleware, API routes и обработчик ошибок. Routes валидируют HTTP-ввод и вызывают методы repository; файловые операции находятся в `server/src/repositories/ticketRepository.ts`.

Файл данных — `server/data/tickets.json`. Начальное содержимое нового хранилища — пустой JSON-массив `[]`. При записи repository:

1. читает актуальный массив заявок;
2. применяет создание или обновление;
3. записывает результат в уникальный временный файл в том же каталоге;
4. переименовывает временный файл в файл данных.

`create` и `update` сериализуются Promise Queue на время всей последовательности read-modify-write.

## API Documentation

Все endpoints имеют префикс `/api/tickets`. Успешные ответы возвращаются в JSON.

### `GET /api/tickets`

Возвращает массив заявок.

Query-параметр `status` необязателен:

- допустимы `new`, `in_progress`, `closed` и `all`;
- если параметр отсутствует или равен `all`, возвращаются все заявки;
- для статуса возвращаются только заявки с этим статусом.

Ответы:

- `200 OK` — массив заявок;
- `400 Bad Request` — недопустимое значение `status`;
- `500 Internal Server Error` — внутренняя ошибка сервера или хранилища.

Пример:

```sh
curl "http://localhost:3001/api/tickets?status=in_progress"
```

### `POST /api/tickets`

Создаёт заявку. Начальный статус назначает сервер (`new`), ID и временные метки также создаются сервером. Неизвестные дополнительные поля запроса игнорируются.

Request body:

```json
{
  "title": "Не работает вход",
  "description": "Ошибка появляется после отправки формы"
}
```

`description` можно не передавать; в сохранённой заявке тогда будет пустая строка.

Ответы:

- `201 Created` — созданная заявка;
- `400 Bad Request` — тело не является объектом, отсутствует или некорректен `title`, либо `description` имеет неправильный тип или превышает ограничение;
- `500 Internal Server Error` — внутренняя ошибка сервера или хранилища.

### `GET /api/tickets/:id`

Возвращает заявку по ID. Параметр `id` — идентификатор в URL.

Ответы:

- `200 OK` — заявка;
- `404 Not Found` — заявка не найдена;
- `500 Internal Server Error` — внутренняя ошибка сервера или хранилища.

### `PATCH /api/tickets/:id`

Изменяет статус заявки по ID. Переходы между статусами не ограничены.

Request body:

```json
{
  "status": "closed"
}
```

Допустимые значения `status`: `new`, `in_progress`, `closed`. Сервер обновляет `updatedAt`; дополнительные поля игнорируются.

Ответы:

- `200 OK` — обновлённая заявка;
- `400 Bad Request` — тело или `status` невалидны;
- `404 Not Found` — заявка не найдена;
- `500 Internal Server Error` — внутренняя ошибка сервера или хранилища.

Для всех endpoints некорректный JSON в теле запроса отклоняется с `400 Bad Request`. Ошибка хранилища передаётся общему обработчику и возвращает `500 Internal Server Error`.

## Validation

Правила валидации реализованы на backend в `server/src/routes/ticketRoutes.ts`.

Frontend обеспечивает дополнительную проверку `title` и `description` в форме создания (`client/src/pages/NewRequestPage.tsx`), а выбор статуса в деталях ограничен допустимыми значениями (`client/src/pages/RequestDetailsPage.tsx`).

- `title` обязателен, должен быть строкой и содержать от 3 до 100 символов после `trim`;
- `description` необязателен, должен быть строкой и содержать не более 1000 символов после `trim`; пустая строка допустима;
- `status` при фильтрации и обновлении должен быть одним из `new`, `in_progress`, `closed`; только фильтр списка дополнительно принимает `all`.

Backend является окончательным уровнем проверки независимо от клиентской валидации.

## Manual Testing and Verification

Ниже перечислены только проверки, которые выполнялись в ходе разработки и аудита проекта.

### API и repository

- Вручную через `curl` проверялись `GET /api/tickets`, создание через `POST`, чтение заявки через `GET /api/tickets/:id`, смена статуса через `PATCH`, фильтрация, ошибки `400` и ошибки `404`.
- Дополнительно выполнялись интеграционные проверки API с Node.js `fetch`: список, фильтры, создание, получение и обновление заявки; также проверялись некорректный JSON и игнорирование дополнительных полей.
- Repository проверялся CRUD-сценарием, включая 30 параллельных созданий и 30 параллельных обновлений; проверка завершилась без потери записей.
- Во время аудита отдельно выполнялись read-only API-проверки списка, фильтра, чтения существующей/отсутствующей заявки, валидации создания и обновления отсутствующей заявки.

### Frontend

- Проверялись API layer и Zustand store при подключённом backend: все четыре API-функции, actions, фильтр, loading/error handling и отсутствие дополнительного GET после создания или обновления.
- Проверялся Vite proxy: запрос к `/api/tickets` через dev-сервер клиента достигал backend.
- В браузере вручную проверялись создание заявок, фильтры, страница деталей, изменение статуса, обновление страницы и валидация формы.
- Также вручную проверялись empty state и error state при выключенном backend. После повторного запуска backend приложение снова работало.

### Typecheck and production build

- `npm.cmd run typecheck` из корня — успешно; отдельно `npm.cmd --prefix server run typecheck` — успешно.
- `npm.cmd run build:client` из корня — успешно. Vite собрал файлы в `client/dist` (HTML, CSS и JS).
- Автоматизированного test script в текущих `package.json` нет; перечисленные сценарии API/repository выполнялись отдельными проверочными командами.

## Known Limitations

- Promise Queue сериализует изменения только внутри одного процесса Node.js. Если одновременно запустить несколько процессов backend, их записи не координируются общей блокировкой.
- Отдельного npm script для автоматизированного тестового набора нет.
- Данные хранятся в одном локальном JSON-файле; отдельная СУБД в проекте не настроена.

## AI Usage

GitHub Copilot Agent использовался для реализации отдельных этапов проекта по задачам разработчика: JSON repository, Express API и backend validation, frontend API layer и Zustand store, страницы и компоненты UI, а также финальный аудит. Эти задачи выполнялись последовательно в рамках одной рабочей сессии; отдельные подзадачи subagent-ам не делегировались.

В ходе работы агент изучал существующие исходники перед изменениями и запускал запрошенные проверки — TypeScript checks, production build, интеграционные проверки API/repository и проверку интерфейса в браузере. Команды и результаты перечислены в разделе [Manual Testing and Verification](#manual-testing-and-verification); они не включают неподтверждённые проверки.

Принятые и скорректированные решения:

- Сохранены `Ticket` как внутреннее имя сущности, shared-модуль типов и отдельные слои routes/repository и API/store/UI.
- Для создания в shared-коде предусмотрена нормализация отсутствующего описания в `""`; сервер назначает статус `new`.
- React Router изначально отсутствовал. Агент сообщил об этом и дождался разрешения пользователя, прежде чем установить зависимость и реализовать маршруты.
- Production build запускается существующей командой `build:client`; корневой script `build` не добавлялся.

## Agent Interaction Examples

Краткие пересказы реальных запросов из рабочей истории, не дословные цитаты:

1. **Постановка задачи:** реализовать этап JSON repository с атомарной записью, Promise Queue и проверками CRUD/параллельных операций, не переходя к следующему этапу.
2. **Обсуждение архитектурного решения:** перед UI проверить наличие React Router; агент сообщил, что пакет отсутствует, спросил разрешение, и только после согласия установил его.
3. **Проверка проблемы:** провести аудит соответствия заданию, выполнить доступные typecheck/API проверки, не менять код; отдельно выяснилось, что запрошенный корневой `build` script отсутствует, тогда как `build:client` существует.
