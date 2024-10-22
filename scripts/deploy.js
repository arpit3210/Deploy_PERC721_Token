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
