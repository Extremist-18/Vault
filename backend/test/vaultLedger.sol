pragma solidity ^0.8.20;
import "forge-std/Test.sol";

contract VaultLedger {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}

contract VaultLedgerTest is Test {
    VaultLedger vault;

    address user = address(0x123);
    function setUp() public {
        vault = new VaultLedger();
        vm.deal(user, 10 ether);
    }
    function testDeposit() public {
        vm.prank(user);
        vault.deposit{value: 1 ether}();
        assertEq(vault.balances(user), 1 ether);
    }

    function testWithdraw() public {
        vm.startPrank(user);
        vault.deposit{value: 2 ether}();
        vault.withdraw(1 ether);
        vm.stopPrank();

        assertEq(vault.balances(user), 1 ether);
    }
}