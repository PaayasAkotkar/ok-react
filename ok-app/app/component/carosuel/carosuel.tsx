'use client'
import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { usePrevNextButtons } from './carosuelHoook'
import './touchup/main.scss'
import Image from 'next/image'
import { images, ImageAttr } from '../image/image'
import { PrevButton } from './prevBtn'
import { NextButton } from './nextBtn'
import { motion } from 'framer-motion'
type PropType = {
    slides: ImageAttr[]
    options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides, options } = props
    const [emblaRef, emblaApi] = useEmblaCarousel(options)

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
        ele

    } = usePrevNextButtons(emblaApi, slides)
    return (
        <section className="embla bg-white-100">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container  ">
                    {slides.map((index, idx) => {
                        const isSelected = idx === ele;
                        return (
                            <div
                                key={idx}
                                className='embla__slide'>
                                <motion.div
                                    className="bg-red-100 text-black"
                                    initial={false}
                                    animate={{
                                        scale: idx === ele ? 1 : 0.8,
                                        opacity: idx === ele ? 1 : 0.5,
                                    }}
                                    transition={{ duration: 0.25 }}
                                >

                                    <Image width={300} height={300} src={index.src} alt={index.alt}
                                        className='w'
                                        loading={idx == 0 ? 'eager' : 'lazy'}
                                    ></Image>
                                    <div className="embla__slide__number">{idx}</div>

                                </motion.div>
                            </div>

                        )
                    })}
                </div>
            </div>

            <div className="embla__controls">
                <div className="embla__buttons">
                    <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                    <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                </div>
            </div>
        </section >
    )
}

export default function Carousel() {
    const imgs = images()
    const OPTIONS: EmblaOptionsType = { loop: true }
    return (
        <EmblaCarousel slides={imgs} options={OPTIONS}></EmblaCarousel>
    )
}