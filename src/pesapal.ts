import { PesaPalController } from "./controllers/payment.controller";

interface Iconfig {
  pesapalEnvironment: string;
  pesapalConsumerKey: string;
  pesapalConsumerSecret: string;
  pesapalIpnUrl: string;
  pesapalCallbackUrl: string;
}


export class Pesapal {
  static config: Iconfig;
  static pesapalUrl: string;
  private paymentInstance: PesaPalController;

  constructor(config: Iconfig) {
    Pesapal.config = config;
    if(config.pesapalEnvironment === 'live') {
      Pesapal.pesapalUrl = 'https://pay.pesapal.com/v3';
    } else {
      Pesapal.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
    }
    this.paymentInstance = new PesaPalController();
    
  }

  run() {
    this.paymentInstance.registerIpn();
    return this.paymentInstance;
  }
}