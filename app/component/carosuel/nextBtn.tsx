'use client'
import { ReactNode, ComponentRef, forwardRef, ForwardedRef } from "react";
import { motion, HTMLMotionProps } from 'framer-motion';

type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
    children?: ReactNode
}

export function fnNextButton({ children, ...rest }: BtnProps, ref: ForwardedRef<HTMLButtonElement>) {

    return (
        <motion.button
            ref={ref}
            type="button"

            whileTap={{ scale: 1.2, backgroundColor: "#314f4fff" }}
            {...rest}
        >
            <span className='text-black text-[4rem]'>NEXT</span>
            {children}
        </motion.button>
    );
}


export const NextButton = forwardRef(fnNextButton)
