/**
 * The Pesapal class is responsible for managing the configuration and initialization of the PesaPal payment gateway.
 *
 * The class takes a configuration object of type `Iconfig` in the constructor,
 * which defines the necessary settings for the PesaPal integration, such as
 * the environment, consumer key, consumer secret, IPN URL, and callback URL.
 *
 * The `run()` method is used to initialize the PesaPal payment gateway
 * by registering the IPN endpoint and retrieving the IPN endpoints.
 * It returns the instance of the `PesaPalController` class, which can be used to interact with the PesaPal API.
 */
import { Pesapal } from './utils/pesapal';

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
}


export const initialisePesapal = async(config: Iconfig) => {
  const paymentInstance = new Pesapal(config);

  await paymentInstance.registerIpn();
  await paymentInstance.getIpnEndPoints();

  return paymentInstance;
};