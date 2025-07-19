import Test "mo:base/Test";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

// Import the module you want to test (if using modules)
// OR test inline logic

actor {

  // Example function to test
  func split(amount: Nat, count: Nat) : Nat {
    amount / count
  };

  // Define a test case
  public func test_split_basic() : async Test.Result {
    let result = split(1000, 4);
    if (result == 250) {
      return #ok;
    } else {
      return #fail("Expected 250, got " # Nat.toText(result));
    }
  };

  // Another test
  public func test_split_zero() : async Test.Result {
    try {
      ignore split(1000, 0);
      return #fail("Expected trap for divide-by-zero");
    } catch e {
      return #ok;
    }
  };
};
