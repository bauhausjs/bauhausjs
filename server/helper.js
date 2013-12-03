
var helper = module.exports = {};

helper.logWelcome = function (app) {

    var packageInfo = require('../package.json');
    var version = packageInfo.version;


    var mode;
    switch (app.settings.env) {
        case 'development':
            mode = '\u001b[93m development';
            break;
        case 'production':
            mode = '\u001b[92m production ';
            break;
        default:
            mode = app.settings.env;

    }

    console.log('\u001b[90m                                                  | |');
    console.log('                                                  | |');
    console.log('       ____              _                        | |____ '); 
    console.log('      | __ )  __ _ _   _| |__   __ _ _   _ ___    | / ___| ');
    console.log('      |  _ \\ / _` | | | | \'_ \\ / _` | | | / __|_  | \\___ \\ ');
    console.log('______| |_) | (_| | |_| | | | | (_| | |_| \\__ \\ |_| |___) |');
    console.log('___________/ \\__,_|\\__,_| | |_|\\__,_|\\__,_|___/\\___/|____/ ');
    console.log('\u001b[90m                        | | \u001b[93m           \u001b[91m _______   \u001b[94m      ');
    console.log('\u001b[90m       v' + version + '           | | \u001b[93m    /\\    \u001b[91m |       | \u001b[94m  ,-´´-, ');
    console.log('\u001b[90m                        | | \u001b[93m   /  \\   \u001b[91m |       | \u001b[94m /      \\ ');
    console.log('\u001b[90m      ' + mode + '      \u001b[90m| | \u001b[93m  /    \\  \u001b[91m |       | \u001b[94m \\      / ');
    console.log('\u001b[90m                        | | \u001b[93m /______\\ \u001b[91m |_______| \u001b[94m  `-,,-´');
    console.log('');
};