# Backend Canister (Motoko)

This folder contains the Motoko smart contract (canister) for the Split DApp.

## Prerequisites

- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- Motoko compiler (comes with DFX)

## Deploy Locally

```bash
dfx deploy
```

## Run Unit Tests

```bash
dfx test
```

## Directory Structure

- `src/` - Motoko source code and candid file
- `test/` - Motoko unit tests

## Update Candid Interface

If you change the `.did` file, run:

```bash
dfx generate
```

to update frontend bindings.

---

Feel free to copy, modify, or expand this template as needed for your project! If you want me to update the file for you, just say so.