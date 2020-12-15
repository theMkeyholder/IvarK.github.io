function galaxyReset(bulk) {
	if (tmp.ri) return
	if (autoS) auto = false;
	autoS = true;
	if (player.sacrificed == 0 && bulk > 0) giveAchievement("I don't believe in Gods");
	if (player.tickspeedBoosts) player.tickspeedBoosts = 0
	doGalaxyResetStuff(bulk)

	NC10NDCostsOnReset()
	if (player.pSac) {
		resetInfDimensions()
		player.pSac.dims.extraTime = 0
	}
	resetTDsOnNGM4()
	reduceDimCosts()
	skipResets()
	if (player.currentChallenge == "postc2") {
		player.eightAmount = new Decimal(1);
		player.eightBought = 1;
		player.resets = 4;
	}
	setInitialResetPower();

	if (player.options.notation == "Emojis") player.spreadingCancer += bulk

	if (player.infinitied < 1 && player.eternities == 0 && !quantumed) {
		document.getElementById("sacrifice").style.display = "none"
		document.getElementById("confirmation").style.display = "none"
		if (player.galacticSacrifice && (player.galaxies > 0 || (player.galacticSacrifice ? player.galacticSacrifice.times > 0 : false))) {
			document.getElementById("gSacrifice").style.display = "inline-block"
			document.getElementById("gConfirmation").style.display = "inline-block"
		}
	}
	if (!player.achievements.includes("r111")) setInitialMoney()
	if (player.achievements.includes("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (tmp.quActive && bulk) {
		if (player.masterystudies.includes("d7")) sacrificeGalaxy()
		if (tmp.qu.bigRip.active) tmp.qu.bigRip.bestGals = Math.max(tmp.qu.bigRip.bestGals, player.galaxies)
	}
	if (ph.did("ghostify") && player.ghostify.neutrinos.boosts) gainNeutrinos(bulk, "gen")
	hideDimensions()
	tmp.tickUpdate = true;
}

document.getElementById("secondSoftReset").onclick = function() {
	let ngm4 = player.aarexModifications.ngmX ? player.aarexModifications.ngmX >= 4 : false
	let bool1 = !inNC(11) || ngm4
	let bool2 = player.currentChallenge != "postc1"
	let bool3 = player.currentChallenge != "postc5" || player.tickspeedBoosts == undefined
	let bool4 = player.currentChallenge != "postc7"
	let bool5 = (player.currentEternityChall == "eterc6" || inQC(6)) && !tmp.be
	var bool = bool1 && bool2  && bool3 && bool4 && !bool5 && !tmp.ri && !cantReset()
	if (getAmount(inNC(4) || player.pSac != undefined ? 6 : 8) >= getGalaxyRequirement() && bool) {
		if ((getEternitied() >= 7 || player.autobuyers[10].bulkBought) && !shiftDown && (!inNC(14) || !(player.aarexModifications.ngmX > 3))) maxBuyGalaxies(true);
		else galaxyReset(1)
	}
}

function getDistantScalingEffect(){
	let speed = 1
	if (GUActive("rg6")) speed *= 0.867
	if (GUActive("gb6")) speed /= 1 + Math.pow(player.infinityPower.plus(1).log10(), 0.25) / 2810
	if (GUActive("br6")) speed /= getBR6Effect()
	if (ph.did("ghostify") && player.ghostify.neutrinos.boosts >= 6) speed /= tmp.nb[6]
	if (hasBosonicUpg(45)) speed /= tmp.blu[45]
	if (player.achievements.includes("ng3p98")) speed *= 0.9
	if (player.achievements.includes("ng3p101")) speed *= 0.5
	return speed
}

function getGalaxyRequirement(offset = 0, display) {
	tmp.grd = {} //Galaxy requirement data
	tmp.grd.gals = player.galaxies + offset
	let mult = getGalaxyReqMultiplier()
	let base = tmp.grd.gals * mult
	let amount = 80 + base
	let scaling = 0
	if (player.galacticSacrifice != undefined) amount -= (player.galacticSacrifice.upgrades.includes(22) && tmp.grd.gals >= 1) ? 80 : 60
	else if (inNC(6, 1) && player.aarexModifications.ngexV != undefined && tmp.grd.gals < 2) amount -= tmp.grd.gals == 1 ? 40 : 50
	if (player.aarexModifications.ngmX > 3) amount -= 10
	if (inNC(6, 1) && player.aarexModifications.ngexV != undefined && tmp.grd.gals >= 2) amount -= 2 * mult
	if (inNC(4) || player.pSac !== undefined) amount = player.tickspeedBoosts == undefined ? 99 + base : amount + (tmp.ngmX >= 4 ? 20 : -30)
	if (tmp.be) {
		amount *= 50
		if (tmp.qu.breakEternity.upgrades.includes(2)) amount /= getBreakUpgMult(2)
		if (player.currentEternityChall == "eterc10" && tmp.qu.breakEternity.upgrades.includes(9)) amount /= getBreakUpgMult(9)
	}
	if (!player.boughtDims) {
		tmp.grd.speed = 1
		if (tmp.ngp3) {
			let ghostlySpeed = tmp.be ? 55 : 1
			let div = 1e4
			let over = tmp.grd.gals / (302500 / ghostlySpeed)
			if (over >= 1) {
				if (over >= 3) {
					div /= Math.pow(over, 6) / 729
					scaling = Math.max(scaling, 6)
				}
				if (isLEBoostUnlocked(2) && tmp.be) div *= tmp.leBonus[2]
				tmp.grd.speed = Math.pow(2, (tmp.grd.gals + 1 - 302500 / ghostlySpeed) * ghostlySpeed / div)
				scaling = Math.max(scaling, 5)
			}
		}

		let distantStart = getDistantScalingStart()
		if (tmp.grd.gals >= distantStart) {
			let speed = tmp.grd.speed
			speed *= getDistantScalingEffect()
			amount += getDistantAdd(tmp.grd.gals - distantStart + 1) * speed
			if (tmp.grd.gals >= distantStart * 2.5 && player.galacticSacrifice != undefined) {
				// 5 times worse scaling
				amount += 4 * speed * getDistantAdd(tmp.grd.gals-distantStart * 2.5 + 1)
				scaling = Math.max(scaling, 2)
			} else scaling = Math.max(scaling, 1)
		}

		let hasRemote = !tmp.be && !hasNU(6) && !player.achievements.includes("ng3p117")
		if (hasRemote) {
			let remoteStart = getRemoteScalingStart()
			if (tmp.grd.gals >= remoteStart) {
				let speed2 = tmp.grd.speed
				if (GUActive("rg7")) speed2 *= 0.9
				if (GUActive("gb7")) speed2 /= 1 + Math.log10(1 + player.infinityPoints.max(1).log10()) / 100
				if (GUActive("br7")) speed2 /= 1 + Math.log10(1 + player.eternityPoints.max(1).log10()) / 80
				amount *= Math.pow(1 + (GUActive("rg1") ? 1 : 2) / (player.aarexModifications.ngmX > 3 ? 10 : 1e3), (tmp.grd.gals - remoteStart + 1) * speed2)
				scaling = Math.max(scaling, 3)
			}
		}

		if (tmp.grd.gals >= tmp.grd.darkStart) scaling = Math.max(scaling, 4)
	}
	amount = Math.ceil(amount)

	if (player.infinityUpgrades.includes("resetBoost")) amount -= 9
	if (player.challenges.includes("postc5")) amount -= 1
	if (player.infinityUpgradesRespecced != undefined) amount -= getInfUpgPow(6)
	if (display) return {amount: amount, scaling: scaling}
	return amount
}

function getGalaxyReqMultiplier() {
	if (inNC(6, 1) && player.aarexModifications.ngexV != undefined && tmp.grd.gals <= 2) return 0
	if (player.currentChallenge == "postcngmm_1") return 60
	let ret = 60
	if (player.galacticSacrifice !== undefined) {
		if (player.galacticSacrifice.upgrades.includes(22)) ret -= 30
	} else if (hasTimeStudy(42)) ret *= tsMults[42]()
	if (inNC(4)) ret = 90
	if (tmp.ngC) ret -= 35
	if (player.infinityUpgrades.includes("galCost")) ret -= 5
	if (player.infinityUpgrades.includes("postinfi52") && player.tickspeedBoosts == undefined) ret -= 3
	if (player.dilation.upgrades.includes("ngmm12")) ret -= 10
	if (player.galacticSacrifice !== undefined && hasTimeStudy(42)) ret *= tsMults[42]()
	return ret
}

function getDistantScalingStart() {
	if (player.currentEternityChall == "eterc5") return 0
	let n = tmp.ngC ? 1 : 100
	n += getECReward(5)
	if (hasTimeStudy(223)) n += 7
	if (hasTimeStudy(224)) n += Math.floor(player.resets/2000)
	if (inBigRip() && tmp.qu.bigRip.upgrades.includes(15)) n += tmp.bru[15]
	if (player.dilation.upgrades.includes("ngmm11")) n += 25
	if (pl.on()) n -= fNu.tmp.nerfMu

	if (tmp.grd.gals >= tmp.grd.darkStart) {
		let push = 5 / tmp.grd.speed
		if (GUActive("rg5")) push *= 1.13
		if (GUActive("gb5")) push *= 1 + Math.sqrt(player.replicanti.galaxies) / 550
		if (GUActive("br5")) push *= getBR5Effect()
		n -= Math.ceil((tmp.grd.gals - tmp.grd.darkStart + 1) / push)
	}

	if (tmp.grd.speed == 1) return Math.max(n, 0)
	return n
}

function getDistantPower() {
	let power = 1
	if (hasTS(194) && tmp.ngC) power = .5
	return power;
}

function getDistantAdd(x) {
	x *= getDistantPower()
	if (player.galacticSacrifice !== undefined && player.tickspeedBoosts == undefined) return Math.pow(x, 1.5) + x
	return (x + 1) * x
}

function getRemoteScalingStart(galaxies) {
	let n = tmp.ngC ? 150 : 800
	if (player.aarexModifications.ngmX > 3) {
		n = 6
		if (player.challenges.includes("postcngm3_1")) n += tmp.cp / 2
	}
	else if (player.galacticSacrifice != undefined) n += 1e7
	if (player.dilation.upgrades.includes(5) && tmp.ngC) n += 25;
	if (tmp.ngp3) {
		for (var t = 251; t < 254; t++) if (masteryStudies.has(t)) n += getMTSMult(t)
		if (masteryStudies.has(301)) n += getMTSMult(301)
		if (isNanoEffectUsed("remote_start")) n += tmp.nf.effects.remote_start
		if (galaxies > 1/0 && !tmp.be) n -= galaxies - 1/0 
	}
	return n
}

function maxBuyGalaxies(manual) {
	let max = (manual || (!player.autobuyers[10].priority && tmp.ngp3)) ? 1/0 : player.autobuyers[10].priority
	if ((inNC(11) || player.currentEternityChall == "eterc6" || player.currentChallenge == "postc1" || (player.currentChallenge == "postc5" && tmp.ngmX >= 3) || player.currentChallenge == "postc7" || inQC(6)) && !tmp.be) return
	if (max > player.galaxies) {
		let amount = getAmount(inNC(4) || player.pSac != undefined ? 6 : 8)
		let increment = 1
		let toSkip = 0
		let check = 0
		while (amount >= getGalaxyRequirement(increment*2) && max > player.galaxies + increment) increment *= 2
		while (increment >= 1) {
			check = toSkip + increment
			if (amount >= getGalaxyRequirement(check) && max > player.galaxies + check) toSkip += increment
			increment /= 2
		}
		galaxyReset(toSkip + 1)
	}
}