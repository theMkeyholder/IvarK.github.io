//time dimensions

function getBreakEternityTDMult(tier){
	let ret = tmp.it
	if (hasTimeStudy(11) && tier == 1) ret = ret.times(tsMults[11]())
	if (tmp.qu.breakEternity.upgrades.includes(1) && tier < 5) ret = ret.times(getBreakUpgMult(1))
	if (tmp.qu.breakEternity.upgrades.includes(4) && tier > 3 && tier < 7) ret = ret.times(getBreakUpgMult(4))
	if (tmp.qu.bigRip.upgrades.includes(13)) ret = ret.times(player.replicanti.amount.max(1).pow(1e-6))
	if (tier == 6 && player.ghostify.ghostlyPhotons.unl) ret = ret.times(tmp.le[6])
	if (tier == 7 && tmp.qu.bigRip.upgrades.includes(16)) ret = ret.times(tmp.bru[16])
	if (tier == 8 && player.achievements.includes("ng3p62")) ret = ret.pow(Math.log10(player.ghostify.time/10+1)/100+1)
	if (ret.lt(0)) ret = new Decimal(0)
	return dilates(ret)
}

function doNGMatLeast4TDChanges(tier, ret){
	//Tickspeed multiplier boost
	let x = player.postC3Reward
	let exp = ([5, 3, 2, 1.5, 1, .5, 1/3, 0])[tier - 1]
	if (x.gt(1e10)) x = Decimal.pow(10, Math.sqrt(x.log10() * 5 + 50))
	if (player.galacticSacrifice.upgrades.includes(25)) exp *= galMults.u25()
	if (player.pSac!=undefined) exp /= 2
	if (inNC(16)) exp /= 2
	ret = ret.times(x.pow(exp))

	//NG-4 upgrades
	if (player.galacticSacrifice.upgrades.includes(12)) ret = ret.times(galMults.u12())
	if (player.galacticSacrifice.upgrades.includes(13) && player.currentChallenge!="postngm3_4") ret = ret.times(galMults.u13())
	if (player.galacticSacrifice.upgrades.includes(15)) ret = ret.times(galMults.u15())
	if (player.pSac !== undefined) if (tier == 2) ret = ret.pow(puMults[13](hasPU(13, true, true))) //NG-5, not NG-4.
	if (player.galacticSacrifice.upgrades.includes(44) && tmp.ngmX >= 4) {
		let e = player.galacticSacrifice.upgrades.includes(46) ? galMults["u46"]() : 1
		ret = ret.times(Decimal.pow(player[TIER_NAMES[tier]+"Amount"].plus(10).log10(), e * Math.pow(11 - tier, 2)))
	}
	if (player.galacticSacrifice.upgrades.includes(31)) ret = ret.pow(galMults.u31())
	return ret
}

function getERTDAchMults(){
	if (!player.boughtDims) return 1
	if (player.achievements.includes('r117')) {
		return 1 + Math.pow(Math.log(player.eternities), 1.5) / Math.log(100);
	} else if (player.achievements.includes('r102')) {
		return 1 + Math.log(player.eternities) / Math.log(100);
	}
	return 1
}

function calcNGM2atleastTDPreVPostDilMultiplier(tier){
	let ret2 = new Decimal(1)
	let ngPlus = (player.aarexModifications.newGamePlusVersion ? 103680000 : 0)
	if (player.currentEternityChall == "eterc9") ret2 = ret2.times(tmp.infPow)
	if (ECTimesCompleted("eterc1") !== 0) ret2 = ret2.times(getECReward(1))
	if (hasEternityUpg(4)) ret2 = ret2.times(player.achPow)
	if (hasEternityUpg(5)) ret2 = ret2.times(Math.max(player.timestudy.theorem, 1))
	if (hasEternityUpg(6)) ret2 = ret2.times((player.totalTimePlayed + ngPlus) / 10 / 60 / 60 / 24)
	if (tmp.ngex) ret2 = ret2.div(10 / tier)
	return ret2
}

function calcVanillaTSTDMult(tier){
	let ret = new Decimal(1)
	if (hasTimeStudy(73) && tier == 3) ret = ret.times(tmp.sacPow.pow(0.005).min(new Decimal("1e1300")))
	if (hasTimeStudy(93)) ret = ret.times(Decimal.pow(player.totalTickGained, 0.25).max(1))
	if (hasTimeStudy(103)) ret = ret.times(Math.max(player.replicanti.galaxies, 1))
	if (hasTimeStudy(151)) ret = ret.times(1e4)
	if (hasTimeStudy(221)) ret = ret.times(tsMults[221]())
	if (hasTimeStudy(227) && tier == 4) ret = ret.times(tsMults[227]())
	return ret
}

function getRepToTDExp() {
	let x = 0.1
	return x
}

function getTimeDimensionPower(tier) {
	if (player.currentEternityChall == "eterc11") return new Decimal(1)
	if (inQC(9)) return tmp.rm.pow(getRepToTDExp())
	if (tmp.be) return getBreakEternityTDMult(tier)
	let dim = player["timeDimension" + tier]
	let ret = dim.power.pow(player.boughtDims ? 1 : 2)

	if (hasPU(32)) ret = ret.times(puMults[32]())
	if (tmp.ngmX >= 4) ret = doNGMatLeast4TDChanges(tier, ret)

	if (hasTimeStudy(11) && tier == 1) ret = ret.times(tsMults[11]())

	if (player.achievements.includes("r105")) ret = ret.times(tmp.it)
	ret = ret.times(getERTDAchMults())

	let ret2 = calcNGM2atleastTDPreVPostDilMultiplier(tier)
	if (player.galacticSacrifice === undefined) ret = ret.times(ret2)
	ret = ret.times(calcVanillaTSTDMult(tier))

	if (ECTimesCompleted("eterc10") !== 0) ret = ret.times(getECReward(10))
	if (player.achievements.includes("r128")) ret = ret.times(Math.max(player.timestudy.studies.length, 1))
	if (player.galacticSacrifice !== undefined && player.galacticSacrifice.upgrades.includes(43)) ret = ret.times(galMults.u43())
	if (!player.dilation.upgrades.includes("ngmm2") && player.dilation.upgrades.includes(5) && !tmp.ngC && player.replicanti.amount.gt(1)) ret = ret.times(tmp.rm.pow(getRepToTDExp()))
	if (inQC(6)) ret = ret.times(player.postC8Mult).dividedBy(player.matter.max(1))

	ret = dilates(ret, 2)
	if (player.galacticSacrifice !== undefined) ret = ret.times(ret2)

	ret = dilates(ret, 1)
	if (tmp.quActive) ret = ret.times(colorBoosts.dim.b)
	if (player.dilation.upgrades.includes("ngmm2") && player.dilation.upgrades.includes(5) && player.replicanti.amount.gt(1)) ret = ret.times(tmp.rm.pow(getRepToTDExp()))
	if (tmp.ngC && ngC.tmp) ret = ret.times(ngC.condense.tds.eff(tier))

	if (player.dilation.upgrades.includes("ngmm8")) ret = ret.pow(getDil71Mult())
	if (tmp.ngC) ret = softcap(ret, "tds_ngC")

	return ret
}

function getTimeDimensionProduction(tier) {
  	if (player.currentEternityChall == "eterc1" || player.currentEternityChall == "eterc10" || (!tmp.be && inQC(8))) return new Decimal(0)
  	let dim = player["timeDimension" + tier]
  	if (player.currentEternityChall == "eterc11") return dim.amount
  	let ret = dim.amount
  	if (inQC(4) && tier == 1) ret = ret.plus(player.timeDimension2.amount.floor())
  	ret = ret.times(getTimeDimensionPower(tier))
  	if (player.aarexModifications.ngmX>3&&(inNC(2)||player.currentChallenge=="postc1"||player.pSac!=undefined)) ret = ret.times(player.chall2Pow)
  	if (player.currentEternityChall == "eterc7") ret = dilates(ret.div(tmp.ngC ? 1 : player.tickspeed.div(1000)))
  	if (player.aarexModifications.ngmX>3&&(tier>1||!player.achievements.includes("r12"))) ret = ret.div(100)
  	if (player.aarexModifications.ngexV) ret = ret.div(10 / tier)
  	if (player.currentEternityChall == "eterc1") return new Decimal(0)
  	return ret
}

function getIC3EffFromFreeUpgs() {
	let x = 0
	if (tmp.ngp3) {
		if (player.currentEternityChall=='eterc14') x = 5
		else {
			x = ECTimesCompleted("eterc14") * 4
			if (hasNU(12)) if (tmp.qu.bigRip.active) x *= tmp.nu[12].replicated
		}
	}
	if (player.galacticSacrifice !== undefined) x++
	return x
}

function isTDUnlocked(t) {
	if (t > 8) return
	if (tmp.ngmX >= 4) {
		if ((inNC(4) || player.currentChallenge == "postc1" || player.pSac != undefined) && t > 6) return
		return player.tdBoosts > t - 2
	}
	return t < 5 || player.dilation.studies.includes(t - 3)
}

function getTimeDimensionRateOfChange(tier) {
	let toGain = getTimeDimensionProduction(tier + (inQC(4) || player.pSac !== undefined ? 2 : 1))
	if (tmp.inEC12) toGain = toGain.div(tmp.ec12Mult)
	let current = Decimal.max(player["timeDimension" + tier].amount, 1);
	let change
	if (player.aarexModifications.logRateChange) {
		change = current.add(toGain.div(10)).log10()-current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else change = toGain.times(10).dividedBy(current);
	return change;
}

function getTimeDimensionDescription(tier) {
	if (!isTDUnlocked(((inNC(7) && tmp.ngmX >= 4) || inQC(4) || player.pSac!=undefined ? 2 : 1) + tier)) return getFullExpansion(player['timeDimension' + tier].bought)
	else if (player.timeShards.l > 1e7) return shortenDimensions(player['timeDimension' + tier].amount)
	else return shortenDimensions(player['timeDimension' + tier].amount) + ' (+' + formatValue(player.options.notation, getTimeDimensionRateOfChange(tier), 2, 2) + dimDescEnd;
}

function updateTimeDimensions() {
	if (document.getElementById("timedimensions").style.display == "block" && document.getElementById("dimensions").style.display == "block") {
		updateTimeShards()

		let maxCost = getMaxTDCost()
		for (let tier = 1; tier <= 8; ++tier) {
			if (isTDUnlocked(tier)) {
				let cost = player["timeDimension" + tier].cost
				document.getElementById("timeRow" + tier).style.display = "table-row"
				document.getElementById("timeD" + tier).textContent = DISPLAY_NAMES[tier] + " Time Dimension x" + shortenMoney(getTimeDimensionPower(tier));
				document.getElementById("timeAmount" + tier).textContent = getTimeDimensionDescription(tier);
				document.getElementById("timeMax" + tier).textContent = tmp.ngmX >= 4 && cost.gte(maxCost) ? "Maxed out!" : (ph.did("quantum") ? '' : "Cost: ") + (tmp.ngmX >= 4 ? shortenPreInfCosts(cost) + "" : shortenDimensions(cost) + " EP")
				if (getOrSubResourceTD(tier).gte(player["timeDimension" + tier].cost)) document.getElementById("timeMax"+tier).className = "storebtn"
			else document.getElementById("timeMax" + tier).className = "unavailablebtn"
			} else document.getElementById("timeRow" + tier).style.display = "none"
			if (tmp.ngC) ngC.condense.tds.update(tier)
		}

		if (tmp.ngmX >= 4) {
			var isShift = player.tdBoosts < (inNC(4) || tmp.ngmX >= 5 ? 5 : 7)
			var req = getTDBoostReq()
			document.getElementById("tdReset").style.display = ""
			document.getElementById("tdResetLabel").textContent = "Time Dimension "+(isShift ? "Shift" : "Boost") + " (" + getFullExpansion(player.tdBoosts) + "): requires " + getFullExpansion(req.amount) + " " + DISPLAY_NAMES[req.tier] + " Time Dimensions"
			document.getElementById("tdResetBtn").textContent = "Reset the game for a " + (isShift ? "new dimension" : "boost")
			document.getElementById("tdResetBtn").className = (player["timeDimension" + req.tier].bought < req.amount) ? "unavailablebtn" : "storebtn"
		} else document.getElementById("tdReset").style.display = "none"

		document.getElementById("tdCostLimit").textContent = tmp.ngmX >= 4 ? "You can spend up to " + shortenDimensions(maxCost) + " antimatter to Time Dimensions." : ""
	}
}

function updateTimeShards() {
	let p = getTimeDimensionProduction(1)
	if (tmp.ngmX >= 5) p = p.plus(getTimeDimensionProduction(2))
	if (tmp.inEC12) p = p.div(tmp.ec12Mult)

	document.getElementById("itmult").textContent = tmp.ngp3 && player.achievements.includes('r105') ? 'Your "Infinite Time" multiplier is currently ' + shorten(tmp.it) + 'x.':''
	document.getElementById("timeShardAmount").textContent = shortenMoney(player.timeShards)
	document.getElementById("tickThreshold").textContent = shortenMoney(player.tickThreshold)
	if (player.currentEternityChall == "eterc7") document.getElementById("timeShardsPerSec").textContent = "You are getting " + shortenDimensions(p) + " Eighth Infinity Dimensions per second."
	else document.getElementById("timeShardsPerSec").textContent = "You are getting " + shortenDimensions(p) + " Timeshards per second."
}

var TIME_DIM_COSTS = {
	1: {
		cost() {
			if (tmp.ngmX >= 4) return 10
			return 1
		},
		mult() {
			if (tmp.ngmX >= 4) return 1.5
			return 3
		}
	},
	2: {
		cost() {
			if (tmp.ngmX >= 4) return 20
			return 5
		},
		mult() {
			if (tmp.ngmX >= 4) return 2
			return 9
		}
	},
	3: {
		cost() {
			if (tmp.ngmX >= 4) return 40
			return 100
		},
		mult() {
			if (tmp.ngmX >= 4) return 3
			return 27
		}
	},
	4: {
		cost() {
			if (tmp.ngmX >= 4) return 80
			return 1e3
		},
		mult() {
			if (tmp.ngmX >= 4) return 20
			return 81
		}
	},
	5: {
		cost() {
			let x = tmp.ngmX >= 4 ? 160 : player.aarexModifications.newGamePlusVersion ? "1e2300" : "1e2350"
			if (tmp.ngC) x = Decimal.pow(x, .25)
			return new Decimal(x)
		},
		mult() {
			if (tmp.ngmX >= 4) return 150
			return 243
		}
	},
	6: {
		cost() {
			let x = tmp.ngmX >= 4 ? 1e8 : player.aarexModifications.newGamePlusVersion ? "1e2500" : "1e2650"
			if (tmp.ngC) x = Decimal.pow(x, .25)
			return new Decimal(x)
		},
		mult() {
			if (tmp.ngmX >= 4) return 1e5
			return 729
		}
	},
	7: {
		cost() {
			let x = tmp.ngmX >= 4 ? 1e12 : player.aarexModifications.newGamePlusVersion ? "1e2700" : "1e3000"
			if (tmp.ngC) x = Decimal.pow(x, .25)
			return new Decimal(x)
		},
		mult() {
			if (tmp.ngmX >= 4) return 3e6
			return 2143
		}
	},
	8: {
		cost() {
			let x = tmp.ngmX >= 4 ? 1e18 : player.aarexModifications.newGamePlusVersion ? "1e3000" : "1e3350"
			if (tmp.ngC) x = Decimal.pow(x, .25)
			return new Decimal(x)
		},
		mult() {
			if (tmp.ngmX >= 4) return 1e8
			return 6561
		}
	},
}

function timeDimCost(tier, bought) {
	let base = TIME_DIM_COSTS[tier].cost()
	let mult = TIME_DIM_COSTS[tier].mult()

	let cost = Decimal.pow(mult, bought).times(base)
	if (player.galacticSacrifice !== undefined) return cost

	if (cost.gte(Number.MAX_VALUE)) cost = Decimal.pow(mult * 1.5, bought).times(base)
	if (cost.gte("1e1300")) cost = Decimal.pow(mult * 2.2, bought).times(base)
	if (tier >= 5) cost = Decimal.pow(mult * 100, bought).times(base)

	let superScaleStartLog = tier >= 5 ? 3e5 : 2e4
	if (cost.log10() >= superScaleStartLog) {
		// rather than fixed cost scaling as before, quadratic cost scaling
		// to avoid exponential growth
		cost = cost.times(Decimal.pow(10, Math.pow((cost.log10() - superScaleStartLog) / 1e3, 2) * 1e3))
	}
	return cost
}

function buyTimeDimension(tier) {
	let dim = player["timeDimension"+tier]
	if (tmp.ngmX >= 4 && getAmount(1) < 1) {
		alert("You need to buy a first Normal Dimension to be able to buy Time Dimensions.")
		return
	}
	if (!isTDUnlocked(tier)) return false
	if (getOrSubResourceTD(tier).lt(dim.cost)) return false

	getOrSubResourceTD(tier, dim.cost)
	dim.amount = dim.amount.plus(1);
	dim.bought += 1
	if (inQC(6)) player.postC8Mult = new Decimal(1)
	if (tmp.ngmX >= 4) {
		dim.cost = dim.cost.times(TIME_DIM_COSTS[tier].mult())
		if (inNC(2) || player.currentChallenge == "postc1" || player.pSac != undefined) player.chall2Pow = 0
		reduceMatter(1)
	} else {
		dim.power = dim.power.times(player.boughtDims ? 3 : 2)
		dim.cost = timeDimCost(tier, dim.bought)
		updateEternityUpgrades()
	}
	return true
}

function getOrSubResourceTD(tier, sub) {
	if (sub == undefined) {
		if (tmp.ngmX >= 4) return player.money.min(getMaxTDCost())
		return player.eternityPoints
	} else {
		if (tmp.ngmX >= 4) player.money = player.money.sub(player.money.min(sub))
		else player.eternityPoints = player.eternityPoints.sub(player.eternityPoints.min(sub))
	}
}

function buyMaxTimeDimension(tier, bulk) {
	if (!isTDUnlocked(tier)) return

	let dim = player['timeDimension' + tier]
	let res = getOrSubResourceTD(tier)
	let mult = TIME_DIM_COSTS[tier].mult()
	if (!res.gte(dim.cost)) return

	if (tmp.ngmX >= 4 && getAmount(1) < 1) return
	if (player.aarexModifications.maxHighestTD && tier < 8 && player["timeDimension" + (tier + 1)].bought > 0) return

	let toBuy = 0
	if (tmp.ngmX >= 4) {
		toBuy = Math.floor(res.div(dim.cost).times(mult - 1).add(1).log(mult))
		if (bulk) toBuy = Math.min(toBuy, bulk)

		getOrSubResourceTD(tier, Decimal.pow(mult, toBuy).sub(1).div(mult - 1).times(dim.cost))

		if (inNC(2) || player.currentChallenge == "postc1" || player.pSac != undefined) player.chall2Pow = 0
		reduceMatter(toBuy)
	} else {
		let increment = 1
		while (player.eternityPoints.gte(timeDimCost(tier, dim.bought + increment - 1))) increment *= 2
		while (increment>=1) {
			if (player.eternityPoints.gte(timeDimCost(tier, dim.bought + toBuy + increment - 1))) toBuy += increment
			increment /= 2
		}
		let num = toBuy
		let newEP = player.eternityPoints
		while (num > 0) {
			let temp = newEP
			let cost = timeDimCost(tier, dim.bought + num - 1)
			if (newEP.lt(cost)) {
				newEP = player.eternityPoints.sub(cost)
				toBuy--
			} else newEP = newEP.sub(cost)
			if (newEP.eq(temp) || num > 9007199254740992) break
			num--
		}
		player.eternityPoints = newEP
		if (isNaN(newEP.e)) player.eternityPoints = new Decimal(0)
	}

	dim.amount = dim.amount.plus(toBuy)
	dim.bought += toBuy
	if (tmp.ngmX >= 4) {
		dim.power = Decimal.pow(getDimensionPowerMultiplier(), toBuy / 2).times(dim.power)
		dim.cost = dim.cost.times(Decimal.pow(mult, toBuy))
	} else {
		dim.cost = timeDimCost(tier, dim.bought)
		dim.power = dim.power.times(Decimal.pow(player.boughtDims ? 3 : 2, toBuy))
		if (inQC(6)) player.postC8Mult = new Decimal(1)
		updateEternityUpgrades()
	}
}

function buyMaxTimeDimensions() {
	for (let i = 1; i <= 8; i++) {
		if (tmp.ngC) ngC.condense.tds.max(i)
		buyMaxTimeDimension(i)
	}
}

function toggleAllTimeDims() {
	var turnOn
	var id = 1
	while (id <= 8 && turnOn === undefined) {
		if (!player.autoEterOptions["td" + id]) turnOn = true
		else if (id > 7) turnOn = false
		id++
	}
	for (id = 1; id <= 8; id++) {
		player.autoEterOptions["td" + id] = turnOn
		document.getElementById("td" + id + 'auto').textContent = "Auto: " + (turnOn ? "ON" : "OFF")
	}
	document.getElementById("maxTimeDimensions").style.display = turnOn ? "none" : ""
}
