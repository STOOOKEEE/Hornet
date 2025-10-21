// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HornetVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // VARIABLES
    IERC20 public immutable usdc;          
    uint256 public totalShares;            
    uint256 public totalAssets;   

    mapping(address => uint256) public shares;  
    mapping(address => uint256) public deposits;          
    
    uint256 public performanceFee = 50;
    address public treasury;

    // POOLS
    IMoonwellPool public moonwellPool;
    IAerodromePool public aerodromePool;
    ISeamlessPool public seamlessPool;

    // EVENTS
    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event Harvested(uint256 profit, uint256 fee);
    event Rebalanced(string newPool);

    // CREATION
    constructor(IERC20 _usdc, address _treasury, address _moonwellPool, address _aerodromePool, address _seamlessPool) {
        usdc = _usdc;
        treasury = _treasury;
        moonwellPool = IMoonwellPool(_moonwellPool);
        aerodromePool = IAerodromePool(_aerodromePool);
        seamlessPool = ISeamlessPool(_seamlessPool);

    }

    // FUNCTIONS VAULT
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
    
    // FUNCTIONS POOLS
    function depositToPool(address pool, uint256 amount) external onlyOwner {
        usdc.safeApprove(pool, 0);          
        usdc.safeApprove(pool, amount);     
        IPool(pool).deposit(amount);
    }








}