# Banking Dashboard Technical Assessment

Full-stack banking dashboard built with React, TypeScript, Node, Express, and SQLite.

## Assessment Coverage

### System Design: Real-Time Analytics Dashboard

The selected design is a multi-region real-time analytics dashboard that can process 10,000 events per second, stream live updates, and support historical analysis.

High-level architecture:

- Ingestion gateway: stateless API tier behind regional load balancers.
- Stream backbone: Apache Kafka partitions events by tenant/source key for throughput, replay, and durability.
- Stream processing: Apache Flink computes rolling aggregates and handles late events with event-time windows.
- Real-time store/cache: Redis Cluster keeps hot aggregates available for dashboard reads and WebSocket fanout.
- Historical analytics: ClickHouse stores compressed event and aggregate tables for low-latency analytical queries.
- Multi-region consistency: region-local ingestion with replicated Kafka topics/object storage, idempotency keys, schema validation, and conflict handling for replayed events.
- Data-source integration: source connectors normalize events into a versioned canonical event envelope.

### Backend Implementation

Implemented endpoints:

- `GET /api/accounts`
- `GET /api/accounts/:id`
- `GET /api/accounts/:id/transactions?page=1&limit=10&type=DEPOSIT&sortBy=createdAt&sortOrder=DESC`
- `POST /api/accounts/:id/transactions`

`POST /api/accounts/:id/transactions` accepts:

```json
{
  "type": "DEPOSIT",
  "amount": 100,
  "description": "Payroll deposit",
  "targetAccountId": "2"
}
```

Backend success criteria covered:

- Working transaction endpoints.
- Input validation for transaction type, positive amount, description, transfer target, and invalid query params.
- Proper error responses for missing accounts, insufficient funds, invalid transfer target, and invalid request input.
- Account balance updates for deposits, withdrawals, and transfers.
- SQLite transaction handling with `BEGIN EXCLUSIVE TRANSACTION`, `COMMIT`, and `ROLLBACK`.
- Seeded assessment data for John Doe and Jane Smith.

### Frontend Enhancement

Frontend success criteria covered:

- Account cards show balances and include a `View Transactions` button.
- Transaction form supports deposit, withdrawal, and transfer.
- Form validation provides user feedback before submission.
- Successful transactions refresh account balances and transaction history.
- Transaction list shows date, type, description, and amount.
- Pagination controls are implemented.
- Type filtering is implemented.
- Sorting by date and amount is implemented.
- Loading and error states are shown.
- Layout uses responsive CSS modules.

## Separation of Concerns

The project is separated into a React client and an Express server.

### Client Structure

```text
client/src/
├── api.ts                         # HTTP client functions
├── types.ts                       # Frontend TypeScript models
├── components/
│   ├── AccountList.tsx            # Account selection and page composition
│   ├── TransactionHistory.tsx     # Transaction table, filters, sorting, pagination
│   └── NewTransactionForm.tsx     # Transaction creation form and form validation
└── *.css / *.module.css           # Styling
```

### Server Structure

```text
server/src/
├── index.ts                       # Process startup only
├── app.ts                         # Express app and middleware registration
├── database/
│   ├── connection.ts              # SQLite connection and async helpers
│   ├── schema.ts                  # Table creation/bootstrap
│   └── seedData.ts                # Assessment sample data
├── routes/
│   └── accountsRoutes.ts          # HTTP routes and response mapping
├── services/
│   ├── accountsService.ts         # Account data access
│   └── transactionsService.ts     # Transaction business logic and balance updates
├── validators/
│   └── transactions.ts            # Request/query validation
├── types/
│   └── banking.ts                 # Backend domain types
└── utils/
    └── AppError.ts                # HTTP-aware application errors
```

## Running the Application

Install dependencies:

```bash
npm run install-all
```

Start both frontend and backend:

```bash
npm run dev
```

Application URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Verification

Build commands:

```bash
cd server && npm run build
cd client && npm run build
```

Direct backend behavior verification:

- Seeded accounts load successfully.
- Paginated transaction reads return expected transaction totals.
- Creating a deposit updates the source account balance.

## Remaining Production Improvements

This meets the assessment scope, but production hardening would still include:

- Persistent database instead of in-memory SQLite.
- Authentication and authorization.
- Request logging and observability.
- Automated unit/integration tests.
- API documentation/OpenAPI.
- Rate limiting and security middleware.
