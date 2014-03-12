var ejs = require('ejs');

ejs.filters.img = function (id, options) {
    if (!id) return id;

    var optionString = '';
    for (var o in options) {
        optionString += o + '=' + options[o] + '&';
    }
    return '<img src="/assets/' + id + '?' + optionString + '">';
}