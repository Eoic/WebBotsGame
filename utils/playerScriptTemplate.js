const scriptTemplate = 
`/* Called once per frame */
function update() {
    
}

/* Called once bullet hits enemy player */
function onBulletHit(event) {
    
}

/* 
    Called when bullet flies outside map bounds 
    without hitting anything
*/
function onBulletMiss() {

}

/*
    Called on collision with map border
*/
function onWallHit(event) {

}

/*
    Called during collision with enemy robot
*/
function onRobotHit(event) {

}

module.exports = {
    update,
    onBulletHit,
    onBulletMiss,
    onWallHit,
    onRobotHit
}
`

module.exports = scriptTemplate