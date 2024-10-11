const { network, web3 } = require("hardhat");
const { abi } = require("../artifacts/contracts/PERC721.sol/PrivateERC721.json"); // Update the path as necessary
const { SwisstronikPlugin } = require("@swisstronik/web3-plugin-swisstronik");
const fs = require("fs");


async function main() {
    // Register the Swisstronik plugin
    web3.registerPlugin(new SwisstronikPlugin(network.config.url));
    
    // Replace with your deployed contract address
    // const contractAddress = "CONTRACT_ADDRESS";
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
