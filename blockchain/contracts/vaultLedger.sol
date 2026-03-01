// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VaultLedger{
    struct Expense{
        bytes32 dataHash;
        uint256 time;
    }

    mapping (address => Expense[])  private userExpense;
    event ExpenseStored(address indexed user, bytes32 indexed dataHash, uint256 time);

    function addExpense(bytes32 _dataHash) public{
        userExpense[msg.sender].push(Expense({dataHash: _dataHash, time: block.timestamp}));
        emit ExpenseStored(msg.sender, _dataHash, block.timestamp);
    }

    function getExpense() public view returns (Expense[] memory){
        return userExpense[msg.sender];
    }
}