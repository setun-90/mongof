'use strict';

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
