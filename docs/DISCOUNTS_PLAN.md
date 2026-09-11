# Проектирование: персональные скидки клиентов

Цель: у каждого клиента есть своя скидка; она должна применяться при покупке и быть видна на сайте
(профиль, корзина, оформление, история заказов, карточка товара) и управляться из админки.
Документ затрагивает все три проекта: `domsommelier-backend`, `domsommelier-frontend` (клиент),
`domsommelier-admin-frontend` (админка).

> **Статус: этапы 0 и 1 реализованы.** Правило скидок зафиксировано бизнесом: личная скидка
> **не складывается** ни с акционной ценой, ни с промокодом. Осталось: этап 2 (персональные цены
> в каталоге) и этап 3 (уровни лояльности, промокоды). Раздел §1 описывает состояние ДО доработки
> и оставлен как история — что именно чинили и почему.

---

## 1. Текущее состояние

| Что | Где | Состояние |
|-----|-----|-----------|
| Скидка на клиенте | `Customer` | **Нет поля вообще.** Есть только `role`, `defaultWineStore`, `favoriteProducts`. |
| Акционная цена товара | `Product.price`, `Product.initialPrice`, `Product.discount` | Три ценовых поля, семантика расходится (см. §2). |
| Скидка корзины | `BasketDto.discount` (Integer, «в процентах») | Считается в `BasketService.recalculateBasket()`. Выставляется **только** из промокода. |
| Промокоды | `Promo`, `PromoUse`, `PromoUseId`, `PromoRepository` | Мёртвая заготовка: `PromoUse` **нигде не создаётся**, admin CRUD нет, эндпоинты `applyPromo`/`removePromo` помечены `@Deprecated @Hidden`, на фронте `Promocode.tsx` целиком закомментирован. |
| Скидка в заказе | `Order.totalAmount` | Процент корзины применяется к итогу, но **не сохраняется** — после оформления неизвестно, какая была скидка. `AdminOrderDetailDto.promoDiscount` всегда `null` (т.к. `PromoUse` не пишется). |
| Админка клиентов | `AdminCustomerController` | **Read-only** (три GET-а). Ни одного write-эндпоинта. |
| Миграции БД | — | Flyway/Liquibase нет. `ddl-auto: update` в `application-prod.yml` и `-docker.yml` → новые колонки появляются сами. |

### 1.1 Три расхождения, которые надо устранить до внедрения скидок

Это не «заодно почистить» — новая скидка ляжет ровно на эти места, поэтому сначала фундамент.

**Р1. `Product.discount` — процент или рубли?**
Бэкенд валидирует как **процент**:
```java
// product/model/write/ProductWriteRequest.java:57
@Min(0) @Max(100)
private Integer discount;
```
Фронт использует как **абсолютную новую цену**:
```ts
// src/hooks/useProductPrice.ts
const hasDiscount = typeof discount === 'number' && discount > 0;
const currentPrice = hasDiscount ? discount! : price;   // discount === цена!
```
Итог: админ ставит «скидка 10» вину за 3000 ₽ → сайт показывает **10 ₽** и зачёркнутые 3000 ₽.
(`temporaryMocks.ts: discount: 1614` подтверждает, что фронт писали под «цену».)
Плюс `initialPrice` есть в БД и в `ProductDTO`, но не используется ни в одной карточке.

**Р2. `BasketDto.discount` — процент, отображается как рубли.**
```java
// BasketService.recalculateBasket() — процент
discounted = total.subtract(total.multiply(BigDecimal.valueOf(discount)).divide(BigDecimal.valueOf(100), 2, HALF_UP));
```
```tsx
// components/OrderSummary/OrderSummary.tsx:43 — рубли
value={`- ${formatPrice(discount)} ₽`}
```
Скидка 10 % показывается как «− 10 ₽».

**Р3. Снапшот заказа игнорирует скидку товара.**
```java
// OrderService.createOrderFromBasket()
BigDecimal unitPrice = product.getPrice();   // акционная цена (product.discount) потеряна
```
При этом `totalAmount` считается с процентом корзины. Результат: сумма позиций в заказе не равна
итогу заказа, а акционная цена не доезжает до заказа вообще.

---

## 2. Единая ценовая модель (основа всего остального)

Развести три сущности, которые сейчас слиты в поле `discount`:

| Термин | Носитель | Тип | Смысл |
|--------|----------|-----|-------|
| `basePrice` | `Product.price` | `BigDecimal` | Цена по прайсу. Зачёркнутая, если есть акция. |
| `salePrice` | `Product.salePrice` (**новое имя** для текущего `discount`) | `BigDecimal`, nullable | Акционная цена товара для всех. `null` = акции нет. |
| `personalDiscountPercent` | `Customer` | `Integer` 0..100 | Личная скидка клиента. |

`effectiveUnitPrice = salePrice != null ? salePrice : basePrice`

**Рекомендация по Р1:** переименовать `Product.discount` → `salePrice` типа `BigDecimal` и снять
`@Min(0) @Max(100)`. Это приводит бэкенд к тому, что фронт уже делает, и освобождает слово
«discount» под скидку клиента. Миграция: колонка `discount` (integer) → `sale_price` (numeric),
разовым SQL, т.к. `ddl-auto: update` колонки не переименовывает и не меняет тип.

> Альтернатива (дешевле в коде, дороже в UI): оставить `discount` процентом и переписать
> `useProductPrice` на `price * (1 - discount/100)`. Но тогда админ не может задать «ровно 1 990 ₽»,
> а для винного прайса это обычное требование. Поэтому — `salePrice`.

---

## 3. Модель личной скидки

### Вариант A — процент на клиенте (MVP, рекомендуется на старт)
```
Customer
  + discountPercent  Integer  (0..100, null == 0)
```
Админ выставляет вручную в карточке клиента.
➕ Один день работы, ровно отвечает постановке «на каждого клиента есть скидка».
➖ Тысяча клиентов = тысяча ручных правок; нет истории «почему 15 %».

### Вариант B — уровни + персональное переопределение (целевой)
```
DiscountTier                       Customer
  id                                 + discountTier        → DiscountTier (nullable)
  name          «Серебро»            + discountPercentOverride  Integer (nullable)
  percent       10                    + discountComment     String
  minTotalSpent 50000                 + discountUpdatedAt   OffsetDateTime
```
`effectivePercent = discountPercentOverride ?? tier.percent ?? 0`
➕ Админ правит 3–4 уровня, а не всех клиентов; уровень можно повышать автоматически по сумме
заказов (`OrderRepository` уже умеет считать по клиенту).
➖ Больше сущностей, нужен экран справочника уровней.

### Решение
Делать **A**, но резолвинг сразу спрятать за одним сервисом:

```java
// customer_management/discount/CustomerDiscountResolver.java
@Service
public class CustomerDiscountResolver {
    /** Действующий процент личной скидки клиента. 0 — скидки нет. */
    public int resolvePercent(Customer customer) { ... }
}
```
Тогда переход на B — это правка одного метода, а не 10 вызовов по коду. Всё остальное
(корзина, заказ, DTO, UI) пишется один раз и под B не меняется.

---

## 4. Правила расчёта

**Считает только бэкенд.** Фронт получает готовые суммы и ничего не умножает на проценты: иначе
копейки разъедутся между корзиной и заказом, а процент можно подменить в браузере.

```
для каждой позиции:
  unitEffective = salePrice ?? basePrice
  lineBase      = basePrice     × qty
  lineEffective = unitEffective × qty

itemsTotal          = Σ lineBase                    // «Товары»
saleDiscountAmount  = Σ (lineBase − lineEffective)  // «Скидка по акции»
personalBase        = Σ lineEffective по позициям, где скидка применима (см. ниже)
personalAmount      = personalBase × percent / 100  → HALF_UP, 2 знака
payableTotal        = itemsTotal − saleDiscountAmount − personalAmount
```

Решения, которые нужно зафиксировать с бизнесом (в коде — константы/флаги, чтобы менять дешево):

| Вопрос | Предлагаемое правило по умолчанию |
|--------|----------------------------------|
| Личная скидка на товар, у которого уже есть `salePrice`? | **Не применяется** (не уценяем уценённое). Реализуется как `personalBase` считается только по позициям с `salePrice == null`. |
| Личная скидка + промокод? | **Берётся максимум**, не суммируются. (Промокоды — этап 3, но правило заложить в расчёт сразу.) |
| Максимальная суммарная скидка | Cap 30 % от `itemsTotal`, вынести в конфиг. |
| Скидка на аксессуары/закуски | Да (то же правило). Мероприятия (`EventOrder`) — **нет**, отдельный флоу. |
| Округление | HALF_UP до 2 знаков, **на уровне итога скидки**, не на позицию — иначе Σ позиций ≠ итог. |

---

## 5. Схема БД

```
customer
  + discount_percent        smallint NULL          -- 0..100, NULL == 0
  (этап 3) + discount_tier_id, discount_comment, discount_updated_at

product
  discount (integer)  →  sale_price (numeric(12,2))   -- разовый SQL, см. §2

orders
  + items_total                numeric(12,2)  -- сумма по прайсу
  + sale_discount_amount       numeric(12,2)  -- экономия по акциям
  + personal_discount_percent  smallint       -- снапшот процента на момент заказа
  + personal_discount_amount   numeric(12,2)  -- снапшот рублей
  ~ total_amount               numeric(12,2)  -- к оплате (как сейчас)

order_item
  ~ unit_price -- теперь = effectiveUnitPrice (фикс Р3)
```

Практика прод-деплоя: `ddl-auto: update` добавит колонки сам, но **только nullable и без default**.
Поэтому в Java поля объявляем `Integer`/`BigDecimal` (nullable), а «нет скидки» трактуем как `null → 0`
в `CustomerDiscountResolver`. Ручной SQL нужен ровно один — переименование `product.discount`.

**Почему снапшот в `orders`:** процент клиента меняется, а история заказов меняться не должна.
Сейчас в заказе не сохраняется ничего — после смены скидки старый заказ «пересчитался» бы.

---

## 6. Контракты API

### 6.1 Профиль клиента
```
GET /api/v1/customer/profile
{ ..., "discountPercent": 10 }        // CustomerProfileDto + поле
```

### 6.2 Корзина — развести проценты и рубли
`BasketDto` сейчас: `totalPrice`, `discount` (%), `discountedPrice`. Новый контракт:

```json
{
  "customerId": "...",
  "items": [ { "product": {...}, "quantity": 2,
               "unitBasePrice": 3000.00,
               "unitEffectivePrice": 2490.00,
               "lineTotal": 4980.00 } ],
  "itemsTotal": 6000.00,
  "saleDiscountAmount": 1020.00,
  "personalDiscountPercent": 10,
  "personalDiscountAmount": 0.00,
  "totalDiscountAmount": 1020.00,
  "payableTotal": 4980.00,

  "totalPrice": 6000.00,        // deprecated-алиас = itemsTotal
  "discount": 10,               // deprecated-алиас
  "discountedPrice": 4980.00    // deprecated-алиас = payableTotal
}
```
Алиасы держим один релиз: корзины лежат в Redis (`basket:<customerId>`) сериализованным `BasketDto`,
и на прод придут одновременно старые корзины и новый код. Безопасность миграции обеспечена тем, что
`RedisService` настроен с `FAIL_ON_UNKNOWN_PROPERTIES = false` — старый JSON без новых полей
прочитается. **Требование:** все новые поля читать null-safe (как уже сделано для `getDiscount()`).

Личная скидка **не** передаётся клиентом и **не** хранится в корзине — берётся из БД по
`customerId` на каждом `recalculateBasket`, иначе изменение скидки не подхватится в живой корзине.

### 6.3 Каталог и карточка товара

Развилка: показывать ли персональную цену в каталоге.

**Вариант (i) — не трогать DTO товара (MVP).** Каталог остаётся публичным и кэшируемым, персональная
скидка живёт в баннере («Ваша скидка 10 % применится в корзине») и в самой корзине.
➕ Ноль изменений в 6 `*CardDtoMapper` и 6 `*DetailsMapper`. ➕ Не ломает SSR и `newProductsCache`.
➖ На плитке каталога персональная цена не видна.

**Вариант (ii) — персональная цена в карточке.** Пришлось бы протащить `customerId` во все 12
мапперов, и прайс становится приватным: SSR-кэш и Redis-кэши каталога отдавали бы цену одного
клиента другому. Отдельная и дорогая работа.

**Рекомендация: (i) сейчас, (ii) позже через оверлей, а не через мапперы:**
```
POST /api/v1/products/personal-prices   { "productIds": ["...","..."] }
→ [ { "productId": "...", "personalPrice": 2241.00, "personalDiscountPercent": 10 } ]
```
Дёргается с клиента после гидратации, накладывается на уже отрисованные цены. SSR-кэш и публичный
контракт каталога не меняются, `ProductCardDto` остаётся общим для всех.

### 6.4 Заказ
- `OrderService.createOrderFromBasket` пишет `unitPrice = effectiveUnitPrice` (фикс Р3) и заполняет
  четыре новые колонки `orders` из посчитанной корзины.
- `OrderFullDto`, `OrderHistoryDto`, `AdminOrderDetailDto` + `itemsTotal`, `saleDiscountAmount`,
  `personalDiscountPercent`, `personalDiscountAmount`.
- `OrderDtoMapper.resolveTotalAmount` оставить как есть (фолбэк на пересчёт для старых заказов).

### 6.5 Админка
Первый write-эндпоинт в модуле клиентов (сейчас он read-only):
```
PATCH /api/v1/admin/customers/{id}/discount     @RequiresAdmin
{ "percent": 10, "comment": "постоянный клиент" }
→ AdminCustomerDetailDto
```
Валидация 0..100. `AdminCustomerListDto`/`DetailDto` + `discountPercent`.
Желательно писать `discountUpdatedAt` + кто менял — скидка это деньги, нужен след.

---

## 7. UI — клиентский сайт (`domsommelier-frontend`)

| Экран | Что добавить |
|-------|--------------|
| `OrderSummary` (корзина + чекаут) | Строки: «Товары» `itemsTotal`, «Скидка по акции» `−saleDiscountAmount`, «Ваша скидка 10 %» `−personalDiscountAmount`, «Итого» `payableTotal`. Здесь же уходит Р2 (% вместо ₽). Строки скрываются при нуле. |
| Профиль → `ProfilePersonalData` | Блок «Ваша персональная скидка — 10 %» (при `discountPercent > 0`). |
| Корзина → `BasketProductRow` | Цена позиции: `unitEffectivePrice` + зачёркнутая `unitBasePrice`. |
| Карточка товара / каталог | Этап 1: бейдж «−10 % в корзине». Этап 2: персональная цена через `personal-prices`. |
| История заказа (`OrderDetailLayout`) | Строка зафиксированной скидки — чтобы клиент видел, почему итог меньше суммы позиций. |
| Гость | Ничего не показываем: у неавторизованного скидки нет. |

`useProductPrice` переписать под новую модель (`basePrice` + `salePrice` + опциональная
`personalPrice`) — сейчас это единственная точка, где фронт решает, что показывать как цену, и она
уже используется в 5 компонентах. Менять там, а не в каждом компоненте.

## 8. UI — админка (`domsommelier-admin-frontend`)

| Экран | Что добавить |
|-------|--------------|
| `CustomersListPage` | Колонка «Скидка, %» (`—` при 0), фильтр «только со скидкой». |
| `CustomerDetailPage` | В `Descriptions` — поле «Персональная скидка» с inline-редактированием (`InputNumber` 0..100 + «Сохранить») → `PATCH`. |
| `OrderDetailPage` | Строки «Скидка по акции» / «Персональная скидка» из снапшота заказа. |
| Форма товара (каталог) | Переименовать поле «Скидка» → «Акционная цена, ₽» (после §2). |

Локально админку не поднять (Node 18.20.7 против требований Vite 7) — проверять через API/`curl`.

---

## 9. Этапы

**Этап 0 — выпрямить фундамент** ✅ сделано
1. ✅ `Product.discount` → `salePrice: BigDecimal` (бэк + админ-форма + `useProductPrice`).
   Миграция данных — `scripts/migrate_sale_price.sh` (запустить один раз после деплоя бэкенда).
2. ✅ `OrderItem.unitPrice` = эффективная цена (Р3).
3. ✅ `OrderSummary`: рубли вместо процентов (Р2).

**Этап 1 — MVP личной скидки** ✅ сделано
4. ✅ `Customer.discountPercent` + `CustomerDiscountResolver`.
5. ✅ Расчёт в `BasketPriceCalculator` + новый `BasketDto` (+8 юнит-тестов на правила §4).
6. ✅ Снапшот в `orders` + `OrderService`.
7. ✅ `PATCH /admin/customers/{id}/discount` + колонка и карточка скидки в админке.
8. ✅ `OrderSummary`, бейдж в профиле, строки скидок в истории заказа.

**Этап 2 — видимость в каталоге**
9. `POST /products/personal-prices` + бейджи и персональные цены на плитках и в карточке.

**Этап 3 — развитие**
10. `DiscountTier` + автоповышение по сумме заказов (вариант B).
11. Оживить `Promo`: admin CRUD, запись `PromoUse` при оформлении, разкомментировать `Promocode.tsx`,
    правило «максимум из промокода и личной скидки».

Этап 0 + 1 — это связная поставка: раньше этапа 1 скидку показывать негде, позже — ломается прайс.

---

## 10. Вопросы к бизнесу

Решено:
1. ✅ Личная скидка **не складывается** с акционной ценой — начисляется только на позиции без акции.
2. ✅ Личная скидка + промокод — **берётся максимум**, не суммируются.
4. ✅ На мероприятия (`EventOrder`) скидка не распространяется — отдельный флоу, не тронут.

Остаётся открытым:
3. Максимальная суммарная скидка (cap)? Сейчас ограничения нет, кроме 0..100 % на саму скидку.
5. Нужна ли скидка в рублях (а не в процентах) хотя бы для отдельных клиентов?
6. Нужен ли журнал изменений скидки? Сейчас пишется только `discount_updated_at` и комментарий —
   но не то, какой админ менял.
7. Ограничения на скидки для алкоголя в рознице — уточнить у юриста до публичного показа
   процентов на витрине.
