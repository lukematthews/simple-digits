# 💰 Budget Application - Detailed Requirements

## 📦 Core Entities

### Budget
- **Fields**:
  - `id`
  - `userId`: Owner of the budget
  - `name`
  - `shortCode`: CamelCase code used in URL
- **Relations**:
  - `months[]`: List of months in the budget
  - `members[]`: `BudgetMember[]` with roles: `OWNER`, `EDITOR`, `VIEWER`
  - `invites[]`: `BudgetInvite[]`

---

### Month
- **Fields**:
  - `id`
  - `name`
  - `position`: Determines order
  - `fromDate`, `toDate`
  - `started`: Boolean
  - `startingBalance`
  - `closingBalance`
- **Behavior**:
  - Can be added, renamed, deleted
  - Can be reordered via **Move Up / Move Down** buttons
  - Duration set via date range picker

---

### Transaction
- **Fields**:
  - `id`
  - `description`
  - `date`
  - `amount`
  - `paid`
- **Behavior**:
  - Stored per `month` and `account`
  - Used to calculate running and month balances

---

### Account
- Represents categories like Bills, Salary, Expenses, etc.
- Used in transaction classification and balance calculations

---

### BudgetMember
- **Fields**:
  - `userId`, `budgetId`, `role` (`OWNER`, `EDITOR`, `VIEWER`)
- **Constraints**:
  - Unique by `(userId, budgetId)`
  - Controls access level per user

---

### BudgetInvite
- Represents a pending email invitation to collaborate
- Links to a budget, includes a role, and expires via token

---

## 🧠 AI-Powered Features (Prediction System)
- Detect recurring transactions
- Predict upcoming amounts and dates
- Detect anomalies in spending patterns
- Assign confidence scores
- Allow user feedback for training
- Smooth future projections

---

## 📋 Spreadsheet Forecasting Features
- Monthly tabs auto-generated
- Each tab contains:
  - Opening and closing balances
  - Running balances per transaction
- Balances color-coded:
  - 🔴 Red if negative
  - 🟢 Green if positive
- Forecasts projected **6 months ahead**
- Google Sheets integration:
  - Tabs for forecast months
  - Apps Script for prediction logic
- Control tab:
  - Tracks whether a month is `started`
  - Controls balance carry-over logic

---

## ⚙️ Functional Features

### Budget Wizard
- Step 1:
  - Enter `name` and auto-generate `shortCode`
- Step 2:
  - Add months
  - Set durations
  - Submit to create budget and navigate to it

### Rename Budget Dialog
- Same fields and behavior as the wizard
- Allows editing existing budget’s `name` and `shortCode`

### Month Editor UI
- List of months
- For each month:
  - Name input
  - Date range picker
  - Delete button
  - Reorder with **Move Up / Move Down**
- Add new months inline

---

## 👥 Collaboration

- Share budget with other users via **email invite**
- Invite flow:
  - User enters email
  - System sends invite with tokenized URL
  - On accept, user joins as a `BudgetMember`
- Role-based access control:
  - Guards in NestJS API

---

## 🧱 Tech Stack

| Area         | Tech              |
|--------------|-------------------|
| Frontend     | React + Vite      |
| UI Library   | ShadCN + Tailwind |
| Backend      | NestJS            |
| Database     | PostgreSQL        |
| Auth         | Google OAuth      |
| Realtime     | WebSockets        |
| Infrastructure | Docker (Monorepo) |

---

## 🛠 Developer Features

- Real-time sync via `budgetEvent` WebSocket messages
- Reordering logic uses `position` field
- Transactions support balance recalculation
- Drag-and-drop replaced with **up/down reordering**
- UI animations via Framer Motion

---

## 📝 Future Enhancements

- [ ] Export/import budgets (CSV or JSON)
- [ ] Audit log of changes
- [ ] Editable forecast parameters
- [ ] Filter transactions by account
