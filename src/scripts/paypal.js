import paypal from 'paypal-checkout';
import client from "braintree-web/client";
import paypalCheckout from 'braintree-web/paypal-checkout';

/* eslint-disable no-unused-expressions */
(async () => {
    var token = await fetch("http://api.iceproductions.dev/client_token");
    const TOKEN = await token.text();
    const AMOUNT = 10.00;

    paypal.Button.render({
        braintree: {
            client: client,
            paypalCheckout: paypalCheckout
        },
        client: {
            sandbox: TOKEN
        },
        env: "sandbox",
        commit: true,
        payment: function (data, actions) {
            return actions.braintree.create({
                flow: 'checkout', // Required
                amount: AMOUNT, // Required
                currency: 'USD', // Required
                enableShippingAddress: false
            });
        },

        onAuthorize: async function (payload) {
            payload.nonceV = payload.nonce;
            payload.amount = AMOUNT;
            console.log(payload, "as", JSON.stringify(payload));
            var res = await fetch("http://api.iceproductions.dev/nonce", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            console.log(await res.text());
        },
    }, '#paypalCheckout');
})//()