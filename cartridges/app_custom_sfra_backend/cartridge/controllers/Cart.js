'use strict';

var server = require('server');
var page = module.superModule;
server.extend(page);

server.append('AddProduct', function (req, res, next) {

    var Site = require('dw/system/Site');
    var Net = require('dw/net');
    var Util = require('dw/util');
    var URLUtils = require('dw/web/URLUtils');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var productAdded = currentBasket.productLineItems
    var productAdded = productAdded[productAdded.length - 1]

    var productID = productAdded.productID;
    var product = ProductMgr.getProduct(productID);
    var productLink = URLUtils.http('Product-Show', 'pid', productID).toString();
    var productPicture = product.getImage('medium').getAbsURL().toString();
    var productName = product.name;
    var productDescription = product.pageDescription;
    var productPrice = productAdded.basePrice.value;
    var currencyCode = productAdded.price.currencyCode;
    var productQuantity = productAdded.quantityValue;

    var template: Template = new Util.Template("mail");
    var productInfo: Map = new Util.HashMap();
        productInfo.put("productID",productID);
        productInfo.put("productLink",productLink);
        productInfo.put("productPicture",productPicture);
        productInfo.put("productName",productName);
        productInfo.put("productDescription",productDescription);
        productInfo.put("productPrice",productPrice);
        productInfo.put("currencyCode",currencyCode);
        productInfo.put("productQuantity", Math.round(productQuantity).toFixed(0));
        productInfo.put("emailSubject", Site.current.getCustomPreferenceValue('emailSubjectCartProductAdded'));
    var message: MimeEncodedText = template.render(productInfo);
    var mail: Mail = new Net.Mail();
    mail.addTo(Site.current.getCustomPreferenceValue('emailAdmin'));
    mail.setFrom(Site.current.getCustomPreferenceValue('emailFrom'));
    mail.setSubject(Site.current.getCustomPreferenceValue('emailSubjectCartProductAdded'));
    mail.setContent(message);
    mail.send();

    next();
    }
);

module.exports = server.exports();
