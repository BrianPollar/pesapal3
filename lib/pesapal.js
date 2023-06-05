"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pesapal = void 0;
const payment_controller_1 = require("./controllers/payment.controller");
class Pesapal {
    constructor(config) {
        Pesapal.config = config;
        if (config.pesapalEnvironment === 'live') {
            Pesapal.pesapalUrl = 'https://pay.pesapal.com/v3';
        }
        else {
            Pesapal.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
        }
        this.paymentInstance = new payment_controller_1.PesaPalController();
    }
    run() {
        this.paymentInstance.registerIpn();
        return this.paymentInstance;
    }
}
exports.Pesapal = Pesapal;
//# sourceMappingURL=pesapal.js.map