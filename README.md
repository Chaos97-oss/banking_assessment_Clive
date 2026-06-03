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
Our current impl plan

Implementation Plan - Banking Dashboard Assessment
This document outlines the system design for the Real Time Analytics Dashboard and the implementation steps for the Banking Dashboard backend and frontend enhancements.

Part 1: System Design (Real Time Analytics Dashboard)
We have chosen System A: Real Time Analytics Dashboard to design. Below is the comprehensive architecture, detailing scaling, failure handling, data flows, and performance numbers.

Architecture Diagram
You can import the following Mermaid diagram directly into Draw.io (using Arrange -> Insert -> Advanced -> Mermaid...):

Mermaid diagram
Component Specifications
1. Ingestion Service & API Gateway
Purpose: Receives incoming events from multiple data sources, performs lightweight authentication and schema validation, and writes them to the message broker.
Scaling Strategy: Horizontal scaling behind an Elastic Load Balancer (ELB). Stateless containers managed by Kubernetes (EKS) auto-scale based on CPU utilization and request count.
Failure Handling:
If an instance fails, the ELB routes traffic to remaining healthy instances.
Implements rate limiting (via token bucket algorithm in Redis) to prevent cascading failures.
Buffers messages locally (short term) if the downstream Kafka cluster becomes temporarily slow.
Performance Metrics:
Throughput: 10,000 events/sec. Average event size: 500 bytes. Aggregate input bandwidth: 5 MB/s.
Response Time: < 15ms for acknowledgement.
2. Apache Kafka (Message Broker)
Purpose: Acts as a highly durable, high-throughput, low-latency log stream that decouples the ingestion layer from the real-time processing and storage layers.
Scaling Strategy: Scale via partitioning. We partition by event_type or client_id across 3 availability zones. With 12 partitions, we can easily distribute load across 3-6 brokers.
Failure Handling:
Replication factor of 3 (min.insync.replicas=2) ensures zero data loss even if one broker fails.
Automatic leader election for partitions.
Performance Metrics:
Throughput: Can easily support 50,000+ events/sec.
Retention: Keep raw stream for 7 days. Storage needed: 5 MB/s * 86400s * 7 days = 3.02 TB.
3. Apache Flink / Spark Streaming (Real-time Processing)
Purpose: Consumes events from Kafka, performs rolling time-window aggregations (e.g., sliding 1-minute averages), anomaly detection, and filters events.
Scaling Strategy: Scale by increasing parallel tasks and workers in the Flink cluster. State is stored in RocksDB and checkpointed to S3.
Failure Handling:
Exactly-once processing guarantees via distributed checkpoints (Chandy-Lamport algorithm).
If a node dies, Flink restarts the task from the last successful checkpoint.
Performance Metrics:
Throughput: 10,000 events/sec.
Processing Latency: < 100ms.
4. Redis Cache Cluster
Purpose: Caches real-time hot metrics (e.g., current active users, last 5-minute transaction totals) for immediate API consumption.
Scaling Strategy: Redis Cluster with replication (1 primary, 1 replica per shard) spread across multiple shards.
Failure Handling: Automatic failover to replica via Redis Sentinel/Cluster consensus.
Performance Metrics:
Read latency: < 2ms.
Cache Size: 32GB RAM is more than enough for storing rolling pre-aggregated analytics.
5. ClickHouse (Analytical Database)
Purpose: Serves as the primary column-oriented database for storing historical events and performing complex ad-hoc analytics queries.
Scaling Strategy: ClickHouse Sharded Cluster. Shards are distributed across regions with replica groups for high availability.
Failure Handling: ReplicatedMergeTree engine handles automatic data replication between replica nodes. If a query node fails, the balancer redirects queries to another replica.
Performance Metrics:
Storage needs: 10,000 events/sec * 500 bytes = 5 MB/s uncompressed. ClickHouse column compression (~5x) reduces this to 1 MB/s. Daily storage: 1 MB/s * 86400s = 86.4 GB/day. Yearly storage: ~31.5 TB.
Query Response Time: Sub-second query response times for aggregations over millions of rows.
6. WebSocket Push Service
Purpose: Maintains persistent connections with active frontend clients to broadcast real-time analytics updates pushed from the Flink/Redis layer.
Scaling Strategy: Scaled horizontally. Connection state is stateless (clients subscribe to channels). A Redis Pub/Sub backplane broadcasts messages across all WebSocket instances.
Failure Handling: Clients automatically reconnect with exponential backoff.
Performance Metrics:
Capacity: Handles 100,000 concurrent client connections.
Part 2: Implementation Plan (Banking Dashboard)
We will implement the transaction backend and frontend components.

Proposed Changes
Backend Component (Server)
[MODIFY] 
server/src/index.ts
Update database initialization to create a transactions table:
sql

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  accountId TEXT,
  type TEXT CHECK(type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
  amount REAL,
  description TEXT,
  createdAt TEXT,
  targetAccountId TEXT,
  FOREIGN KEY(accountId) REFERENCES accounts(id)
)
Implement transaction seeding in insertSampleData to add recent transactions for John Doe (1001) and Jane Smith (1002) as specified in the prompt:
John Doe:
Jan 15: Salary deposit of $1,000 (DEPOSIT)
Jan 16: ATM withdrawal of $50 (WITHDRAWAL)
Jan 17: Transfer of $200 to Savings (TRANSFER, target 1002)
Jane Smith:
Jan 15: Investment return of $2,000 (DEPOSIT)
Jan 16: Online purchase debit of $100 (WITHDRAWAL)
Jan 17: Refund of $500 (DEPOSIT)
Implement transaction validation logic (e.g., validating positive amount, sufficient funds for WITHDRAWAL or TRANSFER, checking valid account IDs).
Implement endpoint: POST /api/accounts/:id/transactions
Needs to be wrapped in a database transaction (BEGIN TRANSACTION ... COMMIT / ROLLBACK).
For WITHDRAWAL or TRANSFER: check if the sender has sufficient balance.
Subtract from sender balance, add to receiver balance (for TRANSFER).
Create transaction records.
Implement endpoint: GET /api/accounts/:id/transactions?page=1&limit=10
Returns paginated transactions sorted by date.
Also supports filtering by type and sorting by amount/date (to support frontend features directly at API level).
Frontend Component (Client)
[MODIFY] 
client/src/types.ts
Add Transaction interface.
[MODIFY] 
client/src/api.ts
Add api helpers for creating a transaction and fetching paginated transactions.
[NEW] 
client/src/components/TransactionHistory.tsx
Create a component to display transactions table.
Features:
Pagination controls (Next/Prev, Current page indicator).
Sorting (by date and amount, ascending/descending).
Type filtering (All, Deposit, Withdrawal, Transfer).
Nice responsive layout and CSS module.
[NEW] 
client/src/components/NewTransactionForm.tsx
Create a component containing the form.
Inputs: Transaction type (DEPOSIT | WITHDRAWAL | TRANSFER), Amount, Description, and Destination Account (if TRANSFER).
Validation: client-side checks for negative/zero amounts, missing fields, or transferring to the same account.
Proper loading state and validation feedback (error/success banners).
[MODIFY] 
client/src/components/AccountList.tsx
Incorporate "View Transactions" buttons on cards.
Integrate TransactionHistory and NewTransactionForm components dynamically based on which account is currently selected.
When a new transaction is successfully submitted, update the balances in the main state instantly or trigger a reload.
[MODIFY] 
client/src/index.css
Update core design styling with an elegant, modern, high-quality dark/light mode gradient theme, smooth transitions, and premium typography.
Verification Plan
Automated Tests
Run the dev server and backend.
Use manual verification to test full user flow.
Manual Verification
Backend verification:
Test endpoint POST /api/accounts/1/transactions with DEPOSIT, WITHDRAWAL, and TRANSFER.
Verify the balance changes properly in the database.
Test GET endpoints with pagination limits.
Frontend verification:
Click on "View Transactions" for John Doe. Observe transaction history table, try sorting, filtering, and page navigation.
Open "New Transaction" form. Create a deposit. Verify the balance on the account card updates instantly.
Create a transfer of $500 from John Doe (1) to Jane Smith (2). Verify both account cards update balances accordingly.