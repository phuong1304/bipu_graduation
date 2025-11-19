'use client';

import { useEffect, useState } from "react";

interface Star {
    id: number;
    left: string;
    top: string;
    animationDelay: string;
}

interface StarBackgroundProps {
    count?: number;
    className?: string;
}

export default function StarBackground({ count = 25, className = "" }: StarBackgroundProps) {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const newStars = Array.from({ length: count }, (_, index) => ({
            id: index,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
        }));
        setStars(newStars);
    }, [count]);

    return (
        <div className={`stars-container ${className}`}>
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: star.left,
                        top: star.top,
                        animationDelay: star.animationDelay,
                    }}
                />
            ))}
        </div>
    );
}
