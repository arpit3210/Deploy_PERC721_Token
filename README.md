

```markdown
# PERC-721 Token Minting on Swisstronik Blockchain

This project demonstrates how to mint a PERC-721 token using Hardhat and deploy it on the Swisstronik blockchain. PERC-721 tokens are non-fungible tokens (NFTs) that represent unique digital assets.

## Prerequisites

- Visual Studio Code or any preferred code editor
- Node.js and npm
- MetaMask wallet

## Setup

1. Create a new project directory:
   ```bash
   mkdir DeployPERC721_Token
   cd DeployPERC721_Token
   ```

2. Install Hardhat:
   ```bash
   npm install --save-dev hardhat
   ```

3. Initialize a new Hardhat project:
   ```bash
   npx hardhat init
   ```

4. Set up your private key as an environment variable:
   ```bash
   npx hardhat vars set PRIVATE_KEY
   ```

5. Configure the Swisstronik network in `hardhat.config.js`:

   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require("@nomicfoundation/hardhat-web3-v4");

   const PRIVATE_KEY = vars.get("PRIVATE_KEY");

   module.exports = {
     defaultNetwork: "swisstronik",
     solidity: "0.8.27",
     networks: {
       swisstronik: {
         url: "https://json-rpc.testnet.swisstronik.com/",
         accounts: [`0x${PRIVATE_KEY}`],
       },
     },
   };
   ```

6. Install required dependencies:
   ```bash
   npm install @nomicfoundation/hardhat-web3-v4 web3-utils @swisstronik/web3-plugin-swisstronik --save-dev
   ```

## Smart Contract

The main smart contract is `PrivateERC721.sol`. Here's a brief overview of the contract structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IERC721 {

   // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    // event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    // event ApprovalForAll(address indexed owner, address indexed operator, bool approved);


    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
}

contract PrivateERC721 is IERC721 {
    string public name;
    string public symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function balanceOf(address owner) external view override returns (uint256) {
        require(owner != address(0), "Address zero is not a valid owner");
        require(msg.sender == owner, "PERC721: Caller must be owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token ID does not exist");
        require(
            msg.sender == owner || msg.sender == _tokenApprovals[tokenId],
            "PERC721: Caller must be owner or approved"
        );
        return owner;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token ID does not exist");
        require(
            msg.sender == owner || msg.sender == _tokenApprovals[tokenId],
            "PERC721: Caller is not owner nor approved"
        );
        require(from == owner, "PERC721: Transfer from incorrect owner");
        require(to != address(0), "PERC721: Transfer to the zero address");

        // Clear previous approvals
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        // emit Transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public override {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token ID does not exist");
        require(msg.sender == owner, "PERC721: Caller is not owner");
        require(to != owner, "PERC721: Approval to current owner");

        _approve(to, tokenId);
           // emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_owners[tokenId] != address(0), "PERC721: Token ID does not exist");
        return _tokenApprovals[tokenId];
    }

    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
    }

    function mint(address to, uint256 tokenId) public {
        require(to != address(0), "PERC721: Mint to the zero address");
        require(_owners[tokenId] == address(0), "PERC721: Token ID already exists");

        _balances[to] += 1;
        _owners[tokenId] = to;

          // emit Transfer(address(0), to, tokenId);
    }
}

```

## Deployment

1. Create a deployment script `deploy.js` in the `scripts` folder:

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");


async function main() {
    // Deploy the PrivateERC721_NFT contract with a name and symbol
    const PrivateERC721_NFT = await ethers.deployContract("contracts/PERC721.sol:PrivateERC721", ["Private NFT", "PNFT"]);
    
    // Wait for the deployment to complete
    await PrivateERC721_NFT.waitForDeployment();
    const deployedContract = await PrivateERC721_NFT.getAddress();
    fs.writeFileSync("contract.txt", deployedContract);
    
    console.log(`PrivateERC721_NFT was deployed to ${deployedContract}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

```

2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network swisstronik
   ```

## Minting Tokens

1. Create a minting script `mint.js` in the `scripts` folder:

```javascript
const { network, web3 } = require("hardhat");
const { abi } = require("../artifacts/contracts/PERC721.sol/PrivateERC721.json");
const { SwisstronikPlugin } = require("@swisstronik/web3-plugin-swisstronik");
const fs = require("fs");

async function main() {
    // Register the Swisstronik plugin
    web3.registerPlugin(new SwisstronikPlugin(network.config.url));
    
    // Replace with your deployed contract address
    const contractAddress = fs.readFileSync("contract.txt", "utf8").trim();
    
    // Get the accounts
    const [from] = await web3.eth.getAccounts();
    
    // Create contract instance
    const contract = new web3.eth.Contract(abi, contractAddress);

    // Specify the token ID you want to mint
    const tokenId = 1; // Adjust the token ID as needed

    // Mint the token
    const mintTx = await contract.methods.mint(from, tokenId).send({ from });
    
    // Log the transaction details
    console.log("Transaction hash:", mintTx.transactionHash);
    console.log("Transaction submitted! Transaction details:", mintTx);
    console.log(`Transaction completed successfully! ✅ Token ID: ${tokenId} minted to ${from}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

2. Run the minting script:
   ```bash
   npx hardhat run scripts/mint.js --network swisstronik
   ```

## Verifying Transactions

Use the [Swisstronik Testnet Explorer](https://explorer-evm.testnet.swisstronik.com/) to verify your transactions.

## Contributing

Feel free to fork this repository and submit pull requests for any improvements or additional features.

## License

This project is licensed under the MIT License.
```

Feel free to modify any sections as needed! Let me know if you need further assistance.