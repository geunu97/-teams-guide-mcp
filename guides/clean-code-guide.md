# 클린 코드 작성 가이드

이 문서는 읽기 쉽고 유지보수하기 좋은 클린 코드를 작성하기 위한 실용적인 가이드입니다.

## 📋 목차

1. [네이밍 규칙](#네이밍-규칙)
2. [함수 작성 원칙](#함수-작성-원칙)
3. [주석 작성 가이드](#주석-작성-가이드)
4. [코드 구조화](#코드-구조화)
5. [에러 처리](#에러-처리)
6. [리팩토링 팁](#리팩토링-팁)

## 네이밍 규칙

### 좋은 네이밍의 원칙

**의도를 분명히 표현하라**

- ❌ 나쁜 예: `d`, `data`, `temp`
- ✅ 좋은 예: `elapsedTimeInDays`, `customerData`, `userAccount`

**검색하기 쉬운 이름을 사용하라**

- ❌ 나쁜 예: 숫자나 짧은 약어 (`e`, `x1`, `MAX`)
- ✅ 좋은 예: 의미 있는 이름 (`employee`, `maxConnections`)

**클래스 이름은 명사나 명사구**

- ✅ 좋은 예: `Customer`, `Account`, `AddressParser`

**함수 이름은 동사나 동사구**

- ✅ 좋은 예: `getUser()`, `calculateTotal()`, `isValid()`

### 네이밍 예시

```javascript
// ❌ 나쁜 예
function proc(d) {
  let t = 0;
  for (let i = 0; i < d.length; i++) {
    t += d[i].amt;
  }
  return t;
}

// ✅ 좋은 예
function calculateTotalAmount(orders) {
  let totalAmount = 0;
  for (let order of orders) {
    totalAmount += order.amount;
  }
  return totalAmount;
}
```

## 함수 작성 원칙

### 작게 만들어라

함수는 가능한 한 작게 작성해야 합니다. 한 함수는 한 가지 일만 해야 합니다.

```javascript
// ❌ 나쁜 예: 여러 가지 일을 하는 함수
function processUser(user) {
  // 사용자 검증
  if (!user.email || !user.name) {
    return { error: "Invalid user" };
  }

  // 데이터베이스 저장
  db.save(user);

  // 이메일 발송
  emailService.sendWelcomeEmail(user.email);

  // 로그 기록
  logger.log(`User created: ${user.email}`);

  return { success: true };
}

// ✅ 좋은 예: 각각의 책임을 분리
function validateUser(user) {
  if (!user.email || !user.name) {
    throw new Error("Invalid user");
  }
}

function saveUser(user) {
  return db.save(user);
}

function sendWelcomeEmail(email) {
  return emailService.sendWelcomeEmail(email);
}

function processUser(user) {
  validateUser(user);
  const savedUser = saveUser(user);
  sendWelcomeEmail(savedUser.email);
  logger.log(`User created: ${savedUser.email}`);
  return { success: true };
}
```

### 함수 인자는 적게

함수의 인자는 0개가 가장 좋고, 1개, 2개 순서로 좋습니다. 3개 이상은 피하는 것이 좋습니다.

```javascript
// ❌ 나쁜 예: 인자가 너무 많음
function createUser(name, email, age, address, phone, role, department) {
  // ...
}

// ✅ 좋은 예: 객체로 묶기
function createUser(userData) {
  const { name, email, age, address, phone, role, department } = userData;
  // ...
}
```

### 부수 효과를 일으키지 마라

함수는 한 가지 일만 해야 하며, 예상치 못한 부수 효과를 만들면 안 됩니다.

```javascript
// ❌ 나쁜 예: 부수 효과가 있는 함수
let password = "default123";

function checkPassword(input) {
  if (input === password) {
    password = "changed"; // 예상치 못한 부수 효과!
    return true;
  }
  return false;
}

// ✅ 좋은 예: 순수 함수
function checkPassword(input, expectedPassword) {
  return input === expectedPassword;
}
```

## 주석 작성 가이드

### 좋은 주석

**복잡한 알고리즘 설명**

```javascript
// 이진 탐색 알고리즘: 정렬된 배열에서 O(log n) 시간 복잡도로 검색
function binarySearch(sortedArray, target) {
  // ...
}
```

**의도를 설명하는 주석**

```javascript
// 사용자 권한을 확인하기 위해 세션을 먼저 검증해야 함
// (보안 정책에 따라)
if (!validateSession(userSession)) {
  return unauthorized();
}
```

### 나쁜 주석

**코드 자체를 설명하는 주석 (불필요)**

```javascript
// ❌ 나쁜 예: 코드가 이미 명확함
// i를 0부터 시작해서 10까지 증가시킴
for (let i = 0; i < 10; i++) {
  // ...
}
```

**주석 처리된 코드**

```javascript
// ❌ 나쁜 예: 주석 처리된 코드는 삭제해야 함
// function oldFunction() {
//   return "deprecated";
// }
```

**너무 많은 주석**

```javascript
// ❌ 나쁜 예: 코드가 주석으로 가려짐
// 이 함수는 사용자를 생성합니다
// 사용자 데이터를 받아서
// 검증하고
// 데이터베이스에 저장합니다
function createUser(user) {
  // ...
}
```

## 코드 구조화

### 일관성 유지

코드 스타일과 구조를 일관되게 유지하세요.

```javascript
// ✅ 좋은 예: 일관된 구조
class UserService {
  constructor(database) {
    this.db = database;
  }

  async getUser(id) {
    return await this.db.findUser(id);
  }

  async createUser(userData) {
    return await this.db.saveUser(userData);
  }

  async updateUser(id, userData) {
    return await this.db.updateUser(id, userData);
  }
}
```

### 중복 제거 (DRY 원칙)

같은 코드를 반복하지 마세요. 함수나 클래스로 추출하세요.

```javascript
// ❌ 나쁜 예: 중복된 코드
function calculateOrderTotal(order) {
  let total = 0;
  for (let item of order.items) {
    total += item.price * item.quantity;
  }
  total += total * 0.1; // 세금
  return total;
}

function calculateInvoiceTotal(invoice) {
  let total = 0;
  for (let item of invoice.items) {
    total += item.price * item.quantity;
  }
  total += total * 0.1; // 세금
  return total;
}

// ✅ 좋은 예: 중복 제거
function calculateItemsTotal(items) {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

function applyTax(amount, taxRate = 0.1) {
  return amount + amount * taxRate;
}

function calculateOrderTotal(order) {
  const subtotal = calculateItemsTotal(order.items);
  return applyTax(subtotal);
}

function calculateInvoiceTotal(invoice) {
  const subtotal = calculateItemsTotal(invoice.items);
  return applyTax(subtotal);
}
```

## 에러 처리

### 명확한 에러 메시지

에러가 발생했을 때 무엇이 잘못되었는지 명확히 알 수 있어야 합니다.

```javascript
// ❌ 나쁜 예: 모호한 에러
function divide(a, b) {
  if (b === 0) {
    throw new Error("Error");
  }
  return a / b;
}

// ✅ 좋은 예: 명확한 에러 메시지
function divide(a, b) {
  if (b === 0) {
    throw new Error(`Cannot divide ${a} by zero`);
  }
  return a / b;
}
```

### 예외 처리

예외를 적절히 처리하고, 예상치 못한 상황에 대비하세요.

```javascript
// ✅ 좋은 예: 적절한 예외 처리
async function fetchUserData(userId) {
  try {
    const user = await database.findUser(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // 예상된 에러는 재발생
    }
    logger.error(`Unexpected error fetching user ${userId}:`, error);
    throw new Error("Failed to fetch user data");
  }
}
```

## 리팩토링 팁

### 코드 냄새(Code Smell) 감지

다음과 같은 상황이 보이면 리팩토링을 고려하세요:

1. **긴 함수**: 함수가 20줄 이상이면 분리 고려
2. **긴 매개변수 목록**: 3개 이상의 매개변수는 객체로 묶기
3. **중복 코드**: 같은 코드가 여러 곳에 있으면 함수로 추출
4. **매직 넘버**: 숫자 상수는 이름 있는 상수로 변경
5. **주석 처리된 코드**: 삭제하거나 버전 관리에 맡기기

### 리팩토링 예시

```javascript
// ❌ 리팩토링 전
function processOrder(order) {
  if (
    order.status === "pending" &&
    order.items.length > 0 &&
    order.total > 100
  ) {
    order.status = "processing";
    // 0.1은 세금율
    order.finalTotal = order.total * 1.1;
    sendEmail(order.customerEmail, "Your order is being processed");
  }
}

// ✅ 리팩토링 후
const TAX_RATE = 0.1;
const MINIMUM_ORDER_AMOUNT = 100;

function isOrderProcessable(order) {
  return (
    order.status === "pending" &&
    order.items.length > 0 &&
    order.total > MINIMUM_ORDER_AMOUNT
  );
}

function calculateFinalTotal(subtotal) {
  return subtotal * (1 + TAX_RATE);
}

function processOrder(order) {
  if (isOrderProcessable(order)) {
    order.status = "processing";
    order.finalTotal = calculateFinalTotal(order.total);
    sendEmail(order.customerEmail, "Your order is being processed");
  }
}
```

## 마무리

클린 코드는 한 번에 완성되지 않습니다. 지속적인 리팩토링과 개선을 통해 점진적으로 발전시켜 나가세요.

**핵심 원칙:**

- 코드는 읽기 쉬워야 합니다
- 작은 함수, 작은 클래스
- 의미 있는 이름 사용
- 중복 제거
- 테스트 가능한 코드 작성

**기억하세요:** 코드는 작성하는 시간보다 읽는 시간이 더 많습니다. 미래의 자신과 동료를 위해 클린 코드를 작성하세요.
