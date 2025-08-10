import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import TransactionTypes "../schema";

module {
    // Validation result type
    public type ValidationResult = {
        #Valid;
        #Invalid : Text;
    };

    // Bitcoin address validation
    public func validateBitcoinAddress(address : Text) : ValidationResult {
        if (address.size() < 26 or address.size() > 90) {
            return #Invalid("Bitcoin address must be between 26 and 90 characters");
        };
        
        if (not (Text.startsWith(address, #text "1") or 
                 Text.startsWith(address, #text "3") or 
                 Text.startsWith(address, #text "bc1"))) {
            return #Invalid("Invalid Bitcoin address format. Must start with 1, 3, or bc1");
        };
        
        #Valid
    };

    // Principal validation
    public func validatePrincipal(principal : Principal) : ValidationResult {
        let principalText = Principal.toText(principal);
        if (principalText.size() == 0) {
            return #Invalid("Principal cannot be empty");
        };
        
        if (principalText == "2vxsx-fae") {
            return #Invalid("Anonymous principal not allowed");
        };
        
        #Valid
    };

    // Amount validation
    public func validateAmount(amount : Nat) : ValidationResult {
        if (amount == 0) {
            return #Invalid("Amount must be greater than 0");
        };
        
        if (amount > 1_000_000_000_000_000) { // 1 quadrillion e8s = 10 million ICP
            return #Invalid("Amount too large. Maximum allowed: 10,000,000 ICP");
        };
        
        #Valid
    };

    // Percentage validation
    public func validatePercentage(percentage : Nat) : ValidationResult {
        if (percentage == 0) {
            return #Invalid("Percentage must be greater than 0");
        };
        
        if (percentage > 100) {
            return #Invalid("Percentage cannot exceed 100%");
        };
        
        #Valid
    };

    // Title validation
    public func validateTitle(title : Text) : ValidationResult {
        if (title.size() == 0) {
            return #Invalid("Title cannot be empty");
        };
        
        if (title.size() > 200) {
            return #Invalid("Title too long. Maximum 200 characters");
        };
        
        // Check for invalid characters
        if (Text.contains(title, #char '\n') or Text.contains(title, #char '\t')) {
            return #Invalid("Title contains invalid characters");
        };
        
        #Valid
    };

    // Nickname validation
    public func validateNickname(nickname : Text) : ValidationResult {
        if (nickname.size() == 0) {
            return #Invalid("Nickname cannot be empty");
        };
        
        if (nickname.size() > 50) {
            return #Invalid("Nickname too long. Maximum 50 characters");
        };
        
        // Check for invalid characters
        if (Text.contains(nickname, #char '\n') or Text.contains(nickname, #char '\t')) {
            return #Invalid("Nickname contains invalid characters");
        };
        
        #Valid
    };

    // Participant validation
    public func validateParticipant(participant : TransactionTypes.ParticipantShare) : ValidationResult {
        // Validate principal
        switch (validatePrincipal(participant.principal)) {
            case (#Invalid(error)) return #Invalid("Invalid participant principal: " # error);
            case (#Valid) {};
        };
        
        // Validate amount
        switch (validateAmount(participant.amount)) {
            case (#Invalid(error)) return #Invalid("Invalid participant amount: " # error);
            case (#Valid) {};
        };
        
        // Validate nickname
        switch (validateNickname(participant.nickname)) {
            case (#Invalid(error)) return #Invalid("Invalid participant nickname: " # error);
            case (#Valid) {};
        };
        
        // Validate percentage
        switch (validatePercentage(participant.percentage)) {
            case (#Invalid(error)) return #Invalid("Invalid participant percentage: " # error);
            case (#Valid) {};
        };
        
        // Validate Bitcoin address if provided
        switch (participant.bitcoinAddress) {
            case (?address) {
                switch (validateBitcoinAddress(address)) {
                    case (#Invalid(error)) return #Invalid("Invalid Bitcoin address: " # error);
                    case (#Valid) {};
                };
            };
            case null {};
        };
        
        #Valid
    };

    // Participants list validation
    public func validateParticipants(participants : [TransactionTypes.ParticipantShare]) : ValidationResult {
        if (participants.size() == 0) {
            return #Invalid("At least one participant is required");
        };
        
        if (participants.size() > 10) {
            return #Invalid("Maximum 10 participants allowed");
        };
        
        // Validate each participant
        for (participant in participants.vals()) {
            switch (validateParticipant(participant)) {
                case (#Invalid(error)) return #Invalid(error);
                case (#Valid) {};
            };
        };
        
        // Check for duplicate principals
        var principals : [Principal] = [];
        for (participant in participants.vals()) {
            principals := Array.append(principals, [participant.principal]);
        };
        
        // Check for duplicates
        for (i in principals.keys()) {
            for (j in principals.keys()) {
                if (i != j and Principal.equal(principals[i], principals[j])) {
                    return #Invalid("Duplicate participant principal: " # Principal.toText(participants[i].principal));
                };
            };
        };
        
        // Validate total percentage
        let totalPercentage = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            participants,
            0,
            func(acc, p) { acc + p.percentage }
        );
        
        if (totalPercentage != 100) {
            return #Invalid("Total percentage must equal 100%. Current total: " # Nat.toText(totalPercentage) # "%");
        };
        
        #Valid
    };

    // Escrow creation validation
    public func validateEscrowCreation(
        caller : Principal,
        participants : [TransactionTypes.ParticipantShare],
        title : Text
    ) : ValidationResult {
        // Validate caller
        switch (validatePrincipal(caller)) {
            case (#Invalid(error)) return #Invalid("Invalid caller: " # error);
            case (#Valid) {};
        };
        
        // Validate title
        switch (validateTitle(title)) {
            case (#Invalid(error)) return #Invalid("Invalid title: " # error);
            case (#Valid) {};
        };
        
        // Validate participants
        switch (validateParticipants(participants)) {
            case (#Invalid(error)) return #Invalid("Invalid participants: " # error);
            case (#Valid) {};
        };
        
        // Check if caller is trying to send to themselves
        for (participant in participants.vals()) {
            if (Principal.equal(caller, participant.principal)) {
                return #Invalid("Cannot send to your own address");
            };
        };
        
        #Valid
    };

    // Transaction ID validation
    public func validateTransactionId(transactionId : Text) : ValidationResult {
        if (transactionId.size() == 0) {
            return #Invalid("Transaction ID cannot be empty");
        };
        
        if (transactionId.size() > 100) {
            return #Invalid("Transaction ID too long");
        };
        
        // Check for valid format (timestamp-principal-suffix)
        let parts = Text.split(transactionId, #char '-');
        let partsArray = Iter.toArray(parts);
        
        if (partsArray.size() < 3) {
            return #Invalid("Invalid transaction ID format");
        };
        
        #Valid
    };

    // Page parameters validation
    public func validatePagination(_page : Nat, pageSize : Nat) : ValidationResult {
        if (pageSize == 0) {
            return #Invalid("Page size must be greater than 0");
        };
        
        if (pageSize > 100) {
            return #Invalid("Page size too large. Maximum 100");
        };
        
        #Valid
    };

    // Comprehensive validation for all inputs
    public func validateAll(
        caller : Principal,
        participants : [TransactionTypes.ParticipantShare],
        title : Text,
        amount : Nat
    ) : ValidationResult {
        // Validate caller
        switch (validatePrincipal(caller)) {
            case (#Invalid(error)) return #Invalid("Caller validation failed: " # error);
            case (#Valid) {};
        };
        
        // Validate title
        switch (validateTitle(title)) {
            case (#Invalid(error)) return #Invalid("Title validation failed: " # error);
            case (#Valid) {};
        };
        
        // Validate participants
        switch (validateParticipants(participants)) {
            case (#Invalid(error)) return #Invalid("Participants validation failed: " # error);
            case (#Valid) {};
        };
        
        // Validate total amount
        let totalAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            participants,
            0,
            func(acc, p) { acc + p.amount }
        );
        
        if (totalAmount != amount) {
            return #Invalid("Total participant amounts (" # Nat.toText(totalAmount) # ") must equal escrow amount (" # Nat.toText(amount) # ")");
        };
        
        #Valid
    };
};
