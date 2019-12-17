var loadPredicates = function(db){
    //db.trapeze.insert( { name: "Jeune", value : new trapeze(18,20,30,35), domain : { property : [ "Age" ], collection: [ ] }});
    cursor = db.trapeze.find();
    print("Creating Variables");
    while(cursor.hasNext()){
        var c = new predicat(cursor.next());
        var name = '_'+c.name;
        //print(name);
        //print(JSON.stringify(c));
        this[name] = c;
    }
};