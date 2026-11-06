function numberOfWords(str) {
    if (str === '') {
        return 0;
    }
    str = str.replace(/(^\s*)|(\s*$)/gi, "");
    str = str.replace(/[ ]{2,}/gi, " ");
    str = str.replace(/\n /, "\n");
    return str.split(' ').length;
}

function numberOfMinutes(str) {
    let minutes = 1;

    if (str === '')
        minutes = 0;

    if (numberOfWords(str) >= 100) {
        minutes = numberOfWords(str) / 100;
    }
    return minutes;
}

function platformCommission(price, commissionRate = 0) {
    let fee = commissionRate > 0 ? commissionRate : commissions('platform');
    return price * fee / 100;
}

function commissions(type = null) {
    let commissions = JSON.parse(COMMISSIONS);
    return type ? commissions[type] : commissions;
}

function totalCommission(price, paymentMethod = 'stripe') {
    return platformCommission(price) + paymentGatewayCommission(price, paymentMethod);
}

function calculatePriceFromPercentage(price, percentage) {
    return price + (price * percentage / 100);
}

function calculateValueFromPercentage(price, percentage) {
    return price * percentage / 100;
}

function paymentGatewayCommission(price, paymentMethod = 'stripe') {
    let fee = 0;
    if (paymentMethod === 'paypal') {
        fee = commissions('paypal');
    }
    if (paymentMethod === 'stripe') {
        fee = commissions('stripe');
    }
    return price * fee / 100;
}

function scenarioPrice(script, pricePerMinute) {
    return pricePerMinute * numberOfMinutes(script);
}

function amountToBePaid(script, price_per_minute, payment_method = 'stripe') {
    return scenarioPrice(script, price_per_minute) + totalCommission(scenarioPrice(script, price_per_minute), payment_method);
}

function servicesPrice(services, numberOfMinutesScenario, totalPrice) {
    let totalValue = 0;
    let totalPercentage = 0;

    if (services.length > 0) {
        let serv;
        let arrValue = [];
        let arrPercentage = [];
        let sumPercentage = 0;

        $.each(services, (index, service) => {
            serv = JSON.parse(service);
            if (parseInt(serv.type) === 1)   //type percentage= 1
                arrPercentage.push(serv.value);

            if (parseInt(serv.type) === 2)  //type value= 2
                arrValue.push(serv.value);
        });

        if (arrValue.length > 0) {
            let sum = sumArray(arrValue);
            totalValue = (sum + platformCommission(sum)) * numberOfMinutesScenario;
        }

        if (arrPercentage.length > 0) {
            sumPercentage = sumArray(arrPercentage);
            totalPercentage = calculatePriceFromPercentage(parseFloat(totalPrice), sumPercentage) * this.numberOfMinutesScenario;
        }

        return parseFloat(totalValue + totalPercentage).toFixed(2);
    }
}
