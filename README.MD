# pesapal3

A nodejs implementation of pesapal payment gateway api.

## Features

pesapal3 implements secure pesapal payment gateway for nodejs. It consists of:

Its main features are:

#### Reliability

Connections are established even in the presence of:

- proxies and load balancers.
- personal firewall and antivirus software.

#### Minimalistic implementation

You do not need to understand the internal structures and operation of the systems.

#### Simple and convenient API

Sample code:

```ts
import { Pesapal, Iconfig } from "pesapal3";

const config: Iconfig = {
  pesapalEnvironment: "live", // or sandbox
  pesapalConsumerKey: "string",
  pesapalConsumerSecret: "string",
  pesapalIpnUrl: "string",
  pesapalCallbackUrl: "string",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

// make order
const details: IpayDetails = {
  // ...details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

//check status using the order tracking id provided by pesapal

const checkStatus = await paymentInstance.getTransactionStatus(
  "orderTrackingId"
);
```

## Installation

```bash
// with npm
npm install pesapal3

// with yarn
yarn add pesapal3
```

## How to use

The following example inits pesapal3 and gets the chat client and chat controller instances.

```ts
import { Pesapal, Iconfig, IpayDetails } from "pesapal3";

const config: Iconfig = {
  pesapalEnvironment: "live", // or sandbox
  pesapalConsumerKey: "string",
  pesapalConsumerSecret: "string",
  pesapalIpnUrl: "string",
  pesapalCallbackUrl: "string",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

// make order
const details: IpayDetails = {
  // ...details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

//check status using the order tracking id provided by pesapal

const checkStatus = await paymentInstance.getTransactionStatus(
  "orderTrackingId"
);

// provide an api ipn notfication call back
paymentRoutes.get("/ipn", async (req, res) => {
  const currntUrl = new URL(req.url);
  // get access to URLSearchParams object
  const searchParams = currntUrl.searchParams;

  // get url parameters
  const orderTrackingId = searchParams.get("OrderTrackingId") as string;
  const orderNotificationType = searchParams.get(
    "OrderNotificationType"
  ) as string;
  const orderMerchantReference = searchParams.get(
    "OrderMerchantReference"
  ) as string;

  // make sure you use main pesapal instance and not constrct another one

  if (!paymentInstance && !related) {
    return res
      .status(500)
      .send({ success: false, err: "internal server error" });
  }

  // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
  const response = await paymentInstance.getTransactionStatus(
    orderTrackingId,
    related._id
  );
  return response;
});
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/pesapal3). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
