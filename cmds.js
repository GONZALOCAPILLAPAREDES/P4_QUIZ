
const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

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
exports.listCmd = rl => {

    models.quiz.findAll()
        .each(quiz => {

            log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);

        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();

        });
};

/**
 * Esta funcion devuelve una promesa que:
 * - Valida que se ha introducido un valor para el parametro.
 * - Convierte el parametro en un numero entero.
 * Si todo va bien, la promesa se satisface y devuelve el valor de id a usar
 *
 * @param id Parametro con el indice a validar
 *
 */
const validateId = id =>{
    return new Sequelize.Promise((resolve, reject) =>{
        if (typeof id === "undefined"){
            reject(new Error(`Falta el parámetro <id>.`));
        }else{
            id = parseInt(id);
            if(Number.isNaN(id)){
                reject(new Error (`El valor del parámetro <id> no es un número.`));
            }else{
                resolve(id);
            }

        }
    });
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.showCmd = (rl,id) =>{
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw  new Error(`No existe un quiz asociado al id= ${id}.`);
            }
            log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(error =>{
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });


};

/**
 * Esta función convierte la llamada rl.question, que está basada en callbacks,
 * en una basada en promesas.
 *
 * Esta función devuelve una promesaa que cuando se cumple, proporciona el texto introducido.
 * Entonces la llamada a then que hay que hacer la promesa devuelta será:
 *             .then(asnwer => {...})
 * Tambien colorea en rojo el texto de la pregunta, elimina espacios al principio y al final
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param text Pregunta que hay que hacerle al usuario.
 */
const makeQuestion = (rl,text) =>{
    return new Sequelize.Promise ((resolve, reject) =>{
        rl.question(colorize(text,'red'), answer =>{
            resolve(answer.trim());
        });
    });
};


/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(g => {
            return makeQuestion(rl, 'Introduzca la respuesta')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};


/**
 * Borra un quiz del modelo.
 *
 * @param id Cclave del quiz a borrar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.deleteCmd = (rl,id) => {

        validateId(id)
            .then(id => models.quiz.destroy({where: {id}}))
            .catch(error => {
                errorlog(error.message);
            })
            .then(() => {
                rl.prompt();
            });
};

/**
 * Edita un quiz del modelo.
 *
 * @param id Clave del quiz a editar en el modelo.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw  new Error(`No existe un quiz asociado al id= ${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            }, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then(g => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer)
                    }, 0);
                    return makeQuestion(rl, 'Introduzca la repsuesta ')
                        .then(a => {
                            quiz.question = g;
                            quiz.answer = a;
                            return quiz;
                        });
                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`)
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message)
        })
        .then(() => {
            rl.prompt();
        });

};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo que debemos contestar.
 * @param id Clave del quiz a probar.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.testCmd = (rl,id) => {
      validateId(id)              //miro si el id es valido
          .then(id => models.quiz.findById(id))  // busco la question a editar
          .then(quiz => {
              if(!quiz){      //si no eixste ningun quiz con ese id
                  throw new Error(`No existe un quiz asociado al id= ${id}`);
              }
              return makeQuestion(rl, 'Introduzca la respuesta: ')
                  .then(answer => {
                        respuesta = answer.trim().toLowerCase();

                        if(respuesta === quiz.answer.toLowerCase()){
                            console.log(`Respuesta correcta`);

                        } else{
                            console.log(`Respuesta incorrecta fin`);
                        }
                  })
          })
          .catch(Sequelize.ValidationError, error => {
           errorlog(`El quiz es erróneo: `);
           error.errors.forEach(({message}) => errorlog(message));
          })
          .catch(error => {
              errorlog(error.message);
          })
          .then(() =>{
              rl.prompt();
          });
};


/**
 * Pregunta todos los quizes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.playCmd = rl =>{
    let score = 0;

    let toBeResolved = []; // aqui guardare los ids de las preguntas existentes


    const playOne = () => {

        return Promise.resolve()
            .then(() => {
                if (toBeResolved.length <= 0) {
                    log(`No hay nada más que preguntar`);
                    log(`Fin del juego. Aciertos: ${colorize(score, 'green')}`);
                    return;
                }

                let randomid = Math.floor((Math.random() * toBeResolved.length));
                let randomquiz = toBeResolved[randomid];

                toBeResolved.splice(randomid, 1);

                return makeQuestion(rl, randomquiz.question + '?')
                    .then(answer => {
                        if (answer.toLowerCase().trim() === randomquiz.answer.toLowerCase().trim()) {
                            score++;
                            console.log(` Respuesta Correcta`);
                            return playOne();
                        } else {
                            console.log(`Respuesta Incorrecta`);

                        }
                    })
            })

    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
            toBeResolved = quizzes;

        })
        .then(() => {
            return playOne();
        })
        .catch(error =>{
            errorlog(error.message);
        })
        .then(() =>{
            console.log('Fin'+ score);
            rl.prompt();
        });
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