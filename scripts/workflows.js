const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();


  /*  Workflow config */
  const workflowName = 'Tokenomics';
  const workflow = await hre.ethers.deployContract("Workflow", [workflowName, deployer.address])
  await workflow.waitForDeployment();
  console.log(
    `Workflow ${workflowName} was deployed`
  );

  await workflow.addState('Waiting for quotation');               //2
  await workflow.addState('Rejected');                            //3
  await workflow.addState('In progress');                         //4
  await workflow.addState('Complete');                            //5

  await workflow.addTranstition(['Submit', 1, 2]);
  await workflow.addTranstition(['Reject', 2, 3]);
  await workflow.addTranstition(['Accept', 2, 4]);
  await workflow.addTranstition(['Complete', 4, 5]);



  //verify
  if (hre.network.name !== 'localhost') {
    console.log('Waiting before verification....')
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(10000);

    await hre.run("verify:verify", {
      address: await workflow.getAddress()
    });
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
