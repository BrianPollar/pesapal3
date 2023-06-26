import { PesaPalController } from './controllers/payment.controller';

/**
 * This interface defines the configuration for PesaPal.
 */
export interface Iconfig {
  /**
   * The environment for PesaPal.
   *
   * Can be either `sandbox` or `live`.
   */
  pesapalEnvironment: 'sandbox' | 'live';

  /**
   * The consumer key for PesaPal.
   */
  pesapalConsumerKey: string;

  /**
   * The consumer secret for PesaPal.
   */
  pesapalConsumerSecret: string;

  /**
   * The IPN URL for PesaPal.
   */
  pesapalIpnUrl: string;

  /**
   * The callback URL for PesaPal.
   */
  pesapalCallbackUrl: string;
}

export class Pesapal {
  /**
   * This is a static property that holds the configuration for PesaPal.
   * The configuration object is of type `Iconfig`, which is an interface that defines the following properties:
   * `environment`: The environment in which PesaPal is running (e.g., "live" or "sandbox").
   * `merchantId`: The merchant ID for PesaPal.
   * `secretKey`: The secret key for PesaPal.
   */
  static config: Iconfig;

  /** 
   * This is a static property that holds the URL for PesaPal.
   * The URL is used to make requests to the PesaPal API.
   */
  static pesapalUrl: string;

  /**
   * This is a private property that holds the instance of the `PesaPalController` class.
   * The `PesaPalController` class is responsible for making requests to the PesaPal API.
   */
  private paymentInstance: PesaPalController;

  constructor(config: Iconfig) {
    Pesapal.config = config;
    if (config.pesapalEnvironment === 'live') {
      Pesapal.pesapalUrl = 'https://pay.pesapal.com/v3';
    } else {
      Pesapal.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
    }
    this.paymentInstance = new PesaPalController();
  }

  /** 
   * This is a method that is used to run the PesaPal payment gateway.
   * The method returns the instance of the `PesaPalController` class.
   * `this.paymentInstance.registerIpn();`
   * This line of code registers the `PesaPalController` class to receive IPN notifications from PesaPal.
   * `return this.paymentInstance;`
   * This method returns the instance of the `PesaPalController` class.
   */
  run() {
    this.paymentInstance.registerIpn();
    return this.paymentInstance;
  }
}
