pragma solidity 0.4.25;

contract Dice {
    address public player1;
    address public player2;
    uint256 public player1Escrow;
    uint256 public player2Escrow;

    uint256 public player1Balance;
    uint256 public player2Balance;
    bool public isPlayer1BalanceSetUp;
    bool public isPlayer2BalanceSetUp;
    uint256 public player1FinalBalance;
    uint256 public player2FinalBalance;
    uint256 public player1Bet;
    uint256 public player2Bet;
    uint256 public player1Call;
    uint256 public player2Call;


    constructor () public payable {
        require(msg.value > 0);
        player1 = msg.sender;
        player1Escrow = msg.value;
    }

    function setupPlayer2() public payable {
        require(msg.value > 0);
        player2 = msg.sender;
        player2Escrow = msg.value;
    }

    function verifyPlayerBalance() public {
        player1.transfer(player1Escrow);
        player2.transfer(player2Escrow);
    }
}