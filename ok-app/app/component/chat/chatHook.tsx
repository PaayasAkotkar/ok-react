import { useEffect, useRef, useState } from "react"
import { Subscription, interval, takeWhile, tap } from "rxjs"

export interface Inputs {
    request: string
}

// IChatHook implements the hook interface
interface IChatHook {
    statusMessage: string // curr status msg on open|close
    replies?: string[] // updated msgs
    connectionStatus: boolean // curr status 
    loading: boolean // is loading on os writing
    waiting: boolean // is waiting for msg
    err: boolean // caught error
    panic: string  // caught error msg
    recievedAny: boolean // msg recieved
    post: (request: Inputs) => void // post the msg
}

export interface IAsyncTape {
    play: boolean // starts playing the animation only if the play is true
    loadText: string // like for example  ... ... ...
}
export default function chatHook(): IChatHook {

    const [curStatus, setStatus] = useState<string>("")
    const [gotMsg, setMsg] = useState<string[]>([])
    const [err, setErr] = useState<boolean>(false)
    const [panic, setPanic] = useState<string>("")
    const [recMsg, setRecMsg] = useState<boolean>(false)
    const [conStatus, setConStatus] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [waiting, setWaiting] = useState<boolean>(false)

    const ws = useRef<WebSocket | null>(null)
    const sub = useRef<Subscription | null>(null)

    useEffect(() => {
        const url = "ws://localhost:8080/ws"

        const conn = new WebSocket(url)

        ws.current = conn

        conn.onopen = () => {
            setStatus(`server says hi 🤗`)
            setConStatus(true)
        }

        conn.onmessage = (token) => {
            setRecMsg(true)
            console.log('message: ', token.data)
            if (sub.current) {

                sub.current.unsubscribe()
                sub.current = null
            }

            const reply = token.data
            let $i = 0
            // imp else it wont work
            setMsg(old => [...old, "Server: "])
            const stream = interval(50).pipe(takeWhile(() => $i < reply.length),

                tap(() => {
                    const char = reply[$i]

                    // updating ... 😄
                    setMsg(old => {

                        const ua: string[] = [...old]
                        const pointer = ua.length - 1;
                        ua[pointer] += char
                        return ua

                    })
                    //end 

                    $i++

                }))

            sub.current = stream.subscribe({
                next: () => {
                    setLoading(true)
                    setWaiting(false)
                },

                complete: () => {
                    sub.current = null
                    setWaiting(true)
                    setLoading(false)
                    setRecMsg(false)
                },

                error: (err) => {
                    setErr(true)
                    setPanic('something we wrong 😕')
                    console.error(err)
                }
            })
        }

        conn.onerror = () => {
            setErr(true)
            setPanic(`server says error 🤬`)
            setConStatus(false)
        }

        conn.onclose = () => {
            setStatus(`server says good night 😴`)
            setConStatus(false)
        }

        return () => {
            if (sub.current) {
                sub.current.unsubscribe()
                sub.current = null

            }
            conn.close()
        }

    }, [])

    const post = (pack: Inputs): void => {
        if (!ws.current)
            return
        if (ws.current.readyState != WebSocket.OPEN)
            return
        const send = JSON.stringify(pack)
        ws.current.send(send)
    }

    const token: IChatHook = {
        statusMessage: curStatus,
        post: post,
        replies: gotMsg,
        connectionStatus: conStatus,
        recievedAny: recMsg,
        loading: loading,
        waiting: waiting,
        err: err,
        panic: panic
    }
    return token
}