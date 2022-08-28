import DecibelMeter from 'decibel-meter'

const decibelOutputNode = document.getElementById("decibel-output")
const dialNode = document.getElementById("dial")
const warningNode = document.getElementById("warning-output")
const warningContainerNode = document.getElementById("warning-output-container")

const renderDial = (canvasNode, min, max, value) => {

    const ctx = canvasNode.getContext("2d")
    ctx.lineWidth = 3
    const width = canvasNode.width
    const height = canvasNode.height
    const radius = Math.min(width, 2 * height) / 2

    const radiansFromZero = Math.PI * (value - min) / (max - min)

    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.arc(radius, radius, radius, Math.PI, 0)
    ctx.stroke()
    ctx.translate(radius, radius)
    ctx.rotate(radiansFromZero)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-radius, 0)
    ctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

let warning = false
let lock_updates = false
const loud_threshold = 50

const meter = new DecibelMeter
meter.sources.then(console.log)
meter.listenTo(0, db => {
    const dba = db + 130

    if ((dba > loud_threshold) && (!warning)) {
        warning = true
        setTimeout(_ => {
            warning = false
        }, 3000)
    }

    if (!lock_updates) {
        renderWarning(warningNode, warning)
        renderDecibelOutput(decibelOutputNode, dba)
        renderDial(dialNode, 0, 140, dba)
        lock_updates = true
        setTimeout(_ => lock_updates = false, 100)
    }
})

const renderWarning = (warningNode, warning) => {
    if (warning) {
        warningNode.innerHTML = "Your environment is currently too loud. Consider leaving the area or putting on ear protection"
        warningContainerNode.classList.remove("okay")
        warningContainerNode.classList.add("warning")
    } else {
        warningNode.innerHTML = "Your environment is at a safe volume"
        warningContainerNode.classList.remove("warning")
        warningContainerNode.classList.add("okay")
    }
}

const renderDecibelOutput = (outputNode, decibels) => {
    outputNode.innerHTML = `${Math.round(decibels)} dBA`
}

const graphNode = document.getElementById("graph")

const renderGraph = (canvasNode, startX, endX, startY, endY, data) => {
    const ctx = canvasNode.getContext("2d")
    const width = canvasNode.width
    const height = canvasNode.height

    const shiftedData = data.map(([x, y]) => [
        width * (x - startX) / (endX - startX),
        height - height * (y - startY) / (endY - startY),
    ])

    let last = shiftedData[0]

    shiftedData.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.moveTo(last[0], last[1])
        ctx.lineTo(x, y)
        ctx.stroke()
        last = [x, y]
    })
}
