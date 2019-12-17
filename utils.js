//sauvegarde d'un alias vers la méthode d'origine  
DBCollection.prototype.__insert__ = DBCollection.prototype.insert;
DBCollection.prototype.__insertMany__ = DBCollection.prototype.insertMany;

function predicat(p){
    this.name = p.name;
    this.value = p.value;
    this.domain = p.domain;
}

function trapeze(b00, b01, b10, b11) {
	this.b00 = b00;
	this.b01 = b01;
	this.b10 = b10;
	this.b11 = b11;
}

function interval(b0, b1) {
	this.b0 = b0;
	this.b1 = b1;
}