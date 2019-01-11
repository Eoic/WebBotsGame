const scriptTemplate = 
`/* 
    Called once per frame 
*/
function update() {
    
}

/* 
    Called once robot is hit by enemy bullet 
*/
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
function onWallHit() {

}

/* 
    Called during collision with enemy robot
*/
function onCollision() {

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