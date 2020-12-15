function resetDimensions() {
	let costs = [10, 100, 1e4, 1e6, 1e9, 1e13, 1e18, 1e24]
	if (inNC(10) || player.currentChallenge == "postc1") costs = [10, 100, 100, 500, 2500, 2e4, 2e5, 4e6]

	for (var d = 1; d <= 8; d++) {
		var name = TIER_NAMES[d]
		player[name + "Amount"] = new Decimal(0)
		player[name + "Bought"] = 0
		player[name + "Cost"] = new Decimal(costs[d - 1])
	}
	resetNormalDimensionCostMults()

	if (tmp.ngC) ngC.resetNDs()
}

function resetNormalDimensionCostMults() {
	let costMults = getNormalDimensionCostMults()
	for (var d = 1; d <= 8; d++) player.costMultipliers[d - 1] = new Decimal(costMults[d])
}

function getR84or73Mult(){
	var mult = new Decimal(1)
	if (player.achievements.includes("r84")) mult = player.money.pow(player.galacticSacrifice ? 0.0002 : 0.00004).plus(1);
	else if (player.achievements.includes("r73")) mult = player.money.pow(player.galacticSacrifice ? 0.0001 : 0.00002).plus(1);
	
	var log = mult.log10()
	if (log > 1e12) log = 1e12 * Math.pow(log / 1e12, .5)
	
	if (log < 0) log = 0
	return Decimal.pow(10, log)
}

function getNormalDimensionVanillaAchievementBonus(tier){
	var mult = new Decimal(1)
	if (tier == 1) {
		if (player.achievements.includes("r28")) mult = mult.times(1.1);
		if (player.achievements.includes("r31")) mult = mult.times(1.05);
		if (player.achievements.includes("r71")) mult = mult.times(player.galacticSacrifice ? 909 : 3);
		if (player.achievements.includes("r68")) mult = mult.times(player.galacticSacrifice ? 5 : 1.5);
		if (player.galacticSacrifice) if (player.achievements.includes("r64")) mult = mult.times(1e6);
	}
	if (tier == 8 && player.achievements.includes("r23")) mult = mult.times(1.1);
	else if (player.achievements.includes("r34")) mult = mult.times(player.galacticSacrifice ? 2 : 1.02);
	if (tier <= 4 && player.achievements.includes("r43")) mult = mult.times(1.25);
	if (player.galacticSacrifice && player.achievements.includes("r31")) mult = mult.times(productAllTotalBought1());
	if (player.achievements.includes("r48")) mult = mult.times(1.1);
	if (player.achievements.includes("r72")) mult = mult.times(player.galacticSacrifice ? 10 : 1.1); // tbd
	if (player.galacticSacrifice && player.tickspeedBoosts == undefined && player.achievements.includes("r46")) mult = mult.times(productAllDims1());
	if (player.achievements.includes("r74") && player.currentChallenge != "") mult = mult.times(player.galacticSacrifice ? 40 : 1.4);
	if (player.achievements.includes("r77")) mult = mult.times(1 + tier / (player.galacticSacrifice ? 10 : 100));
	if (player.boughtDims && player.achievements.includes("r98")) mult = mult.times(player.infinityDimension8.amount.max(1))
	mult = mult.times(getR84or73Mult())
	if (player.galacticSacrifice) return mult
	if (player.achievements.includes("r56") && player.thisInfinityTime < 1800) mult = mult.times(3600 / (player.thisInfinityTime + 1800));
	if (player.achievements.includes("r78") && player.thisInfinityTime < 3) mult = mult.times(3.3 / (player.thisInfinityTime + 0.3));
	if (player.achievements.includes("r65") && player.currentChallenge != "" && player.thisInfinityTime < 1800) mult = mult.times(Math.max(2400 / (player.thisInfinityTime + 600), 1))
	if (player.achievements.includes("r91") && player.thisInfinityTime < 50) mult = mult.times(Math.max(301 - player.thisInfinityTime * 6, 1))
	if (player.achievements.includes("r92") && player.thisInfinityTime < 600) mult = mult.times(Math.max(101 - player.thisInfinityTime / 6, 1));
	return mult
}

function getNormalDimensionVanillaTimeStudyBonus(tier){
	var mult = new Decimal(1)
	if (hasTS(71) && tier !== 8) mult = mult.times(tmp.sacPow.pow(0.25).min("1e210000"));
	if (hasTS(91)) mult = mult.times(Decimal.pow(10, Math.min(player.thisEternity, 18000) / 60));
	let useHigherNDReplMult = !player.dilation.active ? false : !player.masterystudies ? false : masteryStudies.has("t323")
	if (!useHigherNDReplMult) mult = mult.times(tmp.nrm)
	if (hasTS(161)) mult = mult.times(Decimal.pow(10, (player.galacticSacrifice ? 6660 : 616) * (player.aarexModifications.newGameExpVersion ? 5 : 1)))
	if (hasTS(234) && tier == 1) mult = mult.times(tmp.sacPow)
	if (hasTS(193)) mult = mult.times(Decimal.pow(1.03, Decimal.div(getEternitied(), tmp.ngC ? 1e6 : 1)).min("1e13000"))
	if (tier == 8 && hasTS(214)) mult = mult.times((tmp.sacPow.pow(8)).min("1e46000").times(tmp.sacPow.pow(1.1).min(new Decimal("1e125000"))))
	return mult
}

function getNormalDimensionGalaxyUpgradesBonus(tier,mult){
	if (!player.galacticSacrifice) return mult
	
	if (player.galacticSacrifice.upgrades.includes(12) && (!player.galacticSacrifice.upgrades.includes(42) || player.aarexModifications.ngmX < 4)) mult = mult.times(galMults.u12())
	if (player.pSac !== undefined) if (tier == 2) mult = mult.pow(puMults[13](hasPU(13, true, true)))
	if (player.galacticSacrifice.upgrades.includes(13) && ((!inNC(14) && player.currentChallenge != "postcngm3_3") || player.tickspeedBoosts == undefined || player.aarexModifications.ngmX > 3) && player.currentChallenge != "postcngm3_4") mult = mult.times(galMults.u13())
	if (player.galacticSacrifice.upgrades.includes(15)) mult = mult.times(galMults.u15())
	if (player.galacticSacrifice.upgrades.includes(35)) mult = mult.times(galMults.u35())
	if (player.challenges.includes("postc4")) mult = mult.pow(1.05);
	if (player.galacticSacrifice.upgrades.includes(31)) mult = mult.pow(galMults.u31());
	return mult
}

function getAfterDefaultDilationLayerAchBonus(tier){
	mult = new Decimal(1)
	let timeAndDimMult = timeMult()
	if (hasInfinityMult(tier) && !(player.aarexModifications.ngmX >= 4)) timeAndDimMult = dimMults().times(timeAndDimMult)
	if (player.challenges.includes("postcngmm_1")||player.currentChallenge=="postcngmm_1") mult = mult.times(timeAndDimMult)
	if (!player.galacticSacrifice) return mult
	if (player.achievements.includes("r56") && player.thisInfinityTime < 1800) mult = mult.times(3600 / (player.thisInfinityTime + 1800));
	if (player.achievements.includes("r78") && player.thisInfinityTime < 3) mult = mult.times(3.3 / (player.thisInfinityTime + 0.3));
	if (player.achievements.includes("r65") && player.currentChallenge != "" && player.thisInfinityTime < 1800) mult = mult.times(Math.max(2400 / (player.thisInfinityTime + 600), 1))
	if (player.achievements.includes("r91") && player.thisInfinityTime < 50) mult = mult.times(Math.max(301 - player.thisInfinityTime * 6, 1))
	if (player.achievements.includes("r92") && player.thisInfinityTime < 600) mult = mult.times(Math.max(101 - player.thisInfinityTime / 6, 1));
	if (player.currentChallenge == "postc6" || inQC(6)) mult = mult.dividedBy(player.matter.max(1))
	if (player.currentChallenge == "postc8" || inQC(6)) mult = mult.times(player.postC8Mult)
	if (player.galacticSacrifice.upgrades.includes(12) && player.galacticSacrifice.upgrades.includes(42) && player.aarexModifications.ngmX >= 4) mult = mult.times(galMults.u12())
	if (player.galacticSacrifice.upgrades.includes(45) && player.aarexModifications.ngmX >= 4) {
		var e = player.galacticSacrifice.upgrades.includes(46) ? galMults["u46"]() : 1
		mult = mult.times(Math.pow(player["timeDimension" + tier].amount.plus(10).log10(), e))
	}
	return mult
}

function getPostBreakInfNDMult(){
	mult = new Decimal(1)
	if (player.infinityUpgrades.includes("totalMult")) mult = mult.times(totalMult)
	if (player.infinityUpgrades.includes("currentMult")) mult = mult.times(currentMult)
	if (player.infinityUpgrades.includes("infinitiedMult")) mult = mult.times(infinitiedMult)
	if (player.infinityUpgrades.includes("achievementMult")) mult = mult.times(achievementMult)
	if (player.infinityUpgrades.includes("challengeMult")) mult = mult.times(worstChallengeBonus)
	return mult
}

let alwaysCalcDimPowers = true
let dMultsC7 = [null, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1),
	      new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)]
let dCurrentC7 = [null, 0, 0, 0, 0,
		  0, 0, 0, 0]

function getStartingNDMult(tier) {
	let mPerDB = getDimensionBoostPower()
	let dbMult = player.resets < tier ? new Decimal(1) : Decimal.pow(mPerDB, player.resets - tier + 1)

	let mptMult = new Decimal(1)
	if (inNC(9) || player.currentChallenge === "postc1") {
		base = Math.pow(10 / 0.30, Math.random()) * 0.30
		total = Math.floor(player[TIER_NAMES[tier] + "Bought"] / 10)
		diff = total - dCurrentC7[tier]
		if (diff < 0) {
			dCurrentC7[tier] = 0
			dMultsC7[tier] = new Decimal(1)
			diff = total
		}
		dMultsC7[tier] = dMultsC7[tier].times(Decimal.pow(base, diff))
		dCurrentC7[tier] = total
		mptMult = dMultsC7[tier]
	} else {
		let mPerTen = getDimensionPowerMultiplier()
		mptMult = Decimal.pow(mPerTen, Math.floor(player[TIER_NAMES[tier]+"Bought"] / 10))
	}

	let mult = mptMult.times(dbMult)
	if (tier == 8 || tmp.ngC) {
		if (inNC(11)) mult = mult.times(player.chall11Pow)
		else mult = mult.times(tmp.sacPow)
	}
	return mult
}

function getDimensionFinalMultiplier(tier) {
	if (!tmp.infPow) updateInfinityPowerEffects()
	let mult = new Decimal(1)

	if (player.currentChallenge == "postcngc_2" || player.currentChallenge == "postcngm3_2" || player.currentEternityChall == "eterc11") {
		if (player.currentChallenge == "postcngc_2") mult = ngC.condense.nds.eff(tier)
		else if (player.currentChallenge == "postcngm3_2") mult = tmp.infPow.max(1e100)
		else if (player.currentEternityChall == "eterc11") {
			mult = tmp.infPow.times(Decimal.pow(getDimensionBoostPower(), player.resets - tier + 1).max(1))
			if (tmp.quActive) x = x.times(colorBoosts.dim.r)
		}

		if (tmp.ngC) mult = softcap(mult, "nds_ngC")
		return mult
	}

	mult = getStartingNDMult(tier) //contains sac
	if (tmp.ngC && player.currentChallenge != "postcngc_1") mult = mult.times(ngC.condense.nds.eff(tier))

	if (player.aarexModifications.newGameMinusVersion !== undefined) mult = mult.times(.1)
	if ((inNC(7) || player.currentChallenge == "postcngm3_3") && !player.galacticSacrifice) {
		if (tier == 4) mult = mult.pow(1.4)
		if (tier == 2) mult = mult.pow(1.7)
	}

	if (player.currentEternityChall != "eterc9" && (player.tickspeedBoosts == undefined || player.currentChallenge != "postc2")) mult = mult.times(tmp.infPow)

	mult = mult.times(getPostBreakInfNDMult())

	let timeAndDimMult = timeMult()
	if (hasInfinityMult(tier) && !(player.aarexModifications.ngmX >= 4)) timeAndDimMult = dimMults().times(timeAndDimMult)
	if (!(player.aarexModifications.ngmX >= 4)) mult = mult.times(dimMults())
	if (!player.challenges.includes("postcngmm_1") && player.currentChallenge!="postcngmm_1") mult = mult.times(timeAndDimMult)
	
	if (tier == 1 && player.infinityUpgrades.includes("unspentBonus")) mult = mult.times(unspentBonus);
	mult = mult.times(getNormalDimensionVanillaAchievementBonus(tier))
	mult = mult.times(player.achPow)
	mult = mult.times(getNormalDimensionVanillaTimeStudyBonus(tier))
	mult = getNormalDimensionGalaxyUpgradesBonus(tier,mult)

	mult = mult.times(player.postC3Reward)
	if (player.challenges.includes("postc4") && player.galacticSacrifice === undefined) mult = mult.pow(1.05);
	if (player.challenges.includes("postc8") && tier < 8 && tier > 1) mult = mult.times(mult18);

	if (isADSCRunning() || (player.galacticSacrifice && player.currentChallenge === "postc1")) mult = mult.times(productAllTotalBought());
	else {
		if (player.currentChallenge == "postc6" || inQC(6)) mult = mult.dividedBy(player.matter.max(1))
		if (player.currentChallenge == "postc8" || inQC(6)) mult = mult.times(player.postC8Mult)
	}

	if (player.currentChallenge == "postc4" && player.postC4Tier != tier && player.tickspeedBoosts == undefined) mult = mult.pow(0.25)
	
	if (player.currentEternityChall == "eterc10") mult = mult.times(ec10bonus)
	
	if (tier == 8 && player.achievements.includes("ng3p27")) mult = mult.times(tmp.ig)	

	if (mult.gt(10)) mult = dilates(mult.max(1), 2)
	mult = mult.times(getAfterDefaultDilationLayerAchBonus(tier))
	if (player.currentChallenge == "postc4" && player.tickspeedBoosts != undefined) mult = mult.sqrt()

	if (mult.gt(10)) mult = dilates(mult.max(1), 1)
	if (player.dilation.upgrades.includes(6)) mult = mult.times(player.dilation.dilatedTime.max(1).pow(308))
	if (tier == 1 && player.tickspeedBoosts == undefined && player.infinityUpgrades.includes("postinfi60")) mult = mult.times(getNewB60Mult())
	let useHigherNDReplMult = !player.dilation.active ? false : !player.masterystudies ? false : masteryStudies.has("t323")
	if (useHigherNDReplMult) mult = mult.times(tmp.nrm)
	if (tmp.quActive) mult = mult.times(colorBoosts.dim.r)
	if (player.dilation.active && isNanoEffectUsed("dil_effect_exp")) mult = mult.pow(tmp.nf.effects.dil_effect_exp)
	if (isBigRipUpgradeActive(1)) mult = mult.times(tmp.bru[1])

	if (tmp.ngC) {
		mult = softcap(mult, "nds_ngC")
		if (player.replicanti.unl) mult = mult.times(tmp.rm)
	}

	return mult
}

function getDimensionDescription(tier) {
	var name = TIER_NAMES[tier];
	if (tier > Math.min(inQC(1) ? 1 : player.currentEternityChall == "eterc3" ? 3 : inNC(4) || player.currentChallenge == "postc1" || player.pSac != undefined ? 5 : 7, player.resets + 3) - (inNC(7) || player.currentChallenge == "postcngm3_3" || inQC(4) || player.pSac !== undefined ? 1 : 0)) return getFullExpansion(inNC(11) ? getAmount(tier) : player[name + 'Bought']) + ' (' + dimBought(tier) + ')';
	else if (player.money.l > 1e9) return shortenND(player[name + 'Amount'])
	else if (player.money.l > 1e6) return shortenND(player[name + 'Amount']) + '  (+' + formatValue(player.options.notation, getDimensionRateOfChange(tier), 2, 2) + dimDescEnd;
	else return shortenND(player[name + 'Amount']) + ' (' + dimBought(tier) + ')  (+' + formatValue(player.options.notation, getDimensionRateOfChange(tier), 2, 2) + dimDescEnd;
}

function getDimensionRateOfChange(tier) {
	if (tier == 8 || (player.currentEternityChall == "eterc3" && tier > 3)) return 0;

	let toGain = getDimensionProductionPerSecond(tier + 1)
	if (tier == 7 && player.currentEternityChall == "eterc7") toGain = DimensionProduction(1).times(10)

	var name = TIER_NAMES[tier];
	if (inNC(7) || player.currentChallenge == "postcngm3_3" || inQC(4) || player.pSac !== undefined) {
		if (tier == 7) return 0
		else toGain = getDimensionProductionPerSecond(tier + 2);
	}
	if (tmp.inEC12) toGain = toGain.div(tmp.ec12Mult)
	var current = player[name + 'Amount'].max(1);
	if (player.aarexModifications.logRateChange) {
		var change = current.add(toGain.div(10)).log10()-current.log10()
		if (change < 0 || isNaN(change)) change = 0
	} else var change = toGain.times(10).dividedBy(current);

	return change;
}

let infToDimMultUpgs = [null, "18Mult", "27Mult", "36Mult", "45Mult", "45Mult", "36Mult", "27Mult", "18Mult"]
function hasInfinityMult(tier) {
	return player.infinityUpgrades.includes(infToDimMultUpgs[tier])
}

function multiplySameCosts(cost) {
	var tiers = [ null, "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eight" ];
	var tierCosts = [ null, new Decimal(1e3), new Decimal(1e4), new Decimal(1e5), new Decimal(1e6), new Decimal(1e8), new Decimal(1e10), new Decimal(1e12), new Decimal(1e15) ];

	for (let i = 1; i <= 8; i++) {
		if (player[tiers[i] + "Cost"].e == cost.e) player[tiers[i] + "Cost"] = player[tiers[i] + "Cost"].times(tierCosts[i])
	}
	if (player.tickSpeedCost.e == cost.e) player.tickSpeedCost = player.tickSpeedCost.times(player.tickspeedMultiplier)
	//the above line is broken in C9 in NGC&NG+++, but i think its a bug elsewhere
	// the bug is getTickspeedCostMultiplier is not defined
}

function multiplyPC5Costs(cost, tier) {
	var tiers = [ null, "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eight" ];
	if (tier < 5) {
		for (var i = 1; i <= 8; i++) {
			if (player[tiers[i] + "Cost"].e <= cost.e) {
				player[tiers[i] + "Cost"] = player[tiers[i] + "Cost"].times(player.costMultipliers[i-1])
				if (player[tiers[i] + "Cost"].gte(Number.MAX_VALUE)) player.costMultipliers[i-1] = player.costMultipliers[i-1].times(10)
			}
		}
	} else {
		for (var i = 1; i <= 8; i++) {
			if (player[tiers[i] + "Cost"].e >= cost.e) {
				player[tiers[i] + "Cost"] = player[tiers[i] + "Cost"].times(player.costMultipliers[i-1])
				 if (player[tiers[i] + "Cost"].gte(Number.MAX_VALUE)) player.costMultipliers[i-1] = player.costMultipliers[i-1].times(10)
			}
		}
	}
}
	
function canBuyDimension(tier) {
	if (tmp.ri) return false
	if (tier > Math.min(player.resets + 4, inNC(4) || player.currentChallenge == "postc1" || player.pSac != undefined ? 6 : 8)) return false
	if (tier > 1 && getAmount(tier - 1) == 0 && getEternitied() < 30) return false

	return true
}
	
function getDimensionPowerMultiplier(focusOn, debug) {
	let ret = focusOn || inNC(9) || player.currentChallenge=="postc1" ? getMPTBase(focusOn) : tmp.mptb
	let exp = 1
	if (tmp.ngp3 && focusOn != "linear") exp = focusOn == "no-rg4" ? getMPTExp(focusOn) : tmp.mpte
	if (exp > 1) ret = Decimal.pow(ret, exp)
	if (player.aarexModifications.newGameMult !== undefined) {
		ret = Decimal.times(ret, Math.log10(player.resets + 1) + 1)
		ret = Decimal.times(ret, Math.log10(Math.max(player.galaxies, 0) + 1) * 5 + 1)
	}
	return ret
}

function getMPTPreInfBase() {
	let x = 2
	if (player.tickspeedBoosts !== undefined) x = 1
	if (player.aarexModifications.newGameExpVersion) x *= 10
	if (player.aarexModifications.newGameMult) x *= 2.1
	if (tmp.ez) x *= 1.05
	return x
}
	
function getMPTBase(focusOn) {
	if (((inQC(5) || inQC(7)) && focusOn != "linear") || (((inNC(13) && player.tickspeedBoosts == undefined) || player.currentChallenge == "postc1" || player.currentChallenge == "postcngm3_1") && player.galacticSacrifice != undefined)) {
		if (player.masterystudies) if (masteryStudies.has("t321")) return new Decimal("1e430")
		return 1
	}
	let ret =getMPTPreInfBase()
	if (player.infinityUpgrades.includes("dimMult")) ret *= infUpg12Pow()
	if (player.achievements.includes("r58")) {
		if (player.galacticSacrifice !== undefined) {
			let exp = 1.0666
			if (player.tickspeedBoosts !== undefined) exp = Math.min(Math.sqrt(1800 / player.challengeTimes[3] + 1), exp)
			ret = Math.pow(ret, exp)
		} else ret *= 1.01
	}
	ret += getECReward(3)
	if (player.galacticSacrifice !== undefined) if (player.galacticSacrifice.upgrades.includes(33) && ((!inNC(14) && player.currentChallenge != "postcngm3_3") || player.tickspeedBoosts == undefined || player.aarexModifications.ngmX > 3) && player.currentChallenge != "postcngm3_4") ret *= galMults.u33();
	if (focusOn == "no-QC5") return ret
	if (tmp.ngp3) {
		if (isQCRewardActive(5)) ret += tmp.qcRewards[5]
		if (isNanoEffectUsed("per_10_power")) ret += tmp.nf.effects.per_10_power
	}
	return ret
}

function getMPTExp(focusOn) {
	let x = 1
	if (tmp.quActive && masteryStudies.has("d7")) x = getElectronBoost(focusOn)
	return x
}
	
function clearDimensions(amount) {
	var tiers = [null, "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eight" ];
	
	for (var i = 1; i <= amount; i++) {
		player[tiers[i] + "Amount"] = new Decimal(0)
	}
}
	
	
function getDimensionCostMultiplier(tier) {
	return player.costMultipliers[tier - 1]
}

function getNormalDimensionCostMults() {
	let x = []
	if (inNC(10)) x = [null, 1e3, 5e3, 1e4, 12e3, 18e3, 26e3, 32e3, 42e3]
	else x = [null, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12, 1e15]

	if (tmp.ngmR) for (let d = 1; d <= 8; d++) x[d] = ngmR.adjustCostScale(x[d])

	return x
}

function onBuyDimension(tier) {
	giveAchievement(allAchievements["r1"+tier])
	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || tmp.ngmX >= 5) player.chall2Pow = 0
	if (inNC(8) || player.currentChallenge == "postc1") clearDimensions(tier-1)
	if (inMatterChallenge() && player.matter.eq(0)) player.matter = new Decimal(1)
	player.postC4Tier = tier;
	player.postC8Mult = new Decimal(1)
	if (tier != 8) player.dimlife = false
	if (tier != 1) player.dead = false
	if (player.masterystudies) if (tier > 4) player.old = false
}
	
function getAmount(tier) {
	let ret = player[TIER_NAMES[tier] + "Amount"].toNumber()
	if (!break_infinity_js) ret = Math.round(ret)
	return ret
}

function dimBought(tier) {
	return player[TIER_NAMES[tier] + "Bought"] % 10;
}

function recordBought (name, num) {
	player[name + 'Bought'] += num;
	if (player.galacticSacrifice) player.totalBoughtDims[name] = (player.totalBoughtDims[name] ? player.totalBoughtDims[name] : 0) + num;
}

function costIncreaseActive(cost) {
	if (tmp.ngC) return true
	if (inNC(10) || player.currentChallenge == "postc1" || player.infinityUpgradesRespecced != undefined) return false
	return cost.gte(Number.MAX_VALUE) || player.currentChallenge === 'postcngmm_2';
}

function getDimensionCostMultiplierIncrease() {
	if (inQC(7)) return Number.MAX_VALUE
	let ret = player.dimensionMultDecrease;
	if (player.aarexModifications.ngmX > 3) ret = Math.pow(ret, 1.25)
	if (player.currentChallenge === 'postcngmm_2') {
		exp = player.aarexModifications.ngmX >= 4 ? .9 : .5
		ret = Math.pow(ret, exp)
	} else if (player.challenges.includes('postcngmm_2')) {
		expcomp = player.aarexModifications.ngmX >= 4 ? .95 : .9
		ret = Math.pow(ret, expcomp)
	}
	return ret;
}

function buyOneDimension(tier) {
	if (!canBuyDimension(tier)) return false
	let name = TIER_NAMES[tier]
	let cost = player[name + 'Cost']
	let resource = getOrSubResource(tier)
	if (!cost.lte(resource)) return false
	getOrSubResource(tier, cost)
	player[name + "Amount"] = player[name + "Amount"].add(1)
	recordBought(name, 1)
	if (dimBought(tier) == 0) {
		if (player.currentChallenge == "postc5" && player.tickspeedBoosts == undefined) multiplyPC5Costs(player[name + 'Cost'], tier)
		else if (inNC(5) && player.tickspeedBoosts == undefined) multiplySameCosts(player[name + 'Cost'])
		else player[name + "Cost"] = player[name + "Cost"].times(getDimensionCostMultiplier(tier))
		if (costIncreaseActive(player[name + "Cost"])) player.costMultipliers[tier - 1] = player.costMultipliers[tier - 1].times(getDimensionCostMultiplierIncrease())

		let pow = getDimensionPowerMultiplier()
		floatText("D" + tier, "x" + shortenMoney(pow))
	}
	if (tier == 1 && getAmount(1) >= 1e150) giveAchievement("There's no point in doing that")
	if (getAmount(8) == 99) giveAchievement("The 9th Dimension is a lie");
	onBuyDimension(tier)
	reduceMatter(1)
	return true
}

function buyManyDimension(tier, quick) {
	if (!canBuyDimension(tier)) return false
	let name = TIER_NAMES[tier]
	let toBuy = 10 - dimBought(tier)
	let cost = player[name + 'Cost'].times(toBuy)
	let resource = getOrSubResource(tier)
	if (!cost.lte(resource)) return false
	getOrSubResource(tier, cost)
	player[name + "Amount"] = player[name + "Amount"].add(toBuy)
	recordBought(name, toBuy)
	if (player.currentChallenge == "postc5" && player.tickspeedBoosts == undefined) multiplyPC5Costs(player[name + 'Cost'], tier)
	else if (inNC(5) && player.tickspeedBoosts == undefined) multiplySameCosts(player[name + 'Cost'])
	else player[name + "Cost"] = player[name + "Cost"].times(getDimensionCostMultiplier(tier))
	if (costIncreaseActive(player[name + "Cost"])) player.costMultipliers[tier - 1] = player.costMultipliers[tier - 1].times(getDimensionCostMultiplierIncrease())
	let pow = getDimensionPowerMultiplier()
	if (!quick) {
		floatText("D" + tier, "x" + shortenMoney(pow))
		onBuyDimension(tier)
	}
	reduceMatter(toBuy)
	return true
}

var initCost
var costMults
function buyBulkDimension(tier, bulk, auto) {
	if (!canBuyDimension(tier)) return
	let bought = 0
	if (dimBought(tier) > 0) {
		if (!buyManyDimension(tier, true)) return
		bought++
	}
	let name = TIER_NAMES[tier]
	let cost = player[name + 'Cost'].times(10)
	let resource = getOrSubResource(tier)
	if (!cost.lte(resource)) return
	if (((!inNC(5) && player.currentChallenge != "postc5") || player.tickspeedBoosts != undefined) && !inNC(9) && !costIncreaseActive(player[name + "Cost"])) {
		let mult = getDimensionCostMultiplier(tier)
		let max = Number.POSITIVE_INFINITY
		if (!inNC(10) && player.currentChallenge != "postc1" && player.infinityUpgradesRespecced == undefined) max = Math.ceil(Decimal.div(Number.MAX_VALUE, cost).log(mult) + 1)
		var toBuy = Math.min(Math.min(Math.floor(resource.div(cost).times(mult-1).add(1).log(mult)), bulk-bought), max)
		getOrSubResource(tier, Decimal.pow(mult, toBuy).sub(1).div(mult-1).times(cost))
		player[name + "Amount"] = player[name + "Amount"].add(toBuy * 10)
		recordBought(name, toBuy*10)
		player[name + "Cost"] = player[name + "Cost"].times(Decimal.pow(mult, toBuy))
		if (costIncreaseActive(player[name + "Cost"])) player.costMultipliers[tier - 1] = player.costMultipliers[tier - 1].times(getDimensionCostMultiplierIncrease())
		bought += toBuy
		reduceMatter(toBuy * 10)
	}
	let stopped = !costIncreaseActive(player[name + "Cost"])
	let failsafe = 0
	while (!canQuickBuyDim(tier)) {
		stopped = true
		if (!buyManyDimension(tier, true)) break
		bought++
		if (bought == bulk) break
		failsafe++
		if (failsafe > 149) break
		stopped = false
	}
	while (!stopped) {
		stopped = true
		let mi = getDimensionCostMultiplierIncrease()
		let a = Math.log10(mi)/2
		let b = player.costMultipliers[tier-1].log10() - a
		let c = player[name + "Cost"].times(10).log10() - player.money.log10()
		let d = b * b - 4 * a * c
		if (d < 0) break
		let toBuy = Math.min(Math.floor(( -b + Math.sqrt(d)) / (2 * a)) + 1, bulk - bought)
		if (toBuy < 1) break
		let newCost = player[name + "Cost"].times(Decimal.pow(player.costMultipliers[tier - 1], toBuy - 1).times(Decimal.pow(mi, (toBuy - 1) * (toBuy - 2) / 2)))
		let newMult = player.costMultipliers[tier - 1].times(Decimal.pow(mi, toBuy - 1))
		if (!inQC(1)) {
			if (player.money.gte(newCost)) player.money = player.money.sub(newCost)
			else if (player.dimensionMultDecrease > 3) player.money = new Decimal(0)
		}
		player[name + "Amount"] = player[name + "Amount"].add(toBuy * 10)
		recordBought(name, toBuy * 10)
		player[name + "Cost"] = newCost.times(newMult)
		player.costMultipliers[tier - 1] = newMult.times(mi)
		bought += toBuy
		reduceMatter(toBuy * 10)
	}

	let pow = getDimensionPowerMultiplier()
	if (!auto) floatText("D" + tier, "x" + shortenMoney(Decimal.pow(pow, bought)))
	onBuyDimension(tier)
}

function canQuickBuyDim(tier) {
	if (((inNC(5) || player.currentChallenge == "postc5") && player.tickspeedBoosts == undefined) || inNC(9)) return false
	return player.dimensionMultDecrease <= 3 || player.costMultipliers[tier-1].gt(Number.MAX_SAFE_INTEGER)
}

function getOrSubResource(tier, sub) {
	if (sub == undefined || inQC(1)) {
		if (tier > 2 && (inNC(10) || player.currentChallenge == "postc1")) return player[TIER_NAMES[tier-2] + "Amount"]
		return player.money
	} else {
		if (tier > 2 && (inNC(10) || player.currentChallenge == "postc1")) {
			if (sub.gt(player[TIER_NAMES[tier - 2] + "Amount"])) player[TIER_NAMES[tier - 2] + "Amount"] = new Decimal(0)
			else player[TIER_NAMES[tier - 2] + "Amount"] = player[TIER_NAMES[tier - 2] + "Amount"].sub(sub)
		} else if (sub.gt(player.money)) player.money = new Decimal(0)
		else player.money = player.money.sub(sub)
	}
}


function timeMult() {
	var mult = new Decimal(1)
	if (player.infinityUpgrades.includes("timeMult")) mult = mult.times(infUpg11Pow());
	if (player.infinityUpgrades.includes("timeMult2")) mult = mult.times(infUpg13Pow());
	if (player.achievements.includes("r76")) mult = mult.times(Math.pow(player.totalTimePlayed / (600 * 60 * 48), player.galacticSacrifice ? 0.1 : 0.05));
	return mult;
}

function infUpg11Pow() {
	let x = player.totalTimePlayed / 1200
	let exp = 0.15 
	if (player.galacticSacrifice !== undefined) {
		x = player.totalTimePlayed / 864e3
		exp = 0.75
	}
	if (tmp.ngC) exp *= Math.log10(player.money.plus(1).log10() + 1) * 3 + 1
	if (tmp.ez) x *= 10
	x = Math.max(x, 1)

	if (exp > 10) return Decimal.pow(x, exp).max(1)
	return Math.max(Math.pow(x, exp), 1)
}

function infUpg12Pow() {
	let toAdd = .1
	if (player.tickspeedBoosts !== undefined) toAdd = Math.min(Math.max(player.infinitied, 0), 45) * .01 + .05
	else if (player.galacticSacrifice !== undefined) toAdd = Math.min(Math.max(player.infinitied, 0), 60) * .0025 + .05
	if (tmp.ngC) toAdd *= Math.log10(player.money.plus(1).log10() + 1) + 1
	if (player.aarexModifications.newGameExpVersion) toAdd *= 2

	return toAdd + 1
}

function infUpg13Pow() {
	let x = player.thisInfinityTime / 2400
	let exp = 0.25 
	if (player.galacticSacrifice !== undefined) exp = 1.5
	if (tmp.ngC) {
		exp *= Math.sqrt(player.galaxies + 1) * 200
		x += 1
	}
	if (tmp.ez) x *= 10

	return Decimal.pow(x, exp).max(1)
}

function dimMults() {
	let exp = 1
	if (tmp.ngC) exp *= Decimal.log10(nA(getInfinitied(), 1)) + 1
	if (player.galacticSacrifice) exp *= 2
	if (hasTS(31)) exp *= 4
	return Decimal.pow(Decimal.times(getInfinitied(), 0.2).add(1), exp)
}

function getInfinitiedMult() {
	var add = player.galacticSacrifice ? 0 : 1
	var base = (player.galacticSacrifice ? 1 : 0) + Decimal.add(getInfinitied(), 1).log10() * (player.galacticSacrifice ? 100 : 10)
	var exp = (player.galacticSacrifice ? 2 : 1) * (hasTimeStudy(31) ? 4 : 1)
	if (player.aarexModifications.ngmX >= 4) {
		if ((player.currentChallenge == "postcngmm_1" || player.challenges.includes("postcngmm_1")) && !player.achievements.includes("r71")) exp += .2
		else exp *= 1 + Math.log10(getInfinitied() + 1) / 3
	}
	return add + Math.pow(base, exp)
}

function getDimensionProductionPerSecond(tier) {
	let ret = player[TIER_NAMES[tier] + 'Amount'].floor()
	if ((inNC(7) || player.currentChallenge == "postcngm3_3" || inQC(4)) && !player.galacticSacrifice) {
		if (tier == 4) ret = ret.pow(1.3)
		else if (tier == 2) ret = ret.pow(1.5)
	}
	ret = ret.times(getDimensionFinalMultiplier(tier))

	if ((tmp.ngC || tmp.ez) && tier == 1) ret = ret.times(3)
	if (tmp.ez && tier != 1) ret = ret.times(10)
	if (inNC(2) || player.currentChallenge == "postc1" || tmp.ngmR || tmp.ngmX >= 5) ret = ret.times(player.chall2Pow)
	if (tier == 1 && (inNC(3) || player.currentChallenge == "postc1")) ret = ret.times(player.chall3Pow)
	if (player.tickspeedBoosts != undefined) ret = ret.div(10)
	if (player.aarexModifications.ngmX > 3) ret = ret.div(10)
	if (tier == 1 && (inNC(7) || player.currentChallenge == "postcngm3_3" || inQC(4) || player.pSac !== undefined)) ret = ret.plus(getDimensionProductionPerSecond(2))

	let tick = dilates(Decimal.div(1e3, getTickspeed()), "tick")
	if (player.dilation.active && isNanoEffectUsed("dil_effect_exp")) tick = tick.pow(tmp.nf.effects.dil_effect_exp)
	ret = ret.times(tick)
	return ret
}
