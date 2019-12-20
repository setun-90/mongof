'use strict';

load("src/utils.js");

// Fonction de traduction
function translate(query) {
	function traduire(field, pred) {
		/*
		Une requête floue est traduite en le décomposant
		sur les propriétés des représentations des valeurs
		et prédicats flous
		*/

		let s, op = Object.keys(pred)[0], val = pred[op] instanceof predicat ? pred[op].value : pred[op];
		switch (op) {
			case "$flt": {
				s = {$or: [
					{[field]: {$lt: val._smin}},
					{[field + "._smax"]: {$lt: val._smin}}
				]};
				break;
			}
			case "$fgt": {
				s = {$or: [
					{[field]: {$gt: val._smax}},
					{[field + "._smin"]: {$gt: val._smax}}
				]};
				break;
			}
			case "$flte": {
				break;
			}
			case "$fgte": {
				break;
			}
			case "$feq": {
				s = {$or: [
					{[field]: {$gt: val._smin, $lt: val._smax}},
					{$and: [
						{[field + "._smin"]: {$gt: val._smin}},
						{[field + "._smax"]: {$lt: val._smax}}
					]},
					{$and: [
						{[field + "._smin"]: {$lt: val._smin}},
						{[field + "._smax"]: {$gt: val._smax}}
					]}
				]};
				break;
			}
			case "$fne": {
				s = {$or: [
					{[field]: {$lt: val._smin}},
					{[field]: {$gt: val._smax}},
					{[field + "._smax"]: {$lt: val._smin}},
					{[field + "._smin"]: {$gt: val._smax}}
				]};
				break;
			}
			default:
				s = {[field]: pred};
				break;
		}
		return s;
	}

	let q = {}, r = { attr: []};
	if (!("$and" in query
	   || "$or" in query
	   || "$nor" in query
	   || "$not" in query
	))
		q["$and"] = [];

	for (let field in query)
		switch (field) {
		// Cas récursifs
		case "$and":
		case "$or":
		case "$not":
		case "$nor": {
			q[field] = [];
			for (let pred in query[field]) {
				let t = translate(query[field][pred]).q;
				if (t)
					q[field].push(t);
			}
			break;
		}
		case "fuzzy.possibilite":
		case "fuzzy.necessite": {
			r[field] = query[field];
			delete q["$and"];
			break;
		}
		// Cas de base
		default: {
			let pred = query[field], val = pred[Object.keys(pred)[0]];
			if (pred === Object(pred))
				q["$and"].push(traduire(field, pred));
			if (val instanceof trapeze)
				r.attr.push({[field]: pred});
		}
	}

	return {"q": q, "r": r};
}

// Gestion des possibilités et nécessités
function possibilite(d, p) {
	// Possibilité : sup_x{min{D(x),P(x)}}
	const dx = 1e-5;

	const tmin = Math.min(d._smin, p._smin), tmax = Math.max(d._smax, p._smax)

	const min = isFinite(tmin) ? tmin : Math.max(d._smin, p._smin),
	      max = isFinite(tmax) ? tmax : Math.min(d._smax, p._smax);

	let inter = [];

	for (let x = min; x < max; x += dx)
		inter.push(Math.min(d(x), p(x)));

	return inter.reduce(function (x, y) { return Math.max(x, y); });
}

function necessite(d, p) {
	// Nécessité : inf_x(max{1-D(x),P(x)}}
	const dx = 1e-5;

	const tmin = Math.min(d._smin, p._smin), tmax = Math.max(d._smax, p._smax)

	const min = isFinite(tmin) ? tmin : Math.max(d._smin, p._smin),
	      max = isFinite(tmax) ? tmax : Math.min(d._smax, p._smax);

	let inter = [];

	for (let x = min; x < max; x += dx)
		inter.push(Math.max(1 - d(x), p(x)));

	return inter.reduce(function (x, y) { return Math.min(x, y); })
}

function deonto(res, r) {
	// Nécessité : inf_x(max{1-D(x),P(x)}}
	for (let field in r) {
		// Traiter les attributs, il faut les requêtes originales
	}

	return res;
}

// Ajout de métainformations
function metainfo(res) {
	return res;
}

/*
DBCollection._find = DBCollection.find;
DBCollection.find = function(query, fields, limit, skip, batchSize, options) {
	let a = translate(query);
	let res = deonto(this._find(a.q, fields, limit, skip, batchSize, options), a.r);

	return res;
}
*/
