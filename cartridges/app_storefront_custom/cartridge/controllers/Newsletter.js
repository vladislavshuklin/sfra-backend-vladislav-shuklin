"use strict";

var server = require("server");

var csrfProtection = require("*/cartridge/scripts/middleware/csrf");
var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");

server.get("Subscribe", consentTracking.consent, server.middleware.https, csrfProtection.generateToken, function(
    req,
    res,
    next
) {
    var URLUtils = require("dw/web/URLUtils");
    var Resource = require("dw/web/Resource");

    var newsletterForm = server.forms.getForm("newsletter");
    newsletterForm.clear();

    res.render("newsletter/newsletterFormSubscribe", {
        title: Resource.msg("newsletter.form.title.subscribe", "newsletter", null),
        newsletterForm: newsletterForm,
        actionUrl: URLUtils.url("Newsletter-Success").toString()
    });

    next();
});

server.post("Success", server.middleware.https, consentTracking.consent, csrfProtection.generateToken, function(
    req,
    res,
    next
) {
    var UUIDUtils = require("dw/util/UUIDUtils");
    var Site = require("dw/system/Site");
    var Net = require("dw/net");
    var Util = require("dw/util");
    var Resource = require("dw/web/Resource");
    var CustomObjectMgr = require("dw/object/CustomObjectMgr");
    var CouponMgr = require("dw/campaign/CouponMgr");
    var PromotionMgr = require("dw/campaign/PromotionMgr");
    var Transaction = require("dw/system/Transaction");

    var newsletterForm = server.forms.getForm("newsletter");
    var firstName = newsletterForm.customer.firstname.value;
    var lastName = newsletterForm.customer.lastname.value;
    var email = newsletterForm.customer.email.value;
    var noCouponMessage = Resource.msg("newsletter.co.noCoupons", "newsletter", null);

    // Check if the email already exists

    var existingCustomObject = CustomObjectMgr.queryCustomObjects(
        "NewsletterSubscription",
        "custom.email = {0}",
        null,
        email
    );

    if (existingCustomObject.hasNext()) {
        res.render("newsletter/newsletterFormError", {
            title: Resource.msg("newsletter.form.title.error", "newsletter", null),
            firstName: firstName,
            lastName: lastName,
            email: email
        });

        return next();
    }

    // SAVE FORM TO CUSTOMER OBJECTS

    Transaction.begin();

    var id = UUIDUtils.createUUID();
    var customObject = CustomObjectMgr.createCustomObject("NewsletterSubscription", id);
    customObject.custom.firstName = firstName;
    customObject.custom.lastName = lastName;
    customObject.custom.email = email;
    var newsletterCoupon = CouponMgr.getCoupon("newsletterSubscriptionCoupon").getNextCouponCode();
    // var newsletterCoupon = null; // uncomment to see no coupons result

    if (newsletterCoupon) {
        customObject.custom.newsletterCoupon = newsletterCoupon;
    } else {
        customObject.custom.newsletterCoupon = noCouponMessage;
    }

    Transaction.commit();

    // RENDER WEB PAGE

    if (newsletterCoupon) {
        var webTemplate = "newsletter/newsletterFormSuccess";
    } else {
        var webTemplate = "newsletter/newsletterFormNoCoupon";
    }

    res.render(webTemplate, {
        title: Resource.msg("newsletter.form.title.success", "newsletter", null),
        firstName: firstName,
        lastName: lastName,
        email: email,
        newsletterCoupon: newsletterCoupon
    });

    // RENDER EMAIL

    var mail: Mail = new Net.Mail();
    mail.addTo(Site.current.getCustomPreferenceValue("emailAdmin"));
    // mail.addTo(email);
    mail.setFrom(Site.current.getCustomPreferenceValue("emailFrom"));
    mail.setSubject(Site.current.getCustomPreferenceValue("emailNewsletterSubject"));

    var newsletterInfo: Map = new Util.HashMap();
    newsletterInfo.put("firstName", firstName);
    newsletterInfo.put("lastName", lastName);
    newsletterInfo.put("email", email);
    newsletterInfo.put("newsletterCoupon", newsletterCoupon);

    if (newsletterCoupon) {
        var newsletterEmailTemplate: Template = new Util.Template("newsletter/newsletterEmailSuccess");
    } else {
        var newsletterEmailTemplate: Template = new Util.Template("newsletter/newsletterEmailNoCoupon");
    }

    var emailMessage: MimeEncodedText = newsletterEmailTemplate.render(newsletterInfo);
    mail.setContent(emailMessage);
    mail.send();

    next();
});

module.exports = server.exports();
