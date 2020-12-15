function getNanospeedText(){
	s = ""
	let speeds = []
	let speedDescs = []
	if (ph.did("ghostify")) {
		speeds.push(tmp.ns)
		speedDescs.push("")
	}
	if (nanospeed != 1) {
		speeds.push(nanospeed)
		speedDescs.push("Dev")
	}
	if (ls.mult("nf") != 1) {
		speeds.push(ls.mult("nf"))
		speedDescs.push("'Light Speed' mod")
	}
	return speeds.length >= 1 ? (shiftDown ? getNanofieldSpeedText() :
		"Your Nanofield speed is currently " + factorizeDescs(speeds, speedDescs) + shorten(getNanofieldFinalSpeed()) + "x (hold shift for details)"
		): ""
}

function updateNanoverseTab(){
	var rewards = tmp.qu.nanofield.rewards
	document.getElementById("quarksNanofield").textContent = shortenDimensions(tmp.qu.replicants.quarks)		
	document.getElementById("quarkCharge").textContent = shortenMoney(tmp.qu.nanofield.charge)
	document.getElementById("quarkChargeRate").textContent = shortenDimensions(getQuarkChargeProduction())
	document.getElementById("quarkLoss").textContent = shortenDimensions(getQuarkLossProduction())
	document.getElementById("preonEnergy").textContent = shortenMoney(tmp.qu.nanofield.energy)
	document.getElementById("quarkEnergyRate").textContent = shortenMoney(getQuarkEnergyProduction())
	document.getElementById("quarkPower").textContent = getFullExpansion(tmp.qu.nanofield.power)
	document.getElementById("quarkPowerThreshold").textContent = shortenMoney(tmp.qu.nanofield.powerThreshold)
	document.getElementById("quarkAntienergy").textContent = shortenMoney(tmp.qu.nanofield.antienergy)
	document.getElementById("quarkAntienergyRate").textContent = shortenMoney(getQuarkAntienergyProduction())
	document.getElementById("quarkChargeProductionCap").textContent = shortenMoney(getQuarkChargeProductionCap())
	document.getElementById("rewards").textContent = getFullExpansion(rewards)
	document.getElementById("nfRewardScaling").textContent = getGalaxyScaleName(tmp.nf.scale) + "Nanorewards"

	for (var reward = 1; reward < 9; reward++) {
		document.getElementById("nfReward" + reward).className = reward > rewards ? "nfRewardlocked" : "nfReward"
		document.getElementById("nfReward" + reward).textContent = wordizeList(nanoRewards.effectsUsed[reward].map(x => nanoRewards.effectDisplays[x](tmp.nf.effects[x])), true) + "."
		document.getElementById("nfRewardHeader" + reward).textContent = (rewards % 8 + 1 == reward ? "Next" : DISPLAY_NAMES[reward]) + " reward"
		document.getElementById("nfRewardTier" + reward).textContent = "Tier " + getFullExpansion(Math.ceil((rewards + 1 - reward) / 8)) + " / Power: " + tmp.nf.powers[reward].toFixed(1)
	}
	document.getElementById("nfReward5").textContent = (tmp.nf.powers[5] > 15 ? nanoRewards.effectDisplays.light_threshold_speed(tmp.nf.effects.light_threshold_speed) : nanoRewards.effectDisplays.dil_effect_exp(tmp.nf.effects.dil_effect_exp)) + "."
	document.getElementById("ns").textContent = getNanospeedText()
}

function updateNanofieldAntipreon(){
	var rewards = tmp.qu.nanofield.rewards
	document.getElementById("rewards_AP").textContent = getFullExpansion(rewards)
	document.getElementById("rewards_wake").textContent = getFullExpansion(tmp.apgw)
	document.getElementById("sleepy").style.display = tmp.qu.nanofield.apgWoke ? "none" : ""
	document.getElementById("woke").style.display = tmp.qu.nanofield.apgWoke ? "" : "none"
}

function updateNanofieldTab(){
	if (document.getElementById("nanoverse").style.display == "block") updateNanoverseTab()
	if (document.getElementById("antipreon").style.display == "block") updateNanofieldAntipreon()
}

function getQuarkChargeProduction(noSpeed) {
	let ret = new Decimal(1)
	if (isNanoEffectUsed("preon_charge")) ret = tmp.nf.effects.preon_charge
	if (hasNU(3)) ret = ret.times(tmp.nu[3])
	if (hasNU(7)) ret = ret.times(tmp.nu[7])
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.div(Decimal.pow(2, (tmp.qu.nanofield.power - tmp.apgw) / 2))
	if (!noSpeed) ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function startProduceQuarkCharge() {
	tmp.qu.nanofield.producingCharge = !tmp.qu.nanofield.producingCharge
	document.getElementById("produceQuarkCharge").innerHTML = (tmp.qu.nanofield.producingCharge ? "Stop" : "Start") + " production of preon charge." + (tmp.qu.nanofield.producingCharge ? "" : "<br>(You will not get preons when you do this.)")
}

function getQuarkLossProduction() {
	let ret = getQuarkChargeProduction(true)
	let retCube = ret.pow(3)
	if (retCube.gte("1e180")) retCube = retCube.pow(Math.pow(180 / retCube.log10(), 2 / 3))
	ret = ret.times(retCube).times(4e25)
	if (hasNU(3)) ret = ret.div(10)
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.pow((tmp.qu.nanofield.power - tmp.apgw) / 5 + 1)
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuarkEnergyProduction() {
	let ret = tmp.qu.nanofield.charge.sqrt()
	if (masteryStudies.has(411)) ret = ret.times(getMTSMult(411))
	if (masteryStudies.has(421)) ret = ret.times(getMTSMult(421))
	if (isNanoEffectUsed("preon_energy")) ret = ret.times(tmp.nf.effects.preon_energy)
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuarkAntienergyProduction() {
	if (hasBosonicUpg(51)) return new Decimal(0)
	let ret = tmp.qu.nanofield.charge.sqrt()
	if (masteryStudies.has(401)) ret = ret.div(getMTSMult(401))
	if (tmp.qu.nanofield.power > tmp.apgw) ret = ret.times(Decimal.pow(2, (tmp.qu.nanofield.power - tmp.apgw) / 2))
	ret = ret.times(getNanofieldFinalSpeed())
	return ret
}

function getQuarkChargeProductionCap() {
	return tmp.qu.nanofield.charge.times(2500).sqrt()
}

var nanoRewards = {
	scaling: {
		max: 4,
		1: {
			start: 0,
			mult(diff) {
				let base = testHarderNGp3 ? 5 : 4
				let init = 50
				return Decimal.pow(base, diff).times(init)
			}
		},
		2: {
			start: 16,
			mult(diff) {
				return Decimal.pow(2, diff * (diff + 3))
			}
		},
		3: {
			start: 125,
			active() {
				return !player.achievements.includes("ng3p82")
			},
			mult(diff) {
				return Decimal.pow(2, diff * (diff + 1))
			}
		},
		4: {
			start: 150,
			mult(diff) {
				return Decimal.pow(1.1, diff * (diff + 1) * (diff + 2) / 3 + diff * (diff + 1) / 2 * 19)
			}
		}
	},
	effects: {
		hatch_speed: function(x) {
			return Decimal.pow(25 + 5 * x, x)
		},
		ma_effect_exp: function(x) {
			return x * 6.8
		},
		dil_gal_gain: function(x) {
			x = Math.pow(x, 0.83) * 0.039
			if (x > 1/3) x = (Math.log10(x * 3) + 1) / 3
			return x + 1
		},
		dt_to_ma_exp: function(x) {
			return Math.sqrt(x) * 0.021 + 1
		},
		dil_effect_exp: function(x) {
			if (x > 15) tier = Math.log10(x - 5) * 15
			return x * 0.36 + 1
		},
		meta_boost_power: function(x) {
			let y = 2
			if (player.dilation.upgrades.includes("ngpp4")) y = getDil15Bonus()

			return x * 1.34 + y
		},
		remote_start: function(x) {
			return x * 2150
		},
		preon_charge: function(x) {
			return Decimal.pow(2.6, x)
		},
		per_10_power: function(x) {
			return x * 0.76
		},
		preon_energy: function(x) {
			return Decimal.pow(2.5, Math.sqrt(x))
		},
		supersonic_start: function(x) {
			return Math.floor(Math.max(x - 3.5, 0) * 75e5)
		},
		neutrinos: function(x) {
			return Decimal.pow(10, x * 10)
		},
		light_threshold_speed: function(x) {
			return Math.max(Math.sqrt(x + 1) / 4, 1)
		}
	},
	effectDisplays: {
		hatch_speed: function(x) {
			return "eggons hatch " + shorten(x) + "x faster"
		},
		ma_effect_exp: function(x) {
			return "meta-antimatter effect is buffed to ^" + x.toFixed(2)
		},
		dil_gal_gain: function(x) {
			return "you gain " + (x * 100 - 100).toFixed(2) + "% more free galaxies"
		},
		dt_to_ma_exp: function(x) {
			return "dilated time gives ^" + x.toFixed(3) + " boost to all Meta Dimensions"
		},
		dil_effect_exp: function(x) {
			return "in dilation, Normal Dimension multipliers and Tickspeed are raised by ^" + x.toFixed(2)
		},
		meta_boost_power: function(x) {
			return "each meta-Dimension Boost gives " + x.toFixed(2) + "x boost"
		},
		remote_start: function(x) {
			return "Remote Antimatter Galaxies scaling starts " + getFullExpansion(Math.floor(x)) + " later"
		},
		preon_charge: function(x) {
			return "you produce " + shorten(x) + "x faster preon charge"
		},
		per_10_power: function(x) {
			return "multiplier per ten dimensions is increased by " + x.toFixed(2) + "x before the electrons effect"
		},
		preon_energy: function(x) {
			return "you produce " + shorten(x) + "x faster preon energy"
		},
		supersonic_start: function(x) {
			return "Dimension Supersonic scaling starts " + getFullExpansion(Math.floor(x)) + " later"
		},
		neutrinos: function(x) {
			return "you gain " + shorten(x) + "x more neutrinos"
		},
		light_threshold_speed: function(x) {
			return "Light threshold increases " + x.toFixed(2) + "x slower"
		}
	},
	effectsUsed: {
		1: ["hatch_speed"],
		2: ["ma_effect_exp"],
		3: ["dil_gal_gain"],
		4: ["dt_to_ma_exp"],
		5: ["dil_effect_exp"],
		6: ["meta_boost_power"],
		7: ["remote_start", "preon_charge"],
		8: ["per_10_power", "preon_energy"],
	},
	effectToReward: {}
}

function isNanoEffectUsed(x) {
	return tmp.quActive && tmp.nf !== undefined && tmp.nf.rewardsUsed !== undefined && tmp.nf.rewardsUsed.includes(x) && tmp.nf.effects !== undefined
}

function getNanofieldSpeedText(){
	text = ""
	if (ph.did("ghostify") && tmp.qu.nanofield.rewards < 16) text += "Ghostify Bonus: " + shorten(player.ghostify.milestone >= 1 ? 6 : 3) + "x, "
	if (player.achievements.includes("ng3p78")) text += "'Aren't you already dead' reward: " +shorten(Math.sqrt(getTreeUpgradeLevel(8) * tmp.tue + 1)) + "x, "
	if (hasNU(15)) text += "Neutrino upgrade 15: " + shorten(tmp.nu[15]) + "x, "
	if (GDs.unlocked()) text += "Gravity Well Energy: ^" + shorten(GDs.tmp.nf) + ", "
	var lsSpeed = ls.mult("nf")
	if (lsSpeed != 1) {
		if (lsSpeed > 1) text += "'Light Speed' mod: " + shorten(lsSpeed) + "x, "
		if (lsSpeed < 1) text += "'Light Speed' mod: /" + shorten(1 / lsSpeed) + ", "
	}
	if (nanospeed != 1) {
		if (nanospeed > 1) text += "Dev: " + shorten(nanospeed) + "x, "
		if (nanospeed < 1) text += "Dev: /" + shorten(1 / nanospeed) + ", "
	}
	if (text == "") return "No multipliers currently"
	return text.slice(0, text.length-2)
}

function getNanofieldSpeed() {
	let x = 1
	if (ph.did("ghostify")) x *= tmp.qu.nanofield.rewards >= 16 ? 1 : (player.ghostify.milestone >= 1 ? 6 : 3)
	if (player.achievements.includes("ng3p78")) x *= Math.sqrt(getTreeUpgradeLevel(8) * tmp.tue + 1)
	if (hasNU(15)) x = tmp.nu[15].times(x)
	if (GDs.boostUnl('nf')) x = Decimal.pow(x, GDs.tmp.nf)
	return x
}

function getNanofieldFinalSpeed() {
	return Decimal.times(tmp.ns, nanospeed * ls.mult("nf"))
}

function getNanoRewardPower(reward, rewards) {
	let x = Math.ceil((rewards - reward + 1) / 8)
	let apgw = tmp.apgw
	if (rewards >= apgw) {
		let sbsc = Math.ceil((apgw - reward + 1) / 8)
		x = Math.sqrt((x / 2 + sbsc / 2) * sbsc)
		if (reward == (rewards - 1) % 8 + 1) x += 0.5
	}
	return x * tmp.nf.powerEff
}

function getNanoRewardPowerEff() {
	let x = 1
	if (hasBosonicUpg(31)) x *= tmp.blu[31]
	return x
}

function getNanoRewardReq(additional) {
	return getNanoRewardReqFixed(additional - 1 + tmp.qu.nanofield.power)
}

function isNanoScalingActive(x) {
	if (x == 1) return true
	return nanoRewards.scaling[x].active === undefined || nanoRewards.scaling[x].active()
}

function getNanoRewardReqFixed(n) {
	let x = new Decimal(1)
	let d = nanoRewards.scaling
	for (let s = 1; s <= nanoRewards.scaling.max; s++) {
		if (isNanoScalingActive(s) && n >= d[s].start) x = x.times(d[s].mult(n - d[s].start))
	}
	return x.pow(tmp.ppti || 1)
}

function updateNextPreonEnergyThreshold(){
	let en = tmp.qu.nanofield.energy
	let increment = 0.5
	let toSkip = 0
	var check = 0
	while (en.gte(getNanoRewardReq(increment * 2))) {
		increment *= 2
	}
	while (increment >= 1) {
		check = toSkip + increment
		if (en.gte(getNanoRewardReq(check))) toSkip += increment
		increment /= 2
	}
	tmp.qu.nanofield.power += toSkip
	tmp.qu.nanofield.powerThreshold = getNanoRewardReq(1)
}

function getAntiPreonGhostWake() {
	let x = 104
	if (tmp.pce && tmp.pce.ms) x += Math.floor(tmp.pce.ms.ap)
	return x
}
