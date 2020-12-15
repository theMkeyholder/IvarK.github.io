//Bosonic Lab
function canUnlockBosonicLab() {
	let max = getMaximumUnstableQuarks()
	return tmp.quActive && (max.decays >= 6 || max.quarks.e >= 5e10) && max.decays >= 5 && player.ghostify.ghostlyPhotons.enpowerments >= 3
}
  
function updateBLUnlocks() {
	let unl = player.ghostify.wzb.unl
	getEl("blUnl").style.display = unl ? "none" : ""
	getEl("blDiv").style.display = unl ? "" : "none"
	getEl("nftabs").style.display = unl ? "" : "none"
	if (!unl) updateBLUnlockDisplay()
	updateBosonicLimits()
}

function updateBLUnlockDisplay() {
	getEl("blUnl").textContent = "To unlock Bosonic Lab, you need to get " + shortenCosts(Decimal.pow(10, 5e10)) + " " + getUQName(5) + " quarks and 3 Light Empowerments first."
}

function getBosonicWattGain() {
	let x = Math.max(player.money.log10() / 2e16 - 1, 0)
	if (pl.on()) x += fNu.tmp.buffOmega
	if (player.achievements.includes("ng3p91")) x *= getAchBWtMult()
	if (isEnchantUsed(34)) x *= tmp.bEn[34]
	if (pl.on()) x *= fNu.tmp.buffMu
	if (GDs.boostUnl('bl')) x = Decimal.pow(x, getBosonicSpeedExp())
	return x
}

function getAchBWtMult() {
	return player.achPow.div(Decimal.pow(1.5, 21))
}

function getBatteryGainPerSecond(toSub) {
	let batteryMult = new Decimal(1)
	if (isEnchantUsed(24)) batteryMult = batteryMult.times(tmp.bEn[24])

	let toAdd = toSub.div(2e6).times(batteryMult)
	if (toAdd.gt(1e3)) toAdd = Decimal.pow(toAdd.log10() + 7, 3)

	return toAdd
}

function getBosonicSpeedExp() {
	let x = 1
	if (GDs.boostUnl('bl')) x *= GDs.tmp.bl
	return x
}

function getOverdriveFinalSpeed() {
	if (GDs.boostUnl('bl')) return Decimal.pow(tmp.bl.odSpeed, getBosonicSpeedExp())
	return tmp.bl.odSpeed
}

function getOverdriveSpeedDisplay() {
	let x = 1
	if (tmp.bl.battery.gt(0)) x = getOverdriveFinalSpeed()
	return x
}

function getBosonicFinalSpeed() {
	return Decimal.times(player.ghostify.bl.speed, getOverdriveSpeedDisplay()).times(ls.mult("bl"))
}

function updateBAMAmount(diff = 0) {
	let data = player.ghostify.bl
	var newBA = data.am
	var baAdded = diff ? getBosonicAMProduction().times(diff) : 0
	if (tmp.badm.start !== undefined && data.am.gt(tmp.badm.start) && tmp.badm.postDim <= Number.MAX_VALUE) data.am = tmp.badm.preDim.times(tmp.badm.start)
	updateBosonicAMDimReturnsTemp()
	newBA = data.am.add(baAdded)
	if (newBA.gt(tmp.badm.start)) {
		newBA = newBA.div(tmp.badm.start)
		tmp.badm.preDim = newBA
		newBA = newBA.sub(-tmp.badm.offset).ln() / Math.log(tmp.badm.base) + tmp.badm.offset2
		tmp.badm.postDim = newBA
		newBA = tmp.badm.start.times(newBA)
	}
	data.am = newBA
}

function bosonicTick(diff) {
	let lDiff //Mechanic-local diff
	let lData //Mechanic-local data
	let data = player.ghostify.bl
	if (isNaN(diff.e)) return
	if (data.odSpeed > 1 && data.battery.gt(0)) {
		var bBtL = getBosonicBatteryLoss()
		var odDiff = diff.times(bBtL).min(data.battery)
		var fasterDiff = odDiff.div(bBtL).times(getOverdriveFinalSpeed())
		data.battery = data.battery.sub(diff.times(bBtL).min(data.battery))
		diff = fasterDiff.add(diff.sub(odDiff.min(diff)))
	}
	data.ticks = data.ticks.add(diff)
	
	//W & Z Bosons
	let apDiff
	lData = player.ghostify.wzb
	if (lData.dPUse) {
		apDiff = diff.times(getAntiPreonLoss()).min(lData.dP).div(aplScalings[player.ghostify.wzb.dPUse])
		if (isEnchantUsed(13)) apDiff = apDiff.times(tmp.bEn[13])
		if (isNaN(apDiff.e)) apDiff = new Decimal(0)

		lData.dP = lData.dP.sub(diff.times(getAntiPreonLoss()).min(lData.dP))
		if (lData.dP.eq(0)) lData.dPUse = 0

		if (lData.dPUse == 1) {
			lData.wQkProgress = lData.wQkProgress.add(apDiff.times(tmp.wzb.zbs))
			if (lData.wQkProgress.gt(1)) {
				let toSub = lData.wQkProgress.floor()
				lData.wpb = lData.wpb.add(toSub.add(lData.wQkUp ? 1 : 0).div(2).floor())
				lData.wnb = lData.wnb.add(toSub.add(lData.wQkUp ? 0 : 1).div(2).floor())
				if (toSub.mod(2).gt(0)) lData.wQkUp = !lData.wQkUp
				lData.wQkProgress = lData.wQkProgress.sub(toSub.min(lData.wQkProgress))

				let toAdd = getBatteryGainPerSecond(toSub.div(diff)).times(diff)

				data.battery = data.battery.add(toAdd.times(diff))
				tmp.batteryGainLast = toAdd
			}
		}
		if (lData.dPUse == 2) {
			lData.zNeProgress = lData.zNeProgress.add(apDiff.times(getOscillateGainSpeed()))
			if (lData.zNeProgress.gte(1)) {
				let oscillated = Math.floor(lData.zNeProgress.add(1).log(2))
				lData.zb = lData.zb.add(Decimal.pow(Math.pow(2, 0.75), oscillated).sub(1).div(Math.pow(2, 0.75)-1).times(lData.zNeReq.pow(0.75)))
				lData.zNeProgress = lData.zNeProgress.sub(Decimal.pow(2,oscillated).sub(1).min(lData.zNeProgress)).div(Decimal.pow(2, oscillated))
				lData.zNeReq = lData.zNeReq.times(Decimal.pow(2,oscillated))
				lData.zNeGen = (lData.zNeGen+oscillated-1)%3+1
			}
		}
		if (lData.dPUse == 3) {
			lData.wpb = lData.wpb.add(lData.wnb.min(apDiff).times(tmp.wzb.zbs))
			lData.wnb = lData.wnb.sub(lData.wnb.min(apDiff).times(tmp.wzb.zbs))
		}
	} else lData.dP = lData.dP.add(diff.times(getAntiPreonProduction()))
	lData.zNeReq=Decimal.pow(10, Math.sqrt(Math.max(Math.pow(lData.zNeReq.log10(),2) - diff / 100, 0)))
	
	//Bosonic Extractor
	if (data.usedEnchants.includes(12)) {
		data.autoExtract = data.autoExtract.add(diff.times(tmp.bEn[12]))
		if (!data.extracting && data.autoExtract.gte(1)) {
			data.extracting = true
			data.autoExtract = data.autoExtract.sub(1)
			dynuta.times = 0
		}
	} else data.autoExtract = new Decimal(1)
	if (data.extracting) data.extractProgress = data.extractProgress.add(diff.div(getExtractTime()))
	if (data.extractProgress.gte(1)) {
		var oldAuto = data.autoExtract.floor()
		if (!data.usedEnchants.includes(12)) oldAuto = new Decimal(0)
		var toAdd = data.extractProgress.min(oldAuto.add(1).round()).floor()
		data.autoExtract = data.autoExtract.sub(toAdd.min(oldAuto))
		data.glyphs[data.typeToExtract - 1] = data.glyphs[data.typeToExtract - 1].add(toAdd).round()
		if (dynuta.check) {
			dynuta.check = false
			dynuta.times++
			if (dynuta.times >= 20) giveAchievement("Did you not understand the automation?")
		}
		if (data.usedEnchants.includes(12) && oldAuto.add(1).round().gt(toAdd)) data.extractProgress = data.extractProgress.sub(toAdd.min(data.extractProgress))
		else {
			data.extracting = false
			data.extractProgress = new Decimal(0)
		}
		player.ghostify.automatorGhosts[17].oc = true
	}
	if (data.extracting && data.extractProgress.lt(1)) {
		dynuta.check = false
		dynuta.times = 0
	}

	//Bosonic Antimatter production
	updateBAMAmount(diff)
}

function getBAMProduction(){
	return getBosonicAMProduction()
}

function getBosonicAntiMatterProduction(){
	return getBosonicAMProduction()
}

function getBosonicAMProduction() {
	let exp = player.money.max(1).log10() / 15e15 - 3
	let ret = Decimal.pow(10, exp).times(tmp.wzb.wbp)

	if (player.achievements.includes("ng3p113")) ret = ret.times(Math.log10(player.replicanti.amount.max(1e10).log10()))

	ret = softcap(ret, "bam")
	return ret
}

function getBosonicAMProductionSoftcapExp(x) {
	let frac = 10

	return 1 - x / frac
}

function getBosonicAMFinalProduction() {
	let r = getBosonicAMProduction()
	if (player.ghostify.bl.am.gt(tmp.badm.start)) r = r.div(tmp.badm.preDim)
	return r
}

let maxBLLvl = 3
function updateBosonicLimits() {
	//Bosonic Level?
	let lvl = 0
	if (player.ghostify.hb) {
		if (GDs.unlocked()) lvl = 3
		else if (player.ghostify.hb.higgs > 0) lvl = 2
		else if (player.ghostify.wzb.unl) lvl = 1
	}

	//Bosonic Lab
	br.limit = br.limits[lvl]
	bu.rows = bu.limits[lvl]
	bEn.limit = bEn.limits[lvl]

	if (lvl == 0) return

	var width = 100 / br.limit
	for (var r = 1; r <= br.limits[maxBLLvl]; r++) {
		getEl("bRuneCol" + r).style = "min-width:" + width + "%;width:" + width + "%;max-width:" + width + "%"
		if (r > 3) {
			var shown = br.limit >= r
			getEl("bRuneCol" + r).style.display = shown ? "" : "none"
			getEl("typeToExtract" + r).style.display = shown ? "" : "none"
			getEl("bEnRow" + (r - 1)).style.display = shown ? "" : "none"
		}
	}
	for (var r = 3; r <= bu.limits[maxBLLvl]; r++) getEl("bUpgRow" + r).style.display = bu.rows >= r ? "" : "none"
}

function showBLTab(tabName) {
	//iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
	var tabs = document.getElementsByClassName('bltab');
	var tab;
	var oldTab
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.style.display == 'block') oldTab = tab.id
		if (tab.id === tabName) {
			tab.style.display = 'block';
		} else {
			tab.style.display = 'none';
		}
	}
	if (oldTab !== tabName) player.aarexModifications.tabsSave.tabBL = tabName
	closeToolTip()
}

function getEstimatedNetBatteryGain() {
	let pos = (tmp.batteryGainLast || new Decimal(0)).times(1000)
	if (player.ghostify.wzb.dPUse != 1) pos = new Decimal(0)
	let neg = getBosonicBatteryLoss().times(player.ghostify.bl.speed)
	if (pos.gte(neg)) return [true, pos.minus(neg)]
	return [false, neg.minus(pos)]
}

function updateBosonicLabTab(){
	let data = player.ghostify.bl
	let speed = getBosonicFinalSpeed()
	getEl("bWatt").textContent = shorten(data.watt)
	getEl("bSpeed").textContent = shorten(data.speed)
	getEl("bTotalSpeed").textContent = shorten(speed)
	getEl("bTicks").textContent = shorten(data.ticks)
	getEl("bAM").textContent = shorten(data.am)
	getEl("bAMProduction").textContent = "+" + shorten(getBosonicAMFinalProduction().times(speed)) + "/s"
	getEl("bAMProductionReduced").style.display = data.am.gt(tmp.badm.start) ? "" : "none"
	getEl("bAMProductionReduced").textContent = "(reduced by " + shorten(tmp.badm.preDim) + "x)"
	getEl("bBt").textContent = shorten(data.battery)
	let x = getEstimatedNetBatteryGain()
	s = shorten(x[1]) + "/s"
	if (!x[0]) s = "-" + s
	else s = "" //Visualizing the positive production rate is currently broken for now.
	getEl("bBtProduction").textContent = s
	getEl("odSpeed").textContent = shorten(getOverdriveSpeedDisplay()) + "x"
	getEl("odSpeedWBBt").style.display = data.battery.eq(0) && data.odSpeed > 1 ? "" : "none"
	getEl("odSpeedWBBt").textContent = " (" + shorten(getOverdriveFinalSpeed()) + "x if you have Bosonic Battery)"
	for (var g = 1;g <= br.limit; g++) getEl("bRune"+g).textContent = shortenDimensions(data.glyphs[g-1])
	if (getEl("bextab").style.display=="block") updateBosonExtractorTab()
	if (getEl("butab").style.display=="block") updateBosonicUpgradeDescs()
	if (getEl("wzbtab").style.display=="block") updateWZBosonsTab()
	if (player.ghostify.hb.unl) {
		let req = getHiggsRequirement()
		getEl("hb").textContent = getFullExpansion(player.ghostify.hb.higgs)
		getEl("hbReset").className = "gluonupgrade " + (player.ghostify.bl.am.gte(req) ? "hb" : "unavailablebtn")
		getEl("hbResetReq").textContent = shorten(req)
		getEl("hbResetGain").textContent = player.ghostify.bl.am.gte(req) && player.ghostify.hb.higgs ? "+" + getFullExpansion(getHiggsGain()) : ""
	}
	if (GDs.unlocked()) getEl("gvBlAmount").textContent = shortenMoney(GDs.save.gv)
}

function teleportToBL() {
	showGhostifyTab("bltab")
	showTab("ghostify")
}

function updateBosonicStuffCosts() {
	for (var g2 = 2; g2 <= br.limit; g2++) for (var g1 = 1; g1 < g2; g1++) {
		var id = g1 * 10 + g2
		var data = bEn.costs[id]
		getEl("bEnG1Cost" + id).textContent = (data !== undefined && data[0] !== undefined && shortenDimensions(getBosonicFinalCost(data[0]))) || "???"
		getEl("bEnG2Cost" + id).textContent = (data !== undefined && data[1] !== undefined && shortenDimensions(getBosonicFinalCost(data[1]))) || "???"
	}
	for (var r = 1; r <= bu.rows; r++) for (var c = 1; c < 6; c++) {
		var id = r * 10 + c
		var data = bu.reqData[id]
		getEl("bUpgCost" + id).textContent = (data[0] !== undefined && shorten(getBosonicFinalCost(data[0]))) || "???"
		for (var g = 1; g < 3; g++) getEl("bUpgG" + g + "Req" + id).textContent = (data[g * 2 - 1] !== undefined && shortenDimensions(getBosonicFinalCost(data[g * 2 - 1]))) || "???"
	}
}

function getBosonicFinalCost(x) {
	x = new Decimal(x)
	if (player.achievements.includes("ng3p91")) x = x.div(2)
	return x.ceil()
}

function updateBosonicLabTemp() {
	tmp.bEn = {}
	tmp.blu = {}
	tmp.wzb = {}

	if (!ph.did("ghostify")) return 
	if (!player.ghostify.wzb.unl) return 

	updateBosonicEnchantsTemp()
	updateBosonicUpgradesTemp()
	updateWZBosonsTemp()

	if (!tmp.badm) updateBosonicAMDimReturnsTemp()
}

//Bosonic Extractor / Bosonic Runes
let dynuta={
	check: false,
	times: 0
}
function extract() {
	let data = player.ghostify.bl
	if (data.extracting) return
	dynuta.check = true
	data.extracting = true
}

function getExtractTime() {
	let data = player.ghostify.bl
	let r = new Decimal(br.scalings[data.typeToExtract] || 1/0)
	r = r.div(tmp.wzb.wbt)
	if (player.achievements.includes("ng3p95")) r = r.div(Math.sqrt(1 + player.ghostify.hb.higgs))
	return r
}

function getRemainingExtractTime() {
	let data = player.ghostify.bl
	let x = getExtractTime().div(data.speed)
	if (data.extracting) x = x.times(Decimal.sub(1, data.extractProgress))
	return x
}

function changeTypeToExtract(x) {
	let data = player.ghostify.bl
	if (data.typeToExtract == x) return
	getEl("typeToExtract" + data.typeToExtract).className = "storebtn"
	getEl("typeToExtract" + x).className = "chosenbtn"
	data.typeToExtract = x
	data.extracting = false
	data.extractProgress = new Decimal(0)
	data.autoExtract = new Decimal(1)

	player.ghostify.automatorGhosts[17].t = 0
	delete player.ghostify.automatorGhosts[17].oc
}

function canBuyEnchant(id) {
	let data = player.ghostify.bl
	let costData = bEn.costs[id]
	let g1 = Math.floor(id / 10)
	let g2 = id % 10
	if (costData === undefined) return
	if (costData[0] === undefined || !data.glyphs[g1 - 1].gte(getBosonicFinalCost(costData[0]))) return
	if (costData[1] === undefined || !data.glyphs[g2 - 1].gte(getBosonicFinalCost(costData[1]))) return
	return true
}

function getMaxEnchantLevelGain(id) {
	let data = player.ghostify.bl
	let costData = bEn.costs[id]
	let g1 = Math.floor(id / 10)
	let g2 = id % 10
	if (costData === undefined) return new Decimal(0)
	let lvl1 = data.glyphs[g1 - 1].div(getBosonicFinalCost(costData[0])).floor()
	let lvl2 = data.glyphs[g2 - 1].div(getBosonicFinalCost(costData[1])).floor()
	if (costData[0] == 0) lvl1 = 1/0
	if (costData[1] == 0) lvl2 = 1/0
	return Decimal.min(lvl1, lvl2)
}

function canUseEnchant(id) {
	if (isEnchantUsed(id)) return true
	if (!tmp.bl.enchants[id]) return false
	if (tmp.bl.usedEnchants.length >= bEn.limit) return false
	return true
}

function takeEnchantAction(id) {
	bEn.actionFuncs[bEn.action](id)
}

function changeEnchantAction(id) {
	bEn.action = bEn.actions[id - 1]
}

function getEnchantEffect(id, desc) {
	let data = player.ghostify.bl
	let l = new Decimal(0)
	if (bEn.effects[id] === undefined) return
	if (desc ? data.enchants[id] : data.usedEnchants.includes(id)) l = new Decimal(data.enchants[id])
	return bEn.effects[id](l)
}

function updateBosonExtractorTab(){
	let data = player.ghostify.bl
	let speed = getBosonicFinalSpeed()
	let time = getExtractTime().div(speed)
	if (data.extracting) getEl("extract").textContent = "Extracting" + (time.lt(0.1)?"":" ("+data.extractProgress.times(100).toFixed(1)+"%)")
	else getEl("extract").textContent="Extract"
	if (time.lt(0.1)) getEl("extractTime").textContent="This would automatically take "+shorten(Decimal.div(1,time))+" runes per second."
	else if (data.extracting) getEl("extractTime").textContent=shorten(time.times(Decimal.sub(1, data.extractProgress)))+" seconds left to extract."
	else getEl("extractTime").textContent="This will take "+shorten(time)+" seconds."
	updateEnchantDescs()
}

function updateEnchantDescs() {
	let data = player.ghostify.bl
	for (var g2 = 2; g2 <= br.limit; g2++) for (var g1 = 1; g1 < g2; g1++) {
		var id = g1 * 10 + g2
		if (bEn.action == "upgrade" || bEn.action == "max") getEl("bEn" + id).className = "gluonupgrade "  +(canBuyEnchant(id) ? "bl" : "unavailablebtn")
		else if (bEn.action == "use") getEl("bEn" + id).className = "gluonupgrade " + (canUseEnchant(id) ? "storebtn" : "unavailablebtn")
		getEl("bEnLvl" + id).textContent = bEn.action == "max" ?
			"+" + shortenDimensions(getMaxEnchantLevelGain(id)) + " levels" :
			"Level: " + shortenDimensions(tmp.bEn.lvl[id])
		getEl("bEnOn" + id).textContent = bEn.action == "use" ?
			(data.usedEnchants.includes(id) ? "Disable" : !canUseEnchant(id) ? "Disabled" : "Enable") :
			(data.usedEnchants.includes(id) ? "Enabled" : "Disabled")
		if (tmp.bEn[id] != undefined) {
			let effect = getEnchantEffect(id, true)
			let effectDesc = bEn.effectDescs[id]
			getEl("bEnEffect" + id).textContent = effectDesc !== undefined ? effectDesc(effect) : shorten(effect) + "x"	
		}
	}
	getEl("usedEnchants").textContent = "You have used " + data.usedEnchants.length + " / " + bEn.limit + " Bosonic Enchants."
}

function autoMaxEnchant(id, times) {
	if (!canBuyEnchant(id)) return

	let data = player.ghostify.bl
	let costData = bEn.costs[id]
	let g1 = Math.floor(id / 10)
	let g2 = id % 10
	let toAdd = getMaxEnchantLevelGain(id).times(times)
	if (data.enchants[id] == undefined) data.enchants[id] = new Decimal(toAdd)
	else data.enchants[id] = data.enchants[id].add(toAdd).round()
	bEn.onBuy(id)
}

function autoMaxAllEnchants(times) {
	for (let g2 = 2; g2 <= br.limit; g2++) for (let g1 = 1; g1 < g2; g1++) autoMaxEnchant(g1 * 10 + g2, times)
}

function isEnchantUsed(x) {
	return tmp.bEn !== undefined && tmp.bEn[x] !== undefined && tmp.bl.usedEnchants.includes(x)
}

var br = {
	names: [null, "Infinity", "Eternity", "Quantum", "Ghostly", "Ethereal", "Sixth", "Seventh", "Eighth", "Ninth"], //Current maximum limit of 9.
	limits: [0, 3, 4, 5],
	scalings: {
		1: 60,
		2: 120,
		3: 600,
		4: 6e7,
		5: 6e20
	}
}

var bEn = {
	costs: {
		12: [3, 1],
		13: [20, 2],
		23: [1e4, 2e3],
		14: [1e6, 2],
		24: [1e6, 10],
		34: [1, 0],
		15: [2e21, 20],
		25: [2e210, 2e190],
		35: [1e12, 1],
		45: [0, "2e1250"],
	},
	descs: {
		12: "You automatically extract Bosonic Runes.",
		13: "Things that consume Anti-Preons are stronger.",
		23: "Bosonic Antimatter boosts oscillate speed.",
		14: "Reduce the Higgs requirement and start with Bosonic Upgrades, even it is disabled.",
		24: "You gain more Bosonic Battery.",
		34: "Higgs Bosons boost Bosonic Watts.",
		15: "You gain more Gravity Energy.",
		25: "Z Bosons give a stronger boost to W Bosons.",
		35: "Above 200, Higgs Bosons multiples the efficiency of Auto-Enchanter Ghost.",
		45: "Multiply the gain of Gravity Energy, but reduce the charging effect.",
	},
	effects: {
		12(l) {
			let exp = 0.75
			if (tmp.newNGP3E) exp += .025
			if (l.gt(1e10)) exp *= Math.sqrt(Decimal.log10(l) / 10)

			return Decimal.pow(l, exp).div(bEn.autoScalings[player.ghostify.bl.typeToExtract])
		},
		13(l) {
			return Decimal.add(l, 1).sqrt()
		},
		14(l) {
			let eff = Decimal.add(l, 9).log10()
			if (eff > 15) eff = Math.sqrt(eff * 15)
			if (eff > 20) eff = 20
			return {
				bUpgs: Math.floor(eff),
				higgs: Decimal.add(l, 1).pow(0.4)
			}
		},
		23(l) {
			if (Decimal.eq(0, l)) return new Decimal(1)
			let exp = Math.max(l.max(1).log10() + 1, 0) / 3
			if (player.ghostify.bl.am.gt(1e11)) exp *= player.ghostify.bl.am.div(10).log10() / 10
			if (exp > 5) exp = Math.sqrt(exp * 5)
			return Decimal.pow(player.ghostify.bl.am.add(10).log10(), exp)
		},
		24(l) {
			return Decimal.pow(Decimal.add(l, 100).log10(), 4).div(16)
		},
		34(l) {
			let x = player.ghostify.hb.higgs
			if (!tmp.newNGP3E) x = Math.sqrt(x / 2)

			return x * Math.log10(l.times(1e3).max(1).log10() + 1) + 1
		},
		15(l) {
			let x = Math.pow(Math.log10(l.add(1).log10() + 1) / 5 + 1, 2)
			if (hasBosonicUpg(61)) x = Math.max(Math.cbrt(l.add(1).log10() / 25 + 1), x)
			return x
		},
		25(l) {
			return 0.65 - 0.15 / Math.sqrt(l.add(1).log10() / 50 + 1)
		},
		35(l) {
			let hb = player.ghostify.hb.higgs
			if (hb <= 200) return new Decimal(1)
			return Decimal.pow(100, Math.sqrt(hb / 100 - 2) * Math.pow(l.add(1).log10(), 1/3))
		},
		45(l) {
			return 2.5 - 1.5 / (Math.log10(l.add(1).log10() / 300 + 1) / 2 + 1)
		}
	},
	effectDescs: {
		12(x) {
			x = x.times(getBosonicFinalSpeed())
			if (x.lt(1) && x.gt(0)) return x.m.toFixed(2) + "/" + shortenCosts(Decimal.pow(10, -x.e)) + " seconds"
			return shorten(x) + "/second"
		},
		14(x) {
			return "/" + shorten(x.higgs) + " to Higgs requirement, " + getFullExpansion(x.bUpgs) + " starting upgrades"
		},
		25(x) {
			return "x^0.500 -> x^" + x.toFixed(3)
		},
		35(x) {
			return shorten(x) + "x"
		}
	},
	action: "upgrade",
	actions: ["upgrade", "max", "use"],
	actionFuncs: {
		upgrade(id) {
			if (!canBuyEnchant(id)) return

			let data = player.ghostify.bl
			let costData = bEn.costs[id]
			let g1 = Math.floor(id / 10)
			let g2 = id % 10
			data.glyphs[g1 - 1] = data.glyphs[g1 - 1].sub(getBosonicFinalCost(costData[0])).round()
			data.glyphs[g2 - 1] = data.glyphs[g2 - 1].sub(getBosonicFinalCost(costData[1])).round()
			if (data.enchants[id] == undefined) data.enchants[id] = new Decimal(1)
			else data.enchants[id] = data.enchants[id].add(1).round()
			bEn.onBuy(id)
		},
		max(id) {
			if (!canBuyEnchant(id)) return

			let data = player.ghostify.bl
			let costData = bEn.costs[id]
			let g1 = Math.floor(id / 10)
			let g2 = id % 10
			let lvl = getMaxEnchantLevelGain(id)
			data.glyphs[g1 - 1] = data.glyphs[g1 - 1].sub(lvl.times(getBosonicFinalCost(costData[0])).min(data.glyphs[g1 - 1])).round()
			data.glyphs[g2 - 1] = data.glyphs[g2 - 1].sub(lvl.times(getBosonicFinalCost(costData[1])).min(data.glyphs[g2 - 1])).round()
			if (data.enchants[id] == undefined) data.enchants[id] = new Decimal(lvl)
			else data.enchants[id] = data.enchants[id].add(lvl).round()
			bEn.onBuy(id)
		},
		use(id) {
			if (!canUseEnchant(id)) return

			let data = player.ghostify.bl
			if (bEn.limit == 1) data.usedEnchants = [id]
			else {
				if (data.usedEnchants.includes(id)) {
					var newData = []
					for (var u = 0; u < data.usedEnchants.length; u++) if (data.usedEnchants[u] != id) newData.push(data.usedEnchants[u])
					data.usedEnchants = newData
				} else data.usedEnchants.push(id)
			}
			if (id == 14) updateBAMAmount()
		}
	},
	onBuy(id) {
		if (id == 14 && isEnchantUsed(14)) {
			tmp.bEn[14] = getEnchantEffect(14)
			updateBAMAmount()
		}
	},
	limits: [0, 2, 5, 9],
	autoScalings:{
		1: 1.5,
		2: 3,
		3: 12,
		4: 1e6,
		5: 1e17
	}
}

//Bosonic Upgrades
function setupBosonicUpgReqData() {
	for (var r = 1; r <= bu.limits[maxBLLvl]; r++) for (var c = 1; c < 6; c++) {
		var id = r * 10 + c
		var data = bu.costs[id]
		var rData = [undefined, undefined, 0, undefined, 0]
		if (data) {
			if (data.am !== undefined) rData[0] = data.am
			var p = 1
			for (var g = 1; g <= br.limits[maxBLLvl]; g++) if (data["g" + g] !== undefined) {
				rData[p * 2 - 1] = data["g" + g]
				rData[p * 2] = g
				p++
			}
		}
		bu.reqData[id] = rData
	}
}

function canBuyBosonicUpg(id) {
	let rData = bu.reqData[id]
	if (rData[0] === undefined || rData[1] === undefined || rData[3] === undefined) return
	if (!player.ghostify.bl.am.gte(getBosonicFinalCost(rData[0]))) return
	for (var g = 1; g < 3; g++) if (!player.ghostify.bl.glyphs[rData[g * 2] - 1].gte(getBosonicFinalCost(rData[g * 2 - 1]))) return
	return true
}

function buyBosonicUpgrade(id, quick) {
	if (player.ghostify.bl.upgrades.includes(id)) return true
	if (!canBuyBosonicUpg(id)) return false
	player.ghostify.bl.upgrades.push(id)
	player.ghostify.bl.am = player.ghostify.bl.am.sub(getBosonicFinalCost(bu.reqData[id][0]))
	if (!quick) updateTemp()
	if (id == 21 || id == 22) updateNanoRewardTemp()
	if (id == 32 || id == 65) tmp.updateLights = true
	delete player.ghostify.hb.bosonicSemipowerment
	return true
}

function buyMaxBosonicUpgrades() {
	var stopped = false
	var oldLength = player.ghostify.bl.upgrades.length
	if (oldLength == bu.rows * 5) return
	for (var r = 1; r <= bu.rows; r++) {
		for (var c = 1; c <= 5; c++) {
			var id = r * 10 + c
			if (!buyBosonicUpgrade(id, true)) break
		}
	}
	if (player.ghostify.bl.upgrades.length > oldLength) updateTemp()
}

function hasBosonicUpg(id) {
	return tmp.ngp3 && tmp.blu && id <= bu.rows * 10 + 10 && player.ghostify.bl.upgrades.includes(id)
}

function updateBosonicUpgradeDescs() {
	for (var r = 1; r <= bu.rows; r++) for (var c = 1; c <= 5; c++) {
		var id = r * 10 + c
		getEl("bUpg" + id).className = player.ghostify.bl.upgrades.includes(id) ? "gluonupgradebought bl" : canBuyBosonicUpg(id) ? "gluonupgrade bl" : "gluonupgrade unavailablebtn"
		if (tmp.blu[id] !== undefined) getEl("bUpgEffect"+id).textContent = (bu.effectDescs[id] !== undefined && bu.effectDescs[id](tmp.blu[id])) || shorten(tmp.blu[id]) + "x"
	}
}

var bu = {
	limits: [0, 2, 4, 6],
	costs: {
		11: {
			am: 200,
			g1: 200,
			g2: 100
		},
		12: {
			am: 4e5,
			g2: 3e3,
			g3: 800
		},
		13: {
			am: 3e6,
			g1: 1e4,
			g3: 1e3
		},
		14: {
			am: 2e8,
			g1: 2e5,
			g2: 1e5
		},
		15: {
			am: 1e9,
			g2: 25e4,
			g3: 35e3,
		},
		21: {
			am: 8e10,
			g1: 5e6,
			g2: 25e5
		},
		22: {
			am: 5e11,
			g2: 4e6,
			g3: 75e4
		},
		23: {
			am: 1e13,
			g1: 15e6,
			g3: 15e3
		},
		24: {
			am: 1e15,
			g1: 8e7,
			g2: 4e7
		},
		25: {
			am: 15e16,
			g2: 75e6,
			g3: 15e6,
		},
		31: {
			am: 1e10,
			g1: 1e6,
			g4: 1,
		},
		32: {
			am: 1e17,
			g2: 5e6,
			g4: 10
		},
		33: {
			am: 1e22,
			g3: 3e7,
			g4: 400
		},
		34: {
			am: 2e25,
			g1: 5e9,
			g3: 5e8
		},
		35: {
			am: 2e28,
			g1: 5e10,
			g4: 5e4
		},
		41: {
			am: 2e33,
			g2: 5e10,
			g4: 1e6
		},
		42: {
			am: 2e40,
			g3: 1e12,
			g4: 1e7
		},
		43: {
			am: 2e50,
			g1: 4e13,
			g3: 4e12
		},
		44: {
			am: 2e65,
			g1: 1e14,
			g4: 1e8
		},
		45: {
			am: 2e79,
			g2: 2e14,
			g4: 4e8
		},
		51: {
			am: 2e75,
			g1: 6e12,
			g3: 2e12
		},
		52: {
			am: 2e150,
			g2: 2e170,
			g5: 2e150
		},
		53: {
			am: 2e180,
			g3: "2e455",
			g4: "2e450"
		},
		54: {
			am: 2e205,
			g3: "2e680",
			g5: "2e660"
		},
		55: {
			am: 2e210,
			g1: "2e750",
			g2: "2e750"
		},
		61: {
			am: 2e213,
			g1: "2e763",
			g2: "2e763"
		},
		62: {
			am: 2e235,
			g3: "2e950",
			g5: "2e930"
		},
		63: {
			am: 2e245,
			g1: "2e1050",
			g3: "2e1050"
		},
		64: {
			am: 2e265,
			g3: "2e1200",
			g4: "2e1200"
		},
		65: {
			am: 2e280,
			g4: 1/0,
			g5: "1e1350"
		},
	},
	reqData: {},
	descs: {
		11: "Bosonic Antimatter increases blue Light effect.",
		12: "For every 100% of green power effect, decrease the free galaxy threshold increase by 0.0007.",
		13: "Radioactive Decays boost the effect of Light Empowerments.",
		14: "Sacrificed galaxies cancel less galaxies based on your free galaxies.",
		15: "Ghostifies and dilated time power up each other.",
		21: "Replace first Nanofield reward with a boost to slow down Dimension Supersonic scaling.",
		22: "Replace seventh Nanofield reward with a boost to neutrino gain and preon charge.",
		23: "Assigning gives more colored quarks based on your meta-antimatter.",
		24: "You produce 1% of Space Shards on Big Rip per second, but Break Eternity upgrades that boost space shard gain are nerfed.",
		25: "Electrons boost the per-ten Meta Dimensions multiplier.",
		31: "Bosonic Antimatter boosts all Nanorewards.",
		32: "You unlock more boosts from Light Empowerments.",
		33: "Higgs Bosons reduce the costs of all electron upgrades.",
		34: "All types of galaxies boost each other.",
		35: "Replicantis and Emperor Dimensions boost each other.",
		41: "Intergalactic and Infinite Time rewards boost each other.",
		42: "Red power boosts the first Bosonic Upgrade.",
		43: "Green power effect boosts Tree Upgrades.",
		44: "Blue power makes replicate interval increase slower.",
		45: "Dilated time weakens the Distant Antimatter Galaxies scaling.",
		51: "You never produce preon anti-energy and always produce Eternal Matter (but at a reduced rate outside of Big Rips).",
		52: "Replicantis raise all powers to Infinite Time and Intergalactic amount to an exponent.",
		53: "Reduce the cost scaling of extra Gravity Dimension Boosts.",
		54: "All row-4 Neutrino Boosts are stronger.",
		55: "Greenshift Galaxies, which reduces Redshifted Galaxies.",
		61: "Gain more Gravity Energy from Bosonic Enchants.",
		62: "Charging one gives a secondary bonus from it.", 
		63: "Time spent on Ghostify boosts Gravity Dimension Boosts.",
		64: "Higgs Bosons greenshifts Galaxies more and give bonus to your Ghostify time.",
		65: "Higgs Bosons make the linear scaling of Gravity Dimension Boosts starts earlier.",
	},
	effects: {
		11() {
			let x = player.ghostify.bl.am.add(1).log10()
			let y = 1
			if (hasBosonicUpg(42)) y = tmp.blu[42]

			let exp = 0.5 - 0.25 * x / (x + 3) / y
			if (tmp.newNGP3E) x += x / 2 + Math.sqrt(x)
			if (y > 1) x *= y
			ret = Math.pow(x, exp) / 4

			return ret
		},
		12() {
			return tmp.quActive ? (colorBoosts.g + tmp.pe - 1) * 7e-4 : 0
		},
		13() {
			if (!tmp.quActive) return 1

			let decays = getRadioactiveDecays('r') + getRadioactiveDecays('g') + getRadioactiveDecays('b')
			let exp = bu62.active("gph") ? 2/3 : 0.5
			let x = Math.pow(decays, exp)

			if (tmp.newNGP3E) x = x + 1
			else x = x / 3 + .6

			return Math.max(x, 1)
		},
		14() {
			if (!tmp.quActive) return 0
			let x = Math.pow(Math.max(player.dilation.freeGalaxies / 20 - 1800, 0), 1.5)
			let y = tmp.qu.electrons.sacGals
			let z = Math.max(y, player.galaxies)
			if (x > y) x = (x + y * 2) / 3
			if (x > z) x = Math.pow((x - z + 1e5) * 1e10, 1/3) + z - 1e5
			return Math.round(x)
		},
		15() {
			let gLog = Decimal.max(player.ghostify.times, 1).log10()
			if (tmp.newNGP3E) gLog += 2 * Math.sqrt(gLog)

			let ghlog = player.dilation.dilatedTime.div("1e1520").add(1).pow(.05).log10()
			if (ghlog > 308) ghlog = Math.sqrt(ghlog * 308)

			return {
				dt: player.dilation.dilatedTime.gt("1e50000") ? 1 : Decimal.pow(10, 2 * gLog + 3 * gLog / (gLog / 20 + 1)),
				gh: tmp.eterUnl ? Decimal.pow(10, ghlog) : new Decimal(1)
			}
		},
		23() {
			if (!tmp.eterUnl) return new Decimal(1)
			return player.meta.antimatter.add(1).pow(0.06)
		},
		25() {
			var div = 8e3
			var add = 1
			var exp = 0.6
			if (tmp.newNGP3E){
				div = 2e3
				add = 1.5
			}
			if (!tmp.quActive) return add
			return Math.pow(tmp.qu.electrons.amount + 1, exp) / div + add
		},
		31() {
			var ret = Math.pow(Math.log10(player.ghostify.bl.am.add(1).log10() / 5 + 1) / 2 + 1, 2)
			for (var i = 4; i < 10; i++){
				if (ret > i / 2) ret = i / 2 + Math.log10(ret - i/2 + 1)
				else break
			}
			return ret
		},
		33() {
			var div = tmp.newNGP3E ? 4 : 6
			return (Math.sqrt(player.ghostify.hb.higgs + 1) - 1) / div + 1
		},
		34() {
			var galPart = Math.log10(player.galaxies / 1e4 + 10) * Math.log10(getTotalRG() / 1e4 + 10) * Math.log10(player.dilation.freeGalaxies / 1e4 + 10) * Math.log10(tmp.aeg / 1e4 + 10)
			var exp = tmp.newNGP3E ? 1/6 : 1/8
			var ret = Math.pow(galPart, exp) - 1
			for (var i = 2; i < 10; i++){
				if (ret > i / 10) ret = i / 10 + Math.log10(ret - i/10 + 1)
				else break
			}
			return ret / 5 + 1
		},
		35() {
			return {
				rep: Math.pow(tmp.quActive ? tmp.qu.replicants.quarks.add(1).log10() : 0, 1/3) * 2,
				eds: Decimal.pow(tmp.newNGP3E ? 10 : 20, Math.pow(player.replicanti.amount.log10(), 2/3) / 15e3)
			}
		},
		41() {
			return {
				ig: Decimal.pow(inBigRip() ? 1e5 : 1.05, Math.pow(Decimal.max(tmp.it, 1).log10(), 2)),
				it: Decimal.pow(inBigRip() ? 1.01 : 5, Math.sqrt(Decimal.max(tmp.ig, 1).log10()))
			}
		},
		42() {
			if (!tmp.quActive) return 1
			let exp = tmp.newNGP3E ? 1/3 : 1/4
			return Math.pow(tmp.qu.colorPowers.r.add(1).log10() / 2e4 + 1, exp)
		},
		43() {
			if (!tmp.quActive) return 1
			return Math.sqrt(colorBoosts.g + tmp.pe) / (inBigRip() ? 100 : 40) + 1
		},
		44() {
			if (!tmp.quActive) return 0
			let exp = tmp.newNGP3E ? .65 : .5
			let mul = tmp.newNGP3E ? .2 : .15
			return Math.pow(tmp.qu.colorPowers.b.add(1).log10(), exp) * mul
		},
		45() {
			if (!tmp.eterUnl) return 1
			let eff = player.dilation.dilatedTime.add(1).pow(.0005)
			eff = softcap(eff, "bu45")
			return eff.toNumber()
		},
		52() {
			let log = player.replicanti.amount.max(1).log10()
			let div1 = bu62.active("rep") ? 5e8 : 7.5e8
			let div2 = inBigRip() ? 200 : 1e3

			return {
				ig: Math.pow(log / div1 + 1, bu62.active("rep") ? 0.125 : 0.1),
				it: Math.log10(log + 1) / div2 + 1
			}
		},
		55() {
			return hasBosonicUpg(64) ? tmp.blu[64].gs : 0.95
		},
		62() {
			return bu62.eff[GDs.save.gc || "none"]()
		},
		63() {
			let x = player.ghostify.time
			if (hasBosonicUpg(64)) x += tmp.blu[64].gh
			return Math.log2(x / 50 + 1) / 50 + 1
		},
		64() {
			return {
				gs: 0.95 / (Math.log10(player.ghostify.hb.higgs / 2e3 + 1) / 10 + 1),
				gh: player.ghostify.hb.higgs * 3
			}
		},
		65() {
			return Math.max(15 - player.ghostify.hb.higgs / 1e3, 0)
		}
	},
	effectDescs: {
		11(x) {
			return formatPercentage(x) + "%"
		},
		12(x) {
			return "-" + x.toFixed(5)
		},
		14(x) {
			return getFullExpansion(x) + (x > tmp.qu.electrons.sacGals && !inBigRip() ? " (+" + getFullExpansion(Math.max(x - tmp.qu.electrons.sacGals, 0)) + " Antielectronic Galaxies)" : "")
		},
		15(x) {
			return shorten(x.gh) + "x more Ghostifies & " + shorten(x.dt) + "x more DT"
		},
		25(x) {
			return "^" + x.toFixed(2)
		},
		31(x) {
			return formatPercentage(x - 1) + "% stronger"
		},
		33(x) {
			return "-" + x.toFixed(2) + " levels worth"
		},
		34(x) {
			return formatPercentage(x - 1, 2) + "% stronger"
		},
		35(x) {
			return "+" + shorten(x.rep) + " OoMs to replicate interval increase, " + shorten(x.eds) + "x to all EDs"
		},
		41(x) {
			return shorten(x.ig) + "x to Intergalactic, " + shorten(x.it) + "x to Infinite Time"
		},
		42(x) {
			return formatPercentage(x, 2) + "% to growth and softcap slowdown"
		},
		43(x) {
			return formatPercentage(x - 1, 2) + "% stronger"
		},
		44(x) {
			return "+" + x.toFixed(1) + " OoMs"
		},
		45(x) {
			return "/" + shorten(x) + " to efficiency"
		},
		52(x) {
			return "^" + formatValue(player.options.notation, x.ig, 3, 3) + " to Intergalactic, ^" + formatValue(player.options.notation, x.it, 3, 3) + " to Infinite Time"
		},
		55(x) {
			return (
				x < 0 ? "^" + (-x).toFixed(3) + " to Blueshifted Galaxies" :
				"^" + x.toFixed(3) + " to Redshifted Galaxies"
			)
		},
		62(x) {
			return bu62.desc[GDs.save.gc || "none"](x)
		},
		63(x) {
			return formatPercentage(x - 1, 2) + "% stronger"
		},
		64(x) {
			return "^0.950 greenshift -> ^" + x.gs.toFixed(3) + ", +" + timeDisplayShort(x.gh) + " bonus time"
		},
		65(x) {
			return "Starts at " + x.toFixed(2) + " GDBs"
		}
	}
}

//Bosonic Overdrive
function getBosonicBatteryLoss() {
	if (player.ghostify.bl.odSpeed == 1) return new Decimal(0)
	return Decimal.pow(10, player.ghostify.bl.odSpeed * 2 - 3)
}

function changeOverdriveSpeed() {
	player.ghostify.bl.odSpeed = getEl("odSlider").value / 50 * 4 + 1
}

//W & Z Bosons
function getAntiPreonProduction() {
	return 1 / 10
}

var aplScalings = {
	0: 0,
	1: 24,
	2: 96,
	3: 48
}

function getAntiPreonLoss() {
	return 1 / 30
}

function useAntiPreon(id) {
	player.ghostify.wzb.dPUse = id
}

function getOscillateGainSpeed() {
	let r = tmp.wzb.wbo
	if (isEnchantUsed(23)) r = r.times(tmp.bEn[23])
	return Decimal.div(r, player.ghostify.wzb.zNeReq)
}

function updateWZBosonsTab() {
	let data = tmp.bl
	let data2 = tmp.wzb
	let data3 = player.ghostify.wzb
	let speed = getBosonicFinalSpeed()
	let show0 = data3.dPUse == 1 && Decimal.div(getAntiPreonLoss(), aplScalings[1]).times(speed).times(tmp.wzb.zbs).gte(10)
	let gainSpeed = getOscillateGainSpeed()
	let r = speed.times(data3.dPUse ? getAntiPreonLoss() : getAntiPreonProduction())
	getEl("ap").textContent = shorten(data3.dP)
	getEl("apProduction").textContent = (data3.dPUse ? "-" : "+") + shorten(r) + "/s"
	getEl("apUse").textContent = data3.dPUse == 0 ? "" : "You are currently consuming Anti-Preons to " + (["", "decay W Bosons", "oscillate Z Bosons", "convert W- to W+ Bosons"])[data3.dPUse] + "."
	getEl("wQkType").textContent = data3.wQkUp ? "positive" : "negative"
	getEl("wQkProgress").textContent = data3.wQkProgress.times(100).toFixed(1) + "% to turn W Boson to a" + (data3.wQkUp ? " negative" : " positive")+" Boson."
	getEl("wQk").className = show0 ? "zero" : data3.wQkUp ? "up" : "down"
	getEl("wQkSymbol").textContent = show0 ? "0" : data3.wQkUp ? "+" : "−"
	getEl("wpb").textContent = shortenDimensions(data3.wpb)
	getEl("wnb").textContent = shortenDimensions(data3.wnb)
	getEl("wbTime").textContent = shorten(data2.wbt)
	getEl("wbOscillate").textContent = shorten(data2.wbo)
	getEl("wbProduction").textContent = shorten(data2.wbp)
	getEl("zNeGen").textContent = (["electron", "Mu", "Tau"])[data3.zNeGen - 1]
	getEl("zNeProgress").textContent = data3.zNeProgress.times(100).toFixed(1) + "% to oscillate Z Boson to " + (["Mu", "Tau", "electron"])[data3.zNeGen-1] + "."
	getEl("zNeReq").textContent = "Oscillate progress gain speed is currently " + (gainSpeed.gt(1) ? shorten(gainSpeed) : "1 / " + shorten(Decimal.div(1, gainSpeed))) + "x."
	getEl("zNe").className = (["electron","mu","tau"])[data3.zNeGen - 1]
	getEl("zNeSymbol").textContent = (["e", "μ", "τ"])[data3.zNeGen - 1]
	getEl("zb").textContent = shortenDimensions(data3.zb)
	getEl("zbGain").textContent = "You will gain " + shortenDimensions(data3.zNeReq.pow(0.75)) + " Z Bosons on next oscillation."
	getEl("zbSpeed").textContent = shorten(data2.zbs)
}