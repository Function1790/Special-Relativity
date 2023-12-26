const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const canvas2 = document.getElementById("canvas2")
const ctx2 = canvas2.getContext("2d")


const ResolutionValue = 1600 / 800
const HTML = {
    absoluteTime: document.getElementById('absoluteTime')
}


const LightSpeed = 30
const data = {
    imgSize: 200,
    movementValue: 0.1,
    Bvel0: 0.6 * LightSpeed,
    recordSize: 30
}

const print = (text) => console.log(text)

const imgObjects = []
for (var i = 0; i < 16; i++) {
    imgObjects.push(new Image())
    imgObjects[i].src = `./img/${i + 1}.png`
}

function getLorentzFactor(vel) {
    var pre = 1 - vel ** 2 / LightSpeed ** 2
    if (pre <= 0) {
        return 0
    }
    return 1 / Math.sqrt(pre)
}

function getLorentzBetween(p1, p2) {
    var v1 = Math.sqrt(p1.vel.getSizeSquare())
    var v2 = Math.sqrt(p2.vel.getSizeSquare())
    return getLorentzFactor(v1 - v2)
}

function getShrinkedLength(target, length) {
    var gamma = getLorentzBetween(target, Space)
    return length / gamma
}

//t = γ*t0
function countTime() {
    absoluteTime += 1 / getLorentzBetween(focusedPerson, Space)
    HTML['absoluteTime'].innerText = `t=${(absoluteTime).toFixed(4)}`
    for (var i in renderList) {
        renderList[i].time += 1 / getLorentzBetween(focusedPerson, renderList[i])

        //var _time = renderList[i].time.toFixed(4)
        var _time = `${Math.floor(renderList[i].time / 10)}년`
        HTML['absoluteTime'].innerText += ` ${"AB"[i]}=${_time}`
    }
}

function Focus(index) {
    focusedIndex = index
    if (index == -1) {
        focusedPerson = new Person([400, 400], [0, 0])
        return
    }
    focusedPerson = renderList[index]
}


class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    getSizeSquare() {
        return this.x ** 2 + this.y ** 2
    }
    normalized() {
        const size = this.getSizeSquare()
        return new Vector(this.x / size, this.y / size)
    }
    add(vec2) {
        this.x += vec2.x
        this.y += vec2.y
    }
}

class Person {
    constructor(pos, vel, index) {
        this.pos = new Vector(pos[0], pos[1])
        this.vel = new Vector(vel[0], vel[1])
        this.time = 0
        this.imgIndex = 0
        this.beforeTick = 0
        this.index = index
    }
    move() {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
    }
    draw() {
        var tick = Math.floor(this.time)
        if (tick % 3 == 0 && tick != this.beforeTick) {
            this.imgIndex++
            if (this.imgIndex >= imgObjects.length) {
                this.imgIndex = 0
            }
        }
        this.beforeTick = tick
        var mid = [-focusedPerson.pos.x * data.movementValue + canvas.width / 2 - data.imgSize / 2, -focusedPerson.pos.y + canvas.height / 2 - data.imgSize / 2]
        var pos = [mid[0] + this.pos.x * data.movementValue, mid[1] + this.pos.y]
        //var pos = [700, mid[1] + this.pos.y]
        ctx.beginPath()
        ctx.font = "80px serif"
        ctx.fillText("AB"[this.index], pos[0] - 100, pos[1] + 100, 100)
        ctx.drawImage(imgObjects[this.imgIndex], pos[0], pos[1], data.imgSize, data.imgSize);
        //ctx.strokeRect(mid[0] + this.pos.x, mid[1] + this.pos.y, data.imgSize, data.imgSize)
        ctx.closePath()
    }
}

function eventListener() {
    var delta_x = renderList[1].pos.x//getShrinkedLength(focusedPerson, renderList[1].pos.x)
    var standard_x = getShrinkedLength(focusedPerson, 300)
    //delta_x > LightSpeed * 10
    if (delta_x >= data.Bvel0 * standard_x && renderList[1].vel.x > -data.Bvel0) {
        renderList[1].vel.x -= 81//Math.abs(renderList[1].vel.x)
    }
    if (renderList[1].vel.x < -data.Bvel0) {
        renderList[1].vel.x = -data.Bvel0
    }
    if (delta_x <= 0) {
        isPlaying = false
    }
}

function lineTo(x1, y1, x2, y2) {
    ctx2.beginPath()
    ctx2.moveTo(x1, y1)
    ctx2.lineTo(x2, y2)
    ctx2.stroke()
    ctx2.closePath()
}

function drawLorentzAxis(posA) {
    ctx2.beginPath()
    ctx2.strokeStyle = 'rgba(255,155,10,0.3)'
    ctx2.moveTo(posA[0], posA[1])
    ctx2.lineTo(posA[0] + 800, posA[1] + 1500 - (LightSpeed / renderList[1].vel.x) * 800 * timeIncline)
    ctx2.setLineDash([10])
    ctx2.stroke()
    ctx2.setLineDash([0])
}

//[-----------------<Main>-----------------]
const renderList = [
    new Person([0, 200], [0, 0], 0),
    new Person([0, 400], [data.Bvel0, 0], 1),
]

var focusedIndex = -1
var focusedPerson = new Person([400, 400], [0, 0])
var absoluteTime = 0
var Space = new Person([0, 0], [0, 0])
var isPlaying = true
const O = { x: 400, y: 400 }
var Light = { x: 100, y: 0 }

Focus(0)

var timeIncline = 2
ctx2.strokeStyle = 'blue'
ctx2.lineWidth = 10
lineTo(0, 1500, 0, 100)
lineTo(0, 1500, 1300, 1500)
//l=(y/x)t
ctx2.strokeStyle = 'rgb(125,155,255)'
lineTo(0, 1500, 800, 1500 - (LightSpeed / renderList[1].vel.x) * 800 * timeIncline)

ctx2.strokeStyle = 'rgb(155,255,21)'
lineTo(0, 1500, 800, 1500 - 800)
function render() {
    const posA = [renderList[1].pos.x / LightSpeed, 1500 - focusedPerson.time * timeIncline]

    if (Math.floor(focusedPerson.time) % 1 == 0) {
        ctx2.beginPath()
        ctx2.fillStyle = 'rgba(255,0,0, 0.2)'
        ctx2.fillRect(posA[0], posA[1], 10, 10)
        ctx2.fillRect(renderList[0].pos.x / LightSpeed, 1500 - focusedPerson.time * timeIncline, 10, 10)
        ctx2.closePath()
    }

    if (Math.floor(focusedPerson.time) % 50 == 0) {
        ctx2.beginPath()
        ctx2.fillStyle = 'rgba(255,155,0, 1)'
        ctx2.fillRect(posA[0] - data.recordSize / 2, posA[1] - data.recordSize / 2, data.recordSize, data.recordSize)
        ctx2.fillStyle = 'rgba(55,155,255, 1)'
        ctx2.fillRect(renderList[0].pos.x / LightSpeed,
            1500 - focusedPerson.time * timeIncline - data.recordSize / 2, data.recordSize, data.recordSize)
        ctx2.closePath()
    }

    if (!isPlaying) {
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var i in renderList) {
        renderList[i].draw()
        renderList[i].move()
    }
    var mid = [-focusedPerson.pos.x + canvas.width / 2 - data.imgSize / 2, -focusedPerson.pos.y + canvas.height / 2 - data.imgSize / 2]
    var pos = [mid[0] + focusedPerson.pos.x, mid[1] + focusedPerson.pos.y]
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 4
    ctx.strokeRect(pos[0], pos[1], data.imgSize, data.imgSize)

    countTime()
    eventListener()
    requestAnimationFrame(render)
}
render()