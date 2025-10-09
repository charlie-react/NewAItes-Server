import prisma from "../prismaClient.js";

async function main(){
    const products = [
  {
    name: "AI ChatBox",
    image: "https://images.pexels.com/photos/5476749/pexels-photo-5476749.jpeg", 
    feature1: "Natural language conversations",
    feature2: "Supports multiple languages",
    feature3: "Context awareness across sessions",
    price: 5000,
  },
  {
    name: "AI Image Generator",
    image: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
    feature1: "Generate high-res images from text prompts",
    feature2: "Multiple styles and filters",
    feature3: "Custom aspect ratio support",
    price: 8000,
  },
  {
    name: "AI Voice Cloner",
    image: "https://images.pexels.com/photos/164729/pexels-photo-164729.jpeg",
    feature1: "Clone voice from short sample",
    feature2: "Adjust tone and emotion",
    feature3: "Multi-lingual speech output",
    price: 7000,
  },
  {
    name: "AI Music Composer",
    image: "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg",
    feature1: "Generate melodies and harmonies",
    feature2: "Multiple genres and moods",
    feature3: "Export in MIDI, MP3 formats",
    price: 9000,
  },
  {
    name: "AI Video Creator",
    image: "https://images.pexels.com/photos/799158/pexels-photo-799158.jpeg",
    feature1: "Generate short AI video clips",
    feature2: "Text-to-video transformation",
    feature3: "Add music and transitions",
    price: 12000,
  },
  {
    name: "AI Writing Assistant",
    image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg",
    feature1: "Rewrite or expand text",
    feature2: "Grammar and style suggestions",
    feature3: "Summarization and paraphrasing",
    price: 6000,
  },
]

await prisma.product.createMany({data:products})
console.log("Products deployed")

}

main().catch(e=>console.error(e)).finally(()=>prisma.$disconnect())