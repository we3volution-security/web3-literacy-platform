# Full-Stack Web3 Literacy Hub & Custom Access Control Engine

An educational civic technology platform designed to teach the fundamentals of decentralized applications (dApps), Web3, and emerging Central Bank Digital Currencies (CBDCs). The application has evolved from a complex, subscription-validated backend tracking matrix to an interactive Web3 sandbox.

## Key Architectural Frameworks Built

### 1. Dynamic Access Control & State Management
* **Strict Gatekeeping Logic:** Constructed backend validation systems checking real-time subscription lifecycle states (active, cancelled, expired) against incoming referral parameters. 
* **Database Isolation:** Implemented secure cross-CMS table querying to prevent race conditions or unauthorized access to platform parameters. 
* **Input Sanitization:** Used custom text-formatting parsers to scan incoming payloads, blocking abnormal string values or invalid link formations before reaching critical storage blocks.

### 2. Multi-Point Relational Identity Tracking
* **Cross-Table Mapping:** Engineered tracking scripts correlating transient URL parameters directly to individual authenticated user profiles at register milestones.
* **Algorithmic Asset Distribution:** Wrote processing functions utilizing dual-database checkpoints to dynamically resolve and route corresponding third-party referral assets based on historical invite link origins.

### 3. Interactive Web3 Test Sandbox (Current Version)
* **Wallet & Web3 Integration:** Managed client-side infrastructure connecting decentralized browser environments (MetaMask) to the Ethereum ecosystem.
* **Smart Contract Interaction:** Facilitated transaction broadcasting over the Sepolia Testnet, introducing users to reading blockchain ledgers and interacting with automated NFT minting contracts.

## Technology Stack Covered
* **Language:** JavaScript (ES6+)
* **Environments:** Wix Velo (Node.js backend execution context) & Web3 Core Integrations
* **Databases:** Relational CMS architecture with triggered backend hooks
* **Web3 Tooling:** MetaMask, Sepolia RPC Nodes, Smart Contract interactions

