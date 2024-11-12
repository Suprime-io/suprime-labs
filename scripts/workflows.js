const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();


  /*  Workflow config */
  const workflowName = 'TwoParties';
  const workflow = await hre.ethers.deployContract("Workflow", [workflowName, deployer.address])
  await workflow.waitForDeployment();
  console.log(
    `Workflow ${workflowName} was deployed at ${await workflow.getAddress()}`
  );

  await workflow.addState('Waiting for quotation');               //2
  await workflow.addState('Pending');                             //3
  await workflow.addState('Rejected');                            //4
  await workflow.addState('In progress');                         //5
  await workflow.addState('Complete');                            //6

  await workflow.addTranstition(['To quotation', 1, 2, true]);
  await workflow.addTranstition(['Quote', 2, 3, false]);
  await workflow.addTranstition(['Reject', 3, 4, false]);
  await workflow.addTranstition(['Accept', 3, 5, false]);
  await workflow.addTranstition(['Complete', 5, 6, false]);



  //verify
  if (hre.network.name !== 'localhost') {
    console.log('Waiting before verification....')
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(10000);

    await hre.run("verify:verify", {
      address: await workflow.getAddress(),
      constructorArguments: [workflowName, deployer.address],
    });
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
