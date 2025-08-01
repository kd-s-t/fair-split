import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module {
    // User Management Functions
    public func setNickname(
        names : HashMap.HashMap<Principal, Text>,
        principal : Principal,
        nickname : Text
    ) {
        names.put(principal, nickname);
    };

    public func getNickname(
        names : HashMap.HashMap<Principal, Text>,
        principal : Principal
    ) : ?Text {
        names.get(principal);
    };

    public func setCustomNickname(
        names : HashMap.HashMap<Principal, Text>,
        principal : Principal,
        nickname : Text
    ) {
        names.put(principal, nickname);
    };

    public func getCustomNickname(
        names : HashMap.HashMap<Principal, Text>,
        principal : Principal
    ) : ?Text {
        names.get(principal);
    };

    public func removeNickname(
        names : HashMap.HashMap<Principal, Text>,
        principal : Principal
    ) {
        names.delete(principal);
    };

    public func getAllNicknames(
        names : HashMap.HashMap<Principal, Text>
    ) : [(Principal, Text)] {
        let entries = Iter.toArray(names.entries());
        Array.map<(Principal, Text), (Principal, Text)>(
            entries,
            func(entry) { entry }
        )
    };
}; 