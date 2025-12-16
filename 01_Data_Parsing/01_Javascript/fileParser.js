const fs = require("fs");
const { parse, stringify } = require("yaml");
const { DOMParser } = require("@xmldom/xmldom"); // install: npm install @xmldom/xmldom

class FileParserCustom {
    parseJson(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);
        return JSON.stringify(data, null, 4);
    }

    parseXml(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");
        const xmlDocAsString = xmlDoc.toString();
        console.log(xmlDocAsString)

        return xmlDocAsString
    }

    parseYaml(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const data = parse(content);
        const dataAsString = stringify(data)
        
        console.log(dataAsString)
        return dataAsString; 
    }

    parseText(filePath) {
        return fs.readFileSync(filePath, "utf8");
    }

    parseCsv(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const rows = content.split("\n").map(line => line.split(","));
        return rows.map(row => row.join(", ")).join("\n");
    }
}

module.exports = FileParserCustom;


