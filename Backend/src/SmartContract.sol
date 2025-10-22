// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ========== INTERFACES POOLS BASE ==========

// Interface Moonwell (fork Compound V2 sur Base)
interface IMoonwellPool {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

// Interface Aerodrome (AMM natif Base)
interface IAerodromePool {
    function deposit(uint256 amount, address to) external;
    function withdraw(uint256 amount, address to) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

// Interface Seamless (fork Aave V3 sur Base)
interface ISeamlessPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

// Interface générique pour les pools standards
interface IPool {
    function deposit(uint256 amount) external;
}

contract HornetVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ========== VARIABLES VAULT ==========
    IERC20 public immutable usdc;          
    uint256 public totalShares;            
    uint256 public totalAssets;   

    mapping(address => uint256) public shares;  
    mapping(address => uint256) public deposits;       
    
    uint256 public performanceFee = 50; // 0.5% (base 10000)
    address public treasury;

    // ========== POOLS TRACKING ==========
    // Mapping pour gérer dynamiquement les pools
    mapping(string => address) public pools;
    mapping(address => string) public poolTypes; // "moonwell", "aerodrome", "seamless"
    
    address public currentActivePool; // Pool actuellement utilisé
    uint256 public amountInPool; // Montant déployé dans le pool actif

    // ========== EVENTS ==========
    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event DepositedToPool(string poolName, address poolAddress, uint256 amount);
    event WithdrawnFromPool(string poolName, address poolAddress, uint256 amount);
    event PoolAdded(string poolName, address poolAddress, string poolType);
    event Harvested(uint256 profit, uint256 fee);

    // ========== CONSTRUCTOR ==========
    constructor(
        IERC20 _usdc,
        address _treasury
    ) {
        usdc = _usdc;
        treasury = _treasury;
    }

    // ========== GESTION DES POOLS ==========
    
    /// @notice Ajouter un pool au vault
    function addPool(string memory poolName, address poolAddress, string memory poolType) external onlyOwner {
        require(poolAddress != address(0), "Invalid pool address");
        pools[poolName] = poolAddress;
        poolTypes[poolAddress] = poolType;
        emit PoolAdded(poolName, poolAddress, poolType);
    }

    // ========== FONCTIONS UTILISATEURS ==========
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid deposit");
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 sharesToMint;
        if (totalShares == 0 || totalAssets == 0) {
            sharesToMint = amount;
        } else {
            sharesToMint = (amount * totalShares) / totalAssets;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        totalAssets += amount;
        deposits[msg.sender] += amount;

        emit Deposited(msg.sender, amount, sharesToMint);
    }

    function withdraw(uint256 shareAmount) external nonReentrant {
        require(shareAmount > 0 && shareAmount <= shares[msg.sender], "Invalid share");

        uint256 withdrawAmount = (shareAmount * totalAssets) / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        totalAssets -= withdrawAmount;

        usdc.safeTransfer(msg.sender, withdrawAmount);
        emit Withdrawn(msg.sender, withdrawAmount, shareAmount);
    }

    // ========== FONCTIONS POOLS (Owner/IA) ==========
    
    /// @notice Dépose dans un pool spécifique selon son type
    /// @param poolName Le nom du pool (ex: "moonwell", "aerodrome")
    /// @param amount Le montant à déposer
    function depositToPool(string memory poolName, uint256 amount) external onlyOwner nonReentrant {
        address poolAddress = pools[poolName];
        require(poolAddress != address(0), "Pool not found");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient vault balance");
        
        string memory poolType = poolTypes[poolAddress];
        
        // Approuver le montant exact
        usdc.safeApprove(poolAddress, 0);
        usdc.safeApprove(poolAddress, amount);
        
        // Déposer selon le type de pool
        if (keccak256(bytes(poolType)) == keccak256(bytes("moonwell"))) {
            IMoonwellPool(poolAddress).mint(amount);
        } 
        else if (keccak256(bytes(poolType)) == keccak256(bytes("aerodrome"))) {
            IAerodromePool(poolAddress).deposit(amount, address(this));
        } 
        else if (keccak256(bytes(poolType)) == keccak256(bytes("seamless"))) {
            ISeamlessPool(poolAddress).supply(address(usdc), amount, address(this), 0);
        }
        else {
            // Pool générique avec interface standard
            IPool(poolAddress).deposit(amount);
        }
        
        // Mettre à jour le tracking
        currentActivePool = poolAddress;
        amountInPool += amount;
        
        emit DepositedToPool(poolName, poolAddress, amount);
    }

    /// @notice Fonction simplifiée pour dépôt direct par adresse (pour l'IA)
    /// @param poolAddress Adresse directe du pool
    /// @param amount Montant à déposer
    function depositToPoolByAddress(address poolAddress, uint256 amount) external onlyOwner nonReentrant {
        require(poolAddress != address(0), "Invalid pool");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient balance");
        
        string memory poolType = poolTypes[poolAddress];
        require(bytes(poolType).length > 0, "Pool type not registered");
        
        usdc.safeApprove(poolAddress, 0);
        usdc.safeApprove(poolAddress, amount);
        
        if (keccak256(bytes(poolType)) == keccak256(bytes("moonwell"))) {
            IMoonwellPool(poolAddress).mint(amount);
        } 
        else if (keccak256(bytes(poolType)) == keccak256(bytes("aerodrome"))) {
            IAerodromePool(poolAddress).deposit(amount, address(this));
        } 
        else if (keccak256(bytes(poolType)) == keccak256(bytes("seamless"))) {
            ISeamlessPool(poolAddress).supply(address(usdc), amount, address(this), 0);
        }
        
        currentActivePool = poolAddress;
        amountInPool += amount;
        
        emit DepositedToPool(poolType, poolAddress, amount);
    }

    // ========== FONCTIONS DE LECTURE ==========
    
    /// @notice Obtenir le solde USDC du vault
    function getVaultBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
    
    /// @notice Obtenir les infos du pool actif
    function getActivePoolInfo() external view returns (address pool, uint256 amount) {
        return (currentActivePool, amountInPool);
    }
    
    /// @notice Obtenir l'adresse d'un pool par son nom
    function getPoolAddress(string memory poolName) external view returns (address) {
        return pools[poolName];
    }

    // ========== FONCTION ADMIN ==========
    
    /// @notice Mettre à jour l'adresse du treasury
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    /// @notice Mettre à jour les frais de performance
    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        performanceFee = _fee;
    }
}
