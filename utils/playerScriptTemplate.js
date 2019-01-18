const scriptTemplate = 
`/* 
    Called once per frame 
*/
function update() {
    
}

/* 
    Called once robot has been hit by enemy player
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

function onHitSuccess(event) {

}

module.exports = {
    update,
    onBulletHit,
    onBulletMiss,
    onWallHit,
    onHitSuccess
}
`

module.exports = scriptTemplate