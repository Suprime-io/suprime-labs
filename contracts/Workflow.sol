// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Workflow is Ownable{

    using EnumerableSet for EnumerableSet.UintSet;

    struct State {
        string name;
        uint256 stateIndex;     //TODO do we need it?
    }

    struct Transition {
        string name;
        uint256 prevStateIndex;
        uint256 nextStateIndex;
    }

    State public currentState;
    string public name;

    uint256 internal _currentStateIndex = 1;
    mapping(uint256 stateIndex => State state) public states;
    uint256 internal _currentTransitionIndex;
    mapping(uint256 transitionIndex => Transition transition) public transitions;

    // 'State' 1-* 'Transitions' 1-* 'PreConditions'/'PostTriggers'
    mapping(uint256 stateIndex => EnumerableSet.UintSet transitionIndexes) internal stateTransitions;
    mapping(uint256 transitionIndex => EnumerableSet.UintSet preconditionIndexes) internal preconditions;
    mapping(uint256 transitionIndex => EnumerableSet.UintSet posttriggerIndexes) internal posttriggers;

    event StateAdded(string name, uint256 indexed index);
    event TransitionAdded(string name, uint256 indexed from, uint256 indexed to);
    event TransitionExecuted(string name, uint256 indexed index, uint256 indexed from, uint256 indexed to);

    error WrongStateIndex();
    /// Transition cannot be called at this time.
    error TransitionInvalidAtThisState();
    /// Post-triggers can't be executed
    error PostTriggerFailure();

    modifier atProperStage(uint256 _transitionIndex) {
        if (transitions[_transitionIndex].prevStateIndex != currentState.stateIndex)
            revert TransitionInvalidAtThisState();
        _;
    }

    constructor(string memory _name) Ownable(msg.sender){
        states[1] = State('initial', 1);
        currentState = states[1];
        name = _name;
    }

    function addState(string memory name) public onlyOwner{
        _currentStateIndex++;
        states[_currentStateIndex] = State(name, _currentStateIndex);
        emit StateAdded(name, _currentStateIndex);
    }

    /// @dev Note that both prevStateIndex and nextStateIndex must be created before
    function addTranstition(Transition memory _transitionData) public onlyOwner{
        //state 'from' exists
        uint _from = _transitionData.prevStateIndex;
        if (bytes(states[_from].name).length == 0)
            revert WrongStateIndex();
        //state 'to' exists
        uint _to = _transitionData.nextStateIndex;
        if (bytes(states[_to].name).length == 0)
            revert WrongStateIndex();

        _currentTransitionIndex++;
        transitions[_currentTransitionIndex] = Transition(_transitionData.name, _from, _to);
        stateTransitions[_from].add(_currentTransitionIndex);

        emit TransitionAdded(_transitionData.name, _from, _to);
    }

    function execute(uint256 _transitionIndex) public atProperStage(_transitionIndex)
    {
        Transition memory _transition = transitions[_transitionIndex];
        if (preConditionsPassed(_transitionIndex)) {
            if (!executePostTriggers(_transitionIndex)){
                revert PostTriggerFailure();
            }
            currentState = states[_transition.nextStateIndex];
            emit TransitionExecuted(_transition.name, _transitionIndex, _transition.prevStateIndex, _transition.nextStateIndex);
        } else {
            revert TransitionInvalidAtThisState();
        }
    }

    function preConditionsPassed(uint256 _transitionIndex) internal view returns (bool){
        //EnumerableSet.UintSet storage _preconditions = preconditions[_transitionIndex];
        //TODO
        return true;
    }

    function executePostTriggers(uint256 _transitionIndex) internal view returns (bool){
        //EnumerableSet.UintSet storage _posttriggers = posttriggers[_transitionIndex];
        //TODO
        return true;
    }

    function transitionsInState(uint256 stateIndex) public view returns (uint256) {
        return stateTransitions[stateIndex].length();
    }

}
