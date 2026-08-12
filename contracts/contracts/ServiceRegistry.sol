// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ServiceRegistry
 * @notice On-chain audit log of AgentX service listings, micro-service calls, and completion statuses.
 */
contract ServiceRegistry is Ownable {
    struct ServiceListing {
        uint256 id;
        address provider;
        string serviceType; // e.g. "data-oracle", "task-completion", "translation"
        uint256 price;      // default price in CRED base units
        string description;
        bool active;
    }

    struct ServiceCall {
        uint256 id;
        uint256 serviceId;
        address buyer;
        address provider;
        uint256 escrowId;
        uint256 timestamp;
        bool completed;
        bool success;
        string resultHash;  // IPFS hash or metadata string of deliverable
    }

    uint256 public nextServiceId;
    uint256 public nextCallId;

    mapping(uint256 => ServiceListing) public services;
    mapping(uint256 => ServiceCall) public serviceCalls;

    event ServiceRegistered(
        uint256 indexed serviceId,
        address indexed provider,
        string serviceType,
        uint256 price,
        string description
    );

    event ServiceCalled(
        uint256 indexed callId,
        uint256 indexed serviceId,
        address indexed buyer,
        address provider,
        uint256 escrowId
    );

    event ServiceCompleted(
        uint256 indexed callId,
        uint256 indexed serviceId,
        bool success,
        string resultHash
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        nextServiceId = 1;
        nextCallId = 1;
    }

    /**
     * @notice Register a new micro-service offering on-chain.
     * @param serviceType String identifier of service category.
     * @param price Price in CRED tokens.
     * @param description Brief description of service.
     */
    function registerService(
        string calldata serviceType,
        uint256 price,
        string calldata description
    ) external returns (uint256) {
        require(bytes(serviceType).length > 0, "ServiceRegistry: serviceType required");

        uint256 serviceId = nextServiceId++;
        services[serviceId] = ServiceListing({
            id: serviceId,
            provider: msg.sender,
            serviceType: serviceType,
            price: price,
            description: description,
            active: true
        });

        emit ServiceRegistered(serviceId, msg.sender, serviceType, price, description);
        return serviceId;
    }

    /**
     * @notice Log a micro-service call between buyer and provider with associated escrow.
     * @param serviceId ID of registered service.
     * @param buyer Address of purchasing agent.
     * @param escrowId ID of associated TradeEscrow.
     */
    function logServiceCall(
        uint256 serviceId,
        address buyer,
        uint256 escrowId
    ) external returns (uint256) {
        ServiceListing memory service = services[serviceId];
        require(service.id == serviceId && service.id > 0, "ServiceRegistry: service does not exist");
        require(service.active, "ServiceRegistry: service not active");
        require(buyer != address(0), "ServiceRegistry: invalid buyer address");

        uint256 callId = nextCallId++;
        serviceCalls[callId] = ServiceCall({
            id: callId,
            serviceId: serviceId,
            buyer: buyer,
            provider: service.provider,
            escrowId: escrowId,
            timestamp: block.timestamp,
            completed: false,
            success: false,
            resultHash: ""
        });

        emit ServiceCalled(callId, serviceId, buyer, service.provider, escrowId);
        return callId;
    }

    /**
     * @notice Log completion status for a service call.
     * Can be called by service provider, buyer, or contract owner.
     * @param callId ID of service call.
     * @param success Outcome status.
     * @param resultHash Deliverable reference hash/result metadata.
     */
    function logCompletion(
        uint256 callId,
        bool success,
        string calldata resultHash
    ) external {
        ServiceCall storage call = serviceCalls[callId];
        require(call.id == callId && call.id > 0, "ServiceRegistry: call does not exist");
        require(!call.completed, "ServiceRegistry: call already completed");
        require(
            msg.sender == call.provider || msg.sender == call.buyer || msg.sender == owner(),
            "ServiceRegistry: unauthorized to log completion"
        );

        call.completed = true;
        call.success = success;
        call.resultHash = resultHash;

        emit ServiceCompleted(callId, call.serviceId, success, resultHash);
    }

    /**
     * @notice Fetch service listing by ID.
     */
    function getService(uint256 serviceId) external view returns (ServiceListing memory) {
        require(services[serviceId].id > 0, "ServiceRegistry: service does not exist");
        return services[serviceId];
    }

    /**
     * @notice Fetch service call by ID.
     */
    function getServiceCall(uint256 callId) external view returns (ServiceCall memory) {
        require(serviceCalls[callId].id > 0, "ServiceRegistry: call does not exist");
        return serviceCalls[callId];
    }
}
