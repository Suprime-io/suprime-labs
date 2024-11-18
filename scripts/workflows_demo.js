const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const workflowName = 'SpaceX';
  const workflow = await hre.ethers.deployContract("Workflow", [workflowName, deployer.address])
  await workflow.waitForDeployment();
  console.log(
    `Workflow ${workflowName} was deployed at ${await workflow.getAddress()}`
  );

  await workflow.addState('Launch');                                  //2
  await workflow.addState('Ascend');                                  //3
  await workflow.addState('Booster Separation');                      //4

  await workflow.addState('Flip maneuver');                            //5
  await workflow.addState('Booster/Entry Burn');                      //6
  await workflow.addState('Vertical Landing');                        //7, End

  await workflow.addState('Stage separation');                        //8

  await workflow.addState('Flip maneuver');                            //9
  await workflow.addState('Fairing separation');                       //10
  await workflow.addState('Payload separation');                       //11
  await workflow.addState('Tothemoon');                                //12, End

  await workflow.addState('Boostback Burn');                           //13
  await workflow.addState('Grid fins deploy');                        //14
  await workflow.addState('Entry burn');                              //15
  await workflow.addState('Aerodynamic guidance');                    //16
  await workflow.addState('Vertical Landing');                        //17
  await workflow.addState('Landed');                                  //18, End

  await workflow.addTranstition(['To launch', 1, 2, true]);
  await workflow.addTranstition(['Takeoff', 2, 3, false]);
  await workflow.addTranstition(['Up', 3, 4, false]);

  await workflow.addTranstition(['Separate', 4, 5, false]);
  await workflow.addTranstition(['Down', 5, 6, false]);
  await workflow.addTranstition(['Land', 6, 7, false]);     //end

  await workflow.addTranstition(['Separate', 4, 8, false]);

  await workflow.addTranstition(['Release gas', 8, 9, false]);
  await workflow.addTranstition(['Up', 9, 10, false]);
  await workflow.addTranstition(['Up', 10, 11, false]);
  await workflow.addTranstition(['Up', 11, 12, false]);

  await workflow.addTranstition(['Landing engine', 8, 13, false]);
  await workflow.addTranstition(['Down', 13, 14, false]);
  await workflow.addTranstition(['Light engines', 14, 15, false]);
  await workflow.addTranstition(['Steer fins', 15, 16, false]);
  await workflow.addTranstition(['Precision landing', 16, 17, false]);
  await workflow.addTranstition(['Stop', 17, 18, false]);

  //verify
  if (hre.network.name !== 'localhost') {
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
