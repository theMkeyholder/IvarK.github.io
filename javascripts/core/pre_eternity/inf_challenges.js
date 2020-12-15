// INFINITY AND NORMAL CHALLENGES

function startChallenge(name) {
	if (name == "postc3" && isIC3Trapped()) return
	if (name == "challenge7" && inQC(4)) return
	if ((name == "postc2" || name == "postc6" || name == "postc7" || name == "postc8") && inQC(6)) return
	if (name.includes("post")) {
		if (player.postChallUnlocked < checkICID(name)) return
		var target = getGoal(name)
	} else var target = new Decimal(Number.MAX_VALUE)
	if (player.options.challConf && name != "") if (!confirm("You will start over with just your Infinity upgrades, and achievements. You need to reach " + (name.includes("post") ? "a set goal" : "infinity") + " with special conditions. The 4th Infinity upgrade column doesn't work on challenges.")) return
	if (player.tickspeedBoosts != undefined) player.tickspeedBoosts = 0
	if (name == "postc1" && player.currentEternityChall != "" && inQC(4) && inQC(6)) giveAchievement("The Ultimate Challenge")
	
	doNormalChallengeResetStuff()
	player.currentChallenge = name
	player.challengeTarget = target
	NC10NDCostsOnReset()
	
	player.tdBoosts = resetTDBoosts()
	resetPSac()
	resetTDsOnNGM4()
	reduceDimCosts()
	if (player.currentChallenge == "postc1") player.costMultipliers = [new Decimal(1e3), new Decimal(5e3), new Decimal(1e4), new Decimal(1.2e4), new Decimal(1.8e4), new Decimal(2.6e4), new Decimal(3.2e4), new Decimal(4.2e4)];
	if (player.currentChallenge == "postc2") {
		player.eightAmount = new Decimal(1);
		player.eightBought = 1;
		player.resets = 4;
	}
	updateNCVisuals()
	
	if (player.infinityUpgradesRespecced != undefined) {
		player.singularity.darkMatter = new Decimal(0)
		player.dimtechs.discounts = 0
	}
	updateSingularity()
	updateDimTechs()
	
	if (player.replicanti.unl) player.replicanti.amount = new Decimal(1)
	if (!tmp.ngC) player.replicanti.galaxies = 0

	// even if we're in a challenge, apparently if it's challenge 2 we might have four resets anyway.
	setInitialResetPower();

	GPminpeak = new Decimal(0)
	IPminpeak = new Decimal(0)
	if (player.currentChallenge.includes("post")) {
		player.break = true
		document.getElementById("break").innerHTML = "FIX INFINITY"
	}
	if (player.achievements.includes("r36")) player.tickspeed = player.tickspeed.times(0.98);
	if (player.achievements.includes("r45")) player.tickspeed = player.tickspeed.times(0.98);
	if (player.achievements.includes("r66")) player.tickspeed = player.tickspeed.times(0.98);
	if (player.achievements.includes("r83")) player.tickspeed = player.tickspeed.times(Decimal.pow(0.95, player.galaxies));

	showTab('dimensions')
	updateChallenges()
	setInitialMoney()

	resetInfDimensions();
	hideDimensions()
	tmp.tickUpdate = true;

	skipResets()
	if (player.currentChallenge.includes("post") && player.currentEternityChall !== "") giveAchievement("I wish I had gotten 7 eternities")
	Marathon2 = 0;
}

function startNormalChallenge(x) {
	if (x == 7) {
		if (player.infinitied < 1 && player.eternities < 1 && !quantumed) return
		startChallenge("challenge7", Number.MAX_VALUE)
	}
	if (player.aarexModifications.ngmX > 3) galacticSacrifice(false, true, x)
	else startChallenge("challenge" + x, Number.MAX_VALUE)
}

function inNC(x, n) {
	if (x == 6) {
		if (n == 1 && player.aarexModifications.ngexV && (player.currentChallenge == "" || player.currentChallenge.indexOf("postc") == 0) && player.currentChallenge != "postc1") return true
		if (n == 1 && player.aarexModifications.ngexV && player.currentChallenge == "challenge6") return false
		if (n == 2 && !player.aarexModifications.ngexV) return false
	}
	if (x == 0) return player.currentChallenge == "" && (!(player.aarexModifications.ngmX > 3) || !player.galacticSacrifice.chall) && inPxC(0)
	return player.currentChallenge == "challenge" + x || (player.aarexModifications.ngmX > 3 && player.galacticSacrifice.chall == x) || inPxC(x)
}

function getTotalNormalChallenges() {
	let x = 11
	if (player.galacticSacrifice) x += 2
	else if (player.infinityUpgradesRespecced) x++
	if (player.tickspeedBoosts != undefined) x++
	if (player.aarexModifications.ngmX > 3) x++
	return x
}

function updateNCVisuals() {
	var chall = player.currentChallenge

	if (inNC(2) || chall == "postc1" || tmp.ngmR || tmp.ngmX >= 5) document.getElementById("chall2Pow").style.display = "inline-block"
	else document.getElementById("chall2Pow").style.display = "none"

	if (inNC(3) || chall == "postc1") document.getElementById("chall3Pow").style.display = "inline-block"
	else document.getElementById("chall3Pow").style.display = "none"

	if (inMatterChallenge()) document.getElementById("matter").style.display = "block"
	else document.getElementById("matter").style.display = "none"

	if (isADSCRunning()) document.getElementById("chall13Mult").style.display = "block"
	else document.getElementById("chall13Mult").style.display = "none"

	if (inNC(14) && player.aarexModifications.ngmX > 3) document.getElementById("c14Resets").style.display = "block"
	else document.getElementById("c14Resets").style.display = "none"

	if (inNC(6, 2) || inNC(9) || inNC(12) || ((inNC(5) || inNC(14) || chall == "postc4" || chall == "postc5") && player.tickspeedBoosts == undefined) || player.pSac || chall == "postc1" || chall == "postc6" || chall == "postc8") document.getElementById("quickReset").style.display = "inline-block"
	else document.getElementById("quickReset").style.display = "none"
}

function inMatterChallenge() {
	return inNC(12) || player.currentChallenge == "postc1" || player.currentChallenge == "postc6" || inQC(6) || player.pSac !== undefined || pl.on()
}

var worstChallengeTime = 1
var worstChallengeBonus = 1
function updateWorstChallengeTime() {
	worstChallengeTime = 1
	for (var i = 0; i < getTotalNormalChallenges(); i++) worstChallengeTime = Math.max(worstChallengeTime, player.challengeTimes[i])
}

function updateWorstChallengeBonus() {
	updateWorstChallengeTime()
	var exp = player.galacticSacrifice ? 2 : 1
	var timeeff = Math.max(33e-6, worstChallengeTime * 0.1)
	var base = player.aarexModifications.ngmX >= 4 ? 3e4 : 3e3
	var eff = Decimal.max(Math.pow(base / timeeff, exp), 1)
	if (player.aarexModifications.ngmX >= 4) eff = eff.times(Decimal.pow(eff.plus(10).log10(), 5)) 
	worstChallengeBonus = eff
}

function updateChallenges() {
	var buttons = Array.from(document.getElementById("normalchallenges").getElementsByTagName("button")).concat(Array.from(document.getElementById("breakchallenges").getElementsByTagName("button")))
	for (var i=0; i < buttons.length; i++) {
		buttons[i].className = "challengesbtn";
		buttons[i].textContent = "Start"
	}

	tmp.cp = 0
	for (var i=0; i < player.challenges.length; i++) {
		document.getElementById(player.challenges[i]).className = "completedchallengesbtn";
		document.getElementById(player.challenges[i]).textContent = "Completed"
		if (player.challenges[i].search("postc") == 0) tmp.cp++
	}

	let running = []
	if (player.currentChallenge === "") {
		if (!player.challenges.includes("challenge1")) running.push("challenge1")
	} else running.push(player.currentChallenge)
	if (tmp.ngmX >= 4) {
		var chall = player.galacticSacrifice.chall
		if (chall) running.push(chall)
	}
	for (var i = 0; i < running.length; i++) {
		var chall = running[i]
		document.getElementById(chall).className = "onchallengebtn";
		document.getElementById(chall).textContent = "Running"
	}

	document.getElementById("challenge7").parentElement.parentElement.style.display = player.infinitied < 1 && player.eternities < 1 && !ph.did("quantum") ? "none" : ""
	if (inQC(4)) {
		document.getElementById("challenge7").className = "onchallengebtn";
		document.getElementById("challenge7").textContent = "Trapped in"
	}

	if (inQC(6)) for (i=2;i<9;i++) if (i<3||i>5) {
		document.getElementById("postc"+i).className = "onchallengebtn";
		document.getElementById("postc"+i).textContent = "Trapped in"
	}

	if (isIC3Trapped()) {
		document.getElementById("postc3").className = "onchallengebtn";
		document.getElementById("postc3").textContent = "Trapped in"
	}

	if (player.postChallUnlocked > 0 || Object.keys(player.eternityChalls).length > 0 || player.eternityChallUnlocked !== 0) document.getElementById("challTabButtons").style.display = "table"
	for (c = 0; c < order.length; c++) document.getElementById(order[c]).parentElement.parentElement.style.display = player.postChallUnlocked >= c+1 ? "" : "none"

	resetIC1Reward()
}

function getNextAt(chall) {
	let ret = nextAt[chall]
	if (player.galacticSacrifice) {
		let retMod = nextAt[chall+"_ngmm"]
		if (retMod) ret = retMod
	}
	if (player.tickspeedBoosts != undefined) {
		let retMod = nextAt[chall+"_ngm3"]
		if (retMod) ret = retMod
	}
	if (player.aarexModifications.ngmX >= 4){
		let retMod = nextAt[chall+"_ngm4"]
		if (retMod) ret = retMod
	}
	if (tmp.ngC) {
		let retMod = nextAt[chall+"_ngC"]
		if (retMod) ret = retMod
	}
	return ret
}

function getGoal(chall) {
	let ret = goals[chall]
	if (player.galacticSacrifice) {
		let retMod = goals[chall+"_ngmm"]
		if (retMod) ret = retMod
	}
	if (player.tickspeedBoosts != undefined) {
		let retMod = goals[chall+"_ngm3"]
		if (retMod) ret = retMod
	}
	if (player.aarexModifications.ngmX >= 4){
		let retMod = goals[chall+"_ngm4"]
		if (retMod) ret = retMod
	}
	if (tmp.ngC) {
		let retMod = goals[chall+"_ngC"]
		if (retMod) ret = retMod
	}
	return ret
}

function checkICID(name) {
	if (player.galacticSacrifice) {
		var split = name.split("postcngm3_")
		if (split[1] != undefined) return parseInt(split[1]) + 2

		var split = name.split("postcngmm_")
		if (split[1] != undefined) {
			var num = parseInt(split[1])
			if (player.tickspeedBoosts != undefined && num > 2) return 5
			return num
		}

		var split = name.split("postcngc_")
		if (split[1] != undefined) {
			var num = parseInt(split[1])
			var offset = player.tickspeedBoosts != undefined ? 13 : player.galacticSacrifice !== undefined ? 11 : 8
			return num + offset
		}

		var split=name.split("postc")
		if (split[1] != undefined) {
			var num = parseInt(split[1])
			var offset = player.tickspeedBoosts == undefined ? 3 : 5
			if (num > 2) offset--
			return num + offset
		}
	} else {
		var split = name.split("postc")
		if (split[1] != undefined) return parseInt(split[1])
	}
}

function resetIC1Reward() {
	infDimPow = 1
	if (!player.challenges.includes("postc1")) return

	let ics = 0
	for (var i = 0; i < player.challenges.length; i++) if (player.challenges[i].split("postc")[1]) ics++
	infDimPow = Math.pow(tmp.ngmX >= 2 ? 2 : 1.3, ics)
}

var challNames = [null, null, "Second Dimension Autobuyer Challenge", "Third Dimension Autobuyer Challenge", "Fourth Dimension Autobuyer Challenge", "Fifth Dimension Autobuyer Challenge", "Sixth Dimension Autobuyer Challenge", "Seventh Dimension Autobuyer Challenge", "Eighth Dimension Autobuyer Challenge", "Tickspeed Autobuyer Challenge", "Automated Dimension Boosts Challenge", "Automated Galaxies Challenge", "Automated Big Crunches Challenge", "Automated Dimensional Sacrifice Challenge", "Automated Galactic Sacrifice Challenge", "Automated Tickspeed Boosts Challenge", "Automated Time Dimension Boosts Challenge"]
var challOrder = [null, 1, 2, 3, 8, 6, 10, 9, 11, 5, 4, 12, 7, 13, 14, 15, 16]
function updateChallengeTimes() {
	for (c=2;c<17;c++) setAndMaybeShow("challengetime"+c,player.challengeTimes[challOrder[c]-2]<600*60*24*31,'"'+challNames[c]+' time record: "+timeDisplayShort(player.challengeTimes['+(challOrder[c]-2)+'], false, 3)')
	var temp=0
	var tempcounter=0
	for (var i=0;i<player.challengeTimes.length;i++) if (player.challenges.includes("challenge"+(i+2))&&player.challengeTimes[i]<600*60*24*31) {
		temp+=player.challengeTimes[i]
		tempcounter++
	}
	setAndMaybeShow("challengetimesum",tempcounter>1,'"Sum of completed challenge time records is "+timeDisplayShort('+temp+', false, 3)')
	document.getElementById("challengetimesbtn").style.display = tempcounter>0 ? "inline-block" : "none"

	var temp=0
	var tempcounter=0
	for (var i=0;i<14;i++) {
		setAndMaybeShow("infchallengetime"+(i+1),player.infchallengeTimes[i]<600*60*24*31,'"Infinity Challenge '+(i+1)+' time record: "+timeDisplayShort(player.infchallengeTimes['+i+'], false, 3)')
		if (player.infchallengeTimes[i]<600*60*24*31) {
			temp+=player.infchallengeTimes[i]
			tempcounter++
		}
	}
	setAndMaybeShow("infchallengetimesum",tempcounter>1,'"Sum of completed infinity challenge time records is "+timeDisplayShort('+temp+', false, 3)')
	document.getElementById("infchallengesbtn").style.display = tempcounter>0 ? "inline-block" : "none"
	updateWorstChallengeBonus();
}

function loadICData(){
        nextAt = {      postc1: new Decimal("1e2000"), postc1_ngmm: new Decimal("1e3000"), postc1_ngm3:new Decimal("1e3760"), postc1_ngm4:new Decimal("1e4350"), postc1_ngC: new Decimal("1e5555"),
			postc2:new Decimal("1e5000"), postc2_ngC:new Decimal("1e5860"),
			postc3:new Decimal("1e12000"), postc3_ngC:new Decimal("1e7175"),
			postc4:new Decimal("1e14000"), postc4_ngC:new Decimal("1e8475"),
			postc5:new Decimal("1e18000"), postc5_ngm3:new Decimal("1e21500"), postc5_ngC:new Decimal("1e21000"),
		        postc6:new Decimal("1e20000"), postc6_ngm3:new Decimal("1e23000"), postc6_ngC:new Decimal("1e21000"),
			postc7:new Decimal("1e23000"), postc7_ngm3:new Decimal("1e25500"), postc7_ngC:new Decimal("1e32000"),
			postc8:new Decimal("1e28000"), postc8_ngm3:new Decimal("1e39000"), postc8_ngC:new Decimal("1e37500"),
			postcngmm_1:new Decimal("1e750"), postcngmm_1_ngm3:new Decimal("1e1080"),
			postcngmm_2:new Decimal("1e1350"),
			postcngmm_3:new Decimal("1e2000"), postcngmm_3_ngm3:new Decimal("1e2650"),
			postcngm3_1:new Decimal("1e1560"),
			postcngm3_2:new Decimal("1e2085"),
			postcngm3_3:new Decimal("1e8421"),
			postcngm3_4:new Decimal("1e17000"),
			postcngc_1:new Decimal("1e38000"),
			postcngc_2:new Decimal("1e42250"),
		}
	goals = {       postc1: new Decimal("1e850"), postc1_ngmm: new Decimal("1e650"), postc1_ngm3:new Decimal("1e375"), postc1_ngm4:new Decimal("1e575"),
			postc2:new Decimal("1e10500"), postc2_ngm3:new Decimal("1e4250"), postc2_ngm4:new Decimal("1e4675"), postc2_ngC:new Decimal("1e5850"),
			postc3:new Decimal("1e5000"), postc3_ngC:new Decimal("1e2675"), 
			postc4:new Decimal("1e13000"), postc4_ngm3:new Decimal("1e4210"), postc4_ngC:new Decimal("1e5750"),
			postc5:new Decimal("1e11111"), postc5_ngm3:new Decimal("7.77e7777"), postc5_ngC:new Decimal("1e2400"),
			postc6:new Decimal("2e22222"), postc6_ngC:new Decimal("2.1e21111"),
			postc7:new Decimal("1e10000"), postc7_ngmm:new Decimal("1e15000"), postc7_ngm3:new Decimal("1e5100"), postc7_ngC:new Decimal("1e4300"),
			postc8:new Decimal("1e27000"), postc8_ngm3:new Decimal("1e35000"), 
			postcngmm_1:new Decimal("1e550"), postcngmm_1_ngm3:new Decimal("1e650"), postcngmm_1_ngm4:new Decimal("1e950"),
			postcngmm_2:new Decimal("1e950"), postcngmm_2_ngm3:new Decimal("1e1090"), postcngmm_2_ngm4:new Decimal("1e1200"),
			postcngmm_3:new Decimal("1e1200"), postcngmm_3_ngm3:new Decimal("1e1230"), postcngmm_3_ngm4:new Decimal("1e1425"),
        		postcngm3_1:new Decimal("1e550"), postcngm3_1_ngm4:new Decimal("1e1210"),
		        postcngm3_2:new Decimal("1e610"), postcngm3_2_ngm4:new Decimal("1e750"),
			postcngm3_3:new Decimal("8e888"), postcngm3_4:new Decimal("1e1500"),
			postcngm3_4:new Decimal("1e12345"),
			postcngc_1:new Decimal("1e10525"),					
                        postcngc_2:new Decimal("1e27225"),
		}
}