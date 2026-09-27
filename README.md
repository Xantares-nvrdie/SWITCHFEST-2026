<div align="center">
  <img src="./public/assets/logo-black.png" alt="TenderSeal Logo" width="120" />
  <br/>
  <h1>TenderSeal</h1>
  <p><b>Decentralized & Zero-Knowledge e-Procurement System</b></p>
</div>

<br/>

TenderSeal is an advanced e-Procurement platform that solves corruption, tender manipulation, and collusion using **Zero-Knowledge cryptography** and a **Commit-Reveal Scheme**. 

Built to ensure absolute fairness, no party (not even Server Administrators) can view participants' bids before the tender deadline.

## 🎯 Key Features

- **Cryptographic Commit-Reveal**
  Bids are encrypted locally on the browser (Client-Side) using AES-GCM 256-bit. Only cryptographic hashes are sent to the server.
- **Hybrid Blockchain Audit**
  Tender statuses and commitment hashes are immutably recorded on-chain via EVM Smart Contracts for public auditing.
- **Automated Z-Score Engine**
  The system calculates and ranks the best vendor transparently using standardized Z-Score formulas after the decryption phase.
- **Zero-Knowledge Architecture**
  TenderSeal acts strictly as a relayer. Private decryption PINs remain offline with the vendors.
- **Role-Based Access Control**
  Dedicated dashboards and permission scoping for System Admins, Procurement Officers, and Vendors.

## 💻 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** ElysiaJS (Bun Environment)
- **Database:** PostgreSQL + Drizzle ORM
- **Storage:** Supabase Storage
- **Authentication:** Better-Auth
- **Web3 / Blockchain:** Ethers.js, Solidity
- **Cryptography:** Web Crypto API (AES-GCM, SHA-256)

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (Runtime & Package Manager)
- PostgreSQL Database (Local or Cloud like Supabase/Neon)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/TenderSeal.git
   cd TenderSeal
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your Supabase, Postgres, and Web3 RPC credentials.

4. **Database Migration**
   ```bash
   bunx drizzle-kit push
   ```

5. **Run the Development Server**
   ```bash
   bun run dev
   ```
   *The application will be available at `http://localhost:3000`.*

## 🔒 Security Guarantee
All highly sensitive data, including price bids and tender documents, are encrypted symmetrically with Argon2id Key Derivation before ever leaving the user's device. 

---
*Built with 💙 for absolute transparency.*
