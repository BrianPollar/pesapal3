import { PesaPalController } from "./controllers/payment.controller";
interface Iconfig {
    pesapalEnvironment: string;
    pesapalConsumerKey: string;
    pesapalConsumerSecret: string;
    pesapalIpnUrl: string;
    pesapalCallbackUrl: string;
}
export declare class Pesapal {
    static config: Iconfig;
    static pesapalUrl: string;
    private paymentInstance;
    constructor(config: Iconfig);
    run(): PesaPalController;
}
export {};
