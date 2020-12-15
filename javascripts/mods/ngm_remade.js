let ngmR = {
	setup() {
		tmp.ngmR = true
		player.aarexModifications.ngmR = 1

		resetNormalDimensionCostMults()
		resetTickspeed()
	},
	compile() {
		tmp.ngmR = player.aarexModifications.ngmR !== undefined
	},
	adjustCostScale(x) {
		let exp = 1.05
		if (player.galaxies > 0) exp = 1 + 1 / (player.galaxies * 10 + 20)

		return Math.pow(x, exp)
	}
}