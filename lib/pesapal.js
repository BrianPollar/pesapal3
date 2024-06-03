"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pesapal = void 0;
const payment_controller_1 = require("./controllers/payment.controller");
class Pesapal {
    constructor(config) {
        // Pesapal.config = config;
        if (config.pesapalEnvironment === 'live') {
            Pesapal.pesapalUrl = 'https://pay.pesapal.com/v3';
        }
        else {
            Pesapal.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
        }
        this.paymentInstance = new payment_controller_1.PesaPalController(config);
    }
    /**
     * This is a method that is used to run the PesaPal payment gateway.
     * The method returns the instance of the `PesaPalController` class.
     * `this.paymentInstance.registerIpn();`
     * This line of code registers the `PesaPalController` class to receive IPN notifications from PesaPal.
     * `return this.paymentInstance;`
     * This method returns the instance of the `PesaPalController` class.
     */
    async run() {
        await this.paymentInstance.registerIpn();
        await this.paymentInstance.getIpnEndPoints();
        return this.paymentInstance;
    }
}
exports.Pesapal = Pesapal;
//# sourceMappingURL=pesapal.js.map