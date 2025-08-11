"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"


interface CarouselImage {
  src: string;
  alt: string;
  name?: string;
  location?: string;
  price?: number;
  rating?: number;
  reviews?: number;
}

interface CarouselProps {
  images: CarouselImage[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 10px;
  }
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 1rem 1rem 0 0;
  }
  .carousel-data {
    margin-top: 0;
    text-align: center;
    background: #fff;
    border-radius: 0 0 0.75rem 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 0.75rem 0.5rem 0.5rem 0.5rem;
    width: 100%;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .carousel-data {
    margin-top: 1rem;
    text-align: center;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 0.75rem 0.5rem 0.5rem 0.5rem;
    width: 90%;
  }
  .carousel-data h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .carousel-data p {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 0.25rem;
  }
  .carousel-data .price {
    color: #2563eb;
    font-weight: 600;
    font-size: 1rem;
  }
  .carousel-data .rating {
    color: #fbbf24;
    font-size: 0.95rem;
    margin-left: 0.25rem;
  }
  .carousel-data .reviews {
    color: #888;
    font-size: 0.85rem;
    margin-left: 0.25rem;
  }
  .carousel-data .location {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  `
  return (
    <section className="py-4">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-6xl">
        <Swiper
          spaceBetween={24}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
          }}
          effect={"slide"}
          grabCursor={true}
          centeredSlides={false}
          loop={true}
          slidesPerView={3}
          pagination={showPagination}
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : undefined
          }
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="carousel-card flex flex-col items-center w-full h-full">
                <div className="carousel-photo w-full">
                  <Image
                    src={image.src}
                    width={300}
                    height={300}
                    className="rounded-xl"
                    alt={image.alt}
                  />
                </div>
                <div className="carousel-data w-full">
                  {image.name && <h4>{image.name}</h4>}
                  {image.location && <p className="location">{image.location}</p>}
                  {image.price !== undefined && <div className="price">₹{image.price}/hour</div>}
                  {image.rating !== undefined && (
                    <span className="rating">★ {image.rating}</span>
                  )}
                  {image.reviews !== undefined && (
                    <span className="reviews">({image.reviews} reviews)</span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
