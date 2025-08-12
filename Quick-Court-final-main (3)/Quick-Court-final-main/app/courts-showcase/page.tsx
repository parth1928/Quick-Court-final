"use client"

import { ScrollXCarousel,
  ScrollXCarouselContainer,
  ScrollXCarouselProgress,
  ScrollXCarouselWrap } from "@/components/ui/scroll-x-carousel";
import {CardHoverReveal,
  CardHoverRevealContent,
  CardHoverRevealMain,} from '@/components/ui/reveal-on-hover'
import { Badge } from '@/components/ui/badge'

const COURT_SLIDES = [
  {
    id: 'slide-1',
    title: 'Basketball Courts',
    description:
      'Professional basketball courts with regulation dimensions, perfect for competitive games and practice sessions.',
    services: ['5v5 games', 'Training', '3v3 tournaments'],
    type: 'Indoor',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide-2',
    title: 'Tennis Courts',
    description:
      'Premium tennis courts with professional surface and lighting for day and night matches.',
    services: ['Singles', 'Doubles', 'Coaching', 'Tournaments'],
    type: 'Outdoor',
    imageUrl:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide-3',
    title: 'Volleyball Courts',
    description:
      'Indoor volleyball courts with professional nets and proper flooring for safe gameplay.',
    services: ['6v6 matches', 'Beach volleyball', 'Training'],
    type: 'Indoor',
    imageUrl:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2507&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide-4',
    title: 'Badminton Courts',
    description:
      'High-quality badminton courts with proper ventilation and professional-grade flooring.',
    services: ['Singles', 'Doubles', 'Coaching', 'Leagues'],
    type: 'Indoor',
    imageUrl:
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=2474&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide-5',
    title: 'Football Fields',
    description:
      'Full-size football fields with artificial turf, perfect for 11v11 matches and training.',
    services: ['11v11 matches', '7v7 games', 'Training', 'Tournaments'],
    type: 'Outdoor',
    imageUrl:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide-6',
    title: 'Multi-Sport Complex',
    description:
      'State-of-the-art multi-sport facilities with premium amenities and equipment for all sports.',
    services: ['All sports', 'Events', 'Coaching', 'Fitness'],
    type: 'Premium',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2490&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default function CourtsCarousel() {
  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Our Premium Sports Facilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience world-class sports facilities with professional equipment, 
            premium amenities, and expert coaching services across multiple sports.
          </p>
        </div>
      </div>

      {/* Scroll Carousel */}
      <ScrollXCarousel className="h-[150vh]">
        <ScrollXCarouselContainer className="h-dvh place-content-center flex flex-col gap-8 py-12">
          {/* Gradient Overlays */}
          <div className="pointer-events-none w-[12vw] h-[103%] absolute inset-[0_auto_0_0] z-10 bg-[linear-gradient(90deg,_rgb(249_250_251)_35%,_transparent)]" />
          <div className="pointer-events-none bg-[linear-gradient(270deg,_rgb(249_250_251)_35%,_transparent)] w-[15vw] h-[103%] absolute inset-[0_0_0_auto] z-10" />

          <ScrollXCarouselWrap className="flex-4/5 flex space-x-8 [&>*:first-child]:ml-8">
            {COURT_SLIDES.map((slide) => (
              <CardHoverReveal
                key={slide.id}
                className="min-w-[70vw] md:min-w-[38vw] shadow-xl border xl:min-w-[30vw] rounded-xl bg-white"
              >
                <CardHoverRevealMain>
                  <img
                    alt={slide.title}
                    src={slide.imageUrl}
                    className="size-full aspect-square object-cover rounded-xl"
                  />
                </CardHoverRevealMain>
                <CardHoverRevealContent className="space-y-4 rounded-2xl bg-[rgba(0,0,0,.7)] backdrop-blur-3xl p-6">
                  <div className="space-y-2">
                    <h3 className="text-sm text-white/80">Type</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="capitalize rounded-full bg-blue-600 hover:bg-blue-700">
                        {slide.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm text-white/80">Available Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {slide.services.map((service) => (
                        <Badge
                          key={service}
                          className="capitalize rounded-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                          variant={'outline'}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-white capitalize font-medium text-lg">
                      {slide.title}
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed">{slide.description}</p>
                  </div>
                </CardHoverRevealContent>
              </CardHoverReveal>
            ))}
          </ScrollXCarouselWrap>
          
          {/* Progress Bar */}
          <ScrollXCarouselProgress
            className="bg-gray-200 mx-8 h-2 rounded-full overflow-hidden"
            progressStyle="size-full bg-blue-600 rounded-full"
          />
        </ScrollXCarouselContainer>
      </ScrollXCarousel>

      {/* Call to Action Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Book Your Court?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who trust Quick Court for their sports facility needs. 
            Book your preferred court today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/venues" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Venues
            </a>
            <a 
              href="/tournaments" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Tournaments
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
