const { ethers } = require("hardhat");
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe("Workflow", function () {

  let owner;
  let addr1;


  before("Setup", async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  async function deployWorkflow() {
    const workflow = await ethers.deployContract("Workflow", ['Test Workflow', owner]);
    return workflow;
  }

  describe("configure", () => {

    let workflow;

    beforeEach(async () => {
      workflow = await loadFixture(deployWorkflow);
    })

    it("should add state", async () => {
      await expect(workflow.addState('Second state'))
        .to.emit(workflow, "StateAdded")
        .withArgs('Second state', 2);

      expect((await workflow.states(2)).name).to.be.equal('Second state');
    });

    it("should add state only by owner", async () => {
      await expect(workflow
        .connect(addr1).addState('Second state'))
        .to.be.revertedWithCustomError(workflow, 'OwnableUnauthorizedAccount');
    });

    it("should add transition", async () => {
      await workflow.addState('Second state');

      expect(await workflow.transitionsInState(1)).to.be.equal(0);

      await expect(workflow.addTranstition(['transition', 1, 2, false]))
        .to.emit(workflow, "TransitionAdded")
        .withArgs('transition', 1, 2);

      expect((await workflow.transitions(1)).name).to.be.equal('transition');
      expect(await workflow.transitionsInState(1)).to.be.equal(1);
    });

    it("should add transition only by owner", async () => {
      await expect(workflow
        .connect(addr1).addTranstition(['transition', 1, 2, false]))
        .to.be.revertedWithCustomError(workflow, 'OwnableUnauthorizedAccount');
    });

    it("should not add transition without a state", async () => {
      await expect(workflow.addTranstition(['transition', 0, 1, false]))
        .to.be.revertedWithCustomError(workflow, 'WrongStateIndex');

      await expect(workflow.addTranstition(['transition', 1, 2, false]))
        .to.be.revertedWithCustomError(workflow, 'WrongStateIndex');
    });

    it("should add auto transition and instantly execute it", async () => {
      await workflow.addState('Second state');
      await workflow.addTranstition(['transition', 1, 2, true])

      await expect(workflow.instantiate())
        .to.emit(workflow, "TransitionExecuted")
        .withArgs('transition', 1, 1, 2);

      expect((await workflow.currentState(1)).name).to.be.equal('Second state');
    });


  })

  describe("execute", () => {

    let workflow;
    const defaultInstance = 1;

    beforeEach(async () => {
      workflow = await loadFixture(deployWorkflow);
      await workflow.addState('Second state');
      await workflow.addState('Third state');

      await workflow.addTranstition(['init', 1, 2, false]);
      await workflow.addTranstition(['proceed', 2, 3, false]);
      await workflow.addTranstition(['init\'n\'proceed', 1, 3, false]);

      await workflow.instantiate();
    })

    it("should execute transition", async () => {
      await expect(workflow
        .connect(addr1).execute(defaultInstance, 1))
        .to.emit(workflow, "TransitionExecuted")
        .withArgs('init', 1, 1, 2);

      expect((await workflow.currentState(defaultInstance)).name).to.be.equal('Second state');
    });

  })

})
