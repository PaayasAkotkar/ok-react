"use client";
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form";
import { IAsyncTape, Inputs } from "./chatHook";
import chatHook from "./chatHook";
import { interval, takeWhile } from "rxjs";
import './touchup/animation.scss'


export default function Chatting() {
    const {
        register,
        handleSubmit
    } = useForm<Inputs>()

    const { statusMessage, loading, err, panic, replies, waiting, post, recievedAny, connectionStatus } = chatHook()
    const send = (application: Inputs) => {
        if (connectionStatus)
            post(application)
    }
    return (
        <>
            <div className="flex flex-col items-center">
                <div >
                    <h1 className=" p-[10px] text-[4rem] w-fit h-[100%] bg-red-200">
                        {statusMessage}
                    </h1>
                </div>

                <div>
                    <form className="flex p-[10px] bg-ad8-white w-[100%]  flex-col items-center justify-center gap-[10px]" onSubmit={handleSubmit(send)}>
                        <input className="pt-[10px] text-[4rem]" type="text"  {...register('request')}></input>
                        <button type="submit" className="ocs-btn w-[450px] bg-yellow-200 rounded-[4rem] hover:bg-blue-200  flex justify-center align-center text-[4rem]">
                            <span>
                                submit
                            </span>
                        </button>
                    </form>
                </div>

                <div>
                    {err && (
                        <div>
                            <h1 className="text-[5rem] text-red-800">{panic}</h1>
                        </div>
                    )
                    }
                </div>
                <div>
                    {recievedAny && loading && !waiting && (
                        <p className="text-black-500 text-[4rem]">Thinking... 💡</p>
                    )}
                </div>
                <div>
                    {waiting && !loading && (
                        <p className="text-black-500 text-[4rem]">
                            Waiting... 🥱
                        </p>
                    )}

                </div>
                <div>
                    {replies && (
                        <ul className="list-none p-0">
                            {replies.map((v, index) => (
                                <li key={index} className="flex flex-col mb-4 bg-ad8-white">
                                    <h1 className="text-[4rem]">
                                        {v}
                                    </h1>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </>
    )
}