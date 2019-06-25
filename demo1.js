const brain = require('brain.js');

const net = new brain.recurrent.LSTM();

function logProgress(net, iterations) {
    console.log(iterations);
    console.log('doe' + net.run('doe'));  // ', a deer, a female deer'
    console.log('ray' + net.run('ray'));
    console.log('me' + net.run('me'));
    console.log('d' + net.run('d'));
    console.log();
}

for(let i = 0; i < 10; i++) {
    let iterations = 20
    net.train([
    'doe, a deer, a female deer',
    'ray, a drop of golden sun',
    'me, a name, I call myself',
    ], {
        iterations: iterations,
        log: false
    });
    logProgress(net, iterations * (i+1));
}


