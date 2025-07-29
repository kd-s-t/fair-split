// Load real principals from principals.json
const principals = require('./principals.json');

const TEST_PRINCIPALS = [
  principals.user1, // Real user 1
  principals.user2, // Real user 2
  principals.user3, // Real user 3
  principals.user4, // Real user 4
];

async function initiateEscrows() {
  try {
    console.log("🚀 Starting escrow initiation script...");
    
    // Import the actor creation function from the frontend
    const { createSplitDappActor } = require("./frontend/src/lib/icp/splitDapp");
    const { Principal } = require("@dfinity/principal");
    
    const actor = await createSplitDappActor();
    
    // Get the current authenticated principal (whoever is logged in)
    const { AuthClient } = require("@dfinity/auth-client");
    const authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    
    if (!isAuthenticated) {
      console.log("⚠️  No user is currently logged in!");
      console.log("💡 Please log in to Internet Identity first, then run this script.");
      return;
    }
    
    const identity = authClient.getIdentity();
    const currentPrincipal = identity.getPrincipal();
    console.log("👤 Current logged in user:", currentPrincipal.toText());
    console.log("📝 This user will be the sender for all escrows");
    
    // Transaction 1: 1 sender -> 1 recipient
    console.log("\n📝 Creating escrow 1: 1 sender -> 1 recipient");
    const escrow1 = await actor.initiateEscrow(
      currentPrincipal, // Use current logged-in user as sender
      [
        {
          principal: Principal.fromText(TEST_PRINCIPALS[1]),
          amount: 100_000_000n, // 100 ICP (in e8s)
        }
      ],
      "Lunch split - 2 people"
    );
    console.log("✅ Escrow 1 created with ID:", escrow1);
    
    // Transaction 2: 1 sender -> 2 recipients
    console.log("\n📝 Creating escrow 2: 1 sender -> 2 recipients");
    const escrow2 = await actor.initiateEscrow(
      currentPrincipal, // Use current logged-in user as sender
      [
        {
          principal: Principal.fromText(TEST_PRINCIPALS[1]),
          amount: 150_000_000n, // 150 ICP (in e8s)
        },
        {
          principal: Principal.fromText(TEST_PRINCIPALS[2]),
          amount: 150_000_000n, // 150 ICP (in e8s)
        }
      ],
      "Dinner split - 3 people"
    );
    console.log("✅ Escrow 2 created with ID:", escrow2);
    
    // Transaction 3: 1 sender -> 3 recipients
    console.log("\n📝 Creating escrow 3: 1 sender -> 3 recipients");
    const escrow3 = await actor.initiateEscrow(
      currentPrincipal, // Use current logged-in user as sender
      [
        {
          principal: Principal.fromText(TEST_PRINCIPALS[1]),
          amount: 200_000_000n, // 200 ICP (in e8s)
        },
        {
          principal: Principal.fromText(TEST_PRINCIPALS[2]),
          amount: 200_000_000n, // 200 ICP (in e8s)
        },
        {
          principal: Principal.fromText(TEST_PRINCIPALS[3]),
          amount: 200_000_000n, // 200 ICP (in e8s)
        }
      ],
      "Party expenses - 4 people"
    );
    console.log("✅ Escrow 3 created with ID:", escrow3);
    
    console.log("\n🎉 All escrows created successfully!");
    console.log("📊 Summary:");
    console.log("- Escrow 1:", escrow1, "(1 recipient)");
    console.log("- Escrow 2:", escrow2, "(2 recipients)");
    console.log("- Escrow 3:", escrow3, "(3 recipients)");
    
  } catch (error) {
    console.error("❌ Error creating escrows:", error);
  }
}

// Run the script
initiateEscrows(); 