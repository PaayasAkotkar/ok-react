'use client'
import { KonvaNodeEvent } from "konva/lib/types"
import { useEffect, useRef, useState } from "react"
import { Layer, Stage, Text, Rect, Circle } from "react-konva"
import audioHook from "./audioHook"

export default function VoiceChat() {

    const { canvas, url, start, stop, record } = audioHook()

    return (
        <>

            <div className="flex flex-col gap-[20px]">
                <button className="bg-red-100" disabled={record} onClick={start}>
                    <span className="text-[14rem]">Record</span>
                </button>
                <button className="bg-yellow-100" disabled={!record} onClick={stop}>
                    <span className="text-[14rem]">Stop</span>
                </button>
                <div>
                    {
                        canvas && (
                            <canvas ref={canvas} width={600} height={200}></canvas>
                        )
                    }
                </div>
                <div>
                    {
                        url && (
                            <div>
                                <h1>record audio: </h1>
                                <audio controls src={url}>
                                </audio>

                            </div>
                        )
                    }
                </div>

            </div>
        </>
    )
}
