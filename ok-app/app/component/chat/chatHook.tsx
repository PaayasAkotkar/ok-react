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

// displays basic idea about how ai reply is been coded
// yeah this is my world of playing 
export default function chatHook(): IChatHook {

    // i dont think i need to explain what these variables are
    const [curStatus, setStatus] = useState<string>("")
    const [gotMsg, setMsg] = useState<string[]>([])
    const [err, setErr] = useState<boolean>(false)
    // panic if you ever done Go than yes you are thinking in a right way
    // if you havent done go
    // this is bsaiclly a error trigger if caught any
    const [panic, setPanic] = useState<string>("")
    const [recMsg, setRecMsg] = useState<boolean>(false)
    const [conStatus, setConStatus] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [waiting, setWaiting] = useState<boolean>(false)

    const ws = useRef<WebSocket | null>(null)
    const sub = useRef<Subscription | null>(null)

    // and my frands this is how clean you can implement the websocket 
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

            // this is how the magic begans
            const reply = token.data
            // do you know what i did here
            // i just implemented the for loop
            // within time
            // this is one of the tecnhqiue you learn by doing it agani and again
            let $i = 0
            // imp else it wont work
            // why it is imp becuaes on render it consider null
            // on second click fuck happens
            // on third click fuck happens
            // on double click stuff happens
            // doing this way output happens
            setMsg(old => [...old, "Server: "])

            // do angular if you wish to learn rxjs
            const stream = interval(50).pipe(takeWhile(() => $i < reply.length),

                tap(() => {
                    const char = reply[$i]

                    // updating ... 😄
                    setMsg(old => {
                        // this is dope btw trust me this is ridiculas
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