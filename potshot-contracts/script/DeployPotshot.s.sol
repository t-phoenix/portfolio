// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Potshot} from "../src/Potshot.sol";

/**
 * @title DeployPotshot
 * @notice Deployment script for Potshot game contract with Chainlink VRF V2.5
 * @dev Run with: forge script script/DeployPotshot.s.sol:DeployPotshot --rpc-url $RPC_URL --broadcast --verify
 * 
 * Environment Variables Required:
 * - VRF_SUBSCRIPTION_ID: Chainlink VRF V2.5 subscription ID (uint256)
 * - DEV_ADDRESS (optional): Dev wallet address (defaults to deployer)
 * - INITIAL_SEED (optional): Initial USDC to seed pot (in USDC units with 6 decimals)
 */
contract DeployPotshot is Script {
    
    // Configuration for different networks (USDC has 6 decimals)
    uint256 constant BASE_MAINNET_MIN_BET = 1 * 10**6;  // 1 USDC
    uint256 constant BASE_TESTNET_MIN_BET = 1 * 10**6;  // 1 USDC
    uint256 constant LOCALHOST_MIN_BET = 1 * 10**6;     // 1 USDC
    
    // USDC Token Addresses
    address constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    // For localhost, set via environment variable
    
    // VRF V2.5 Configuration - Base Mainnet
    address constant BASE_MAINNET_VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant BASE_MAINNET_KEY_HASH = 0x00b81b5a830cb0a4009fbd8904de511e28631e62ce5ad231373d3cdad373ccab; //2Gwei
    
    // VRF V2.5 Configuration - Base Sepolia
    address constant BASE_SEPOLIA_VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    bytes32 constant BASE_SEPOLIA_KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    
    // VRF Parameters
    uint32 constant CALLBACK_GAS_LIMIT = 500000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    
    function run() external returns (Potshot) {
        // Load private key from .env and start broadcasting
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Get configuration from environment or use defaults
        address dev = vm.envOr("DEV_ADDRESS", msg.sender);
        address usdc = getUSDCForNetwork();
        uint256 minBet = getMinBetForNetwork();
        uint256 initialSeed = vm.envOr("INITIAL_SEED", uint256(0));
        
        // VRF V2.5 Configuration
        address vrfCoordinator = getVRFCoordinatorForNetwork();
        uint256 subscriptionId = vm.envUint("VRF_SUBSCRIPTION_ID");
        bytes32 keyHash = getKeyHashForNetwork();
        
        console2.log("=================================");
        console2.log("Deploying Potshot Game Contract (USDC + VRF)");
        console2.log("=================================");
        console2.log("Network Chain ID:", block.chainid);
        console2.log("Deployer:", msg.sender);
        console2.log("Dev Address:", dev);
        console2.log("USDC Address:", usdc);
        console2.log("Min Bet (USDC):", minBet);
        console2.log("Initial Seed (USDC):", initialSeed);
        console2.log("VRF Coordinator:", vrfCoordinator);
        console2.log("VRF Subscription ID:", subscriptionId);
        console2.log("=================================");
        
        require(subscriptionId > 0, "VRF_SUBSCRIPTION_ID not set");
        require(usdc != address(0), "USDC address not configured");
        
        // Deploy contract
        Potshot potshot = new Potshot(
            dev,
            usdc,
            minBet,
            vrfCoordinator,
            subscriptionId,
            keyHash,
            CALLBACK_GAS_LIMIT,
            REQUEST_CONFIRMATIONS
        );
        
        console2.log("Potshot deployed at:", address(potshot));
        
        // Note: Initial seed requires USDC approval and transfer
        // This should be done separately after deployment
        if (initialSeed > 0) {
            console2.log("NOTE: To seed pot with", initialSeed, "USDC:");
            console2.log("1. Approve Potshot contract to spend USDC");
            console2.log("2. Call seedPot(", initialSeed, ")");
        }
        
        vm.stopBroadcast();
        
        // Log deployment info
        console2.log("=================================");
        console2.log("Deployment Complete!");
        console2.log("=================================");
        console2.log("Contract:", address(potshot));
        console2.log("Dev:", potshot.dev());
        console2.log("USDC:", address(potshot.usdc()));
        console2.log("Min Bet:", potshot.minBet());
        console2.log("Current Pot:", potshot.pot());
        console2.log("VRF Subscription:", potshot.subscriptionId());
        console2.log("=================================");
        console2.log("");
        console2.log("IMPORTANT NEXT STEPS:");
        console2.log("1. Add this contract as a consumer to your VRF subscription");
        console2.log("   Visit: https://vrf.chain.link");
        console2.log("2. Users need to approve USDC spending before buying tickets");
        console2.log("3. Dev can claim funds anytime via claimDevFunds()");
        console2.log("=================================");
        
        // Write deployment info to file
        writeDeploymentInfo(address(potshot), dev, usdc, minBet, subscriptionId);
        
        return potshot;
    }
    
    /**
     * @notice Get USDC address based on network
     * @return USDC token address
     */
    function getUSDCForNetwork() internal view returns (address) {
        uint256 chainId = block.chainid;
        
        if (chainId == 8453) {
            return BASE_MAINNET_USDC;
        } else if (chainId == 84532) {
            return BASE_SEPOLIA_USDC;
        } else {
            // For local/custom networks, require env var
            return vm.envOr("USDC_ADDRESS", address(0));
        }
    }
    
    /**
     * @notice Get minimum bet based on network
     * @return Minimum bet in USDC (6 decimals)
     */
    function getMinBetForNetwork() internal view returns (uint256) {
        uint256 chainId = block.chainid;
        
        // Base Mainnet: 8453
        if (chainId == 8453) {
            return BASE_MAINNET_MIN_BET;
        }
        // Base Sepolia: 84532
        else if (chainId == 84532) {
            return BASE_TESTNET_MIN_BET;
        }
        // Localhost / Anvil: 31337
        else if (chainId == 31337) {
            return LOCALHOST_MIN_BET;
        }
        // Default
        else {
            return vm.envOr("MIN_BET", LOCALHOST_MIN_BET);
        }
    }
    
    /**
     * @notice Get VRF Coordinator address based on network
     * @return VRF Coordinator address
     */
    function getVRFCoordinatorForNetwork() internal view returns (address) {
        uint256 chainId = block.chainid;
        
        if (chainId == 8453) {
            return BASE_MAINNET_VRF_COORDINATOR;
        } else if (chainId == 84532) {
            return BASE_SEPOLIA_VRF_COORDINATOR;
        } else {
            // For local/custom networks, require env var
            return vm.envAddress("VRF_COORDINATOR");
        }
    }
    
    /**
     * @notice Get VRF Key Hash based on network
     * @return VRF Key Hash
     */
    function getKeyHashForNetwork() internal view returns (bytes32) {
        uint256 chainId = block.chainid;
        
        if (chainId == 8453) {
            return BASE_MAINNET_KEY_HASH;
        } else if (chainId == 84532) {
            return BASE_SEPOLIA_KEY_HASH;
        } else {
            // For local/custom networks, require env var
            return vm.envBytes32("VRF_KEY_HASH");
        }
    }
    
    /**
     * @notice Write deployment information to a file
     * @param contractAddress Deployed contract address
     * @param devAddress Developer address
     * @param usdcAddress USDC token address
     * @param minBet Minimum bet amount in USDC
     * @param subscriptionId VRF V2.5 subscription ID (uint256)
     */
    function writeDeploymentInfo(
        address contractAddress,
        address devAddress,
        address usdcAddress,
        uint256 minBet,
        uint256 subscriptionId
    ) internal {
        string memory chainName = getChainName();
        string memory json = string.concat(
            '{\n',
            '  "network": "', chainName, '",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "contract": "', vm.toString(contractAddress), '",\n',
            '  "dev": "', vm.toString(devAddress), '",\n',
            '  "usdc": "', vm.toString(usdcAddress), '",\n',
            '  "minBet": "', vm.toString(minBet), '",\n',
            '  "vrfVersion": "v2.5",\n',
            '  "vrfSubscriptionId": ', vm.toString(subscriptionId), ',\n',
            '  "timestamp": ', vm.toString(block.timestamp), '\n',
            '}'
        );
        
        string memory filename = string.concat(
            "deployments/",
            chainName,
            "-",
            vm.toString(block.timestamp),
            ".json"
        );
        
        vm.writeFile(filename, json);
        console2.log("Deployment info written to:", filename);
    }
    
    /**
     * @notice Get human-readable chain name
     * @return Chain name
     */
    function getChainName() internal view returns (string memory) {
        uint256 chainId = block.chainid;
        
        if (chainId == 8453) return "base-mainnet";
        if (chainId == 84532) return "base-sepolia";
        if (chainId == 31337) return "localhost";
        return "unknown";
    }
}
