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
        bool finalized;
    }

    mapping(string => Tender) public tenders;
    // tenderId => (bidId => Bid)
    mapping(string => mapping(string => Bid)) public tenderBids;

    event TenderCreated(string tenderId, uint256 commitDeadline);
    event BidCommitted(string tenderId, string bidId, address vendor, string commitmentHash);
    event RevealAttested(string tenderId, string bidId);
    event TenderFinalized(string tenderId, string winningBidId, string finalScore);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can perform this action");
        _;
    }

    constructor() {
        relayer = msg.sender;
    }

    function createTender(string memory tenderId, uint256 commitDeadline) external onlyRelayer {
        require(tenders[tenderId].commitDeadline == 0, "Tender already exists");
        tenders[tenderId] = Tender({
            tenderId: tenderId,
            commitDeadline: commitDeadline,
            winningBidId: "",
            finalScore: "",
            finalized: false
        });
        emit TenderCreated(tenderId, commitDeadline);
    }

    function commitBid(string memory tenderId, string memory bidId, string memory commitmentHash) external {
        Tender memory tender = tenders[tenderId];
        require(tender.commitDeadline > 0, "Tender does not exist");
        
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

    function finalizeTender(string memory tenderId, string memory winningBidId, string memory finalScore) external onlyRelayer {
        require(!tenders[tenderId].finalized, "Tender already finalized");
        require(tenders[tenderId].commitDeadline > 0, "Tender does not exist");

        tenders[tenderId].winningBidId = winningBidId;
        tenders[tenderId].finalScore = finalScore;
        tenders[tenderId].finalized = true;

        emit TenderFinalized(tenderId, winningBidId, finalScore);
    }
}
