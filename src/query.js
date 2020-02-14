'use strict';

function fuzzy_value(v) {
	return v instanceof predicat ? v.value : v instanceof trapeze ? v : undefined;
}

// Fonction de traduction
function translate(query) {
	function traduire(field, pred) {
		/*
		Une requête floue est traduite en le décomposant
		sur les propriétés des représentations des valeurs
		et prédicats flous
		*/

		let s, p, n, op = Object.keys(pred)[0];
		if (!fuzzy_value(pred)) {
			let val = fuzzy_value(pred[op]);
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
			}
		} else {
			let val = fuzzy_value(pred);
			s = {[field]: pred};
			p = function (c) {
				const data = fuzzy_value(c[field]);
				return data ? possibilite(data, val) : appartenance(val, c[field]);
			};
			n = function (c) {
				const data = fuzzy_value(c[field]);
				return data ? necessite(data, val) : appartenance(val, c[field]);
			};
		}
		return { "s": s, "f": { "p": p, "n": n } };
	}

	let q = {}, r = { a: {}, f : []};

	for (let field in query)
		switch (field) {
		// Cas récursifs
		case "$and":
		case "$or":
		case "$not":
		case "$nor": {
			q[field] = [];
			for (let pred in query[field]) {
				var t = translate(query[field][pred]);
				q[field].push(t.q);
				r.a = t.r.a;
			}
			break;
		}
		case "fuzzy.possibilite":
		case "fuzzy.necessite": {
			r[field] = query[field];
			break;
		}
		// Cas de base
		default: {
			let pred = query[field], val = pred[Object.keys(pred)[0]], t, p;
			if (pred === Object(pred)) {
				t = traduire(field, pred);
				p = Object.keys(t.s)[0];
			} else {
				q[field] = pred;
			}
			if (fuzzy_value(val) || fuzzy_value(pred)) {
				r.a[field] = 1;
				r.f.push(t.f);
			}
		}
	}

	for (let field in query)
		switch (field) {
		// Cas récursifs
		case "$and": {
			r.f.push({
				"p": function (c) {
					let a = [];
					for (let n = 0; n < t.r.f.length; n++)
						a.push(t.r.f[n].p(c));
					return Math.min(...a);
				},
				"n": function (c) {
					let a = [];
					for (let n = 0; n < t.r.f.length; n++)
						a.push(t.r.f[n].n(c));
					return Math.min(...a);
				},
			});
			break;
		}
		case "$or": {
			r.f.push({
				"p": function (c) {
					let a = [];
					for (let n = 0; n < t.r.f.length; n++)
						a.push(t.r.f[n].p(c));
					return Math.max(...a);
				},
				"n": function (c) {
					let a = [];
					for (let n = 0; n < t.r.f.length; n++)
						a.push(t.r.f[n].n(c));
					return Math.max(...a);
				}
			});
			break;
		}
		case "$not": {
			let f = function (c) {
				let a = [];
				for (let n = 0; n < t.r.f.length; n++)
					a.push(t.f[n].p(c));
				return d.map(function (x) {
					return 1 - x;
				});
			};
			r.f.push({"p": f, "n" : f});
			break;
		}
	}
	return {"q": q, "r": r};
}

// Appartenances
function appartenance(p, x) {
		return p._nmin <= x && x <= p._nmax ? 1
		     : p._smin <  x && x <  p._nmin ? (x - p._smin)/(p._nmin - p._smin)
		     : p._nmax <  x && x <  p._smax ? (p._smax - x)/(p._smax - p._nmax)
		     : 0;
}

// Gestion des possibilités et nécessités
function possibilite(d, p) {
	// Possibilité : sup_x{min(D(x),P(x))}
	const dx = 1e-5;

	const tmin = Math.min(d._smin, p._smin), tmax = Math.max(d._smax, p._smax)

	const min = isFinite(tmin) ? tmin : Math.max(d._smin, p._smin),
	      max = isFinite(tmax) ? tmax : Math.min(d._smax, p._smax);

	let inter = 0;

	for (let x = min; x < max; x += dx)
		inter = Math.max(inter, Math.min(appartenance(d, x), appartenance(p, x)));

	return inter;
}

function necessite(d, p) {
	// Nécessité : inf_x{max(1-D(x),P(x))}
	const dx = 1e-5;

	const tmin = Math.min(d._smin, p._smin), tmax = Math.max(d._smax, p._smax)

	const min = isFinite(tmin) ? tmin : Math.max(d._smin, p._smin),
	      max = isFinite(tmax) ? tmax : Math.min(d._smax, p._smax);

	let inter = 1;

	for (let x = min; x < max; x += dx)
		inter = Math.min(inter, Math.max(1 - appartenance(d, x), appartenance(p, x)));

	return inter;
}

function deonto(c, r) {
	if (r.f.length === 0)
		return c;

	const kr = "fuzzy.possibilite" in r ? "fuzzy.possibilite"
	         : "fuzzy.necessite" in r ? "fuzzy.necessite"
	         : undefined,
	      kf = kr === "fuzzy.possibilite" ? "p"
	         : kr === "fuzzy.necessite" ? "n"
	         : "p",
	      s = kr ? r[kr] : 0;

	let ca = c.toArray();

	let cb = ca.filter(function (ic) {
		return r.f[0][kf](ic) >= s;
	});

	return cb;
}

// Ajout de métainformations
function metainfo(res) {
	return res;
}

// Patch de la méthode
if (DBCollection.prototype._find == null) {
	DBCollection.prototype._find = DBCollection.prototype.find;
	DBCollection.prototype.find = function(query, fields, limit, skip, batchSize, options) {
		let a = translate(query);
		if (fields) {
			var f = fields;
			for (let value in a.r.a)
				f[value] = 1;
		} else {
			var f = {};
//			for (let value in query)
//				f[value] = 1;
		}
		let res = deonto(this._find(a.q, f, limit, skip, batchSize, options), a.r);

		return res;
	}
}


print("query script loaded");
