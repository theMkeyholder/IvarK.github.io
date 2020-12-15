var quantumChallenges = {
	costs: [null, 16750, 19100, 21500,  24050,  25900,  28900, 31300, 33600, 0],
	goalLogs: [null, 6.65e9, 7.68e10, 4.525e10, 5.325e10, 1.344e10, 5.61e8, 6.254e10, 2.925e10, 8e16]
}

var assigned
var pcFocus = 0
function updateQuantumChallenges() {
	if (document.getElementById("qctabbtn").style == "none") return

	assigned = []
	var assignedNums = {}
	document.getElementById("bigrip").style.display = player.masterystudies.includes("d14") ? "" : "none"
	document.getElementById("autoCS").style.display = player.ghostify.automatorGhosts.ghosts >= 22 ? "" : "none"
	document.getElementById("pairedchallenges").style.display = player.masterystudies.includes("d9") ? "" : "none"
	document.getElementById("respecPC").style.display = player.masterystudies.includes("d9") ? "" : "none"
	for (var pc = 1; pc <= 4; pc++) {
		var subChalls = tmp.qu.pairedChallenges.order[pc]
		if (subChalls) for (var sc = 0; sc < 2; sc++) {
			var subChall = subChalls[sc]
			if (subChall) {
				assigned.push(subChall)
				assignedNums[subChall] = pc
			}
		}
		if (player.masterystudies.includes("d9")) {
			var property = "pc" + pc
			var sc1 = tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc][0] : 0
			var sc2 = (sc1 ? tmp.qu.pairedChallenges.order[pc].length > 1 : false) ? tmp.qu.pairedChallenges.order[pc][1] : 0
			document.getElementById(property+"desc").textContent = "Paired Challenge "+pc+": Both Quantum Challenge " + (sc1 ? sc1 : "?") + " and " + (sc2 ? sc2 : "?") + " are applied."
			document.getElementById(property+"cost").textContent = "Cost: " + (!sc2 && !player.achievements.includes("ng3p55") ? "???" : getFullExpansion(getQCCost(subChalls))) + " electrons"
			document.getElementById(property+"goal").textContent = "Goal: " + (sc2 ? shortenCosts(Decimal.pow(10, getQCGoalLog(subChalls))) : "???") + " antimatter"
			document.getElementById(property).textContent = pcFocus == pc ? "Cancel" : (tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc].length < 2 : true) ? "Assign" : tmp.qu.pairedChallenges.current == pc ? "Running" : tmp.qu.pairedChallenges.completed >= pc ? "Completed" : tmp.qu.pairedChallenges.completed + 1 < pc ? "Locked" : "Start"
			document.getElementById(property).className = pcFocus == pc || (tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc].length < 2 : true) ? "challengesbtn" : tmp.qu.pairedChallenges.completed >= pc ? "completedchallengesbtn" : tmp.qu.pairedChallenges.completed + 1 <pc ? "lockedchallengesbtn" : tmp.qu.pairedChallenges.current == pc ? "onchallengebtn" : "challengesbtn"

			var sc1t = Math.min(sc1, sc2)
			var sc2t = Math.max(sc1, sc2)
			if (player.masterystudies.includes("d14")) {
				document.getElementById(property + "br").style.display = ""
				document.getElementById(property + "br").textContent = sc1t != 6 || sc2t != 8 ? "QC6 & 8" : tmp.qu.bigRip.active ? "Big Ripped" : tmp.qu.pairedChallenges.completed + 1 < pc ? "Locked" : "Big Rip"
				document.getElementById(property + "br").className = sc1t != 6 || sc2t != 8 ? "lockedchallengesbtn" : tmp.qu.bigRip.active ? "onchallengebtn" : tmp.qu.pairedChallenges.completed + 1 < pc ? "lockedchallengesbtn" : "bigripbtn"
			} else document.getElementById(property + "br").style.display = "none"
		}
	}
	if (player.masterystudies.includes("d14")) {
		var max = getMaxBigRipUpgrades()
		document.getElementById("spaceShards").textContent = shortenDimensions(tmp.qu.bigRip.spaceShards)
		for (var u = 18; u <= 20; u++) document.getElementById("bigripupg" + u).parentElement.style.display = u > max ? "none" : ""
		for (var u = 1; u <= max; u++) {
			document.getElementById("bigripupg" + u).className = tmp.qu.bigRip.upgrades.includes(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : tmp.qu.bigRip.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
			document.getElementById("bigripupg" + u + "cost").textContent = shortenDimensions(new Decimal(bigRipUpgCosts[u]))
		}
	}
	for (var qc = 1; qc <= 9; qc++) {
		var property = "qc" + qc
		var unl = isQCUnlocked(qc)
		var done = QCIntensity(qc) >= 1
		document.getElementById(property + "div").style.display = unl ? "inline-block" : "none"
		if (!unl) continue

		document.getElementById(property).textContent = ((!assigned.includes(qc) && pcFocus) ? (done ? "Choose" : "Not completed") : inQC(qc) ? "Running" : done ? (assigned.includes(qc) ? "Assigned" : "Completed") : "Start") + (assigned.includes(qc) ? " (PC" + assignedNums[qc] + ")" : "")
		document.getElementById(property).className = (!assigned.includes(qc) && pcFocus) ? (done ? "challengesbtn" : "lockedchallengesbtn") : inQC(qc) ? "onchallengebtn" : done ? "completedchallengesbtn" : "challengesbtn"
		document.getElementById(property + "cost").textContent = "Cost: " + getFullExpansion(getQCCost([qc])) + " electrons"
		document.getElementById(property + "goal").textContent = "Goal: " + shortenCosts(Decimal.pow(10, getQCGoalLog([qc]))) + " antimatter"
	}
	updateQCDisplaysSpecifics()
}

function updateQCDisplaysSpecifics() {
	document.getElementById("qc2reward").textContent = Math.round(tmp.qcRewards[2] * 100 - 100)
	document.getElementById("qc7desc").textContent = "Dimension and Tickspeed cost multiplier increases are " + shorten(Number.MAX_VALUE) + "x. Multiplier per ten Dimensions and meta-Antimatter boost to Dimension Boosts are disabled."
	document.getElementById("qc7reward").textContent = (100 - tmp.qcRewards[7] * 100).toFixed(2)
	document.getElementById("qc8reward").textContent = tmp.qcRewards[8]
}

function teleportToQCs() {
	if (!tmp.quUnl) return
	showTab("challenges")
	showChallengesTab("quantumchallenges")
}

function isQCUnlocked(x) {
	if (x == 1) return player.masterystudies.includes("d8")
	if (x == 9) return GDs.unlocked()
	return QCIntensity(x - 1) >= 1
}

function inQC(num) {
	return tmp.inQCs.includes(num)
}

function inAnyQC() {
	return tmp.inQCs.length >= 1
}

function updateInQCs() {
	tmp.inQCs = [0]
	if (tmp.qu !== undefined && tmp.qu.challenge !== undefined) {
		data = tmp.qu.challenge
		if (typeof(data) == "number") data = [data]
		else if (data.length == 0) data = [0]
		tmp.inQCs = data
	}
}

function getQCGoalLog(QCs, bigRip) {
	if (player.masterystudies == undefined) return 0
	let mods = tmp.qu.qcsMods.current
	let mult = 1
	let c1 = 0
	let c2 = 0
	if (QCs == undefined) {
		let data = tmp.inQCs
		if (data[0]) c1 = data[0]
		if (data[1]) c2 = data[1]
	} else {
		c1 = QCs[0] || 0
		c2 = QCs[1] || 0
		if (bigRip != "ghp_gain") mods = qcm.on
	}
	let cs = [c1, c2]
	
	if (testHarderNGp3) if (cs.includes(0) && !cs.includes(6)) mult *= 1.5 
	/*
	Ok Ive been told that QCs are stupid easy once you unlock them 
	so im thinking we just multiply their goals (this is not tested at all)
	feel free to never uncomment this :) but i think it might be a good idea for balance
	*/
	if (!bigRip) {
		if (player.achievements.includes("ng3p96")) mult *= 0.95
		if (player.achievements.includes("ng3p107")) mult *= 0.8
		if (bu62.active("nf")) mult /= tmp.blu[62]
	}
	if (bigRip != "ghp_gain") {
		if (mods.includes("ms")) mult *= 6e3
		//if (mods.includes("tb")) mult *= 100
	}
	if (c1 == 0) return quantumChallenges.goalLogs[c2] * mult
	if (c2 == 0) return quantumChallenges.goalLogs[c1] * mult

	mult *= mult //for both challenges
	if (cs.includes(1) && cs.includes(3)) mult *= 1.6
	if (cs.includes(2) && cs.includes(6)) mult *= 1.7
	if (cs.includes(3) && cs.includes(7)) mult *= 2.68
	if (cs.includes(3) && cs.includes(6)) mult *= 3
	return quantumChallenges.goalLogs[c1] * quantumChallenges.goalLogs[c2] / 1e11 * mult
}

function onQCCompletion(qcs, am, time, dilTimes) {
	let intensity = qcs.length
	let qc1 = qcs[0]
	let qc2 = qcs[1]
	if (intensity == 2) {
		let qc1st = Math.min(qc1, qc2)
		let qc2st = Math.max(qc1, qc2)
		if (qc1st == qc2st) {
			console.warn("There is an issue, you have assigned a QC twice (QC" + qc1st + ")")
			intensity = 1
		} else {
			let pcid = qc1st * 10 + qc2st
			if (tmp.qu.pairedChallenges.current > tmp.qu.pairedChallenges.completed) {
				tmp.qu.challenges[qc1] = 2
				tmp.qu.challenges[qc2] = 2
				tmp.qu.electrons.mult += 0.5
				tmp.qu.pairedChallenges.completed = tmp.qu.pairedChallenges.current
				if (pcid == 68 && tmp.qu.pairedChallenges.current == 1 && am.e >= 1.65e9) giveAchievement("Back to Challenge One")
				if (tmp.qu.pairedChallenges.current == 4) giveAchievement("Twice in a row")
			}
			tmp.qu.pairedChallenges.completions[pcid] = Math.min(tmp.qu.pairedChallenges.current, tmp.qu.pairedChallenges.completions[pcid] || 4)
			if (dilTimes == 0) {
				if (tmp.qu.qcsNoDil["pc" + pcid] === undefined) tmp.qu.qcsNoDil["pc" + pcid] = tmp.qu.pairedChallenges.current
				else tmp.qu.qcsNoDil["pc" + pcid] = Math.min(tmp.qu.pairedChallenges.current,tmp.qu.qcsNoDil["pc" + pcid])
			}
			for (let m = 0; m < tmp.preQCMods.length; m++) recordModifiedQC("pc" + pcid, tmp.qu.pairedChallenges.current, tmp.preQCMods[m])
			if (tmp.qu.pairedChallenges.fastest[pcid] === undefined) tmp.qu.pairedChallenges.fastest[pcid] = time
			else tmp.qu.pairedChallenges.fastest[pcid] = tmp.qu.pairedChallenges.fastest[pcid] = Math.min(tmp.qu.pairedChallenges.fastest[pcid], time)
			if (tmp.preQCMods.length >= 3) giveAchievement("Brutally Challenging")
		}
	}
	if (intensity == 1) {
		if (!tmp.qu.challenges[qc1]) {
			tmp.qu.challenges[qc1] = 1
			tmp.qu.electrons.mult += 0.25
		}
		if (tmp.qu.challengeRecords[qc1] == undefined) tmp.qu.challengeRecords[qc1] = time
		else tmp.qu.challengeRecords[qc1] = Math.min(tmp.qu.challengeRecords[qc1], time)
		if (dilTimes == 0) tmp.qu.qcsNoDil["qc" + qc1] = 1
		for (let m = 0; m < tmp.preQCMods.length; m++) recordModifiedQC("qc" + qc1, 1, tmp.preQCMods[m])
	}
}

function QCIntensity(num) {
	if (tmp.ngp3 && tmp.qu !== undefined && tmp.qu.challenges !== undefined) return tmp.qu.challenges[num] || 0
	return 0
}

function updateQCTimes() {
	document.getElementById("qcsbtn").style.display = "none"
	if (!player.masterystudies) return
	var temp = 0
	var tempcounter = 0
	for (var i = 1; i < 9; i++) {
		setAndMaybeShow("qctime" + i, tmp.qu.challengeRecords[i], '"Quantum Challenge ' + i + ' time record: "+timeDisplayShort(tmp.qu.challengeRecords[' + i + '], false, 3)')
		if (tmp.qu.challengeRecords[i]) {
			temp+=tmp.qu.challengeRecords[i]
			tempcounter++
		}
	}
	if (tempcounter > 0) document.getElementById("qcsbtn").style.display = "inline-block"
	setAndMaybeShow("qctimesum", tempcounter > 1, '"The sum of your completed Quantum Challenge time records is "+timeDisplayShort(' + temp + ', false, 3)')
}

function respecPCs() {
	let data = tmp.qu.pairedChallenges
	tmp.qu.electrons.mult -= tmp.qu.pairedChallenges.completed * 0.5

	data.order = {}
	data.completed = 0
	data.respec = false
	for (qc = 1; qc <= 9; qc++) if (QCIntensity(qc)) tmp.qu.challenges[qc] = 1

	document.getElementById("respecPC").className = "storebtn"
}

var ranking = 0
function updatePCCompletions() {
	var shownormal = false
	document.getElementById("pccompletionsbtn").style.display = "none"
	if (!tmp.ngp3) return

	var r = 0
	tmp.pcc = {} // PC Completion counters
	for (var c1 = 2; c1 <= 9; c1++) for (var c2 = 1; c2 < c1; c2++) {
		var rankingPart = 0
		if (tmp.qu.pairedChallenges.completions[c2 * 10 + c1]) {
			rankingPart = 5 - tmp.qu.pairedChallenges.completions[c2 * 10 + c1]
			tmp.pcc.normal = (tmp.pcc.normal || 0) + 1
			if (c1 == 9) tmp.pcc.c9 = (tmp.pcc.c9 || 0) + 1
		} else if (c2 * 10 + c1 == 68 && ghostified) {
			rankingPart = 0.5
			tmp.pcc.normal = (tmp.pcc.normal || 0) + 1
		}
		if (tmp.qu.qcsNoDil["pc" + (c2 * 10 + c1)]) {
			rankingPart += 5 - tmp.qu.qcsNoDil["pc" + ( c2 * 10 + c1)]
			tmp.pcc.noDil = (tmp.pcc.noDil || 0) + 1
		}
		for (var m = 0; m < qcm.modifiers.length; m++) {
			var id = qcm.modifiers[m]
			var data = tmp.qu.qcsMods[id]
			if (data && data["pc" + (c2 * 10 + c1)]) {
				rankingPart += 5 - data["pc" + (c2 * 10 + c1)]
				tmp.pcc[id] = (tmp.pcc[id] || 0) + 1
				shownormal = true
			}
		}
		r += Math.sqrt(rankingPart)
	}
	r *= 100 / 56

	tmp.pce = {} // PC Completion effects
	for (var m = 0; m < qcm.modifiers.length; m++) {
		let mod = qcm.modifiers[m]
		if (tmp.pcc[mod] && qcm.rewards[mod]) tmp.pce[mod] = qcm.rewards[mod].eff(tmp.pcc[mod])
	}

	if (r) document.getElementById("pccompletionsbtn").style.display = "inline-block"
	document.getElementById("pccranking").textContent = r.toFixed(1)
	document.getElementById("pccrankingMax").textContent = (Math.sqrt(4 * (2 + qcm.modifiers.length)) * 36 * 100 / 56).toFixed(1)
	updatePCTable()
	for (var m = 0; m < qcm.modifiers.length; m++) {
		var id = qcm.modifiers[m]
		var shownormal = tmp.qu.qcsMods[id] !== undefined || shownormal
		document.getElementById("qcms_" + id).style.display = tmp.qu.qcsMods[id] !== undefined ? "" : "none"
	}
	document.getElementById("qcms_normal").style.display = shownormal ? "" : "none"
	if (r >= 75) {
		document.getElementById("modifiersdiv").style.display = ""
		for (var m = 0; m < qcm.modifiers.length; m++) {
			var id = qcm.modifiers[m]
			if (r >= qcm.reqs[id] || !qcm.reqs[id]) {
				document.getElementById("qcm_" + id).className = qcm.on.includes(id) ? "chosenbtn" : "storebtn"
				document.getElementById("qcm_" + id).setAttribute('ach-tooltip', (qcm.descs[id] || "???") + (tmp.pce[id] ? " (PC Reward: " + qcm.rewards[id].desc(tmp.pce[id]) + ")" : ""))
			} else {
				document.getElementById("qcm_" + id).className = "unavailablebtn"
				document.getElementById("qcm_" + id).setAttribute('ach-tooltip', 'Get ' + qcm.reqs[id] + ' Paired Challenges ranking to unlock this modifier. Ranking: ' + ranking.toFixed(1))
			}
		}
	} else document.getElementById("modifiersdiv").style.display = "none"
	
	ranking = r // its global
}

let qcRewards = {
	effects: {
		1: function(comps) {
			if (comps == 0) return 1
			let base = getDimensionFinalMultiplier(1).times(getDimensionFinalMultiplier(2)).max(1).log10()
			let exp = 0.225 + comps * .025
			return Decimal.pow(10, Math.pow(base, exp) / 200)
		},
		2: function(comps) {
			if (comps == 0) return 1
			let exp = tmp.newNGP3E ? 1.25 : 1
			return Math.pow(1.2 + comps * 0.2, exp)
		},
		3: function(comps) {
			if (comps == 0) return 1
			let ipow = player.infinityPower.plus(1).log10()
			let exp = 0.5
			if (tmp.newNGP3E) exp += Math.sqrt(exp) / 10
			
			let log = Math.pow(ipow / 2e8, exp) 
			if (comps >= 2) log += Math.pow(ipow / 1e9, 4/9 + comps / 9)
			
			log = softcap(log, "qc3reward")
			return Decimal.pow(10, log)
		},
		4: function(comps) {
			if (comps == 0) return 1
			let mult = player.meta[2].amount.times(player.meta[4].amount).times(player.meta[6].amount).times(player.meta[8].amount).max(1)
			if (comps <= 1) return Decimal.pow(10 * comps, Math.sqrt(mult.log10()) / 10)
			return mult.pow(comps / 150)
		},
		5: function(comps) {
			if (comps == 0) return 0
			return Math.log10(1 + player.resets) * comps
		},
		6: function(comps) {
			if (comps == 0) return 1
			let exp = comps * 2 - 1
			return player.achPow.pow(exp)
		},
		7: function(comps) {
			if (comps == 0) return 1
			return Math.pow(0.975, comps)
		},
		8: function(comps) {
			if (comps == 0) return 1
			return comps + 2
		},
		9: function(comps) {
			let compEff = Math.sqrt(
				(((tmp.pcc && tmp.pcc.c9) || 0) + 1) *
				comps
			)
			let x = player.replicanti.amount.log10()
			return {
				ri: Math.sqrt(x / 1e7) * compEff,
				ge: Math.sqrt(x / 1e10) * compEff
			}
		}
	}
}

function isQCRewardActive(x) {
	return tmp.qcRewards && tmp.qcRewards[x] && player.masterystudies.includes("d8") && QCIntensity(x)
}

function updateQCRewardsTemp() {
	tmp.qcRewards = {}
	if (!tmp.quUnl) return
	for (var c = 1; c <= 9; c++) tmp.qcRewards[c] = qcRewards.effects[c](QCIntensity(c))
}

function getQCCost(QCs) {
	if (player.achievements.includes("ng3p55")) return 0

	let x = quantumChallenges.costs[QCs[0]]
	if (QCs[1]) x += quantumChallenges.costs[QCs[1]]
	if (tmp.newNGP3E) return Math.floor(Math.pow(x, .999))
	return x
}

function showQCModifierStats(id) {
	tmp.pct = id
	updatePCTable()
}

function updatePCTable() {
	var data = tmp.qu.qcsMods[tmp.pct]
	for (r = 1; r <= 9; r++) for (c = 1; c <= 9; c++) {
		if (r != c) {
			var divid = "pc" + (r * 10 + c)
			var pcid = r * 10 + c
			if (r > c) pcid = c * 10 + r
			if (tmp.pct == "") {
				var comp = tmp.qu.pairedChallenges.completions[pcid]
				if (comp !== undefined) {
					document.getElementById(divid).textContent = "PC" + comp
					document.getElementById(divid).className = (tmp.qu.qcsNoDil["pc" + pcid] ? "nd" : "pc" + comp) + "completed"
					var achTooltip = 'Fastest time: ' + (tmp.qu.pairedChallenges.fastest[pcid] ? timeDisplayShort(tmp.qu.pairedChallenges.fastest[pcid]) : "N/A")
					if (tmp.qu.qcsNoDil["pc" + pcid]) achTooltip += ", No dilation: PC" + tmp.qu.qcsNoDil["pc" + pcid]
					document.getElementById(divid).setAttribute('ach-tooltip', achTooltip)
					if (divid=="pc38") giveAchievement("Hardly marked")
					if (divid=="pc68") giveAchievement("Big Rip isn't enough")
				} else if (pcid == 68 && ph.did("ghostify")) {
					document.getElementById(divid).textContent = "BR"
					document.getElementById(divid).className = "brCompleted"
					document.getElementById(divid).removeAttribute('ach-tooltip')
					document.getElementById(divid).setAttribute('ach-tooltip', 'Fastest time from start of Ghostify: ' + timeDisplayShort(player.ghostify.best))
				} else {
					document.getElementById(divid).textContent = ""
					document.getElementById(divid).className = ""
					document.getElementById(divid).removeAttribute('ach-tooltip')
				}
			} else if (data&&data["pc" + pcid]) {
				var comp = data["pc" + pcid]
				document.getElementById(divid).textContent = "PC" + comp
				document.getElementById(divid).className = "pc" + comp + "completed"
				document.getElementById(divid).removeAttribute('ach-tooltip')
			} else {
				document.getElementById(divid).textContent = ""
				document.getElementById(divid).className = ""
				document.getElementById(divid).removeAttribute('ach-tooltip')
			}
		} else { // r == c
			var divid = "qcC" + r
			if ((tmp.pct == "" && QCIntensity(r)) || (data && data["qc" + r])) {
				document.getElementById(divid).textContent = "QC"+r
				if (tmp.qu.qcsNoDil["qc" + r] && tmp.pct == "") {
					document.getElementById(divid).className = "ndcompleted"
					document.getElementById(divid).setAttribute('ach-tooltip', "No dilation achieved!")
				} else {
					document.getElementById(divid).className = "pc1completed"
					document.getElementById(divid).removeAttribute('ach-tooltip')
				}
			} else {
				document.getElementById(divid).textContent = ""
				document.getElementById(divid).className = ""
				document.getElementById(divid).removeAttribute('ach-tooltip')
			}
		}
	}
	updateBestPC68Display()
	document.getElementById("upcc").textContent = (qcm.names[tmp.pct] || "Unique PC completions") + ": " + (tmp.pcc[tmp.pct || "normal"] || 0) + " / 36"
	document.getElementById("udcc").textContent = tmp.pct == "" ?  "No dilation: " + (tmp.pcc.noDil || 0) + " / 36" : ""
	document.getElementById("pcEff").textContent = tmp.pce[tmp.pct] ? "Effect: " + qcm.rewards[tmp.pct].desc(tmp.pce[tmp.pct]) : ""
}

function updateBestPC68Display() {
	document.getElementById("bpc68").textContent = tmp.pct == "" ? "Best PC w/ QC6 & 8: " + shortenMoney(tmp.qu.pairedChallenges.pc68best) : ""
}

var qcm = {
	modifiers: ["ad", "sm", "ms"],
	names: {
		ad: "Anti-Dilation",
		sm: "Supermastery",
		ms: "Macroscopic",
		//tb: "Time Barrier"
	},
	reqs: {
		ad: 100,
		sm: 165,
		ms: 200,
		//tb: 220
	},
	descs: {
		ad: "You always have no Tachyon particles. You can dilate time, but you can't gain Tachyon particles.",
		sm: "You can't have normal Time Studies, and can't have more than 20 normal Mastery Studies.",
		ms: "All Quantum features are disabled except Speedrun Milestones. Also, all QC goals are raised to the power of 6,000. Good luck! :)",
		//tb: "All Eternity features are disabled. All QC goals are raised to the power of 100. >:)"
	},
	rewards: {
		ms: {
			eff(x) {
				return {
					eds: Math.pow(x / 300 + 1, 2),
					ol: 1 - x / 36, 
					ap: Math.sqrt(player.ghostify.hb.higgs * x / 20),
				}
			},
			desc(x) {
				return "Boost all Emperor Dimensions by " + (x.eds * 100 - 100).toFixed(2) + "% per 8th Emperor Dimension, reduce the logarithmic softcap of orange Light effect by " + (100 - 100 * x.ol).toFixed(1) + "%, and Higgs Bosons make Anti-Preonitus wakes up " + x.ap.toFixed(1) + " later."
			}
		},
		/*
		tb: {
			eff(x) {
				return Math.pow(tmp.pcc.tb / 15 + 1, 2)
			},
			desc(x) {
				return "Strengthen Infinite Time reward by " + (x * 100 - 100).toFixed(2) + "%."
			}
		}
		*/
	},
	on: []
}

function toggleQCModifier(id) {
	if (!(ranking >= qcm.reqs[id]) && qcm.reqs[id]) return
	if (qcm.on.includes(id)) {
		let data = []
		for (var m = 0; m < qcm.on.length; m++) if (qcm.on[m] != id) data.push(qcm.on[m])
		qcm.on = data
	} else qcm.on.push(id)
	document.getElementById("qcm_" + id).className = qcm.on.includes(id) ? "chosenbtn" : "storebtn"
	updateQuantumChallenges()
}

function inQCModifier(id) {
	if (!tmp.quUnl) return
	return tmp.qu.qcsMods.current.includes(id)
}

function recordModifiedQC(id, num, mod) {
	var data = tmp.qu.qcsMods[mod]
	if (data === undefined) {
		data = {}
		tmp.qu.qcsMods[mod] = data
	}
	data[id] = Math.min(num, data[id] || 4)
}
