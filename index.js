const fetch = require('node-fetch');
const BIXI = require('./lib/BIXI');

const BIXIServiceUUID = "deadbeef8165c3419aeb4ba40df63ace"
const BIXIServiceNotificationUUID = "deadbeef8165c3419aeb4ba47ebded8e";


BIXI.discover(function (bixiInstance) {
    console.log("BIXI Discovered.");

    bixiInstance.on('disconnect', function () {
        console.log('BIXI Disconnected.');
        process.exit(1);
    });

    connectAndSetup(bixiInstance)
        .then(() => discoverServicesAndCharacteristics(bixiInstance))
        .then(() => notifyCharacteristic(bixiInstance, BIXIServiceUUID, BIXIServiceNotificationUUID, true, onDataReceived));
});

function connectAndSetup(bixiInstance) {
    return new Promise((resolve, reject) => {
        bixiInstance.connectAndSetUp(function (error) {
            if (error)
                reject(error);
            console.log('BIXI Connected');
            resolve();
        });
    });
}

function discoverServicesAndCharacteristics(bixiInstance) {
    return new Promise((resolve, reject) => {
        bixiInstance.discoverServicesAndCharacteristics(function (err, response) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function notifyCharacteristic(bixiInstance, serviceUuid, characteristicUuid, notify, listener) {
    return new Promise((resolve, reject) => {
        if (!bixiInstance.hasService(serviceUuid)) {
            reject(new Error('service uuid ' + serviceUuid + ' not found!'));
        } else if (!bixiInstance.hasCharacteristic(serviceUuid, characteristicUuid)) {
            reject(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
        }

        var characteristic = bixiInstance._characteristics[serviceUuid][characteristicUuid];

        characteristic.notify(notify, function (error) {
            if (notify) {
                characteristic.addListener('data', listener);
            } else {
                characteristic.removeListener('data', listener);
            }
        });

        resolve();
    })
};

function onDataReceived(data) {
    const commandTag = data.readUInt16LE(0);
    console.log("commandTag", commandTag);

    let currency;
    switch(commandTag) {
        case 42285:
            currency = 'BTC';
            break;
        case 42242:
            currency = 'LTC';
            break;
        default:
            currency = 'ETH';
            break;
        }
    return getCryptoData(currency);
};

function getCryptoData(currency) {
    return fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${currency}&tsyms=USD`)
    .then(function(res) {
        return res.json();
    }).then(function(json) {
        console.log(json.DISPLAY);
    });
}