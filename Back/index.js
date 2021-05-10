var express = require('express');
var router = express.Router();
// var py = require('../pypy/python');
const fs = require('fs');
const {spawn} = require("child_process");
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test/:id', function (req, res, next) {
  res.render('test', { output: req.params.id });
});

router.get('/GenererFichier', function(req, res){
  console.log(req.query);
  //Récupération des parametre de la quete /
  //Generation des fichier JSON
  let dataFrom = req.query;
  /**Le date est sous la forme
{
  input_header: '{"dataset_config":{"class_name":"MNIST","name":"MNIST","versions":"3.0.1","size":11.06,"FeaturesDict":{"image":{"type":"Image","shape":[28,28,1],"dtype":"tf.uint8"},"classLabel":{"shape":[],"dtype":"tf.int64","num_classes":10}}},"custom_param":{"epoch":5,"batch_size":10}}',
  metrics: [ '[]' ],
  optimizer_config: '{"config":{"learning_rate":0.001,"beta_1":0.9,"beta_2":0.999,"epsilon":1e-7,"name":"Adam"}}',
  loss: 'BinaryCrossentropy'
}

Pour pouvoir récupérer les donnée input_headern metrics, optimizer_config et loss, il faut faire un JSON.parse
Exemple, récupération du Epoch et batch_size 
  */
 let custom_param = JSON.parse(dataFrom.input_header).custom_param;
  console.log(custom_param);

   fs.writeFileSync('tmp/custom_param.json',JSON.stringify(custom_param,null,2)); //Enregistrement des parameters dans un fichier JSON.

  //******************************/
//Lancement du script Python

   const pythonProcess = spawn('py', ['tmp/script_umap.py', 'tmp']);

   //Evenement qui permet de récupérer les messages renvoyer par le script python. (peut être supprimer)
  pythonProcess.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    console.log(data.toString());
    
   });

   //Evenement permettant d'affiche les erreurs émis par le script python
   pythonProcess.stderr.on('data', (data) => {
    console.error('stderr: ', data.toString('utf8'));
  });

  //Evenement qui se déclance à la fin du script python
   pythonProcess.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
  
    //Envoie une page HTML
    //Ecriture dans le header de la réponse qu'on envoie une page html
    res.writeHead(200, { 'Content-Type':'text/html'});

    //Lecture du fichier
    let html1 = fs.readFileSync('tmp/Layer/1.conv2d.html');
    // let html2 = fs.readFileSync('tmp/Layer/2.dense.html');

    //Envoie du résultat
    res.end(html1);

    //On peut aussi envoyer en utilisant la fonction sendFile
    // res.sendFile(path.join(__dirname,'../tmp','/Layer/1.conv2d.html'));


    //Envoie de plusieurs pages html
    //le sendFile ou le .end ne permet d'envoyer un seul fichier au client. pour en envoyer plusieurs on peut utiliser un objet JSON qui contiendra un attribut pour chaque page HTML

    // Variable contenant le chemin vers le dossier qui contient les fichiers html
  //   const directoryPath = path.join(__dirname, '../tmp/Layer');
  

    


  //    res.writeHead(200, { 'Content-Type':'application/json'});
    
    

  //   // l'objet qui va êre envoyer au client
  //   let pages = {};
    
  //   //Parcour du dossier
  //   fs.readdir(directoryPath, function (err, files) {
  //     //handling error
  //     if (err) {
  //         return console.log('Unable to scan directory: ' + err);
  //     } 
  //     // let Htmlfile;
  //     //listing all files using forEach
  //     files.forEach(function (file,index) {
  //         // Lecture du fichier HTML
  //         Htmlfile = fs.readFileSync('tmp/Layer/'+file);

  //         // Ajout du contenu du fichier dans l'objet pages
  //         pages['Layer'+(index+1)] = Htmlfile.toString();
  //     });

  //     //Envoie de l'objet
  //     res.end(JSON.stringify(pages));
  //   });
   });

});

router.get('/CreateLayer', function(req, res){
// Parse certains attributs pour ne pas avoir des \"" dans le fichier JSON
req.query.config = JSON.parse(req.query.config);
req.query.training_config = JSON.parse(req.query.training_config);
fs.writeFileSync('tmp/test_model.json',JSON.stringify(req.query,null,2)); //Enregistrement des parameters dans un fichier JSON.
});
module.exports = router;
