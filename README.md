# Banking Dashboard Technical Assessment

A deliberately basic banking dashboard application designed as a starting point for technical assessment. The project provides candidates with a foundation to demonstrate their skills in both frontend and backend development.

## Project Overview

This is an intentionally basic implementation with clear areas for improvement. Candidates are expected to identify issues, suggest improvements, and implement solutions.

### Current Implementation

- React + TypeScript frontend with basic account display
- Node.js + Express backend with simple REST API
- SQLite in-memory database
- Basic styling and component structure
- Type-safe implementation

### Key Areas for Improvement

#### Frontend

- [ ] Enhanced visual design and UX
- [ ] Responsive layout improvements
- [ ] Component structure optimization
- [ ] Loading states and animations
- [ ] Error handling and user feedback
- [ ] Form validation
- [ ] Authentication UI
- [ ] Transaction history view
- [ ] Filtering and sorting capabilities
- [ ] Accessibility improvements
- [ ] Unit and integration tests
- [ ] Performance optimizations

#### Backend

- [ ] Persistent database implementation
- [ ] Authentication and authorization
- [ ] Input validation and sanitization
- [ ] Error handling improvements
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] API documentation
- [ ] Logging system
- [ ] Unit and integration tests
- [ ] Security improvements

## Technical Stack

### Frontend

- React 18
- TypeScript
- CSS Modules
- Vite
- Modern ES6+ features

### Backend

- Node.js
- Express
- TypeScript
- SQLite (in-memory)
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install all dependencies (root, client, and server)
npm run install-all
```

### Running the Application

```bash
# Start both frontend and backend servers
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Current Implementation

- GET /api/accounts - Get all accounts
- GET /api/accounts/:id - Get account by ID

### Potential Additional Endpoints

- POST /api/accounts - Create new account
- PUT /api/accounts/:id - Update account
- DELETE /api/accounts/:id - Delete account
- GET /api/accounts/:id/transactions - Get account transactions
- POST /api/auth/login - User authentication
- GET /api/users/profile - Get user profile

## Project Structure

```
/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types/       # TypeScript interfaces
│   │   ├── api/         # API integration
│   │   └── styles/      # CSS modules
│   └── public/
└── server/               # Node.js backend
    └── src/
        ├── routes/      # API routes
        ├── services/    # Business logic
        └── types/       # TypeScript interfaces
```

## Assessment Goals

This project serves as a foundation for candidates to demonstrate:

1. Code quality and organization
2. Problem-solving approach
3. Technical decision-making
4. Understanding of full-stack development
5. Attention to detail
6. Knowledge of best practices
7. Ability to identify and implement improvements

## Notes for Candidates

- The current implementation is deliberately basic
- Focus on both technical improvements and code quality
- Consider real-world production requirements
- Document your changes and reasoning
- Think about scalability and maintainability
- Consider security implications
- Implement proper error handling
- Add appropriate tests
- Follow best practices for your chosen technologies





Jun 3
Walkthrough - Banking Dashboard Assessment
We have successfully completed all the backend implementation, frontend enhancements, and the Real Time Analytics Dashboard system design.

1. System Design: Real Time Analytics Dashboard
We completed a comprehensive multi-region real-time ingestion and query architecture capable of handling 10,000 events per second. The complete design details are logged in the 
implementation_plan.md
 document.

Key architectural components include:

Ingestion Gateway: Auto-scaling stateless tier behind load balancers.
Apache Kafka: Distributed commit log partitioning events by ID to scale write throughput.
Apache Flink: Real-time streaming processor for sliding window aggregates.
Redis Cluster: In-memory caching for real-time analytics.
ClickHouse: Highly compressed columnar database for historical queries.
WebSockets: Real-time push updates to clients.
2. Backend Implementation (Transaction Endpoints)
The backend API was enhanced to support account transactions with persistent data consistency and strict validation logic.

File Modified
server/src/index.ts
Implemented Endpoints
POST /api/accounts/:id/transactions
Executes DEPOSIT, WITHDRAWAL, and TRANSFER.
Performs database transactions (BEGIN EXCLUSIVE TRANSACTION ... COMMIT / ROLLBACK) to update account balances and write transactions atomically.
For transfers, updates both source (debit) and destination (credit) account balances and writes corresponding transaction logs to both accounts.
Validation checks: non-positive amounts, empty descriptions, self-transfers, invalid accounts, and insufficient balance.
GET /api/accounts/:id/transactions
Supports pagination via page and limit.
Allows sorting by createdAt or amount in ASC or DESC order.
Filters by transaction types (DEPOSIT, WITHDRAWAL, TRANSFER).
3. Frontend Enhancements (Premium Interface)
We replaced the basic frontend layout with a premium, state-of-the-art UI matching Aura Bank's high-end wealth dashboard theme.

Files Modified & Created
client/src/types.ts
client/src/api.ts
client/src/index.css
client/src/App.css
client/src/components/AccountList.tsx
client/src/components/AccountList.module.css
client/src/components/TransactionHistory.tsx
client/src/components/TransactionHistory.module.css
client/src/components/NewTransactionForm.tsx
client/src/components/NewTransactionForm.module.css
Implemented UI Features
Google Fonts Integration: Imported Outfit for headings and Plus Jakarta Sans for clean UI typography.
Glassmorphic Navbar: Dynamic header with background blur and linear gradient brand text.
Interactive Cards: Visual indicators for selected accounts, clean badges (Checking / Savings), and hover states.
Transaction Table: Fully sortable (by Date and Amount), filterable (by All, Deposits, Withdrawals, Transfers), and paginated transaction history table.
Interactive Form: Intuitive input forms for creating transactions. Dynamically displays the target account drop-down only for TRANSFER transactions, and filters out the current active account.
Available Balance Warning: Informs the user immediately (before submission) if they try to withdraw or transfer more money than is available in their active account.
Instant Updates: Successful transactions trigger a reload of accounts and a reload of the transaction history to immediately update the available balance and lists across the UI.
4. Verification Results
Backend Build: Compiles cleanly (ts-node-dev).
Client Build: Compiles cleanly with TypeScript check and Vite production bundle (tsc -b && vite build).
Functional Verify:
Seeded transaction records load on startup.
Balance updates persist in memory SQLite.
Pagination, type filter, and sort endpoints are tested and confirmed functional.