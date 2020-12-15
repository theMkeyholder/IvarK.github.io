function toggleChallengeRetry() {
	player.options.retryChallenge = !player.options.retryChallenge
	document.getElementById("retry").textContent = "Automatically retry challenges: O" + (player.options.retryChallenge ? "N" : "FF")
}

function togglePerformanceTicks() {
	player.aarexModifications.performanceTicks = ((player.aarexModifications.performanceTicks || 0) + 1) % 4
	updatePerformanceTicks()
}

function toggleLogRateChange() {
	player.aarexModifications.logRateChange=!player.aarexModifications.logRateChange
	document.getElementById("toggleLogRateChange").textContent = "Logarithm rate: O" + (player.aarexModifications.logRateChange ? "N" : "FF")
	dimDescEnd = (player.aarexModifications.logRateChange?" OoM":"%")+"/s)"
}

function toggleTabsSave() {
	player.aarexModifications.tabsSave.on =! player.aarexModifications.tabsSave.on
	document.getElementById("tabsSave").textContent = "Saved tabs: O" + (player.aarexModifications.tabsSave.on ? "N" : "FF")
}

function infMultAutoToggle() {
	if (getEternitied()<1) {
		if (canBuyIPMult()) {
			var toBuy = Math.max(Math.floor(player.infinityPoints.div(player.infMultCost).times(ipMultCostIncrease - 1).plus(1).log(ipMultCostIncrease)), 1)
			var toSpend = Decimal.pow(ipMultCostIncrease, toBuy).sub(1).div(ipMultCostIncrease - 1).times(player.infMultCost).round()
			if (toSpend.gt(player.infinityPoints)) player.infinityPoints = new Decimal(0)
			else player.infinityPoints = player.infinityPoints.sub(toSpend)
			player.infMult = player.infMult.times(Decimal.pow(getIPMultPower(), toBuy))
			player.infMultCost = player.infMultCost.times(Decimal.pow(ipMultCostIncrease,toBuy))
		}
	} else {
		player.infMultBuyer = !player.infMultBuyer
		document.getElementById("infmultbuyer").textContent = "Autobuy IP mult O"+(player.infMultBuyer?"N":"FF")
	}
}

function toggleEternityConf() {
	player.options.eternityconfirm = !player.options.eternityconfirm
	document.getElementById("eternityconf").textContent = "Eternity confirmation: O" + (player.options.eternityconfirm ? "N" : "FF")
}

function toggleDilaConf() {
	player.aarexModifications.dilationConf = !player.aarexModifications.dilationConf
	document.getElementById("dilationConfirmBtn").textContent = "Dilation confirmation: O" + (player.aarexModifications.dilationConf ? "N" : "FF")
}

function toggleOfflineProgress() {
	player.aarexModifications.offlineProgress = !player.aarexModifications.offlineProgress
	document.getElementById("offlineProgress").textContent = "Offline progress: O"+(player.aarexModifications.offlineProgress?"N":"FF")
}

function toggleAutoBuyers() {
	var bool = player.autobuyers[0].isOn
	for (var i = 0; i<player.autobuyers.length; i++) {
		if (player.autobuyers[i]%1 !== 0) {
			player.autobuyers[i].isOn = !bool
		}
	}
	player.autoSacrifice.isOn = !bool
	player.eternityBuyer.isOn = !bool
	if (tmp.ngp3) tmp.qu.autobuyer.enabled = !bool
	updateCheckBoxes()
	updateAutobuyers()
}

function toggleBulk() {
	if (player.options.bulkOn) {
		player.options.bulkOn = false
		document.getElementById("togglebulk").textContent = "Enable bulk buy"
	} else {
		player.options.bulkOn = true
		document.getElementById("togglebulk").textContent = "Disable bulk buy"
	}
}

function toggleHotkeys() {
	if (player.options.hotkeys) {
		player.options.hotkeys = false
		document.getElementById("hotkeys").textContent = "Enable hotkeys"
	} else {
		player.options.hotkeys = true
		document.getElementById("hotkeys").textContent = "Disable hotkeys"
	}
}

function respecToggle() {
	player.respec = !player.respec
	updateRespecButtons()
}

function toggleProductionTab() {
	// 0 == visible, 1 == not visible
	player.aarexModifications.hideProductionTab=!player.aarexModifications.hideProductionTab
	document.getElementById("hideProductionTab").textContent = (player.aarexModifications.hideProductionTab?"Show":"Hide")+" production tab"
	if (document.getElementById("production").style.display == "block") showDimTab("antimatterdimensions")
}

function toggleRepresentation() {
	// 0 == visible, 1 == not visible
	player.aarexModifications.hideRepresentation=!player.aarexModifications.hideRepresentation
	document.getElementById("hideRepresentation").textContent=(player.aarexModifications.hideRepresentation?"Show":"Hide")+" antimatter representation"
}

function toggleProgressBar() {
	player.aarexModifications.progressBar=!player.aarexModifications.progressBar
	document.getElementById("progressBarBtn").textContent = (player.aarexModifications.progressBar?"Hide":"Show")+" progress bar"	
}

function toggleReplAuto(i) {
	if (i == "chance") {
		if (player.replicanti.auto[0]) {
			player.replicanti.auto[0] = false
			document.getElementById("replauto1").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[0] = true
			document.getElementById("replauto1").textContent = "Auto: ON"
		}
	} else if (i == "interval") {
		if (player.replicanti.auto[1]) {
			player.replicanti.auto[1] = false
			document.getElementById("replauto2").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[1] = true
			document.getElementById("replauto2").textContent = "Auto: ON"
		}
	} else if (i == "galaxy") {
		if (player.replicanti.auto[2]) {
			player.replicanti.auto[2] = false
			document.getElementById("replauto3").textContent = "Auto: OFF"
		} else {
			player.replicanti.auto[2] = true
			document.getElementById("replauto3").textContent = "Auto: ON"
		}
	}
}
