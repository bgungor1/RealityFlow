# 1. GLOBAL SOFTWARE PRINCIPLES
- **SOLID:** Adhere strictly to SOLID principles.
- **DRY (Don't Repeat Yourself):** Avoid code duplication across services and components.
- **KISS (Keep It Simple, Stupid):** Prefer simple, straightforward solutions over complex abstractions.
- **YAGNI (You Aren't Gonna Need It):** Do not implement features or abstract layers that are not explicitly required by the case.

# 2. BACKEND RULES (NestJS & MongoDB)

## Architecture & Layers
- Use a modular monolith architecture.
- Organize code by domain: transaction, commission, user (Transaction is the aggregate root).
- Controllers MUST only handle HTTP layer (request/response) and MUST NOT contain business logic.
- Services MUST contain all business logic. Do NOT duplicate business logic across services.
- Commission logic MUST be implemented in a separate service.

## Domain & Business Logic
- A transaction represents a real estate deal.
- Transaction stages: `agreement` → `earnest_money` → `title_deed` → `completed`.
- Invalid stage transitions MUST be prevented.
- Stage transitions MUST be controlled by backend following a config-driven approach.
- Backend MUST be the single source of truth for all business logic and financial calculations.

## Commission Rules
- Commission is calculated ONLY when a transaction is completed.
- Commission is calculated ONCE and stored. It MUST NOT be recalculated unless the transaction changes.
- Distribution: 50% agency, 50% agents.
- If listing and selling agent are the same person → receives 100% of agent share.
- If different agents → split equally.

## Database, Atomicity & Consistency
- Commission MUST be embedded inside the transaction document. Avoid unnecessary collections.
- Critical operations MUST be atomic.
- When a transaction reaches the 'completed' stage, updating the stage and calculating/storing the commission MUST be executed within a single MongoDB transaction/session.
- Stage transition operations MUST be idempotent. Repeated requests for the same transition MUST NOT corrupt or duplicate state.

## API, Validation & Error Handling
- Prefer use-case based endpoints over CRUD (Minimize number of API calls).
- Provide aggregated endpoints for the dashboard.
- All business errors MUST be explicitly handled with meaningful and descriptive messages.
- System errors MUST be handled safely without exposing internal details.
- Use DTOs with `class-validator`. All inputs MUST be validated.
- Transaction response MUST include: agent data (id, name), full commission breakdown, and stage.
- Optional: Critical operations (stage change, commission calculation) SHOULD be logged for traceability.

## Testing
- Business logic MUST be testable.
- Write unit tests for commission calculation and stage transitions.

# 3. FRONTEND RULES (Nuxt 3, Pinia, Tailwind CSS)

## Architecture & Framework
- Use Nuxt 3 Composition API.
- Organize code by feature (e.g., transaction).
- Separate UI, state, and data layers.
- Prefer Nuxt 3 auto-imports for Vue composition APIs (ref, computed, etc.) and components. Avoid manual imports unless absolutely necessary.

## Component & UI Rules
- Components MUST be small and reusable, and MUST NOT contain business logic.
- UI MUST reflect backend as the single source of truth. Do NOT calculate business logic in frontend.
- Transaction UI must display: address, stage (progress indicator), agent names, commission breakdown.
- Commission UI must display: total pool, agency share, agent shares (amount + percentage). MUST NOT calculate values.

## State Management & Interaction
- All API calls MUST go through Pinia stores or composables.
- Store handles API calls, loading state, and error state.
- Components MUST NOT call APIs directly.
- Frontend MUST NOT store or derive duplicated business data that can diverge from backend state.
- UI actions MUST rely on backend responses for state updates. Frontend MUST NOT assume successful operations without API confirmation.
- Dashboard MUST use a single aggregated API endpoint to avoid multiple API calls.
- Stage changes MUST trigger backend API, and UI must update based on the API response.

## Code Quality
- Avoid large components.
- Use meaningful naming.
- Keep logic simple and readable.