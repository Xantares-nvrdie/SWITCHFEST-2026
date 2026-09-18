// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TenderSeal
 * @notice Secure Sealed Tendering Smart Contract for Commit-Reveal Procurement Integrity
 * @dev Stores cryptographic bid commitments and reveal attestations on-chain without exposing plaintext bids.
 */
contract TenderSeal {
    address public immutable owner;

    struct Commitment {
        string commitmentHash;
        address vendorWallet;
        uint256 timestamp;
        bool isRevealed;
        string revealHash;
    }

    // Mapping: keccak256(tenderId) => vendorWallet => Commitment
    mapping(bytes32 => mapping(address => Commitment)) private _commitments;

    // Events
    event BidCommitted(
        string indexed tenderId,
        address indexed vendor,
        string commitmentHash,
        uint256 timestamp
    );

    event RevealAttested(
        string indexed tenderId,
        address indexed vendor,
        string revealHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "TenderSeal: Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Records vendor bid commitment hash on-chain before commit deadline.
     * @param tenderId The unique identifier string of the tender
     * @param commitmentHash SHA-256 hash of (tenderId + vendorOrgId + payload + bidSalt)
     */
    function commitBid(string memory tenderId, string memory commitmentHash) external {
        bytes memory hashBytes = bytes(commitmentHash);
        require(hashBytes.length > 0, "TenderSeal: Empty commitment hash");

        bytes32 tenderKey = keccak256(abi.encodePacked(tenderId));
        Commitment storage existing = _commitments[tenderKey][msg.sender];
        require(bytes(existing.commitmentHash).length == 0, "TenderSeal: Commitment already submitted");

        _commitments[tenderKey][msg.sender] = Commitment({
            commitmentHash: commitmentHash,
            vendorWallet: msg.sender,
            timestamp: block.timestamp,
            isRevealed: false,
            revealHash: ""
        });

        emit BidCommitted(tenderId, msg.sender, commitmentHash, block.timestamp);
    }

    /**
     * @notice Attests valid bid reveal on-chain (executed by backend system relayer).
     * @param tenderId The unique identifier string of the tender
     * @param vendorWallet Address of the vendor whose bid was verified
     * @param revealHash Verification hash of the revealed plaintext bid
     */
    function recordRevealAttestation(
        string memory tenderId,
        address vendorWallet,
        string memory revealHash
    ) external {
        bytes32 tenderKey = keccak256(abi.encodePacked(tenderId));
        Commitment storage commit = _commitments[tenderKey][vendorWallet];
        require(bytes(commit.commitmentHash).length > 0, "TenderSeal: No commitment found for vendor");
        require(!commit.isRevealed, "TenderSeal: Bid already revealed");

        commit.isRevealed = true;
        commit.revealHash = revealHash;

        emit RevealAttested(tenderId, vendorWallet, revealHash, block.timestamp);
    }

    /**
     * @notice Queries commitment details for a given tender and vendor wallet.
     * @param tenderId The unique identifier string of the tender
     * @param vendorWallet Address of the vendor wallet
     */
    function getCommitment(string memory tenderId, address vendorWallet)
        external
        view
        returns (
            string memory commitmentHash,
            address vendor,
            uint256 timestamp,
            bool isRevealed,
            string memory revealHash
        )
    {
        bytes32 tenderKey = keccak256(abi.encodePacked(tenderId));
        Commitment memory commit = _commitments[tenderKey][vendorWallet];
        return (
            commit.commitmentHash,
            commit.vendorWallet,
            commit.timestamp,
            commit.isRevealed,
            commit.revealHash
        );
    }
}
