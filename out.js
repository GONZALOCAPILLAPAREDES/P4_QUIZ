const chalk = require ('chalk');
const figlet = require('figlet');

/**
 * Dar color a un string.
 *
 * @param msg Es el string al que hay que dar color.
 * @param color El color con el que pintar msg.
 * @returns {string} Devuelve el string msg con el color indicado.
 */
const colorize = (msg,color) => {
    if (typeof  color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribe un mensaje de log al que le hemos colorize
 *
 * @param msg El String a escribir
 * @param color Color del texto
 */
const log = (msg,color) => {
    console.log(colorize(msg,color));
};

/**
 * Escribe un mensaje log con letras grandes
 *
 * @param msg Texto a escribir.
 * @param color Color del texto.
 */
const biglog = (msg,color) =>{
    log(figlet.textSync(msg,{horizontalLayout: 'full'}),color);
};

/**
 * Escribe el mensaje de error emsg.
 *
 * @param emsg Texto del mensaje error.
 */
const errorlog = (emsg) => {
    console.log(`${colorize("Error","red")}: ${colorize(colorize(emsg,"red"),"bgYellowBright")}`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};

