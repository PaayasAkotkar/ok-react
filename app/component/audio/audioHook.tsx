'use client';
import { RefObject, useEffect, useRef, useState } from "react"

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
    const [url, setUrl] = useState('')
    const canvas = useRef<HTMLCanvasElement | null>(null)
    var chunk = useRef<Blob[]>([])
    const audioContext = useRef<AudioContext | null>(null)
    const analyser = useRef<AnalyserNode | null>(null)
    const dataArray = useRef<Uint8Array<ArrayBuffer> | null>(null)
    const bufferLength = useRef(0)
    const animationId = useRef<number>(0)

    useEffect(() => {

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
            _recorder.onstop = () => {
                let chunks = new Blob(chunk.current, { type: 'audio/webm' })
                const u = URL.createObjectURL(chunks)
                setUrl(u)
                chunk.current = []  // imp: empty the chunk 
                cancelAnimationFrame(animationId.current)
            }
        })

    }, [])

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

    const onStart = () => {
        if (!record && recorder.current) {
            chunk.current = []
            recorder.current.start()
            setRecord(true)
            draw()
        }
    }
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