# Reputation System Implementation

## Overview

The reputation system has been implemented in `backend/src/main.mo` to detect and prevent fraud patterns, particularly repeated quick refunds. The system tracks user behavior and applies reputation penalties/bonuses based on their actions.

## Core Functions

### Sender Functions
- **`initiateEscrow`**: Create a new escrow transaction
- **`releaseSplit`**: Release funds to all approved recipients

### Receiver Functions  
- **`recipientApproveEscrow`**: Approve an escrow transaction
- **`recipientDeclineEscrow`**: Decline an escrow transaction (immediate refund)
- **`cancelSplit`**: Cancel pending transactions

## Key Features

### 1. Reputation Tracking
- **Initial Reputation**: 100 points for new users
- **Maximum Reputation**: 200 points
- **Minimum for Escrow**: 50 points required to create escrows

### 2. Fraud Detection
- **Quick Refund Detection**: Flags users who create and immediately decline escrows within 5 minutes
- **Fraud Threshold**: 3 suspicious activities within the time window trigger fraud flagging
- **Time Window**: 300 seconds (5 minutes) for quick refund detection

### 3. Reputation Penalties/Bonuses
- **Quick Refund Penalty**: -10 reputation points
- **Normal Decline Penalty**: -5 reputation points  
- **Successful Transaction Bonus**: +2 reputation points

## Implementation Details

### Data Structures
```motoko
// Reputation tracking
transient let reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
transient let fraudHistory = HashMap.HashMap<Principal, [Nat]>(10, Principal.equal, Principal.hash);
transient let transactionHistory = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
```

### Transaction Status Types
```motoko
public type ToEntry = {
    principal : Principal;
    name : Text;
    amount : Nat;
    status : { #pending; #approved; #declined };
};
```

### Key Functions

#### `getUserReputation(user: Principal): Nat`
Returns the current reputation score for a user.

#### `updateReputation(user: Principal, change: Int)`
Updates user reputation with bounds checking (0-200).

#### `detectFraudPattern(user: Principal, currentTime: Nat): Bool`
Checks if user has suspicious activity patterns within the time window.

#### `canCreateEscrow(user: Principal): Bool`
Verifies if user has sufficient reputation to create escrows.

#### `recordFraudActivity(user: Principal, timestamp: Nat)`
Records a fraud activity timestamp for pattern detection.

## Public API Functions

### Query Functions
- `getUserReputationScore(user: Principal): async Nat`
- `isUserFlaggedForFraud(user: Principal): async Bool`
- `canUserCreateEscrow(user: Principal): async Bool`
- `getFraudHistory(user: Principal): async [Nat]`
- `getReputationStats(user: Principal): async { reputation: Nat; isFlagged: Bool; canCreateEscrow: Bool; fraudCount: Nat }`

### Core Transaction Functions
- `initiateEscrow(caller: Principal, participants: [ParticipantShare], title: Text): async Text`
- `recipientApproveEscrow(sender: Principal, txId: Text, recipient: Principal): async ()`
- `recipientDeclineEscrow(sender: Principal, idx: Nat, recipient: Principal): async ()`
- `releaseSplit(caller: Principal, txId: Text): async ()`
- `cancelSplit(caller: Principal): async ()`

### Admin Functions
- `resetUserReputation(user: Principal, caller: Principal): async ()` - Admin only

## Fraud Detection Logic

1. **Quick Refund Detection**: When a user creates an escrow and it gets declined within 5 minutes, it's recorded as suspicious activity.

2. **Pattern Recognition**: If a user has 3 or more suspicious activities within the 5-minute window, they are flagged for fraud.

3. **Reputation Impact**: Quick refunds result in larger reputation penalties (-10) compared to normal declines (-5).

4. **Escrow Restrictions**: Users with reputation below 50 cannot create new escrows.

5. **Fraud Flagging**: Users with detected fraud patterns are blocked from creating escrows until their reputation improves.

## Usage Examples

### Checking User Reputation
```motoko
let userRep = await SplitDApp.getUserReputationScore(user);
let canCreate = await SplitDApp.canUserCreateEscrow(user);
let isFlagged = await SplitDApp.isUserFlaggedForFraud(user);
```

### Getting Comprehensive Stats
```motoko
let stats = await SplitDApp.getReputationStats(user);
// Returns: { reputation: Nat, isFlagged: Bool, canCreateEscrow: Bool, fraudCount: Nat }
```

## Security Considerations

1. **Admin Controls**: Only admin can reset user reputation
2. **Immutable History**: Fraud history is preserved for pattern detection
3. **Bounded Reputation**: Reputation is clamped between 0-200 to prevent gaming
4. **Time-based Detection**: Uses absolute timestamps for accurate fraud detection

## Future Enhancements

1. **Reputation Decay**: Gradual reputation recovery over time
2. **Advanced Patterns**: Detection of other fraud patterns
3. **Community Reporting**: Allow users to report suspicious behavior
4. **Reputation Tiers**: Different privileges based on reputation levels
5. **Appeal System**: Allow users to appeal fraud flags 