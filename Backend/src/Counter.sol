// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
}

contract YieldAIStablecoinVault {
    IERC20 public immutable usdc; // USDC natif sur Base
    address public owner;

    // Solde total déposé
    uint public totalDeposited;

    // Soldes des utilisateurs
    mapping(address => uint) public balances;

    event Deposited(address indexed user, uint amount);
    event Withdrawn(address indexed user, uint amount);
    event Rebalanced(address indexed executor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address usdcAddress) {
        usdc = IERC20(usdcAddress);
        owner = msg.sender;
    }

    // Déposer USDC dans le coffre
    function deposit(uint amount) external {
        require(amount > 0, "Amount zero");
        // Transfert USDC de l'utilisateur vers le contrat
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        totalDeposited += amount;
        emit Deposited(msg.sender, amount);
    }

    // Retirer USDC du coffre
    function withdraw(uint amount) external {
        require(amount > 0 && balances[msg.sender] >= amount, "Invalid amount");
        balances[msg.sender] -= amount;
        totalDeposited -= amount;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    // Fonction de rééquilibrage/balancing simulée
    // En vrai, IA off-chain ou agents exécuteront logiques complexes via ce point d'entrée
    function rebalance() external onlyOwner {
        // Exemple simplifié : ici on pourrait intégrer des appels vers d'autres protocoles,
        // ou mettre en place un logic d’allocation selon suggestions IA
        emit Rebalanced(msg.sender);
    }

    // Pour voir le solde USDC détenu par le vault (utile pour vérifications)
    function vaultBalance() external view returns (uint) {
        return usdc.balanceOf(address(this));
    }
}
