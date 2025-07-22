# Backend Canister (Motoko)
This folder contains the Motoko smart contract (canister) for the Split DApp.

## Deploy Locally

```bash
dfx deploy split_dapp --mode=reinstall --argument "(principal \"$(dfx identity get-principal)\")"
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
