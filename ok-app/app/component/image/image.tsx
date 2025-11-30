import './touchup/main.scss';

export interface ImageAttr {
    src: string
    alt: string
    title?: string
}
export function images(): ImageAttr[] {
    const imgs: ImageAttr[] = []
    for (let i = 1; i <= 7; i++) {
        const put: ImageAttr = {
            src: `/dummy/d${i}.jpg`,
            alt: `d${i}`,
            title: `d${i}`,
        }
        imgs.push(put)
    }
    return imgs
}

export default function ImagePlayground() {
    var imgs = images()
    return (
        <>
            <div className="flex flex-row">

                <div className="relative">
                    {
                        imgs.map((src, key) => {
                            if (key != 0)
                                return (

                                    <div key={key} className="w-[1400px] flex flex-row">
                                        <img className='w-[100%] h-[100%] object-contain' src={src.src} alt=""></img>
                                        <span className=" font-arial text-[4rem]">{src.title}</span>
                                    </div>
                                )
                        })
                    }

                </div>
                <div className="w-[100%] flex flex-row absolute  ">
                    <img className={`mask-man  w-[100%] h-[100%] object-contain`} src={imgs[0].src}></img>
                    <span className="font-arial text-[4rem]">{imgs[0].title}</span>

                </div>
            </div >
        </>
    )
}