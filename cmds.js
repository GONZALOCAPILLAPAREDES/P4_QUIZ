const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

/**
 * Muestra la ayuda.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.helpCmd = rl =>{
    log("comandos:");
    log(" h|help - muestra esta ayuda.");
    log(" list - listar los quizzes existentes.");
    log(" show <id> - muestra la pregunta y la respuesta del quiz indicado.");
    log(" add - añadir un nuevo quiz interactivamente.");
    log(" delete <id> - borrar el quiz indicado.");
    log(" edit <id> - editar el quiz indicado.");
    log(" test <id> - probar el quiz indicado.");
    log(" p|play - jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - créditos.");
    log(" q|quit - salir del programa.");
    rl.prompt();
};


/**
 * Lista todos los quizzes existentes en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.listCmd = rl =>{

    model.getAll().forEach((quiz,id)=> {

        log(`[${colorize(id,'magenta')}]: ${quiz.question}`);
    });

    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.showCmd = (rl,id) =>{

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        try {
            const quiz = model.getByIndex(id);
            log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.addCmd = rl =>{

    rl.question(colorize(' Introduzca una pregunta: ', 'red'),question => {

        rl.question(colorize(' Introduzca una respuesta: ', 'red'),answer => {

            model.add(question,answer);
            log(`${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

/**
 * Borra un quiz del modelo.
 *
 * @param id Cclave del quiz a borrar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.deleteCmd = (rl,id) => {

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        try {
             model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }


    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave del quiz a editar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.editCmd = (rl,id) =>{

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'),question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca una respuesta: ', 'red'),answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id ,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }

    rl.prompt();
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo que debemos contestar.
 * @param id Clave del quiz a probar.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.testCmd = (rl,id) => {

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }
    else{
        try {
            const quiz = model.getByIndex(id);

            rl.question (colorize( quiz.question, 'red'),respuesta =>{
                respuesta = respuesta.trim().toLowerCase();

                if(respuesta === quiz.answer.toLowerCase()){

                    log(`Su respuesta es:`);
                    log('Correcta','green');
                    rl.prompt();

                }else{
                    log(`Su respuesta es:`);
                    log('Incorrecta','red');
                    rl.prompt();

                }


            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Pregunta todos los quizes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.playCmd = rl =>{
    let score = 0;

    let toBeResolved = model.getAll(); //guardo los ids de las preguntas existentes


    const playOne = () =>{
        if(toBeResolved.length === 0 ){
            log(`No hay nada más que preguntar`);
            log(`Fin del juego. Aciertos: ${colorize(score,'green')}`);
           // biglog(`${score}`, 'magenta');

        rl.prompt();

        }else {

            let randomid =  Math.floor((Math.random() * toBeResolved.length));
            let randomquiz = toBeResolved[randomid];


            rl.question(colorize( randomquiz.question, 'red'), resp => {

                if(resp.trim().toLowerCase() === randomquiz.answer.toLowerCase()){

                    score++;

                    console.log("Su respuesta es:");
                    log('Incorrecta', 'green');

                    log(`CORRECTO - Lleva ${score} aciertos. `);


                    toBeResolved.splice(randomid,1);
                    playOne();

                }else{
                    console.log("Su respuesta es:");
                    log('Incorrecta', 'red');
                    log(`Fin del juego. Aciertos: ${colorize(score,'green')}`);
                   // biglog(`${score}`, 'magenta');
                    rl.prompt();
                }

            });
        }
    };

    playOne();
};

/**
 * Muestra los nombres de los autores de la práctica.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.creditsCmd = rl =>{
    log('Autores de la práctica:');
    log('Gonzalo Capilla Paredes','green');
    rl.prompt();
};

/**
 * Terminar el programa.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.quitCmd = rl =>{
    rl.close();

};