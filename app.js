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

app.engine("handlebars", handlebars({
  defaultLayout: "main",
  helpers: {
    equals: function(a, b){
      return a ==b;
    }
  }
}))
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
 
app.get("/editar/:id", async function (req, res) {
  const dataSnapshot = await db.collection('agendamentos').doc(req.params.id).get();
  const data = {
      id: dataSnapshot.id,
      nome: dataSnapshot.get('nome'),
      telefone: dataSnapshot.get('telefone'),
      origem: dataSnapshot.get('origem'),
      data_contato: dataSnapshot.get('data_contato'),
      observacao: dataSnapshot.get('observacao'),
  };

  res.render("editar", { data });
});

app.get("/excluir/:id", function(req, res){
  db.collection('agendamentos').doc(req.params.id).delete().then(function(){
    res.redirect('/consultar');
  });
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
  var result = db
  .collection("agendamentos")
  .doc(req.body.id)
  .update({
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao,
  })
  .then(function () {
    res.redirect("/consultar");
  });
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})