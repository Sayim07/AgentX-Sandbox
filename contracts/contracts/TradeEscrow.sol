// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TradeEscrow
 * @notice Holds and releases funds ($CRED tokens) for AgentX simulated transactions and micro-services.
 */
contract TradeEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum EscrowStatus { Active, Released, Refunded, Disputed }

    struct Escrow {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 timeoutDuration; // in seconds
        EscrowStatus status;
    }

    IERC20 public immutable token;
    uint256 public nextEscrowId;

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timeoutAt
    );

    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    event EscrowDisputed(uint256 indexed escrowId, address indexed raisedBy);

    constructor(address tokenAddress, address initialOwner) Ownable(initialOwner) {
        require(tokenAddress != address(0), "TradeEscrow: invalid token address");
        token = IERC20(tokenAddress);
        nextEscrowId = 1;
    }

    /**
     * @notice Open a new escrow where caller is the buyer.
     * Tokens are transferred from msg.sender to this contract.
     * @param seller Address of the seller/service provider receiving funds.
     * @param amount Amount of tokens to deposit in escrow.
     * @param timeoutDuration Duration in seconds after which buyer can claim a refund if not released.
     */
    function openEscrow(
        address seller,
        uint256 amount,
        uint256 timeoutDuration
    ) external nonReentrant returns (uint256) {
        return _createEscrow(msg.sender, seller, amount, timeoutDuration);
    }

    /**
     * @notice Open an escrow on behalf of a buyer (e.g., orchestrator or buyer with approval).
     * @param buyer Address funding the escrow.
     * @param seller Target address receiving funds.
     * @param amount Token amount.
     * @param timeoutDuration Timeout in seconds.
     */
    function openEscrowFor(
        address buyer,
        address seller,
        uint256 amount,
        uint256 timeoutDuration
    ) external nonReentrant returns (uint256) {
        require(
            msg.sender == buyer || msg.sender == owner(),
            "TradeEscrow: unauthorized caller"
        );
        return _createEscrow(buyer, seller, amount, timeoutDuration);
    }

    function _createEscrow(
        address buyer,
        address seller,
        uint256 amount,
        uint256 timeoutDuration
    ) internal returns (uint256) {
        require(buyer != address(0), "TradeEscrow: invalid buyer address");
        require(seller != address(0), "TradeEscrow: invalid seller address");
        require(amount > 0, "TradeEscrow: amount must be greater than 0");

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: buyer,
            seller: seller,
            amount: amount,
            createdAt: block.timestamp,
            timeoutDuration: timeoutDuration,
            status: EscrowStatus.Active
        });

        token.safeTransferFrom(buyer, address(this), amount);

        emit EscrowCreated(
            escrowId,
            buyer,
            seller,
            amount,
            block.timestamp + timeoutDuration
        );

        return escrowId;
    }

    /**
     * @notice Release funds held in escrow to the seller.
     * Can be called by buyer, contract owner (simulation orchestrator), or seller if agreed.
     * @param escrowId ID of the escrow to release.
     */
    function release(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.id == escrowId && escrow.id > 0, "TradeEscrow: escrow does not exist");
        require(escrow.status == EscrowStatus.Active, "TradeEscrow: escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == owner(),
            "TradeEscrow: unauthorized to release"
        );

        escrow.status = EscrowStatus.Released;
        token.safeTransfer(escrow.seller, escrow.amount);

        emit EscrowReleased(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @notice Refund funds held in escrow back to the buyer.
     * Can be called by seller, contract owner, or by buyer after timeout has expired.
     * @param escrowId ID of the escrow to refund.
     */
    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.id == escrowId && escrow.id > 0, "TradeEscrow: escrow does not exist");
        require(escrow.status == EscrowStatus.Active, "TradeEscrow: escrow not active");

        bool isSeller = (msg.sender == escrow.seller);
        bool isOwner = (msg.sender == owner());
        bool isTimedOutBuyer = (msg.sender == escrow.buyer && block.timestamp >= escrow.createdAt + escrow.timeoutDuration);

        require(
            isSeller || isOwner || isTimedOutBuyer,
            "TradeEscrow: unauthorized or timeout not reached"
        );

        escrow.status = EscrowStatus.Refunded;
        token.safeTransfer(escrow.buyer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    /**
     * @notice Get escrow status and details.
     * @param escrowId ID of the escrow.
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        require(escrows[escrowId].id > 0, "TradeEscrow: escrow does not exist");
        return escrows[escrowId];
    }
}
