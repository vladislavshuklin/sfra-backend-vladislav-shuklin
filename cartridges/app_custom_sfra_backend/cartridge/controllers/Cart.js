"use strict";

var server = require("server");
var page = module.superModule;
server.extend(page);

server.append("Show", function(req, res, next) {
    var Site = require("dw/system/Site");
    var BasketMgr = require("dw/order/BasketMgr");
    var currentBasket = BasketMgr.getCurrentBasket();

    var totalPriceCount = currentBasket.adjustedMerchandizeTotalPrice.value;
    var priceToExceed = Site.current.getCustomPreferenceValue("cartTresholdAmount");

    if (totalPriceCount >= priceToExceed) {
        res.setViewData({
            totalPriceCount: totalPriceCount,
            priceToExceed: priceToExceed
        });
    }

    next();
});

module.exports = server.exports();
