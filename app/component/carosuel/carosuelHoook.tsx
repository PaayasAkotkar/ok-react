import {
    useCallback,
    useEffect,
    useState
} from 'react'
import { EmblaCarouselType } from 'embla-carousel'
import { ImageAttr } from '../image/image'

type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean
    nextBtnDisabled: boolean
    onPrevButtonClick: () => void
    onNextButtonClick: () => void
    ele: number
}

export const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined, imgs: ImageAttr[]
): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
    const [selected, setInx] = useState(0)

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollPrev()
    }, [emblaApi])

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollNext()
    }, [emblaApi])

    const normalizeIndex = useCallback(() => {
        if (!emblaApi) return
        const slideCount = imgs.length
        if (slideCount === 0) return

        const rawIndex = emblaApi.selectedScrollSnap()
        const normalized = ((rawIndex % slideCount) + slideCount) % slideCount

        setInx(normalized)
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())

    }, [emblaApi, imgs.length])

    useEffect(() => {
        if (!emblaApi) return
        emblaApi.on('select', normalizeIndex)
        emblaApi.on('reInit', normalizeIndex)

        normalizeIndex()

        return () => {
            emblaApi.off('select', normalizeIndex)
            emblaApi.off('reInit', normalizeIndex)
        }
    }, [emblaApi, normalizeIndex])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
        ele: selected
    }
}
