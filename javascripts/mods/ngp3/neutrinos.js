function updateNeutrinoBoostDisplay(){
	if (player.ghostify.neutrinos.boosts >= 1) {
		document.getElementById("preNeutrinoBoost1").textContent = getDilExp("neutrinos").toFixed(2)
		document.getElementById("neutrinoBoost1").textContent = getDilExp().toFixed(2)
	}
	if (player.ghostify.neutrinos.boosts >= 2) {
		document.getElementById("preNeutrinoBoost2").textContent = "^" + shorten(getMTSMult(273, "pn"))
		document.getElementById("neutrinoBoost2").textContent = "^" + shorten(getMTSMult(273))
		document.getElementById("preNeutrinoBoost2Exp").textContent = getMTSMult(273, ["pn", "intensity"]).toFixed(2)
		document.getElementById("neutrinoBoost2Exp").textContent = getMTSMult(273, "intensity").toFixed(2)
	}
	if (player.ghostify.neutrinos.boosts >= 3) document.getElementById("neutrinoBoost3").textContent = tmp.nb[3].toFixed(2)
	if (player.ghostify.neutrinos.boosts >= 4) document.getElementById("neutrinoBoost4").textContent = formatPercentage(tmp.nb[4] - 1)
	if (player.ghostify.neutrinos.boosts >= 5) document.getElementById("neutrinoBoost5").textContent = formatPercentage(tmp.nb[5])
	if (player.ghostify.neutrinos.boosts >= 6) document.getElementById("neutrinoBoost6").textContent = formatPercentage(1 - 1 / tmp.nb[6])
	if (player.ghostify.neutrinos.boosts >= 7) {
		let preEff = getTreeUpgradeEfficiency("noNB")
		document.getElementById("neutrinoBoost7").textContent = formatPercentage(tmp.nb[7] - 1)
		document.getElementById("preNeutrinoBoost7Eff").textContent = formatPercentage(preEff)
		document.getElementById("neutrinoBoost7Eff").textContent = formatPercentage(preEff * tmp.nb[7])
	}
	if (player.ghostify.neutrinos.boosts >= 8) document.getElementById("neutrinoBoost8").textContent = formatPercentage(tmp.nb[8] - 1)
	if (player.ghostify.neutrinos.boosts >= 9) document.getElementById("neutrinoBoost9").textContent = shorten(tmp.nb[9])
	if (player.ghostify.neutrinos.boosts >= 10) document.getElementById("neutrinoBoost10").textContent = tmp.nb[10].toFixed(4)
	if (player.ghostify.neutrinos.boosts >= 11) document.getElementById("neutrinoBoost11").textContent = shorten(tmp.nb[11])
	if (player.ghostify.neutrinos.boosts >= 12) document.getElementById("neutrinoBoost12").textContent = "^" + shorten(tmp.nb[12])
}

function updateNeutrinoAmountDisplay(){
	document.getElementById("electronNeutrinos").textContent = shortenDimensions(player.ghostify.neutrinos.electron)
	document.getElementById("muonNeutrinos").textContent = shortenDimensions(player.ghostify.neutrinos.mu)
	document.getElementById("tauNeutrinos").textContent = shortenDimensions(player.ghostify.neutrinos.tau)
}

function updateNeutrinoUpgradeDisplay() {
	var sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	for (var u = 1; u <= neutrinoUpgrades.max; u++) if (isNeutrinoUpgUnlocked(u)) {
		if (hasNU(u)) document.getElementById("neutrinoUpg" + u).className = "gluonupgradebought neutrinoupg"
		else if (sum.gte(tmp.nuc[u])) document.getElementById("neutrinoUpg" + u).className = "gluonupgrade neutrinoupg"
		else document.getElementById("neutrinoUpg" + u).className = "gluonupgrade unavailablebtn"

		eff = tmp.nu[u]
		if (eff == undefined) continue
		if (u == 12) document.getElementById("neutrinoUpg12").setAttribute('ach-tooltip', neutrinoUpgrades[u].effDesc(eff))
		else document.getElementById("neutrinoUpg" + u + "Pow").textContent = neutrinoUpgrades[u].effDesc(eff)
	}
}

function isNeutrinoUpgUnlocked(u) {
	if (u >= 16) return GDs.unlocked()
	if (u >= 13) return player.ghostify.ghostlyPhotons.unl
	if (u >= 5) return player.ghostify.times >= u - 2
	return true
}

function updateNeutrinoUpgradeUnlock(u) {
	let unl = isNeutrinoUpgUnlocked(u)
	if (u % 3 == 1) document.getElementById("neutrinoUpg" + u).parentElement.parentElement.style.display = isNeutrinoUpgUnlocked(u) ? "" : "none"
	else document.getElementById("neutrinoUpg" + u).style.display = isNeutrinoUpgUnlocked(u) ? "" : "none"
}

function updateNeutrinoUpgradeUnlocks(rangeMin, rangeMax) {
	if (!tmp.ngp3) return
	for (var u = rangeMin; u <= rangeMax; u++) updateNeutrinoUpgradeUnlock(u)
}

function updateNeutrinosTab(){
	var generations = ["electron", "Muon", "Tau"]
	var neutrinoGain = getNeutrinoGain()
	var sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	document.getElementById("neutrinosGain").textContent="You gain " + shortenDimensions(neutrinoGain) + " " + generations[player.ghostify.neutrinos.generationGain - 1] + " neutrino" + (neutrinoGain.eq(1) ? "" : "s") + " each time you get 1 normal galaxy."
	setAndMaybeShow("neutrinosGainGhostify",player.achievements.includes("ng3p68"),'"You gain "+shortenDimensions(Decimal.times(\''+neutrinoGain.toString()+'\',tmp.qu.bigRip.bestGals*2e3))+" of all neutrinos each time you become a ghost 1x time."')
	
	updateNeutrinoAmountDisplay()
	updateNeutrinoBoostDisplay()
	updateNeutrinoUpgradeDisplay()
	
	if (player.ghostify.ghostParticles.gte(getNeutrinoBoostCost())) document.getElementById("neutrinoUnlock").className = "gluonupgrade neutrinoupg"
	else document.getElementById("neutrinoUnlock").className = "gluonupgrade unavailablebtn"
	if (player.ghostify.ghostParticles.gte(Decimal.pow(4,player.ghostify.neutrinos.multPower-1).times(2))) document.getElementById("neutrinoMultUpg").className = "gluonupgrade neutrinoupg"
	else document.getElementById("neutrinoMultUpg").className = "gluonupgrade unavailablebtn"
	if (sum.gte(getGHPMultCost())) document.getElementById("ghpMultUpg").className = "gluonupgrade neutrinoupg"
	else document.getElementById("ghpMultUpg").className = "gluonupgrade unavailablebtn"
}

function onNotationChangeNeutrinos() {
	if (player.masterystudies == undefined) return
	document.getElementById("neutrinoUnlockCost").textContent=shortenDimensions(getNeutrinoBoostCost())
	document.getElementById("neutrinoMult").textContent=shortenDimensions(Decimal.pow(5, player.ghostify.neutrinos.multPower - 1))
	document.getElementById("neutrinoMultUpgCost").textContent=shortenDimensions(Decimal.pow(4, player.ghostify.neutrinos.multPower-1).times(2))
	document.getElementById("ghpMult").textContent = shortenMoney(getGHPBaseMult())
	document.getElementById("ghpMultUpgCost").textContent=shortenDimensions(getGHPMultCost())
	for (var u = 1; u <= neutrinoUpgrades.max; u++) document.getElementById("neutrinoUpg" + u + "Cost").textContent=shortenDimensions(new Decimal(tmp.nuc[u]))
}

function getNeutrinoGain() {
	let ret = Decimal.pow(5, player.ghostify.neutrinos.multPower - 1)
	if (player.ghostify.ghostlyPhotons.unl) ret = ret.times(tmp.le[5])
	if (hasNU(14)) ret = ret.times(tmp.nu[14])
	if (isNanoEffectUsed("neutrinos")) ret = ret.times(tmp.nf.effects.neutrinos)
	return ret
}

function buyNeutrinoUpg(id) {
	let sum = player.ghostify.neutrinos.electron.add(player.ghostify.neutrinos.mu).add(player.ghostify.neutrinos.tau).round()
	let cost = tmp.nuc[id]
	if (sum.lt(cost) || player.ghostify.neutrinos.upgrades.includes(id)) return
	player.ghostify.neutrinos.upgrades.push(id)
	subNeutrinos(cost)
	if (id == 2) {
		document.getElementById("eggonsCell").style.display="none"
		document.getElementById("workerReplWhat").textContent="babies"
	}
	if (id == 5) updateElectrons(true)
}

function updateNeutrinoBoosts() {
	for (var b = 1; b <= neutrinoBoosts.max; b++) document.getElementById("neutrinoBoost" + (b % 3 == 1 ? "Row" + (b + 2) / 3 : "Cell" + b)).style.display = player.ghostify.neutrinos.boosts >= b ? "" : "none"
	document.getElementById("neutrinoUnlock").style.display = player.ghostify.neutrinos.boosts >= 12 ? "none" : ""
	document.getElementById("neutrinoUnlockCost").textContent = shortenDimensions(getNeutrinoBoostCost())
}

function getNeutrinoBoostCost() {
	let data = neutrinoBoosts[player.ghostify.neutrinos.boosts + 1]
	let x = data ? data.cost : 1/0
	return new Decimal(x)
}

function unlockNeutrinoBoost() {
	var cost = getNeutrinoBoostCost()
	if (!player.ghostify.ghostParticles.gte(cost) || player.ghostify.neutrinos.boosts >= 12) return
	player.ghostify.ghostParticles=player.ghostify.ghostParticles.sub(cost).round()
	player.ghostify.neutrinos.boosts++
	updateNeutrinoBoosts()
	updateTemp()
}

function hasNU(id) {
	return ph.did("ghostify") ? player.ghostify.neutrinos.upgrades.includes(id) : false
}

function buyNeutrinoMult() {
	let cost = Decimal.pow(4, player.ghostify.neutrinos.multPower - 1).times(2)
	if (!player.ghostify.ghostParticles.gte(cost)) return
	player.ghostify.ghostParticles=player.ghostify.ghostParticles.sub(cost).round()
	player.ghostify.neutrinos.multPower++
	document.getElementById("neutrinoMult").textContent=shortenDimensions(Decimal.pow(5, player.ghostify.neutrinos.multPower-1))
	document.getElementById("neutrinoMultUpgCost").textContent=shortenDimensions(Decimal.pow(4, player.ghostify.neutrinos.multPower-1).times(2))
}

function maxNeutrinoMult() {
	let cost = Decimal.pow(4,player.ghostify.neutrinos.multPower-1).times(2)
	if (!player.ghostify.ghostParticles.gte(cost)) return
	let toBuy = Math.floor(player.ghostify.ghostParticles.div(cost).times(3).add(1).log(4))
	let toSpend = Decimal.pow(4, toBuy).sub(1).div(3).times(cost)
	player.ghostify.ghostParticles = player.ghostify.ghostParticles.sub(toSpend.min(player.ghostify.ghostParticles)).round()
	player.ghostify.neutrinos.multPower += toBuy
	document.getElementById("neutrinoMult").textContent = shortenDimensions(Decimal.pow(5, player.ghostify.neutrinos.multPower - 1))
	document.getElementById("neutrinoMultUpgCost").textContent = shortenDimensions(Decimal.pow(4, player.ghostify.neutrinos.multPower - 1).times(2))
}

let neutrinoBoosts = {
	max: 12,
	1: {
		eff(nt) {
			let nb1mult = .75
			if (tmp.newNGP3E) nb1mult = .8
			if (isLEBoostUnlocked(7)) nb1mult *= tmp.leBonus[7]
			let nb1neutrinos = nt[0].add(1).log10() + nt[1].add(1).log10() + nt[2].add(1).log10()
			return Math.log10(1 + nb1neutrinos) * nb1mult
		},
		cost: 1
	},
	2: {
		eff(nt) {
			let nb2neutrinos = Math.pow(nt[0].add(1).log10(),2)+Math.pow(nt[1].add(1).log10(),2)+Math.pow(nt[2].add(1).log10(),2)
			let nb2 = Math.pow(nb2neutrinos, .25) * 1.5
			return nb2 
		},
		cost: 2
	},
	3: {
		eff(nt) {
			let nb3neutrinos = Math.sqrt(
				Math.pow(nt[0].max(1).log10(), 2) +
				Math.pow(nt[1].max(1).log10(), 2) +
				Math.pow(nt[2].max(1).log10(), 2)
			)
			let nb3 = Math.sqrt(nb3neutrinos + 625) / 25
			return nb3
		},
		cost: 4
	},
	4: {
		eff(nt) {
			var nb4neutrinos = Math.pow(nt[0].add(1).log10(),2)+Math.pow(nt[1].add(1).log10(),2)+Math.pow(nt[2].add(1).log10(),2)
			var nb4 = Math.pow(nb4neutrinos, .25) * 0.07 + 1
			return nb4
		},
		cost: 6
	},
	5: {
		eff(nt) {
			var nb5neutrinos = nt[0].max(1).log10()+nt[1].max(1).log10()+nt[2].max(1).log10()
			return Math.min(nb5neutrinos / 33, 1)
		},
		cost: 15
	},
	6: {
		eff(nt) {
			var nb6neutrinos = Math.pow(nt[0].add(1).log10(), 2) + Math.pow(nt[1].add(1).log10(), 2) + Math.pow(nt[2].add(1).log10(), 2)
			var nb6exp1 = .25
			if (tmp.newNGP3E) nb6exp1 = .26
			let nb6 = Math.pow(Math.pow(nb6neutrinos, nb6exp1) * 0.525 + 1, inBigRip() ? 0.5 : 1)
			if (isLEBoostUnlocked(9)) nb6 *= tmp.leBonus[7]
			return nb6
		},
		cost: 50
	},
	7: {
		eff(nt) {
			let nb7exp = .5
			if (tmp.newNGP3E) nb7exp = .6
			let nb7neutrinos = nt[0].add(1).log10()+nt[1].add(1).log10()+nt[2].add(1).log10()
			let nb7 = Math.pow(Math.log10(1 + nb7neutrinos), nb7exp) * 2.35
			if (nb7 > 4) nb7 = 2 * Math.log2(nb7)
			if (nb7 > 5) nb7 = 2 + Math.log2(nb7 + 3)
			if (!inBigRip() && hasNU(17)) nb7 = Math.pow(nb7 + 1, tmp.nu[17]) - 1
			return nb7
		},
		cost: 1e3
	},
	8: {
		eff(nt) {
			let nb8neutrinos = Math.pow(nt[0].add(1).log10(),2)+Math.pow(nt[1].add(1).log10(),2)+Math.pow(nt[2].add(1).log10(),2)
			let nb8exp = .25
			if (tmp.newNGP3E) nb8exp = .27
			var nb8 = Math.pow(nb8neutrinos, nb8exp) / 10 + 1
			if (nb8 > 11) nb8 = 7 + Math.log2(nb8 + 5)
			return nb8
		},
		cost: 1e14
	},
	9: {
		eff(nt) {
			var nb9 = (nt[0].add(1).log10()+nt[1].add(1).log10()+nt[2].add(1).log10())/10
			if (isLEBoostUnlocked(9)) nb9 *= tmp.leBonus[7]
			return nb9
		},
		cost: 1e35
	},
	10: {
		eff(nt) {
			let nb10neutrinos = nt[0].add(1).log10()+nt[1].add(1).log10()+nt[2].add(1).log10()
			let nb10 = Math.max(nb10neutrinos - 3e3, 0) / 75e4
			if (hasBosonicUpg(54)) nb10 = Math.pow(nb10neutrinos / 2e5, 2)
			return nb10
		},
		cost: "1e900"
	},
	11: {
		eff(nt) {
			let nb11neutrinos = nt[0].add(nt[1]).add(nt[2]).add(1).log10()
			let exp = Math.sqrt(nb11neutrinos)
			if (hasBosonicUpg(54)) exp = Math.max(Math.pow(nb11neutrinos, 0.75) / 5, exp)

			return Decimal.pow(1.15, exp)
		},
		cost: "1e3000"
	},
	12: {
		eff(nt) {
			let nb12neutrinos = nt[0].add(nt[1]).add(nt[2]).add(1).log10()
			let nb12 = Math.pow(nb12neutrinos / 1e4 + 1, 2)
			if (hasBosonicUpg(54)) nb12 = Math.pow(nb12, 1.25)
			return nb12
		},
		cost: "1e10000"
	}
}

var neutrinoUpgrades = {
	max: 18,
	1: {
		eff() {
			let x = 110
			if (!inBigRip()) x = Math.max(x - player.meta.resets, 0)
			return x
		},
		effDesc(x) {
			return x
		}
	},
	3: {
		eff() {
			if (!tmp.quActive) return new Decimal(1)
			let log = tmp.qu.colorPowers.b.log10()
			let exp = Math.max(log / 1e4 + 1, 2)
			let x
			if (exp > 2) x = Decimal.pow(Math.max(log / 250 + 1, 1), exp)
			else x = Math.pow(Math.max(log / 250 + 1, 1), exp)
			return x
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	4: {
		eff() {
			let nu4base = 50
			if (tmp.ngp3l) nu4base = 20
			return Decimal.pow(nu4base, Math.pow(Math.max(-getTickspeed().div(1e3).log10() / 4e13 - 4, 0), 1/4))
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	7: {
		eff() {
			if (!tmp.quActive) return new Decimal(1)
			var nu7 = tmp.qu.colorPowers.g.add(1).log10()/400
			if (nu7 > 40) nu7 = Math.sqrt(nu7*10)+20
			return Decimal.pow(10, nu7) 
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	12: {
		eff() {
			return { 
				normal: Math.sqrt(player.galaxies * .0035 + 1),
				free: player.dilation.freeGalaxies * .035 + 1,
				replicated: Math.sqrt(getTotalRG()) * .0175 + 1 //NU12 
			}
		},
		effDesc(x) {
			return "Normal galaxy effect: " + shorten(x.normal) + "x to quark spin production, "+
			"Replicated galaxy effect: " + shorten(x.replicated) + "x to EC14 reward, "+
			"Free galaxy effect: " + shorten(x.free) + "x to IC3 reward"
		}
	},
	14: {
		eff() {
			if (!tmp.quActive) return new Decimal(1)
			var base = player.ghostify.ghostParticles.add(1).log10()
			var colorsPortion = Math.pow(tmp.qu.colorPowers.r.add(tmp.qu.colorPowers.g).add(tmp.qu.colorPowers.b).add(1).log10(),1/3)
			return Decimal.pow(base, colorsPortion * 0.8 + 1).max(1)
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	15: {
		eff() {
			if (!tmp.quActive) return new Decimal(1)
			let nr = tmp.qu.nanofield.rewards
			if (nr > 90) nr = Math.sqrt(nr * 90)
			return Decimal.pow(2, nr / 2.5)
		},
		effDesc(x) {
			return shorten(x)
		}
	},
	17: {
		eff() {
			return 1 - 1 / Math.max(player.ghostify.hb.higgs / 150, 1)
		},
		effDesc(x) {
			return x.toFixed(3)
		}
	}
}

function gainNeutrinos(bulk,type) {
	let gain = getNeutrinoGain().times(bulk)
	let gens = ["electron", "mu", "tau"]
	if (type == "all") {
		for (var g = 0; g < 3; g++) {
			var gen = gens[g]
			player.ghostify.neutrinos[gen] = player.ghostify.neutrinos[gen].add(gain).round()
		}
	} else if (type == "gen") {
		var gen = gens[player.ghostify.neutrinos.generationGain - 1]
		player.ghostify.neutrinos[gen] = player.ghostify.neutrinos[gen].add(gain).round()
	}
}

function subNeutrinos(sub) {
	let neu = player.ghostify.neutrinos
	let sum = neu.electron.add(neu.mu).add(neu.tau).round()
	let gen = ["electron", "mu", "tau"]
	for (g = 0; g < 3; g++) neu[gen[g]] = neu[gen[g]].sub(neu[gen[g]].div(sum).times(sub).min(neu[gen[g]])).round()
}
