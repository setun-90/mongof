'use strict';

load("../src/init_load.js");

//ajout des prédicats
db.trapeze.insert( { name: "Jeune", value : new trapeze(18,20,30,35), domain : { property : [ "Age" ], collection: [ ] }});
db.trapeze.insert( { name: "Mûr", value : new trapeze(35,40,50,70), domain : { property : [ "Age" ], collection: [ ] }});
db.trapeze.insert( { name: "Vieux", value : new trapeze(70,75,Infinity,Infinity), domain : { property : [ "Age" ], collection: [ ] }});
db.trapeze.insert( { name: "Elevé", value : new trapeze(110,130,Infinity,Infinity), domain : { property : [ "Salaire" ], collection: ["Cadres"] }});
db.trapeze.insert( { name: "Faible", value : new trapeze(85,95,110,130), domain : { property : [ "Salaire" ], collection: ["Cadres"] }});
db.trapeze.insert( { name: "VariableFort", value : new trapeze(70,80,90,140), domain : { property : [ "Salaire" ], collection: ["Cadres"] }});
db.trapeze.insert( { name: "MoyenSup", value : new interval(100,130), domain : { property : [ "Salaire" ], collection: ["Cadres"] }});
//creation des variables du shell
loadPredicats(db);
//ajout des documents 
db.Cadres.insert({nom:"luis", Adresse:"Paris", Age: 31, Salaire : _Elevé});
db.Cadres.insert({nom:"Antonio", Adresse:"Paris", Age: _Mûr, Salaire : 100});
db.Cadres.insert({nom:"Jean", Adresse:"Angers", Age: _Jeune, Salaire : 90});
db.Cadres.insert({nom:"Francis", Adresse:"Angers", Age: _Vieux, Salaire : _Faible});
db.Cadres.insert({nom:"Julia", Adresse:"Paris", Age: _Jeune, Salaire : _MoyenSup});
db.Cadres.insert({nom:"Ines", Adresse:"Angers", Age: 28, Salaire : 125});
db.Cadres.insert({nom:"Xavier", Adresse:"Paris", Age: new interval(30,35), Salaire : 105}); 
db.Cadres.insert({nom:"Dupont", Adresse:"Nantes", Age: 45, Salaire : _VariableFort});
//test error 
//db.Cadres.insert({name : "dummy_error", Age : _Faible,Salaire : _MoyenSup});