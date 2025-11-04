import prisma from "../prismaClient.js";

async function main() {
    const products = [
        {
            name: "AI ChatBox",
            image: "https://images.pexels.com/photos/5476749/pexels-photo-5476749.jpeg",
            description: "An intelligent chat assistant that understands context and provides human-like responses in real time.",
            detailed: "The AI Chatbox is built with cutting-edge language models to help users communicate naturally and get instant, context-aware replies. It can assist in customer support, creative writing, idea generation, and more. With customizable personalities and multilingual support, it feels less like a bot and more like a real conversation partner.",

            feature1: "Natural language conversations",
            feature2: "Supports multiple languages",
            feature3: "Context awareness across sessions",
            price: 200000,
        },
        {
            name: "AI Image Generator",
            image: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
            description: "Create stunning, high-resolution images from simple text prompts within seconds.",
            detailed: "The AI Image Generator harnesses the power of deep diffusion models to turn your imagination into visuals. Whether you're an artist, designer, or content creator, it allows you to generate ultra-realistic or artistic images in various styles—from photorealism to anime and abstract art. All in one click.",

            feature1: "Generate high-res images from text prompts",
            feature2: "Multiple styles and filters",
            feature3: "Custom aspect ratio support",
            price: 250000,
        },
        {
            name: "AI Voice Cloner",
            image: "https://images.pexels.com/photos/164729/pexels-photo-164729.jpeg",
            description: "Clone any voice with near-perfect accuracy and generate lifelike speech instantly.",
            detailed: "The AI Voice Cloner uses advanced neural voice synthesis to replicate the tone, accent, and expression of any speaker. Ideal for podcasting, content creation, and virtual assistants, it provides a natural sound that’s almost indistinguishable from the real voice. All voice data is securely processed with user privacy in mind.",

            feature1: "Clone voice from short sample",
            feature2: "Adjust tone and emotion",
            feature3: "Multi-lingual speech output",
            price: 200000,
        },
        {
            name: "AI Music Composer",
            image: "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg",
            description: "Compose original, high-quality music across genres using advanced AI composition models.",
            detailed: "The AI Music Composer empowers musicians, creators, and hobbyists to generate melodies, harmonies, and full instrumentals effortlessly. With genre-specific styles — from Afrobeat to orchestral symphonies — it intelligently crafts unique soundtracks in seconds. You can tweak tempo, mood, and instruments to match your creative vision, making it the perfect companion for content creators, filmmakers, and artists seeking inspiration.",

            feature1: "Generate melodies and harmonies",
            feature2: "Multiple genres and moods",
            feature3: "Export in MIDI, MP3 formats",
            price: 100000,
        },
        {
            name: "AI Video Creator",
            image: "https://images.pexels.com/photos/799158/pexels-photo-799158.jpeg",
            description: "Turn your ideas or scripts into captivating videos automatically using AI-powered editing and animation tools.",
            detailed: "The AI Video Creator simplifies video production by transforming plain text, voiceovers, or scripts into fully-edited videos. It automatically selects visuals, adds transitions, syncs soundtracks, and can even generate AI avatars or subtitles. Whether for marketing, education, or entertainment, it saves hours of manual editing — delivering professional-grade results in minutes.",


            feature1: "Generate short AI video clips",
            feature2: "Text-to-video transformation",
            feature3: "Add music and transitions",
            price: 500000,
        },
        {
            name: "AI Writing Assistant",
            image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg",
            description: "Boost your writing efficiency with AI that drafts, edits, and improves text intelligently.",
            detailed: "The AI Writing Assistant helps you write faster and better by analyzing your tone, grammar, and clarity in real time. From essays and emails to stories and blog posts, it suggests improvements, generates ideas, and maintains a natural writing flow. Built for students, professionals, and creatives alike, it adapts to your writing style and turns writer’s block into effortless creativity.",

            feature1: "Rewrite or expand text",
            feature2: "Grammar and style suggestions",
            feature3: "Summarization and paraphrasing",
            price: 120000,
        },
    ]

    await prisma.product.createMany({ data: products })
    console.log("Products deployed")

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())