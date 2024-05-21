'use strict';

var server = require('server');
var page = module.superModule;
server.extend(page);

server.append('Show', function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var CatalogMgr = require('dw/catalog/CatalogMgr');

    var productId = req.querystring.pid;
    var productInfo = ProductMgr.getProduct(productId);

    if (productInfo) {
        var primaryCategory = productInfo.primaryCategory;
        if (primaryCategory) {
            var ProductSearchModel = require('dw/catalog/ProductSearchModel');
            var searchModel = new ProductSearchModel();
            var sortingRule = CatalogMgr.getSortingRule('price-low-to-high');
            searchModel.setSortingRule(sortingRule);
            searchModel.setCategoryID(primaryCategory.ID);
            searchModel.search();

            var categoryProducts = searchModel.getProductSearchHits().asList().slice(0, 5).toArray();
            categoryProducts = categoryProducts.filter(function(i) {
                return i.product.ID !== productInfo.ID;
            });
            categoryProducts = categoryProducts.slice(0, 4);

            res.render('product/productDetails', {
                productInfo: productInfo,
                primaryCategory : primaryCategory,
                categoryProducts: categoryProducts
            });
        } else {
            res.render('product/productDetails', {
                productInfo: productInfo,
                primaryCategory : primaryCategory,
                categoryProducts: []
            });
        }
    } else {
        res.render('error/notFound');
    }
    next();
});

module.exports = server.exports();
