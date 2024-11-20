const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();


  /*  Workflow config for two parties to negotiate*/
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

  /*  Workflow config for one-step */
  const oneStep = 'OneStep';
  const workflowOneStep = await hre.ethers.deployContract("Workflow", [oneStep, deployer.address])
  await workflowOneStep.waitForDeployment();
  console.log(
    `Workflow ${oneStep} was deployed at ${await workflowOneStep.getAddress()}`
  );

  await workflowOneStep.addState('Complete');               //2
  await workflowOneStep.addTranstition(['Complete', 1, 2, false]);

  /*  Workflow config for two-steps-ongoing */
  const ongoing = 'Ongoing';
  const workflowOngoing = await hre.ethers.deployContract("Workflow", [ongoing, deployer.address])
  await workflowOngoing.waitForDeployment();
  console.log(
    `Workflow ${ongoing} was deployed at ${await workflowOngoing.getAddress()}`
  );

  await workflowOngoing.addState('In Progress');                //2
  await workflowOngoing.addState('Complete');                   //3
  await workflowOngoing.addTranstition(['In Progress', 1, 2, false]);
  await workflowOngoing.addTranstition(['Complete', 2, 3, false]);

  //verify
  if (hre.network.name !== 'localhost') {
    await hre.run("verify:verify", {
      address: await workflow.getAddress(),
      constructorArguments: [workflowName, deployer.address],
    });
    await hre.run("verify:verify", {
      address: await workflowOneStep.getAddress(),
      constructorArguments: [oneStep, deployer.address],
    });
    await hre.run("verify:verify", {
      address: await workflowOngoing.getAddress(),
      constructorArguments: [ongoing, deployer.address],
    });
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
