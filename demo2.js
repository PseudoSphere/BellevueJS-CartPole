const CartPole = require('./cartpole.js');
const Brain = require('brain.js');
const _ = require('lodash');
const Heap = require('heap');

const maxGameScore = 20000;
const goal = maxGameScore * .98; // 196 avg for games to 200

const sim = new CartPole();
let net = new Brain.NeuralNetwork();

// Play one game
function play(agent) {
    sim.setRandomState();
    let state = sim.getState();
    let action = agent.nextAction(state);
    let reinforceAction = action == 0 ? [0,1] : [1,0]; // [0,1] = right, [1,0] = left
    let data = [{input: state, output: reinforceAction}];

    let reward = 1; //counts first state instead of last, same end result

    // sim.update returns isDone (aka false if still running)
    while(!sim.update(action) && reward < maxGameScore) {
        state = sim.getState();
        action = agent.nextAction(state);
        reinforceAction = action == 0 ? [0,1] : [1,0];
        data.push({input: state, output: reinforceAction});
        reward++;
    }

    return {
        reward,
        data
    }
}

// Always chooses a random action regardless of state
let randomAgent = {};
randomAgent.nextAction = state => {
    return Math.floor(Math.random() * 2);
}

// Make decisions with NN (brainjs agent :| )
let bragent = {};
bragent.nextAction = state => {
    let output = net.run(state);
    return output[0] < output[1] ? 0 : 1;
}

function randomData(games) {
    let data = [];
    for(let i = 0; i < games; i++) {
        data.push(play(randomAgent));
    }
    return data;
}

function main(games = 1000, topPercent = 0.1, iterations =  20000, threshold = 100000) {
    net = new Brain.NeuralNetwork();
    let megaData = [];
    let totalGames = games;

    // Play with agent random
    megaData = randomData(games);

    let score = _.mean(megaData.map(value => {
        return value.reward;
    }))

    let minHeap = new Heap((a, b) => { // for top %
        return a.reward - b.reward;
    });
    let maxHeap = new Heap((a, b) => { // for bottom %
        return b.reward - a.reward;
    });
    // Loop until goal is reached
    while(score < goal) {
        // Net has not succeeded in the required number of games
        if(totalGames > threshold) {
            megaData = randomData(games);
            net = new Brain.NeuralNetwork();
            console.log('NEW BRAIN!\n');
            totalGames = 0;
        }
        totalGames += games;

        // Get top and bottom X% of !data!
        let actionData = megaData.map(game => {
            return game.data.map((io, index) => {
                if(game.reward === maxGameScore) {
                    return {io, reward: maxGameScore}
                }
                return {io, reward: game.reward - index};
            })
        })
        actionData = _.flatten(actionData);
        
        // fill heaps
        actionData.forEach(action => {
            if(minHeap.size() < actionData.length * topPercent) {
                minHeap.push(action);
            } else {
                action = minHeap.pushpop(action);
                if(maxHeap.size() < actionData.length * topPercent) {
                    maxHeap.push(action);
                } else {
                    maxHeap.pushpop(action);
                }
            }
        })
        let topData = minHeap.toArray().map(value => {
            return value.io;
        });
        // Train on opposite of bad data
        let bottomData = maxHeap.toArray().map(value => {
            value.io.output = value.io.output[0] === 0 ? [1, 0] : [0, 1]
            return value.io;
        });;
        minHeap.clear();
        maxHeap.clear();
        
        let trainingData = _.concat(bottomData, topData);

        // Train
        net.train(trainingData, {
            iterations: iterations,
            errorThresh: 0.001,
        });

        // Play with new network
        megaData = [];
        for(let i = 0; i < games; i++) {
            megaData.push(play(bragent));
        }

        let scores = megaData.map(value => {
            return value.reward;
        });
        // required for while loop
        score = _.mean(scores);

        // I want to see!!
        let scoreCounts = _.countBy(scores);
        let maxScore = _.max(scores);
        let minScore = _.min(scores);
        console.log(`Score: ${score}; Max: ${maxScore} x${scoreCounts[maxScore]}; Min: ${minScore} x${scoreCounts[minScore]}`);
    }

    console.log('YOU BEAT IT!\n');
}

// recursively call during qa (if any)
function qa() {
    main(100, 0.03, 100);
    setTimeout(() => {
        qa();
    }, 10000);
}
qa();
    