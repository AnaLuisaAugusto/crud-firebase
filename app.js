const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./chave.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consultar", async function (req, res) {
    try {
      const snapshot = await db.collection('agendamentos').get();
      const clientes = snapshot.docs.map(doc => ({ 
        id: doc.id,
        nome: doc.get('nome'),
        telefone: doc.get('telefone'),
        origem: doc.get('origem'),
        data_contato: doc.get('data_contato'),
        observacao: doc.get('observacao'),
      }));
      res.render("consultar", { clientes });
    } catch (erro) {
      res.send("Falha ao mostrar a lista de clientes: " + erro);
    }
});
 
app.get("/editar/:id", function(req, res){
  res.render("editar")
})

app.get("/excluir/:id", function(req, res){
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})