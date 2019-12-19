'use strict';

// Fonction de traduction
function translate(query) {
	function traduire(field, pred) {
		/*
		Une requête floue est traduite en le décomposant
		sur les propriétés des représentations des valeurs
		et prédicats flous
		*/
		let s = [];
		for (let op in pred)
			switch (op) {
			case "$flt": {
				s.push({$or: [
					{[field]: {$lt: pred[op]._smin}},
					{[field + "._smax"]: {$lt: pred[op]._smin}}
				]});
				break;
			}
			case "$fgt": {
				s.push({$or: [
					{[field]: {$gt: pred[op]._smax}},
					{[field + "._smin"]: {$gt: pred[op]._smax}}
				]});
				break;
			}
			case "$flte": {
				break;
			}
			case "$fgte": {
				break;
			}
			case "$feq": {
				s.push({$or: [
					{[field]: {$gt: pred[op]._smin, $lt: pred[op]._smax}},
					{$and: [
						{[field + "._smin"]: {$gt: pred[op]._smin}},
						{[field + "._smax"]: {$lt: pred[op]._smax}}
					]},
					{$and: [
						{[field + "._smin"]: {$lt: pred[op]._smin}},
						{[field + "._smax"]: {$gt: pred[op]._smax}}
					]}
				]});
				break;
			}
			case "$fne": {
				s.push({$or: [
					{[field]: {$lt: pred[op]._smin}},
					{[field]: {$gt: pred[op]._smax}},
					{[field + "._smax"]: {$lt: pred[op]._smin}},
					{[field + "._smin"]: {$gt: pred[op]._smax}}
				]});
				break;
			}
			default:
				s.push(pred[op]);
				break;
		}
		if (s.length > 1)
			return {$and: s};
		return s[0];
	}

	let q = {}, r = {};
	for (let field in query)
		switch (field) {
		// Cas récursifs
		case "$and":
		case "$or":
		case "$not":
		case "$nor":
			for (let pred in field)
				q[field].push(translate(pred));
			break;
		case "fuzzy.possibilite":
		case "fuzzy.necessite":
			r[field] = query[field];
			break;
		// Cas de base
		default: {
			let pred = query[field];
			if (pred === Object(pred))
				q = traduire(field, pred);
		}
	}

	return {"q": q, "r": r};
}

// Gestion des possibilités et nécessités
function deonto(res, r) {
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
