'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react'

const cardsData = Array.from({ length: 10 }, (_, i) => ({ id: i, content: `Card ${i + 1}` }));

export function CardStack() {
    const [cards, setCards] = useState(cardsData);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (index: number) => {
        setIsDragging(false);
        const newCards = [...cards];
        const [draggedCard] = newCards.splice(index, 1);
        newCards.push(draggedCard);
        setCards(newCards);
    };

    return (
        <div style={{ position: "relative", width: 320, height: 220, margin: "auto" }}>
            <AnimatePresence>
                {cards.map((card, index) => {
                    const isTop = index === 0;
                    const zIndex = isDragging && isTop ? -1 : index === cards.length - 1 ? -1 : cards.length - index;

                    return (
                        <motion.div
                            key={card.id}
                            drag={"x"}
                            dragConstraints={{ left: -20, right: 0 }}
                            dragElastic={0.2}
                            onDragStart={() => isTop && setIsDragging(true)}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > 0) {
                                    setIsDragging(false)
                                    return
                                } if (isTop)
                                    return handleDragEnd(index)
                            }
                            }
                            initial={{ scale: 1 - index * 0.05, y: 0 }}
                            animate={{ scale: 1 - index * 0.05, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: "absolute",
                                width: 300,
                                height: 200,
                                borderRadius: 16,
                                backgroundColor: "#61dafb",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 24,
                                fontWeight: "bold",
                                cursor: isTop ? "grab" : "default",
                                userSelect: "none",
                                zIndex,
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {card.content}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>

    );
}


export default function Cards() {
    return (
        <></>
    )
}

