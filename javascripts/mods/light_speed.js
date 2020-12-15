let LIGHT_SPEED = {
	mult(id) {
		let data = player.aarexModifications.ls
		return (data && data[id]) || 1
	},
	options: ["game", "rep", "nf", "tod", "bl"],
	reqs: {
		game() {
			return true
		},
		rep() {
			return player.replicanti.unl || ph.did("eternity")
		},
		nf() {
			return tmp.ngp3 && player.masterystudies.includes("d11")
		},
		tod() {
			return tmp.ngp3 && player.masterystudies.includes("d12")
		},
		gph() {
			return tmp.ngp3 && player.ghostify.ghostlyPhotons.unl
		},
		bl() {
			return tmp.ngp3 && player.ghostify.wzb.unl
		},
	},
	reset() {
		let shown = player.aarexModifications.ls !== undefined
		document.getElementById("lstabbtn").style.display = shown ? "" : "none"
		if (!shown) return

		for (var i = 0; i < ls.options.length; i++) ls.updateOption(ls.options[i])
	},
	updateOption(id) {
		let unl = ls.reqs[id]()
		document.getElementById("ls_" + id).parentElement.style.display = unl ? "" : "none"
		if (!unl) return

		let speed = ls.mult(id)
		document.getElementById("ls_" + id).value = Math.round(Math.log10(speed) * 10)
		document.getElementById("ls_" + id + "_text").textContent = speed.toFixed(2)
	},
	changeOption(id) {
		let speed = Math.pow(10, document.getElementById("ls_" + id).value / 10)
		document.getElementById("ls_" + id + "_text").textContent = speed.toFixed(2)
		if (speed == 1) delete player.aarexModifications.ls[id]
		else player.aarexModifications.ls[id] = speed
	}
}
let ls = LIGHT_SPEED