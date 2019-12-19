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
	function f(x) {
		return nmin <= x && x <= nmax ? 1 :
		       smin <  x && x <  nmin ? (x - smin)/(nmin - smin) :
		       nmax <  x && x <  smax ? (smax - x)/(smax - nmax) :
		       0;
	}
	f._smin = smin;
	f._nmin = nmin;
	f._nmax = nmax;
	f._smax = smax;
	Object.setPrototypeOf(f, trapeze.prototype);
	return f;
}

function interval(min, max) {
	function f(x) {
		return min <= x && x <= max ? 1 : 0;
	}
	f._smin = f._nmin = min;
	f._smax = f._nmax = max;
	Object.setPrototypeOf(f, interval.prototype);
	return f;
}
interval.prototype = trapeze.prototype = Function.prototype;

print("utils script loaded");
