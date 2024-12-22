# access-gate

A powerful and flexible role-based access control (RBAC) library for modern JavaScript and TypeScript applications.

## Key Features
- **Policies**: Define granular access control rules.
- **Guards**: Apply global or contextual restrictions.
- **Async Guards**: Handle asynchronous operations seamlessly.
- **Lightweight**: Minimal dependencies, fast performance.
- **TypeScript Support**: Fully typed API for improved developer experience.

For full [Documentation](https://uksarkar.github.io/access-gate/).

## Installation

Install the package via npm or yarn:

```bash
npm install access-gate
# or
yarn add access-gate
```

### 1. Import the Library
```ts
import { Gate, Policy } from "access-gate";

const gate = new Gate();

// Define a policy
const postPolicy = new Policy("post");

postPolicy.define("update", (user, post) => user.id === post.authorId);

gate.addPolicy(postPolicy);

// Access the policy
const representative = gate.build({ id: 1 });
const decision = representative.access("post", "update").can({ authorId: 1 });

console.log(decision); // true
```

## Core Concepts

### Policies
A **Policy** represents a set of actions that define access rules.

```ts
const postPolicy = new Policy("post");

postPolicy.define("view", (user, post) => true);
postPolicy.define("update", (user, post) => user.id === post.authorId);

gate.addPolicy(postPolicy);
```

### Guards

**Guards** define global or contextual access rules.
```ts
gate.guard((user) => user.isAdmin);
```

### Lazy Guards

**Lazy guards** are entity-specific restrictions.

```ts
gate.lazyGuard((user, post) => user.id === post.authorId);
```

### Decisions

A **Decision** object represents the result of evaluating a policy or guard.

```ts
const decision = representative.access("post", "view");
console.log(decision.can()); // true
```

## API Reference

### Gate
The `Gate` class manages policies and guards.

#### Methods
- `addPolicy(policy: Policy)`: Adds a policy.
- `guard(fn: Guard)`: Adds a global guard.
- `lazyGuard(fn: LazyGuard)`: Adds a lazy guard.

---

### Policy
The `Policy` class defines a set of rules.

#### Methods
- `define(action: string, fn: (user, entity) => boolean)`: Defines a policy action.
- `can(action: string)`: Evaluates if an action can be performed.

---

### Representative
The `Representative` class evaluates access based on policies and guards.

#### Methods
- `access(policy: string, action: string)`: Accesses a policy decision.
- `can(entity?: object)`: Evaluates synchronous access.
- `could(entity?: object)`: Evaluates async access.

## Advanced Usage

### Async Guards
```ts
gate.asyncLazyGuard(async (user, resource) => {
  const hasAccess = await someAsyncCheck(user, resource);
  return hasAccess;
});
```

### Dependency Injection
```ts
// provide
gate.guard((user, provide) => {
  const role = getRole(user);

  provide("role", role);
});

// inject
policy.define("update", (user, entity) => {
    const role = this.inject("role");

    return role === "user" && user.id === entity.authorId;
});
```