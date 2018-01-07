const NobleDevice = require("noble-device");

const BIXI = function (peripheral) {
    NobleDevice.call(this, peripheral);
};

BIXI.is = function (peripheral) {
    return (peripheral.advertisement.localName === "BIXI_3823");
};

NobleDevice.Util.inherits(BIXI, NobleDevice);

module.exports = BIXI;