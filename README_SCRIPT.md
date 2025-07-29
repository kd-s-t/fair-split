# SplitDApp Escrow Creation Script

This script creates 3 test escrow transactions with different numbers of recipients to test the SplitDApp functionality.

## 📋 Prerequisites

1. **Deploy the backend canister** and get the canister ID
2. **Update the canister ID** in `frontend/src/lib/icp/splitDapp.ts`
3. **Install dependencies** in the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

## 🚀 Running the Script

1. **Navigate to the project root**:
   ```bash
   cd /path/to/splitsafe
   ```

2. **Run the script**:
   ```bash
   node script.js
   ```

## 📊 What the Script Does

The script creates 3 escrow transactions:

### **Escrow 1: 1 Sender → 1 Recipient**
- **Title**: "Lunch split - 2 people"
- **Amount**: 100 ICP per recipient
- **Total**: 100 ICP

### **Escrow 2: 1 Sender → 2 Recipients**
- **Title**: "Dinner split - 3 people"
- **Amount**: 150 ICP per recipient
- **Total**: 300 ICP

### **Escrow 3: 1 Sender → 3 Recipients**
- **Title**: "Party expenses - 4 people"
- **Amount**: 200 ICP per recipient
- **Total**: 600 ICP

## 🔧 Customization

### **Change Test Principals**
The script automatically loads principals from `principals.json`. To use different principals, edit the `principals.json` file:
```json
{
  "user1": "your-principal-1",
  "user2": "your-principal-2", 
  "user3": "your-principal-3",
  "user4": "your-principal-4"
}
```

### **Change Amounts**
Modify the `amount` values in the script:
```javascript
amount: 100_000_000n, // 100 ICP (in e8s)
```

### **Change Titles**
Update the title strings:
```javascript
"Your custom title here"
```

## 📝 Expected Output

```
🚀 Starting escrow initiation script...

📝 Creating escrow 1: 1 sender -> 1 recipient
✅ Escrow 1 created with ID: 1234567890-abc-def

📝 Creating escrow 2: 1 sender -> 2 recipients  
✅ Escrow 2 created with ID: 1234567891-abc-def

📝 Creating escrow 3: 1 sender -> 3 recipients
✅ Escrow 3 created with ID: 1234567892-abc-def

🎉 All escrows created successfully!
📊 Summary:
- Escrow 1: 1234567890-abc-def (1 recipient)
- Escrow 2: 1234567891-abc-def (2 recipients)  
- Escrow 3: 1234567892-abc-def (3 recipients)
```

## ⚠️ Important Notes

1. **Authentication**: The script uses the currently logged-in Internet Identity account
2. **Sender**: Whoever is logged in will be the sender for all escrows
3. **Recipients**: Uses real principals from `principals.json` as recipients
4. **Canister ID**: Make sure the canister ID is correctly set in the frontend
5. **Network**: Ensure you're connected to the correct network (local/mainnet)

## 🐛 Troubleshooting

- **Authentication Error**: Make sure you're logged in to Internet Identity
- **Canister Not Found**: Verify the canister ID is correct
- **Network Error**: Check your internet connection and network settings 