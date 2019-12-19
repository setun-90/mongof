//sauvegarde d'un alias vers la méthode d'origine
DBCollection.prototype.__insert__ = DBCollection.prototype.insert;
DBCollection.prototype.__insertMany__ = DBCollection.prototype.insertMany;

function predicat(p){
    this.name = p.name;
    this.value = p.value;
    this.domain = p.domain;
}

// Définition de valeur floue
function trapeze(smin, nmin, nmax, smax) {
	this._smin = smin;
	this._nmin = nmin;
	this._nmax = nmax;
	this._smax = smax;
}

function interval(min, max) {
	this._smin = this._nmin = min;
	this._smax = this._nmax = max;
}
interval.prototype = trapeze.prototype;

print("utils script loaded");
