//overwrite insert method to validate 
DBCollection.prototype.insert = function(document,options={}){
	print("new insert");
	var valid = true;
	var msg = "";
	Object.keys(document).forEach(key => {
		let value = document[key];
		if(predicat.prototype.isPrototypeOf(value)){
			msg = value.name + " can be applied to : " + JSON.stringify(value.domain);
			let property = value.domain.property;
			print(property);
			let collection = value.domain.collection;
			print(collection);
			if(property.length> 0){
				valid = valid && property.includes(key);
			}
			if(collection.length > 0){
				valid = valid && collection.includes(this.getName());
			}
		}
	});
	if(valid){
		this.__insert__(document,options);
	}else {
		print("Error can't be inserted " + JSON.stringify(document));
		print("fuzzy predicat invalid  ");
		print(msg);
	}
}

DBCollection.prototype.insertMany = function(documents,options={}){
	print("new insertMany");
	documents.forEach(element =>{
		this.insert(element,options);
	});
}

