// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TenderSeal {
    address public relayer;

    struct Bid {
        string bidId;
        address vendor;
        string commitmentHash;
        bool revealed;
    }

    struct Tender {
        string tenderId;
        uint256 commitDeadline;
        string winningBidId;
        string finalScore;
        bytes32 scoringPolicyHash;
        bytes32 evaluationHash;
        bytes32 tieBreakEvidenceHash;
        bool tied;
        bool finalized;
    }

    mapping(string => Tender) public tenders;
    // tenderId => (bidId => Bid)
    mapping(string => mapping(string => Bid)) public tenderBids;

    event TenderCreated(string tenderId, uint256 commitDeadline, bytes32 scoringPolicyHash);
    event BidCommitted(string tenderId, string bidId, address vendor, string commitmentHash);
    event RevealAttested(string tenderId, string bidId);
    event TenderTied(string tenderId, bytes32 candidateBidIdsHash, bytes32 evaluationHash);
    event TenderFinalized(string tenderId, string winningBidId, string finalScore, bytes32 evaluationHash, bytes32 tieBreakEvidenceHash);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can perform this action");
        _;
    }

    constructor() {
        relayer = msg.sender;
    }

    function createTender(string memory tenderId, uint256 commitDeadline, bytes32 scoringPolicyHash) external onlyRelayer {
        require(tenders[tenderId].commitDeadline == 0, "Tender already exists");
        tenders[tenderId] = Tender({
            tenderId: tenderId,
            commitDeadline: commitDeadline,
            winningBidId: "",
            finalScore: "",
            scoringPolicyHash: scoringPolicyHash,
            evaluationHash: bytes32(0),
            tieBreakEvidenceHash: bytes32(0),
            tied: false,
            finalized: false
        });
        emit TenderCreated(tenderId, commitDeadline, scoringPolicyHash);
    }

    function commitBid(string memory tenderId, string memory bidId, string memory commitmentHash) external {
        Tender memory tender = tenders[tenderId];
        require(tender.commitDeadline > 0, "Tender does not exist");
        require(block.timestamp <= tender.commitDeadline, "Commit deadline passed");
        
        require(tenderBids[tenderId][bidId].vendor == address(0), "Bid already committed");

        tenderBids[tenderId][bidId] = Bid({
            bidId: bidId,
            vendor: msg.sender,
            commitmentHash: commitmentHash,
            revealed: false
        });

        emit BidCommitted(tenderId, bidId, msg.sender, commitmentHash);
    }

    function attestReveal(string memory tenderId, string memory bidId) external onlyRelayer {
        require(!tenders[tenderId].finalized, "Tender already finalized");
        require(tenderBids[tenderId][bidId].vendor != address(0), "Bid does not exist");
        require(!tenderBids[tenderId][bidId].revealed, "Already revealed");

        tenderBids[tenderId][bidId].revealed = true;
        emit RevealAttested(tenderId, bidId);
    }

    function recordTie(string memory tenderId, bytes32 candidateBidIdsHash, bytes32 evaluationHash) external onlyRelayer {
        require(!tenders[tenderId].finalized, "Tender already finalized");
        require(tenders[tenderId].commitDeadline > 0, "Tender does not exist");
        require(!tenders[tenderId].tied, "Tie already recorded");

        tenders[tenderId].tied = true;
        tenders[tenderId].evaluationHash = evaluationHash;

        emit TenderTied(tenderId, candidateBidIdsHash, evaluationHash);
    }

    function finalizeTender(
        string memory tenderId,
        string memory winningBidId,
        string memory finalScore,
        bytes32 evaluationHash
    ) external onlyRelayer {
        require(!tenders[tenderId].finalized, "Tender already finalized");
        require(tenders[tenderId].commitDeadline > 0, "Tender does not exist");
        require(!tenders[tenderId].tied, "Tender requires tie resolution");

        _finalizeTender(tenderId, winningBidId, finalScore, evaluationHash, bytes32(0));
    }

    function resolveTie(
        string memory tenderId,
        string memory winningBidId,
        string memory finalScore,
        bytes32 tieBreakEvidenceHash
    ) external onlyRelayer {
        require(!tenders[tenderId].finalized, "Tender already finalized");
        require(tenders[tenderId].tied, "Tender is not tied");

        _finalizeTender(tenderId, winningBidId, finalScore, tenders[tenderId].evaluationHash, tieBreakEvidenceHash);
    }

    function _finalizeTender(
        string memory tenderId,
        string memory winningBidId,
        string memory finalScore,
        bytes32 evaluationHash,
        bytes32 tieBreakEvidenceHash
    ) private {

        tenders[tenderId].winningBidId = winningBidId;
        tenders[tenderId].finalScore = finalScore;
        tenders[tenderId].evaluationHash = evaluationHash;
        tenders[tenderId].tieBreakEvidenceHash = tieBreakEvidenceHash;
        tenders[tenderId].finalized = true;

        emit TenderFinalized(tenderId, winningBidId, finalScore, evaluationHash, tieBreakEvidenceHash);
    }
}
