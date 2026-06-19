# Проектирование админ-панели DomSommelier

Документ описывает целевую архитектуру `domsommelier-admin-frontend`, перечень разделов,
необходимые доработки бэкенда и поэтапный roadmap с детализированным MVP-этапом.

> Связанные проекты: `domsommelier-backend` (Spring Boot, общий API), `domsommelier-frontend`
> (клиентский магазин, Next.js). Админка ходит в тот же бэкенд через прокси `/api-back`.

---

## 1. Цели и принципы

- **Назначение.** Внутренний инструмент для сотрудников: управление заказами, каталогом,
  мероприятиями, новостями, винотеками и клиентами.
- **Доступ.** Только `ROLE_ADMIN`. Проверка на двух уровнях: фронт (`AuthContext` грузит профиль
  и валидирует роль) + бэк (`@RequiresAdmin` / `hasRole('ADMIN')` на write-эндпоинтах).
- **Технологии (заданы текущим репозиторием):** Vite 7 + React 19 + TypeScript + Ant Design 5 +
  React Router 6. Сохраняем стек, не добавляем тяжёлых зависимостей без необходимости.
- **Принципы:** доменная структура папок (зеркалит бэкенд), единый слой `customFetch`, типовые
  паттерны «список → форма → деталь», переиспользуемые таблицы/формы, оптимистичные статусы где уместно.

---

## 2. Текущее состояние (на момент планирования)

**Готово в админке (MVP-авторизация):**
- `App.tsx` — роутинг: `/login`, `/` (защищённый `HomePage`), `*` → редирект по статусу.
- `auth/` — `AuthContext` (OTP-логин, загрузка профиля, проверка `isAdmin`, `ForbiddenAccessError`),
  `tokenStorage`, `roles`, `errors`.
- `api/` — `auth`, `customer`, `config/customFetch` (прокси `/api-back` → vite proxy на `:8080`).
- `components/ProtectedRoute`, `pages/HomePage` (заглушка), `pages/LoginPage`.

**Готово в бэкенде (можно использовать сразу):**
- Полный CRUD: `Events` (`/api/v1/events`), `News` (`/api/v1/news`), `WineStores` (`/api/v1/wine-stores`).
- Загрузка фото: `events/files`, `news/files`, `products/files`.
- Заказы: `GET /orders`, `GET /orders/{id}` — **но только для своих заказов текущего юзера**.
- Продукты: только чтение/фильтры/поиск.

**Пробелы бэкенда под админку (нужна доработка — см. §6):**
- Нет admin-листинга **всех** заказов и смены статуса заказа.
- Нет write-API для продуктов (создание/редактирование/удаление/склад).
- CRUD событий/новостей/винотек не закрыт ролью ADMIN (write открыт любому authenticated).
- Нет admin-эндпоинтов для просмотра клиентов и управления промокодами.
- `OrderStatus` — строковая сущность (`TODO: to enum`), нет справочника статусов через API.

---

## 3. Целевая архитектура фронта

### 3.1 Структура папок

```
src/
  api/                      # слой запросов, по доменам (зеркало бэкенда)
    config/                 # customFetch, общие типы (Page<T>, ApiError)
    auth/  customer/        # есть
    orders/ products/ events/ news/ wineStores/ promos/ files/   # добавить
  auth/                     # AuthContext, roles, tokenStorage (есть)
  app/                      # каркас приложения
    AdminLayout.tsx         # Sider + Header + Content (AntD Layout)
    routes.tsx              # описание роутов разделов
    menu.ts                 # конфиг бокового меню
  components/               # переиспользуемые: ProtectedRoute, DataTable,
                            # EntityForm, ConfirmDelete, PhotoUploader, PageHeader
  features/                 # бизнес-разделы (каждый = папка)
    orders/ catalog/ events/ news/ wineStores/ customers/
      pages/                # List / Detail / Form страницы раздела
      components/           # узкоспецифичные компоненты раздела
      hooks/                # useOrders, useOrderMutations и т.п.
  shared/                   # утилиты, форматтеры (дата/деньги), константы
  types/                    # общие типы
```

> Текущая плоская `pages/` мигрирует в `features/*/pages`. `HomePage` → `features/dashboard`.

### 3.2 Роутинг (React Router 6, вложенный)

```
/login                       LoginPage (публичный)
/  ──────────────────────────  AdminLayout (ProtectedRoute)
   ├─ /                        Dashboard (сводка)
   ├─ /orders                  Список заказов
   ├─ /orders/:id              Деталь заказа + смена статуса
   ├─ /catalog                 Список товаров (фильтр по категории)
   ├─ /catalog/new             Создание товара
   ├─ /catalog/:id             Редактирование товара
   ├─ /events  /events/new  /events/:id
   ├─ /news    /news/new    /news/:id
   ├─ /wine-stores  /wine-stores/new  /wine-stores/:id
   └─ /customers  /customers/:id
```

### 3.3 Слой API

- Единый `customFetch<T>(path, { method, body, withAuth, params })` (уже есть; расширить `params`
  для query и поддержкой `multipart/form-data` для загрузки фото).
- Общие типы: `Page<T>` (Spring Pageable: `content`, `totalElements`, `number`, `size`),
  `ApiErrorBody`. Хелпер `buildPageParams({ page, size, sort })`.
- Каждый домен в `api/<domain>/requests.ts` + `interfaces.ts`. Запросы admin-разделов всегда
  `withAuth: true`.
- Обработка `401/403` → `handleSessionExpired` (есть). Глобально показывать ошибки через
  AntD `message`/`notification`.

### 3.4 UI-паттерны (на AntD)

- **DataTable** — обёртка над `Table` с серверной пагинацией/сортировкой, лоадером,
  пустым состоянием, тулбаром (поиск/фильтры/кнопка «Создать»).
- **EntityForm** — обёртка над `Form` с режимами create/edit, авто-disable при сабмите,
  выводом серверных ошибок валидации.
- **PhotoUploader** — `Upload` + превью, привязка к `*/files` эндпоинтам.
- **PageHeader** — заголовок + хлебные крошки + действия.
- **ConfirmDelete** — `Popconfirm` + вызов мутации + тост.
- Локализация AntD: `ConfigProvider locale={ruRU}`. Брендовый акцент `#680a08` (уже в Header).

### 3.5 Состояние и данные

- Серверные данные — через лёгкие хуки на `useState/useEffect` поверх `customFetch`
  (как в текущем `AuthContext`). При росте можно ввести TanStack Query — **в roadmap, не в MVP**.
- Глобальное состояние — только auth (Context). Без Redux.

---

## 4. Разделы и маппинг на API

| Раздел | Функции | Бэкенд сейчас | Действие |
|--------|---------|---------------|----------|
| **Заказы** | список всех, фильтр по статусу/дате/винотеке, деталь, смена статуса, отмена | `GET /orders` (только свои), `GET /orders/{id}`, `POST /{id}/cancel` | **Доработать бэк:** admin-листинг + смена статуса |
| **Каталог/товары** | список по категориям, создание/редактирование/удаление, фото, остаток на складе | только чтение/фильтры | **Доработать бэк:** полный CRUD + склад |
| **Мероприятия** | CRUD, фото, статусы | `GET/POST/PUT/DELETE /events`, `events/files` | Готово — закрыть ролью ADMIN |
| **Новости** | CRUD, фото | `GET/POST/PUT/DELETE /news`, `news/files` | Готово — закрыть ролью ADMIN |
| **Винотеки** | CRUD, гео-точки на карте | `GET/POST/PUT/DELETE /wine-stores` | Готово — закрыть ролью ADMIN |
| **Клиенты** | список, деталь, заказы клиента, роль | нет admin-эндпоинтов | **Доработать бэк:** read-only листинг/деталь |
| **Промокоды** | CRUD, статистика использования | сущности есть, API нет | **Доработать бэк** (поздний этап) |

---

## 5. Сквозные вопросы

- **Безопасность.** Все мутации — под `@RequiresAdmin` на бэке. Фронт скрывает разделы по роли,
  но это не замена серверной проверке.
- **Ошибки/нотификации.** Единый перехват в `customFetch` + точечные тосты в формах.
- **Пагинация/сортировка.** Серверная, через Spring `Pageable` (`page`, `size`, `sort`).
- **Загрузка фото.** `multipart/form-data`, превью до сохранения, удаление по `photoId`.
- **Деньги/даты.** Форматтеры в `shared/format` (BigDecimal → строка с валютой; `OffsetDateTime` → локаль ru).
- **i18n.** Интерфейс на русском; тексты в одном месте (`shared/strings`) для будущей вынесенности.

---

## 6. Доработки бэкенда

### 6.1 Заказы (admin) — приоритет MVP
- `GET /api/v1/admin/orders` — пагинированный список **всех** заказов c фильтрами
  (`status`, `wineStoreId`, диапазон дат, поиск по `customerName/phone`). DTO — расширить
  `OrderHistoryDto` полями клиента/винотеки.
- `PATCH /api/v1/admin/orders/{id}/status` — смена статуса (валидировать допустимые переходы).
- `GET /api/v1/admin/order-statuses` — справочник статусов (для селекта на фронте).
- Все — под `@RequiresAdmin`. Рекомендуется вынести `OrderStatus` в enum (закрыть `TODO`).

### 6.2 Каталог/товары — приоритет после заказов
- `POST/PUT/DELETE /api/v1/admin/products/{category}` — CRUD по категориям
  (wine, spirit, sparkling, lowAlcohol, snack, accessories) с учётом полиморфных полей.
- Управление складом (`StorageHistory`): эндпоинт изменения остатка.
- Привязка фото через существующий `products/files`.

### 6.3 Закрытие существующего CRUD ролью ADMIN
- Навесить `@RequiresAdmin` на write-методы `EventController`, `NewsController`,
  `WineStoreController` (GET оставить публичными). Либо перенести write под `/api/v1/admin/**`.

### 6.4 Клиенты (read-only) — поздний этап
- `GET /api/v1/admin/customers` (пагинация, поиск), `GET /api/v1/admin/customers/{id}`
  (+ заказы клиента). Опционально — смена роли.

### 6.5 Промокоды — поздний этап
- CRUD `Promo` + просмотр `PromoUse`.

---

## 7. Roadmap по этапам

| Этап | Содержание | Зависимость от бэка |
|------|------------|---------------------|
| **0. Каркас** | AdminLayout (Sider+Header), меню, вложенный роутинг, миграция страниц в `features`, общие `DataTable`/`EntityForm`/`PageHeader`, типы `Page<T>`, `ConfigProvider ru` | нет |
| **1. Заказы (MVP-флагман)** | Список + фильтры, деталь, смена статуса, отмена | §6.1 |
| **2. Мероприятия + Новости** | CRUD + фото (бэк готов) | §6.3 (закрыть роль) |
| **3. Винотеки** | CRUD + гео-точки | §6.3 |
| **4. Каталог/товары** | CRUD по категориям + склад + фото | §6.2 |
| **5. Клиенты + Промокоды** | read-only клиенты, CRUD промо | §6.4, §6.5 |
| **6. Полировка** | Dashboard-сводка, TanStack Query (опц.), роли-гранулярность, аудит-лог | по месту |

---

## 8. MVP-этап детально (Этап 0 + Этап 1: Каркас + Заказы)

Цель MVP: рабочая админка, в которой сотрудник видит **все заказы**, открывает детали и
**меняет статус** заказа. Заказы выбраны флагманом — высшая бизнес-ценность при минимальной
доработке бэка.

### 8.1 Backend-задачи (Spring Boot)

- **B1.** `OrderStatus` → enum (`NEW`, `PROCESSING`, `READY`, `COMPLETED`, `CANCELLED` — уточнить
  по текущим данным) либо оставить строковым справочником, но добавить чтение списка.
  - Файлы: `order_management/order/entity/OrderStatus.java`, миграция данных.
- **B2.** Admin-сервис/контроллер заказов:
  - `AdminOrderController` (`/api/v1/admin/orders`) под `@RequiresAdmin`.
  - `GET /` — `Page<AdminOrderListDto>` с фильтрами `status, wineStoreId, dateFrom, dateTo, query`.
  - `GET /{id}` — `OrderFullDto` (переиспользовать, без проверки «свой/чужой»).
  - `PATCH /{id}/status` — body `{ status }`, валидация перехода, 409 при недопустимом.
  - `GET /api/v1/admin/order-statuses` — список значений.
  - Repository: метод с `Specification<Order>` для фильтров.
- **B3.** Проверить, что `JwtAuthenticationFilter` кладёт роль в `Authentication` так, что
  `hasRole('ADMIN')` срабатывает (префикс `ROLE_`). Покрыть тестом MockMvc (403 для юзера, 200 для админа).

### 8.2 Frontend-задачи (Vite/React/AntD)

**Каркас (Этап 0):**
- **F0.1** `app/AdminLayout.tsx` — `Layout` с `Sider` (меню), `Header` (логотип `#680a08` + кнопка
  «Выйти» из текущего `HomePage`), `Content` под `<Outlet/>`.
- **F0.2** `app/menu.ts` + рендер меню из конфига; активный пункт по роуту.
- **F0.3** Перевести `App.tsx` на вложенные роуты с `AdminLayout` как layout-роут под `ProtectedRoute`.
- **F0.4** `ConfigProvider locale={ruRU}` в `main.tsx`.
- **F0.5** `api/config`: добавить `Page<T>`, `buildPageParams`, поддержку `params` в `customFetch`.
- **F0.6** Общие компоненты `components/DataTable.tsx`, `components/PageHeader.tsx`.

**Раздел «Заказы» (Этап 1):**
- **F1.1** `api/orders/{interfaces,requests}.ts`:
  `getOrders(params): Page<AdminOrderListDto>`, `getOrder(id)`, `updateOrderStatus(id, status)`,
  `cancelOrder(id)`, `getOrderStatuses()`. Все `withAuth: true`.
- **F1.2** `features/orders/pages/OrdersListPage.tsx` — `DataTable` (колонки: №/дата, клиент,
  телефон, винотека, сумма, статус-тег, действия), серверная пагинация, тулбар-фильтры
  (статус, винотека, диапазон дат, поиск).
- **F1.3** `features/orders/pages/OrderDetailPage.tsx` — карточка: данные клиента/доставки,
  позиции заказа (`OrderItem`), сумма, промокод; `Select` статуса + кнопка «Сохранить»;
  кнопка «Отменить» (`Popconfirm`).
- **F1.4** Хуки `features/orders/hooks/useOrders.ts`, `useOrderMutations.ts`
  (загрузка, смена статуса с тостом, обработка 409).
- **F1.5** Форматтеры суммы и даты в `shared/format`. Статус → цвет тега (мапа).

### 8.3 Критерии готовности MVP (Definition of Done)

- [ ] Не-админ получает 403 на `/api/v1/admin/**` (бэк-тест) и не видит разделы (фронт).
- [ ] Админ логинится по OTP и попадает в layout с боковым меню.
- [ ] Список заказов: серверная пагинация + фильтр по статусу + поиск работают.
- [ ] Деталь заказа отображает позиции, клиента, сумму, промокод.
- [ ] Смена статуса сохраняется на бэке и отражается в списке; недопустимый переход → понятная ошибка.
- [ ] Отмена заказа работает, статус обновляется.
- [ ] Ошибки сети/401/403 не «роняют» UI, показываются тостом; 401 → редирект на `/login`.

### 8.4 Порядок выполнения

1. B1 → B2 → B3 (бэк-API заказов готов и покрыт тестом).
2. F0.1–F0.6 (каркас) — можно параллельно с бэком.
3. F1.1 (API-слой) после B2.
4. F1.2 → F1.3 → F1.4 → F1.5.
5. Прогон DoD, демо.

---

## 9. Открытые вопросы для уточнения

- Точный список статусов заказа и допустимые переходы (нужен для B1/F1.3).
- Нужна ли админу смена роли клиента и ручное создание заказа, или только просмотр/статусы.
- Карта винотек в админке — Yandex Maps (как на клиенте) или ручной ввод координат на MVP.
- Нужен ли аудит действий администратора (кто сменил статус) — влияет на схему БД.
