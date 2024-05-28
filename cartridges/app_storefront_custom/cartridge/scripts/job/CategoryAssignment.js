"use strict";

var File = require("dw/io/File");
var FileWriter = require("dw/io/FileWriter");
var XMLStreamWriter = require("dw/io/XMLStreamWriter");
var Status = require("dw/system/Status");
var Site = require("dw/system/Site");
var Logger = require("dw/system/Logger");

function execute(args) {
    try {
        var brand = args.brand;
        var categoryID = args.categoryID;
        var catalogID = args.catalogID;
        Logger.info('You are searching for brand "{0}".', brand);
        Logger.info('You want to assign products to the category "{0}" in the catalog "{1}".', categoryID, catalogID);
    } catch (error) {
        Logger.error("Please set the following job parameters: brand, categoryID, catalogID");
        return new Status(Status.ERROR, "ERROR", error.message);
    }

    try {
        // MANUAL PRODUCTS ARRAY FOR XML
        var productIDs = ["008885004519M", "008884304085M", "008884304108M"];

        // Generate XML file in the root folder
        var file = new File(File.IMPEX + "/categoryAssignment.xml");
        var fileWriter = new FileWriter(file);
        var xsw = new XMLStreamWriter(fileWriter);

        // Function to write new lines and indent code
        function writeNewLineAndIndent(xsw, indentLevel) {
            xsw.writeCharacters("\n" + "    ".repeat(indentLevel));
        }

        // Write XML
        xsw.writeStartDocument("UTF-8", "1.0");
        writeNewLineAndIndent(xsw, 0);
        xsw.writeStartElement("catalog");
        xsw.writeAttribute("xmlns", "http://www.demandware.com/xml/impex/catalog/2006-10-31");
        xsw.writeAttribute("catalog-id", catalogID);
        productIDs.forEach(function(productID) {
            writeNewLineAndIndent(xsw, 1);
            xsw.writeStartElement("category-assignment");
            xsw.writeAttribute("category-id", categoryID);
            xsw.writeAttribute("product-id", productID);
            xsw.writeEndElement();
        });
        writeNewLineAndIndent(xsw, 0);
        xsw.writeEndElement();
        writeNewLineAndIndent(xsw, 0);
        xsw.writeEndDocument();
        xsw.close();
        fileWriter.close();

        return new Status(Status.OK, "OK", "Successfully assigned products to category and generated XML file.");
    } catch (error) {
        statusOK = false;
        Logger.error("Error executing script: " + error.message);
        return new Status(Status.ERROR, "ERROR", error.message);
    }
}

exports.execute = execute;
