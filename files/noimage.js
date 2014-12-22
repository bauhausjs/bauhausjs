var m = module.exports = {};
var dataUrl = 'data:image/jpeg;base64,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';
var data = {'kw':80,'kh':40};
var dataString = dataUrl.split(",");
var buffer = new Buffer(dataString[1], 'base64');
var contentType = dataString[0].split(":")[1];
contentType = contentType.split(";")[0];
var width = data.kw - data.kw % 1; // Abrunden
var height = data.kh - data.kh % 1; // Abrunden
var getGCD = function (nominator, denominator) {
    'use strict';
    return ((nominator > 0) ? getGCD(denominator % nominator, nominator) : denominator);
}

var gcd = getGCD(width, height);

var metadata = {
    "content-type": contentType,
    "width": width,
    "height": height,
    "aspectRatio": {
        value: width / height,
        text: (width / gcd) + ':' + (height / gcd)
    }
};
m.buffer = buffer;
m.metadata = metadata;