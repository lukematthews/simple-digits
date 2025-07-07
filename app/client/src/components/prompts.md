Prompts.

For this data model, create a React app that manages budgets. All of the editing is live and data changes are emitted via WebSockets. Redux should be used for a centralised state.

A budget has a name.
A budget has many months.

A month:
- Has a name.
- Has many accounts.
- Has many transactions.
- Is either started or not started.
- Has a starting balance (currency)
- Has a closing balance (currency)
- Is ordered by position

An Account:
- Has a name
- Has a balance (currency)

A Transaction:
- Has a description
- Has a date
- Has an amount (currency)
- Is paid or not paid

Pages:
  Home page:
  - Displays the available budgets as cards. Each budget card has a button to open the budget
  Budget:
  - Has the name of the budget and the currently selected month as a heading
  - Has a tab control for selecting a month. The tab control will be a medium size
  
The content of the month tab is:
  MonthDetails
    - The starting balance: A read only input formatted as AUD.
    - The closing balance: A read only input formatted as AUD.
    - A slider indicating whether or not the month is started.
  Accounts
    The list of accounts for the month. The user will be able to add and delete accounts.
    - An account should have a name input and a balance input. Any changes to these values should be debounced and emit a message to the server when modified
  Transactions
    The list of transactions for the month. The user will be able to add and delete transactions.
    Transactions are sorted automatically by date and then value descending

Starting and closing balances.
The rules for calculating the starting balance are:
- If the month is started, the starting balance is the sum of the account balances.
- If the month is not started, it is the closing balance of the previous month.
The rules for closing balance are:
- It is the starting balance plus the total of all the unpaid transactions for the month.

- The site should have URL routing.
"/" is the home page. The user will be presented with the available budgets.
"/:budget" is the page for the budget. The the month with the highest position is shown by default
"/:budget/:monthName" selects the tab for that month.



When do the month balances change?
- Transaction added / deleted. That month and future months.
- Transaction marked as paid. That month and future months.
- Transaction amount changed. That month and future months.
- Account added. That month and future months.
- Account deleted. That month and future months.
- Account balance changed. That month and future months.

Starting and closing balances should be stored against the month in state.


 
Starting from 1/7/2025 and finishing on 31/1/2026
budgetId: 1
userId: c702a2ce-0bbb-4cee-8334-ff2a546faf77
paid: false
Create transactions for Macquarie on the first day every month for $7000
Create transactions for Toorak on the 15th of every month for $-3708.70
Create transactions for Woodleigh on the 20th of every month for $-6794.50
Create transactions for Expenses weekly from 7/7/2025 for $-1037.57
Create transactions for Luke fortnightly from 10/7/2025 for $5816.18
Create transactions for Karen fortnightly from 1/7/2025 for $1680
Create transactions for Luke Leave fortnightly from 10/7/2025 for $-894.80
Create transactions for Bills weekly from 3/7/2025 for $-643.43
Create transactions for Bills - Annual weekly from 3/7/2025 for $-184.12
Create transactions for Bills - Boat weekly from 3/7/2025 for $-220.96


Bills budget:

Create transactions for Bills weekly from 7/8/2025 for $643.43
Create transactions for Bills - Boat weekly from 7/8/2025 for $220.96
Create transactions for Trailer on the first day every month for $-100
Create transactions for SYC Membership on the first day every month for $-133
Create transactions for Fran weekly from next Tuesday for $-250
Create transactions for Fran - TAC weekly from next Thursday for $197.60
Create transactions for Karen Train weekly on Mondays for $-33
Create transactions for Kids investments weekly from 4/7/2025 for $-45
Create transactions for Telstra monthly from 6/7/2025 for $-243.58
Create transactions for Annabel Gym fortnightly from 10/7/2025 for $-43.90
Create transactions for Water fortnightly from 11/7/2025 for $-79
Create transactions for Frank fortnightly from 11/7/2025 for $-164.50
Create transactions for Stan monthly from 18/7/2025 for $-17.00
Create transactions for Spotify monthly from 27/7/2025 for $-23.99
Create transactions for Netflix monthly from 26/7/2025 for $-18.99
Create transactions for Internet monthly from 28/7/2025 for $-99.00
Create transactions for Google Storage monthly from 30/7/2025 for $-14.98
Create transactions for Google One monthly from 19/7/2025 for $-2.99
Create transactions for CGU fortnightly from 10/7/2025 for $-79.70
Create transactions for Kids Phones monthly from 17/7/2025 for $-117
Create transactions for Powershop monthly from 11/7/2025 for $-273.18
Create transactions for Pet Insurance monthly from 17/7/2025 for $-65.88


Changes:
FIXED BUG -     Add Account: acts as an update instead of a create. Then fails because the id is not found.
FIXED FEATURE - Make account management like transactions.
FIXED BUG -     Adding a new month does not add it to the tabs
      BUG -     Performance
FIXED FEATURE - Move Add Transaction button to bottom as well.
FIXED FEATURE - Standardise currency input
      FEATURE - Sticky header / month detail
      FEATURE - Click to edit month name
      FEATURE - Click to edit transactions fields.
      FEATURE - Dropdown to change budgets
      FEATURE - Add date range to Add Month

Change this component so that you can create / update / delete accounts.
- Each account row should be editable.
- When a field loses focus, it should emit an update for that value
- Clicking Add Account should create new account row. There should be a Done / Save icon to then emit the create event.
- There should be a Trash icon to delete the account



Scaffold GPT prompts:

# 💸 Budget App – ChatGPT Prompt Guide

This guide provides curated prompts you can use with ChatGPT to assist in building a full-stack collaborative budget tracking app using:

- **Frontend:** React + Vite + Tailwind + Zustand
- **Backend:** NestJS + PostgreSQL + Passport.js (Google OAuth)
- **Realtime:** WebSockets
- **Deployment:** Railway or Docker

---

## ⚙️ Project Setup

**Prompt:**
> Create a monorepo budget app using Vite (React frontend), NestJS (backend), and PostgreSQL. Include Docker configuration to run everything locally. Organize the code with separate folders for `client/`, `server/`, and `database/`.

---

## 🔐 Google OAuth Authentication

**Prompt:**
> Set up Google OAuth2 login using Passport.js in NestJS. On successful login, issue access and refresh JWTs in HTTP-only cookies. Integrate with the frontend so the user stays authenticated across refreshes.

---

## 👥 User & Budget Sharing

**Prompt:**
> In a NestJS backend, implement user management with the ability to create, update, and share budgets between users. Each budget should store the list of user IDs with access, and allow one to be the owner.

---

## 🗃️ Data Model Design

**Prompt:**
> Define a relational data model in PostgreSQL for:  
> - Users  
> - Budgets  
> - Months (each Budget has many Months)  
> - Transactions (each Month has many Transactions)  
> - Accounts (each Month has many Accounts)  
>
> Include foreign keys, timestamps, and basic validation.

---

## 🔁 WebSocket Sync

**Prompt:**
> Implement WebSocket-based real-time updates in a NestJS gateway. When a transaction is added/updated/deleted, broadcast it to all clients subscribed to that budget.

---

## ⚡ Zustand State Management

**Prompt:**
> Create a Zustand store in React to manage the current user, budgets, selected budget, months, transactions, and accounts. Add a `reset()` function to clear all state on logout.

---

## 💻 UI Layout (React + Tailwind)

**Prompt:**
> Build a responsive UI in React and Tailwind. Show a top nav bar with the current budget name on the left and a profile avatar on the right. Clicking the avatar shows a dropdown with shared budgets and a logout button.

---

## 📊 Balance Calculations

**Prompt:**
> Write a utility function in TypeScript that calculates:  
> - Running balances for each transaction in a month  
> - Starting and closing balances for each month  
> Carry forward balances across months in order.

---

## 🗓 Recurring Transaction Generator

**Prompt:**
> Create a function that, given a start and end date, creates recurring transactions (weekly, fortnightly, monthly). Each transaction should include a description, date, amount, paid status, and account reference.

---

## 🔐 Auth Guards & Current User

**Prompt:**
> In a NestJS app, protect routes with `@UseGuards(AuthGuard('jwt'))`. Use a custom `@CurrentUser()` decorator to inject the currently authenticated user based on the access token from a cookie.

---

## 📬 Invite Links to Share Budgets

**Prompt:**
> Implement an invite link system to allow sharing a budget. The invite should be tied to a specific email, expire after 48 hours, and automatically add the user to the budget if they accept it.

---

## ✅ Bonus: Testing Strategy

**Prompt:**
> Suggest a testing approach for this budget app. Include unit tests for utility functions, integration tests for API endpoints using Supertest, and E2E tests using Playwright or Cypress.

