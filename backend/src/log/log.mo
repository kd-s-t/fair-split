import Text "mo:base/Text";
import Array "mo:base/Array";

module {
    public func appendLog(logs : [Text], message : Text) : [Text] {
        Array.append(logs, [message])
    };
    public func getLogs(logs : [Text]) : [Text] {
        logs
    };
} 