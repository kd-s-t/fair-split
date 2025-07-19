import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

actor BitSplit {

  // 👤 Admin of the canister (set on init)
  let owner: Principal = Principal.fromActor(BitSplit);

  // 💸 Split result type
  type Recipient = {
    name: Text;
    share: Nat;
  };

  // 🧠 Split record + caller tracking
  type SplitRecord = {
    total: Nat;
    recipients: [Recipient];
    createdBy: Principal;
  };

  // 🌾 All split operations (multi-user, append only)
  var allSplits: [SplitRecord] = [];

  // 📦 Stable storage
  stable var stableAllSplits: [SplitRecord] = [];

  /// 🔐 Only allow the owner to reset
  public shared ({ caller }) func reset() : async Text {
    if (caller != owner) {
      return "🚫 Unauthorized: only owner can reset.";
    };
    allSplits := [];
    return "✅ Cleared all split records.";
  };

  /// 💸 Split an amount among names evenly (validated)
  public shared ({ caller }) func split(amount: Nat, names: [Text]) : async [Recipient] {
    let count = names.size();
    if (count == 0) {
      Debug.print("⚠️ No recipients provided");
      return [];
    };

    let eachShare = amount / count;
    let recipients = Array.map(names, func(name) {
      { name = name; share = eachShare }
    });

    let record : SplitRecord = {
      total = amount;
      recipients = recipients;
      createdBy = caller;
    };

    allSplits := Array.append(allSplits, [record]);

    recipients
  };

  /// 📖 View all splits (public)
  public query func getAllSplits() : async [SplitRecord] {
    allSplits
  };

  /// 📖 View only your splits
  public shared ({ caller }) func getMySplits() : async [SplitRecord] {
    Array.filter(allSplits, func(r) { r.createdBy == caller })
  };

  /// 💾 Save state on upgrade
  system func preupgrade() {
    stableAllSplits := allSplits;
  };

  /// 🔁 Restore state after upgrade
  system func postupgrade() {
    allSplits := stableAllSplits;
  };
};
