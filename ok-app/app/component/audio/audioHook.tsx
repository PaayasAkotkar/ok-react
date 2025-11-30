'use client';
import { RefObject, useEffect, useRef, useState } from "react"
// kudos to mdn for implementing the audio demo
// i just rewrite the code of mdn in react
// the only difference is that i added the listen to audio option

interface IAudioHoook {
    stop: () => void
    start: () => void
    canvas: RefObject<HTMLCanvasElement | null>
    url: string
    record: boolean
}

export default function audioHook(): IAudioHoook {
    const [record, setRecord] = useState(false)
    const recorder = useRef<MediaRecorder | null>(null)
    const [url, setUrl] = useState('') // imp in order to listen
    const canvas = useRef<HTMLCanvasElement | null>(null)
    var chunk = useRef<Blob[]>([])
    const audioContext = useRef<AudioContext | null>(null)
    const analyser = useRef<AnalyserNode | null>(null)
    const dataArray = useRef<Uint8Array<ArrayBuffer> | null>(null)
    const bufferLength = useRef(0)
    const animationId = useRef<number>(0)

    useEffect(() => {
        // i dont shit what this is i just implemented 😉
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {

            audioContext.current = new AudioContext()
            const source = audioContext.current.createMediaStreamSource(stream)
            analyser.current = audioContext.current.createAnalyser()
            source.connect(analyser.current)
            analyser.current.fftSize = 2048
            bufferLength.current = analyser.current.frequencyBinCount
            dataArray.current = new Uint8Array(bufferLength.current)

            const _recorder = new MediaRecorder(stream)
            recorder.current = _recorder
            _recorder.ondataavailable = (ev) => {
                if (ev.data.size > 0)
                    chunk.current.push(ev.data)
            }

            // i only this part becuase in go i implemented image so shit went crazy for 2h in Go
            // what this is basiclly is that creating a url its same as doing static file stuff
            // this is my analogy of thinking 😅
            _recorder.onstop = () => {
                let chunks = new Blob(chunk.current, { type: 'audio/webm' })
                const u = URL.createObjectURL(chunks)
                setUrl(u)
                chunk.current = []  // imp: empty the chunk 
                cancelAnimationFrame(animationId.current) // i still have no idea 
            }
        })

    }, [])

    // i am not good at canvas its just copy and paste from mdn and did some changes here
    // so my bad cant explain you what this is
    // but i can explain you the basic
    // the width and height must be implementd as each canvas
    // i dont know shit about animationId
    // the canvasCtx is bascially like lets say you opening either blender or photoshop
    // make sure to set the canvas pen as per the body
    // stokeStyle: if you ever ever used ms word and created shapes and edited bunch of stuff
    //             you would find the outline stuff and that's bsacilly stokeStyle
    // dont worry if you haevnt dont this
    // this is bsaiclly a pint point just like a ball pen
    var draw = () => {
        if (!analyser.current || !canvas.current || !dataArray.current) return
        const canvasCtx = canvas.current.getContext("2d")
        if (!canvasCtx) return

        const WIDTH = canvas.current.width
        const HEIGHT = canvas.current.height

        animationId.current = requestAnimationFrame(draw)

        analyser.current.getByteTimeDomainData(dataArray.current)

        canvasCtx.fillStyle = "rgb(200, 200, 200)"
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

        canvasCtx.lineWidth = 2
        canvasCtx.strokeStyle = "rgb(0, 0, 0)"

        canvasCtx.beginPath()

        let sliceWidth = (WIDTH * 1.0) / bufferLength.current
        let x = 0

        for (let i = 0; i < bufferLength.current; i++) {
            let v = dataArray.current[i] / 128.0
            let y = (v * HEIGHT) / 2

            if (i === 0) {
                canvasCtx.moveTo(x, y)
            } else {
                canvasCtx.lineTo(x, y)
            }

            x += sliceWidth
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2)
        canvasCtx.stroke()
    }

    // pro tip always use disable items outside the hooks if you triggering events with buttons
    const onStart = () => {
        if (!record && recorder.current) {
            chunk.current = []
            recorder.current.start()
            setRecord(true)
            draw()
        }
    }
    // if you wont stop you wont able to hear it 😅
    const onStop = () => {
        if (record && recorder.current) {
            recorder.current.stop()
            setRecord(false)
        }
    }
    const token: IAudioHoook = {
        canvas: canvas,
        url: url,
        stop: onStop,
        start: onStart,
        record: record
    }
    return token
}