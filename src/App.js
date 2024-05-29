import React from "react";
import { useState, useEffect, useCallback } from "react";
// declare global {
//   interface Window {
//     google: any;
//   }
// }
export function App() {
  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedCardNetworks: ["VISA", "MASTERCARD"],
      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    },
  };

  console.log("script loaded");
  const googlePayBaseConfiguration = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [baseCardPaymentMethod],
  };

  const [gPayBtn, setGPayBtn] = useState(null);

  function getQueryParams() {
    const params = {};
    window.location.search
      .substring(1)
      .split("&")
      .forEach((param) => {
        const [key, value] = param.split("=");
        params[key] = decodeURIComponent(value);
      });
    return params;
  }

  const createAndAddButton = useCallback(() => {
    if (window.google && window.google.payments.api.PaymentsClient) {
      const googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
      });

      const googlePayButton = googlePayClient.createButton({
        buttonColor: "default",
        buttonType: "long",
        onClick: processPayment,
      });

      setGPayBtn(googlePayButton);
    }
  }, []);

  const queryParams = getQueryParams();
  const amount = queryParams.amount; // Access the dynamic amount
  console.log("Processing payment with amount: ", amount);
  const processPayment = useCallback(() => {
    console.log("Processing payment");

    const tokenizationSpecification = {
      type: "PAYMENT_GATEWAY",
      parameters: {
        gateway: "example",
        gatewayMerchantId: "exampleMerchantId",
      },
    };

    const cardPaymentMethod = {
      type: "CARD",
      tokenizationSpecification,
      parameters: {
        allowedCardNetworks: ["VISA", "MASTERCARD"],
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        billingAddressRequired: true,
        billingAddressParameters: {
          format: "FULL",
          phoneNumberRequired: true,
        },
      },
    };

    const transactionInfo = {
      totalPriceStatus: "FINAL",
      totalPrice: "123.45",
      currencyCode: "USD",
    };

    const merchantInfo = {
      merchantName: "Example Merchant Name",
    };

    const paymentDataRequest = {
      ...googlePayBaseConfiguration,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo,
      merchantInfo,
    };

    if (window.google && window.google.payments.api.PaymentsClient) {
      const googlePayClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST",
      });

      googlePayClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData) => {
          console.log(paymentData);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.async = true;
    script.onload = () => {
      if (window.google && window.google.payments.api.PaymentsClient) {
        const googlePayClient = new window.google.payments.api.PaymentsClient({
          environment: "TEST",
        });

        googlePayClient
          .isReadyToPay(googlePayBaseConfiguration)
          .then((response) => {
            if (response.result) {
              createAndAddButton();
            } else {
              alert("Unable to pay using Google Pay");
            }
          })
          .catch((err) => {
            console.error(
              "Error determining readiness to use Google Pay: ",
              err
            );
          });
      }
    };
    document.body.appendChild(script);
  }, [createAndAddButton]);

  return (
    <div className="App">
      <h1>Click the Pay button</h1>
      {gPayBtn && (
        <div
          ref={(el) => {
            if (el && gPayBtn) {
              el.appendChild(gPayBtn);
            }
          }}
        />
      )}
    </div>
  );
}
