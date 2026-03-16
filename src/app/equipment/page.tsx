import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'UMHC | Equipment Guide - Essential Hiking Gear Recommendations',
  description: 'Essential hiking equipment and gear recommendations for University of Manchester Hiking Club members. Learn what gear you need for safe and enjoyable hiking adventures. Includes required boots, waterproof coats, and optional equipment.',
  keywords: ['hiking equipment', 'hiking boots', 'waterproof coats', 'manchester', 'hiking gear', 'mountain walking', 'outdoor equipment'],
  openGraph: {
    title: 'UMHC Equipment Guide - Essential Hiking Gear',
    description: 'Complete hiking equipment recommendations for all skill levels. From boots to backpacks, find out what gear you need for UMHC trips.',
    type: 'website',
  },
};

// Equipment Item Component
interface EquipmentItemProps {
  name: string;
  link: string;
  imagePath: string;
  imageAlt: string;
}

function EquipmentItem({ name, link, imagePath, imageAlt }: EquipmentItemProps) {
  return (
    <a 
      href={link}
      className="group relative block w-full aspect-[307/323] focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2 rounded-lg"
      aria-label={`View ${name} recommendations and purchase options`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative w-full h-full">
        {/* Image container with whellow background */}
        <div className="absolute top-0 left-0 right-0 h-[calc(100%-52px)] bg-whellow rounded-[10px] overflow-hidden group-hover:shadow-lg transition-shadow duration-200">
          <Image
            src={imagePath}
            alt={imageAlt}
            fill
            className="object-contain transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1200px) 30vw, 307px"
            priority={false}
            quality={85}
          />
        </div>
        {/* Item name */}
        <div className="absolute bottom-0 left-[2.93%] right-[9.45%] h-[44px] flex items-start pt-[8px]">
          <p className="font-medium text-xs sm:text-sm md:text-base text-black font-sans leading-tight group-hover:text-umhc-green transition-colors duration-200">
            {name}
          </p>
        </div>
      </div>
    </a>
  );
}

// Equipment Recommendation Section Component
interface EquipmentRecommendationSectionProps {
  title: string;
  description: string;
  items: EquipmentItemProps[];
  id?: string;
}

function EquipmentRecommendationSection({ title, description, items, id }: EquipmentRecommendationSectionProps) {
  // Create a unique ID for the section based on the title or use provided ID
  const sectionId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  return (
    <section 
      id={sectionId}
      className="flex flex-col gap-3 sm:gap-3.5 w-full max-w-[1120px] px-4 sm:px-0" 
      aria-labelledby={`heading-${sectionId}`}
      role="region"
    >
      <header>
        <h2 
          id={`heading-${sectionId}`}
          className="font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-black font-sans leading-tight mb-2 sm:mb-3"
          tabIndex={-1}
        >
          {title}
        </h2>
        <p className="font-medium text-sm sm:text-base lg:text-[16px] text-black font-sans leading-relaxed max-w-6xl">
          {description}
        </p>
      </header>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[26px] mt-4"
        role="list"
        aria-label={`${title} product recommendations`}
      >
        {items.map((item, index) => (
          <div 
            key={`${sectionId}-item-${index}`} 
            className="w-full max-w-[307px] justify-self-center sm:justify-self-start"
            role="listitem"
          >
            <EquipmentItem {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EquipmentPage() {
  // Equipment data - using placeholder links for now
  const hikingBootsItems: EquipmentItemProps[] = [
    {
      name: "Regatta Edgepoint Hiking Boots",
      link: "https://www.decathlon.co.uk/p/mp/regatta/edgepoint-mid-mens-waterproof-hiking-shoes/_/R-p-7a5aa845-d477-47f1-95cf-d2c736948439?mc=7a5aa845-d477-47f1-95cf-d2c736948439_c251&c=grey",
      imagePath: "/images/equipment/decathlon-regatta-boot.png",
      imageAlt: "Grey regatta hiking boots with ankle support"
    },
    {
      name: "Jack Wolfskin Vojo 3 Texapore Boots",
      link: "https://www.cotswoldoutdoor.com/p/jack-wolfskin-mens-vojo-3-texapore-mid-boots-B22ABA0181.html?colour=3457",
      imagePath: "/images/equipment/cotswold-jack-wolfskin-boots.png",
      imageAlt: "Hiking boots with ankle support made from black and faint light blue material "
    },
    {
      name: "Scarpa Terra II Gore-Tex",
      link: "https://www.gooutdoors.co.uk/15895342/scarpa-women-s-terra-ii-gore-tex-walking-boots-15895342",
      imagePath: "/images/equipment/gooutdoors-scarpa-boots.png",
      imageAlt: "Brown leather walking boots with high ankle support and faint 'Scarpa' logo pressed into the leather"
    }
  ];

  const waterproofCoatItems: EquipmentItemProps[] = [
    {
      name: "Quencha Hiking Lightweight Waterproof Jacket MH500",
      link: "https://www.decathlon.co.uk/p/men-s-hiking-lightweight-waterproof-jacket-mh500/_/R-p-301681?mc=8612171&c=smoked%20black",
      imagePath: "/images/equipment/decathlon-quencha-coat.png",
      imageAlt: "Quencha black water proof hiking coat"
    },
    {
      name: "Berghaus Maitland Gore-Tex IA Waterproof Jacket",
      link: "https://www.gooutdoors.co.uk/15898104/berghaus-men-s-maitland-gore-tex-ia-waterproof-jacket-15898104",
      imagePath: "/images/equipment/gooutdoors-berghaus-coat.png",
      imageAlt: "Black berghaus waterproof coat"
    },
    {
      name: "Rab Downpour Mountain Jacket",
      link: "https://www.cotswoldoutdoor.com/p/rab-mens-downpour-mountain-jacket-B12AE90517.html?colour=124",
      imagePath: "/images/equipment/cotswold-rab-coat.png",
      imageAlt: "Black rab waterproof coat"
    }
  ];

  const hikingTrousersItems: EquipmentItemProps[] = [
    {
      name: "Brashers Stretch Walking Trousers",
      link: "https://www.gooutdoors.co.uk/16007744/brasher-mens-stretch-walking-trousers-16007744",
      imagePath: "/images/equipment/brasher-trousers.png",
      imageAlt: "Black Brashers Stretch Walking Trousers"
    },
    {
      name: "Montane Dynamic Nano Pants",
      link: "https://www.cotswoldoutdoor.com/p/montane-mens-dynamic-nano-pants-B12CEH0556.html?colour=124",
      imagePath: "/images/equipment/montane-trousers.png",
      imageAlt: "Black Montane Dynamic Nano Trousers"
    },
    {
      name: "Quencha Hiking Trousers MH500",
      link: "https://www.decathlon.co.uk/p/men's-hiking-trousers-mh500-green/_/R-p-325496?mc=8917639&c=black",
      imagePath: "/images/equipment/quencha-trousers.png",
      imageAlt: "Quencha black hiking trousers"
    }
  ];

  const backpackItems: EquipmentItemProps[] = [
    {
      name: "Quencha 20 Litre Hiking Backpack",
      link: "https://www.decathlon.co.uk/p/20-l-mountain-hiking-backpack-mh100-black/_/R-p-331022?mc=8649476&c=black",
      imagePath: "/images/equipment/quencha-bag.png",
      imageAlt: "Black Quencha 20 Litre Hiking Backpack"
    },
    {
      name: "Lowe Alpine Airzone Active 22 Daypack",
      link: "https://www.cotswoldoutdoor.com/p/lowe-alpine-airzone-active-22-daypack-E1314678.html?colour=124",
      imagePath: "/images/equipment/lowe-alpine-bag.png",
      imageAlt: "Black Lowe Alpine Airzone Active 22 Daypack"
    },
    {
      name: "Osprey Talon 26 Daypack",
      link: "https://www.gooutdoors.co.uk/19672198/osprey-talon-26-daypack-19672198",
      imagePath: "/images/equipment/osprey-bag.png",
      imageAlt: "Black Osprey Talon 26 Daypack"
    }
  ];

  return (
    <div className="bg-whellow min-h-screen">
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="hidden"
      >
        Skip to main content
      </a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
        
        {/* Header/Intro Section */}
        <header className="text-center mb-8 sm:mb-12 lg:mb-[45px]">
          <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] text-black font-sans leading-tight">
              Equipment
            </h1>
            <div className="max-w-6xl mx-auto px-2 sm:px-4">
              <p className="font-medium text-sm sm:text-base lg:text-[16px] text-black font-sans leading-relaxed">
                Before heading out on any of our trips, it&apos;s important to make sure you&apos;ve got the right equipment. The hills can be unpredictable, and having the proper gear keeps everyone safe and makes the experience far more enjoyable. On this page, you&apos;ll find guidance on the essentials you&apos;ll need for our weekend trips, day hikes, and longer expeditions. Whether you&apos;re brand new to hiking or a seasoned hillwalker, this guide will help you feel prepared and confident for the adventures ahead. We recommend you purchase from <a href="https://www.gooutdoors.co.uk/" target="_blank" rel="noopener noreferrer" className="text-umhc-green hover:text-stealth-green underline font-semibold transition-colors">GoOutdoors</a>, <a href="https://www.cotswoldoutdoor.com/" target="_blank" rel="noopener noreferrer" className="text-umhc-green hover:text-stealth-green underline font-semibold transition-colors">Cotswold Outdoor</a>, or <a href="https://www.decathlon.co.uk/" target="_blank" rel="noopener noreferrer" className="text-umhc-green hover:text-stealth-green underline font-semibold transition-colors">Decathlon</a> where you may also be able to get a discount via your BMC membership which you get access to through becoming a member of our society. You can also find a lot of second hand equipment on sites like Vinted, or eBay which offer a great discount on high spec equipment.
              </p>
            </div>
          </div>
        </header>

        {/* Main Equipment Sections */}
        <main id="main-content" className="flex flex-col gap-8 sm:gap-12 lg:gap-[45px] items-center" role="main">
          
          {/* Hiking Boots Section */}
          <EquipmentRecommendationSection
            id="hiking-boots-required"
            title="Hiking Boots (Required)"
            description="Hiking boots are a required piece of equipment for any trip with us. If you don't have sufficient hiking boots, we may not let you go on the trip. Sufficient hiking boots are ones that provide ankle support and are not considered a fashion statement, we recommend that you try these on in person to ensure they're a comfortable fit and won't cause you to develop blisters."
            items={hikingBootsItems}
          />

          {/* Waterproof Coat Section */}
          <EquipmentRecommendationSection
            id="waterproof-coat-required"
            title="Waterproof Coat (Required)"
            description="Rain is fairly common on a hike and therefore having a waterproof coat is a requirement for our trips. Coats are measured using a rating value called the Hydrostatic Head (HH) which measures how waterproof it is. The higher the number, the more waterproof the coat is. Lots of companies advertise their coats as waterproof when they actually have a fairly low HH rating (~3000mm), a coat can be considered waterproof against heavy rain and extended use when it's HH rating is above 10,000mm and then considered suitable for extreme weather when it's HH rating is above 20,000mm. It's recommended that you have a coat with a HH rating of 10,000mm or greater however these can be expensive and are not necessarily required as long as the coat is somewhat waterproof. The minimum HH rating is 1,500mm which is considered suitable for light showers."
            items={waterproofCoatItems}
          />

          {/* Hiking Trousers Section */}
          <EquipmentRecommendationSection
            id="hiking-trousers"
            title="Hiking Trousers"
            description="You're welcome to wear any trousers on our hikes as long as they're not jeans. We recommend purchasing a pair of hiking trousers, even if they're a cheap pair from Decathlon, however it's not required."
            items={hikingTrousersItems}
          />

          {/* Backpack Section */}
          <EquipmentRecommendationSection
            id="backpack"
            title="Backpack"
            description="You can bring any backpack or no backpack on our hikes, as long as you're carrying at least 1.5 litres of water, a coat, and your lunch. Having a specific hiking backpack would make things easier for you, especially if you're using your uni bag for hiking since everything can get soaked through on a hike and then you're stuck with a wet bag for uni the next day. We don't require you to have a hiking backpack."
            items={backpackItems}
          />

          {/* Additional Equipment Section */}
          <section
            id="additional-equipment"
            className="flex flex-col gap-3 sm:gap-3.5 w-full max-w-[1120px] px-4 sm:px-0"
            aria-labelledby="heading-additional-equipment"
            role="region"
          >
            <header>
              <h2
                id="heading-additional-equipment"
                className="font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-black font-sans leading-tight mb-2 sm:mb-3"
                tabIndex={-1}
              >
                Additional Equipment
              </h2>
              <p className="font-medium text-sm sm:text-base lg:text-[16px] text-black font-sans leading-relaxed max-w-6xl">
                As well as the equipment shown above, we also recommend you bring the following items on our day hikes to make it much more enjoyable for you and safer for everyone else:
              </p>
              <div className="mt-4">
                <ul className="font-medium text-sm sm:text-base lg:text-[16px] text-black font-sans leading-relaxed max-w-6xl list-disc pl-6 space-y-2">
                  <li>Lunch and lots of snacks</li>
                  <li>Plenty of water (Ideally at least 1.5L)</li>
                  <li>Hat and Gloves</li>
                  <li>Spare warm layers</li>
                  <li>Headtorch</li>
                  <li>Waterproof trousers</li>
                </ul>
              </div>
            </header>
          </section>

        </main>
      </div>
    </div>
  );
}