const Sequelize = require('sequeLize');

 const sequeLize = new Sequelize("sqLite:quizzes.sqLite",{logging: false});

 sequeLize.define('quiz',{
     question:{
         type: Sequelize.STRING,
         unique: {msg:"Ya existe esta pregunta"},
         validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}}
     },
     answer: {
         type: Sequelize.STRING,
         validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
     }
 });

 sequeLize.sync()
     .then(() => sequeLize.models.quiz.count())
     .then(count => {
         if(!count){
             return sequeLize.models.quiz.bulkCreate([
                 {question: "Capital de Italia", answer:"Roma"},
                 {question: "Capital de Francia", answer:"París"},
                 {question: "Capital de España", answer:"Madrid"},
                 {question: "Capital de Portugal", answer:"Lisboa"}
             ]);
         }
     })
     .catch(error =>{
         console.log(error);
     });
 module.exports = sequeLize;

