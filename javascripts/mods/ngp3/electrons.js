function updateElectronsTab() {
	document.getElementById("normal_galaxies").textContent = getFullExpansion(player.galaxies)
	document.getElementById("sacrificed_gals").textContent = getFullExpansion(Math.round(tmp.qu.electrons.sacGals))
	document.getElementById("elc_amount").textContent = getFullExpansion(Math.round(tmp.qu.electrons.amount))
	document.getElementById("elc_translation").textContent = getFullExpansion(Math.round(tmp.mpte))
	document.getElementById("elc_effect").textContent = shorten(getDimensionPowerMultiplier("non-random"))
	document.getElementById("linear_per_ten_mult").textContent = shorten(getDimensionPowerMultiplier("linear"))
	for (var u = 1; u <= 4; u++) {
		document.getElementById("elc_upg_" + u).className = "gluonupgrade " + (canBuyElectronUpg(u) ? "stor" : "unavailabl") + "ebtn"
	}
}

function updateElectrons() {
	var mult = getElectronGainFinalMult()
	document.getElementById("elc_percentage").textContent = getGalaxySacrificeMult() * 100
	document.getElementById("elc_mult").textContent = mult.toFixed(2)
	tmp.qu.electrons.amount = getElectronGainFinalMult() * tmp.qu.electrons.sacGals
	for (var u = 1; u < 5; u++) {
		var cost = getElectronUpgCost(u)
		document.getElementById("elc_upg_" + u).innerHTML = "Increase the multiplier by " + (getElectronGainMult() * getElectronUpgIncrease(u)).toFixed(2) + "x.<br>" +
			"Level: " + getFullExpansion(tmp.qu.electrons.rebuyables[u-1]) + "<br>" +
			"Cost: " + ((u == 4 ? getFullExpansion : shortenCosts)(cost)) + " " + [null, "Time Theorems", "dilated time", "meta-antimatter", "Meta-Dimension Boosts"][u]
	}
}

function sacrificeGalaxy() {
	var mult = getGalaxySacrificeMult()
	var amount = (player.galaxies - tmp.qu.electrons.sacGals / mult) * mult
	if (amount < 1 || mult == 0) return
	tmp.qu.electrons.sacGals += amount
	tmp.qu.electrons.amount = getElectronGainFinalMult() * tmp.qu.electrons.sacGals
}

function getGalaxySacrificeMult() {
	return tmp.qu.electrons.percentage || 0
}

function changeGalaxySacrificeMult(x) {
	if (player.options.sacrificeConfirmation && !confirm("This requires a forced quantum reset. Are you sure you want to change?")) return
	tmp.qu.electrons.percentage = x
	quantum(false, true)
}

function getElectronBoost(mod) {
	if (!inQC(0)) return 1
	var amount = tmp.qu.electrons.amount
	var s = 149840
	if (player.ghostify.ghostlyPhotons.unl) s += tmp.le[2]
	
	if (amount > 37460 + s) amount = Math.sqrt((amount - s) * 37460) + s
	if (GUActive("rg4") && mod != "no-rg4") amount *= 0.7
	if (player.masterystudies !== undefined && isTreeUpgActive(4) && mod != "noTree") amount *= getTreeUpgradeEffect(4)
	return amount + 1
}

function getElectronGainMult() {
	let ret = 1
	if (hasNU(5)) ret *= 3
	return ret
}

function getElectronGainFinalMult() {
	return tmp.qu.electrons.mult * getElectronGainMult()
}

function getElectronUpgCost(u) {
	var amount = tmp.qu.electrons.rebuyables[u-1]
	if (hasBosonicUpg(33)) amount -= tmp.blu[33]
	var base = amount * Math.max(amount - 1, 1) + 1
	var exp = getElectronUpgCostScalingExp(u)
	if (exp != 1) {
		if (base < 0) base = -Math.pow(-base, exp)
		else base = Math.pow(base, exp)
	}
	base += ([null, 82, 153, 638, 26])[u]

	if (u == 1) return Math.pow(10, base)
	if (u == 4) return Math.max(Math.floor(base), 0)
	return Decimal.pow(10, base)
}

function getElectronUpgCostScalingExp(u) {
	if (u == 1) return 1
	return 2
}

function getElectronUpgIncrease(u) {
	return 0.25
}

function buyElectronUpg(u, quick) {
	if (!canBuyElectronUpg(u)) return false
	var cost = getElectronUpgCost(u)
	if (u == 1) player.timestudy.theorem -= cost
	else if (u == 2) player.dilation.dilatedTime = player.dilation.dilatedTime.sub(cost)
	else if (u == 3) player.meta.antimatter = player.meta.antimatter.sub(cost)
	else if (u == 4 && !player.achievements.includes("ng3p64")) {
		player.meta.resets -= cost
		player.meta.antimatter = getMetaAntimatterStart()
		clearMetaDimensions()
		for (let i = 2; i <= 8; i++) if (!canBuyMetaDimension(i)) document.getElementById(i + "MetaRow").style.display = "none"
	}
	tmp.qu.electrons.rebuyables[u - 1]++
	tmp.qu.electrons.mult += getElectronUpgIncrease(u)
	if (quick) return true
	updateElectrons()
}

function canBuyElectronUpg(id) {
	if (!inQC(0)) return false
	if (id > 3) return player.meta.resets >= getElectronUpgCost(4)
	if (id > 2) return player.meta.antimatter.gte(getElectronUpgCost(3))
	if (id > 1) return player.dilation.dilatedTime.gte(getElectronUpgCost(2))
	return player.timestudy.theorem >= getElectronUpgCost(1)
}

function getBaseAelcGalaxyEff() {
	return 1
}