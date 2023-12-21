const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const ResolutionValue = 1600 / 800
const HTML = {
    absoluteTime: document.getElementById('absoluteTime')
}

const data = {
    imgSize: 200,
    movementValue: 0.005
}

const imgObjects = []
for (var i = 0; i < 8; i++) {
    imgObjects.push(new Image())
    imgObjects[i].src = `./img/${i + 1}.png`
}

const LightSpeed = 30

function getLorentzFactor(vel) {
    var pre = 1 - vel ** 2 / LightSpeed ** 2
    if (pre == 0) {
        return 0
    }
    return 1 / Math.sqrt(pre)
}

function getLorentzBetween(p1, p2) {
    var v1 = Math.sqrt(p1.vel.getSizeSquare())
    var v2 = Math.sqrt(p2.vel.getSizeSquare())
    return getLorentzFactor(v1 - v2)
}

//t = γ*t0
function countTime() {
    focusedPerson.time++
    absoluteTime += 1 / getLorentzBetween(focusedPerson, Space)
    HTML['absoluteTime'].innerText = `t=${(absoluteTime).toFixed(4)}s`
    for (var i in renderList) {
        if (i !== focusedIndex) {
            renderList[i].time += 1 / getLorentzBetween(focusedPerson, renderList[i])
        }
        HTML['absoluteTime'].innerText += ` [${i}]=${renderList[i].time.toFixed(4)}`
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
    constructor(pos, vel) {
        this.pos = new Vector(pos[0], pos[1])
        this.vel = new Vector(vel[0], vel[1])
        this.time = 0
        this.imgIndex = 0
        this.beforeTick = 0
    }
    move() {
        this.pos.x += this.vel.x * data.movementValue
        this.pos.y += this.vel.y * data.movementValue
    }
    draw() {
        var tick = Math.floor(this.time)
        if (tick % 2 == 0 && tick != this.beforeTick) {
            this.imgIndex++
            if (this.imgIndex >= imgObjects.length) {
                this.imgIndex = 0
            }
        }
        this.beforeTick = tick
        var mid = [-focusedPerson.pos.x + canvas.width / 2 - data.imgSize / 2, -focusedPerson.pos.y + canvas.height / 2 - data.imgSize / 2]
        var pos = [mid[0] + this.pos.x, mid[1] + this.pos.y]
        ctx.beginPath()
        ctx.drawImage(imgObjects[this.imgIndex], pos[0], pos[1], data.imgSize, data.imgSize);
        //ctx.strokeRect(mid[0] + this.pos.x, mid[1] + this.pos.y, data.imgSize, data.imgSize)
        ctx.closePath()
    }
}


//[-----------------<Main>-----------------]
const renderList = [
    new Person([100, 200], [1, 0]),
    new Person([100, 400], [29.9, 0]),
]
var focusedIndex = -1
var focusedPerson = new Person([400, 400], [0, 0])
var absoluteTime = 0
var Space = { vel: new Vector(0, 0) }

Focus(-1)

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var i in renderList) {
        renderList[i].draw()
        renderList[i].move()
    }
    countTime()
    requestAnimationFrame(render)
}
render()