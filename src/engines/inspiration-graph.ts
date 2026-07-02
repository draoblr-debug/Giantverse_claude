/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Inspiration Graph: personalities, books, cinema, anime, and games
// resonant with each archetype. 8 archetypes (marked sourced: true) use
// data provided directly by the project team; the other 24 are drafted
// placeholders in the same schema, pending review/replacement.
//
// See rag/inspiration_graph/ in the project's RAG knowledge base for the
// full provenance notes and the Supabase/pgvector schema this can graduate to.

export interface InspirationEntry {
  personalities: string[];
  books: string[];
  cinema: string[];
  anime: string[];
  games: string[];
  sourced: boolean; // true = provided by project team, false = drafted placeholder
}

export const INSPIRATION_GRAPH: { [archetypeId: string]: InspirationEntry } = {
  philosopher: {
    personalities: ["Socrates", "Confucius", "Jiddu Krishnamurti", "Albert Einstein", "A.P.J. Abdul Kalam", "Carl Sagan"],
    books: ["Meditations", "The Republic", "Tao Te Ching", "Bhagavad Gita", "Sophie's World"],
    cinema: ["Stalker", "Ikiru", "12 Angry Men", "The Seventh Seal", "Arrival"],
    anime: ["Frieren", "Mushishi", "Ghost in the Shell", "Vinland Saga"],
    games: ["Journey", "Outer Wilds", "The Talos Principle", "Myst"],
    sourced: true
  },
  technocrat: {
    personalities: ["Deng Xiaoping", "Taiichi Ohno", "Reed Hastings"],
    books: ["The Innovator's Dilemma", "The Toyota Way"],
    cinema: ["Steve Jobs", "The Social Network"],
    anime: ["Dr. Stone"],
    games: ["SimCity"],
    sourced: false
  },
  democrat: {
    personalities: ["Mahatma Gandhi", "Nelson Mandela", "Martin Luther King Jr.", "Abraham Lincoln"],
    books: ["Long Walk to Freedom", "My Experiments with Truth", "The Federalist Papers"],
    cinema: ["Lincoln", "Gandhi", "Selma"],
    anime: ["Legend of the Galactic Heroes", "Fullmetal Alchemist Brotherhood"],
    games: ["Civilization VI", "Democracy 4", "Suzerain"],
    sourced: true
  },
  aristocrat: {
    personalities: ["Queen Elizabeth II", "Prince Shōtoku", "Miyamoto Musashi"],
    books: ["The Remains of the Day", "Bushido: The Soul of Japan"],
    cinema: ["Barry Lyndon", "The Last Samurai"],
    anime: ["Rurouni Kenshin"],
    games: ["Crusader Kings III"],
    sourced: false
  },
  bureaucrat: {
    personalities: ["Otto von Bismarck", "Konosuke Matsushita", "Angela Merkel"],
    books: ["Good to Great", "The Mythical Man-Month"],
    cinema: ["Hidden Figures", "13 Days"],
    anime: ["Legend of the Galactic Heroes"],
    games: ["Frostpunk"],
    sourced: false
  },
  strategist: {
    personalities: ["Sun Tzu", "Chanakya", "Napoleon Bonaparte", "Dwight Eisenhower"],
    books: ["The Art of War", "Arthashastra", "Good Strategy Bad Strategy"],
    cinema: ["The Imitation Game", "Master and Commander", "Oppenheimer"],
    anime: ["Code Geass", "Legend of the Galactic Heroes", "Kingdom"],
    games: ["Chess", "StarCraft II", "Total War", "XCOM 2"],
    sourced: true
  },
  visionary: {
    personalities: ["Leonardo da Vinci", "Walt Disney", "Hayao Miyazaki", "Steve Jobs"],
    books: ["Creativity Inc.", "Leonardo da Vinci", "The War of Art"],
    cinema: ["Dreams", "The Wind Rises", "Interstellar"],
    anime: ["The Wind Rises", "Steins;Gate", "Eureka Seven"],
    games: ["Minecraft", "Dreams", "LittleBigPlanet"],
    sourced: true
  },
  architect: {
    personalities: ["Zaha Hadid", "I.M. Pei", "Antoni Gaudí"],
    books: ["The Fountainhead", "How Buildings Learn"],
    cinema: ["Columbus", "My Architect"],
    anime: ["Laputa: Castle in the Sky"],
    games: ["Townscaper"],
    sourced: false
  },
  judge: {
    personalities: ["Ruth Bader Ginsburg", "Thurgood Marshall", "Sandra Day O'Connor"],
    books: ["To Kill a Mockingbird", "Just Mercy"],
    cinema: ["12 Angry Men", "A Few Good Men"],
    anime: ["Death Note"],
    games: ["Papers, Please"],
    sourced: false
  },
  diplomat: {
    personalities: ["Nelson Mandela", "Kofi Annan", "Jimmy Carter"],
    books: ["Getting to Yes", "Team of Rivals"],
    cinema: ["Bridge of Spies", "Munich"],
    anime: ["Vinland Saga"],
    games: ["Diplomacy"],
    sourced: false
  },
  sage: {
    personalities: ["Confucius", "Lao Tzu", "Rumi"],
    books: ["Tao Te Ching", "The Prophet"],
    cinema: ["Groundhog Day", "Little Buddha"],
    anime: ["Mushishi"],
    games: ["Journey"],
    sourced: false
  },
  reformer: {
    personalities: ["Martin Luther King Jr.", "Susan B. Anthony", "Wangari Maathai"],
    books: ["The Warmth of Other Suns", "Silent Spring"],
    cinema: ["Selma", "Erin Brockovich"],
    anime: ["Fullmetal Alchemist Brotherhood"],
    games: ["Life is Strange"],
    sourced: false
  },
  chancellor: {
    personalities: ["Angela Merkel", "Otto von Bismarck", "Ashoka the Great"],
    books: ["Team of Rivals", "The Prince"],
    cinema: ["Darkest Hour", "The Iron Lady"],
    anime: ["Legend of the Galactic Heroes"],
    games: ["Crusader Kings III"],
    sourced: false
  },
  oracle: {
    personalities: ["Carl Jung", "Nikola Tesla", "Alan Turing"],
    books: ["Thinking, Fast and Slow", "The Structure of Scientific Revolutions"],
    cinema: ["Arrival", "A Beautiful Mind"],
    anime: ["Steins;Gate"],
    games: ["Outer Wilds"],
    sourced: false
  },
  historian: {
    personalities: ["Herodotus", "Ken Burns", "Yuval Noah Harari"],
    books: ["Sapiens", "Guns, Germs, and Steel"],
    cinema: ["Lincoln", "Schindler's List"],
    anime: ["Vinland Saga"],
    games: ["Civilization VI"],
    sourced: false
  },
  custodian: {
    personalities: ["David Attenborough", "Wangari Maathai", "Jane Goodall"],
    books: ["Braiding Sweetgrass", "The Overstory"],
    cinema: ["Princess Mononoke", "My Octopus Teacher"],
    anime: ["Nausicaä"],
    games: ["Spiritfarer"],
    sourced: false
  },
  guardian: {
    personalities: ["Nelson Mandela", "Captain Vikram Batra", "Florence Nightingale", "Mother Teresa", "Arunima Sinha"],
    books: ["Man's Search for Meaning", "The Book of Joy", "Wings of Fire", "The Little Prince"],
    cinema: ["Princess Mononoke", "Grave of the Fireflies", "The Pursuit of Happyness", "The Intouchables"],
    anime: ["Violet Evergarden", "Dororo", "Nausicaä", "Frieren"],
    games: ["The Last Guardian", "Spiritfarer", "Ori and the Blind Forest", "Shadow of the Colossus"],
    sourced: true
  },
  survivor: {
    personalities: ["Ernest Shackleton", "Viktor Frankl", "Bear Grylls", "Malala Yousafzai", "Arunima Sinha"],
    books: ["Endurance", "Man's Search for Meaning", "Into the Wild", "The Road"],
    cinema: ["The Revenant", "Cast Away", "Life of Pi", "127 Hours"],
    anime: ["Attack on Titan", "Made in Abyss", "Vinland Saga"],
    games: ["The Long Dark", "Death Stranding", "This War of Mine", "Subnautica"],
    sourced: true
  },
  builder: {
    personalities: ["J.R.D. Tata", "E. Sreedharan", "Elon Musk", "Brunel"],
    books: ["The Lean Startup", "Zero to One", "Built to Last"],
    cinema: ["Ford v Ferrari", "The Founder"],
    anime: ["Dr. Stone", "Planetes"],
    games: ["Factorio", "Satisfactory", "Cities Skylines"],
    sourced: true
  },
  explorer: {
    personalities: ["Marco Polo", "Ibn Battuta", "Neil Armstrong", "Ernest Shackleton"],
    books: ["Into Thin Air", "The Explorers"],
    cinema: ["The Secret Life of Walter Mitty", "Kon-Tiki"],
    anime: ["A Place Further Than the Universe", "Made in Abyss"],
    games: ["No Man's Sky", "Outer Wilds", "Breath of the Wild"],
    sourced: true
  },
  messenger: {
    personalities: ["Paul Revere", "Alexander Graham Bell", "Guglielmo Marconi"],
    books: ["The Information"],
    cinema: ["The Post"],
    anime: ["A Place Further Than the Universe"],
    games: ["Death Stranding"],
    sourced: false
  },
  navigator: {
    personalities: ["James Cook", "Zheng He", "Sacagawea"],
    books: ["Longitude"],
    cinema: ["Master and Commander"],
    anime: ["One Piece"],
    games: ["Sea of Thieves"],
    sourced: false
  },
  artisan: {
    personalities: ["Michelangelo", "Yayoi Kusama", "Hokusai"],
    books: ["The Craftsman"],
    cinema: ["Jiro Dreams of Sushi"],
    anime: ["Barakamon"],
    games: ["Dreams"],
    sourced: false
  },
  healer: {
    personalities: ["Florence Nightingale", "Paul Farmer", "Elizabeth Blackwell"],
    books: ["When Breath Becomes Air"],
    cinema: ["Patch Adams"],
    anime: ["Cells at Work"],
    games: ["Spiritfarer"],
    sourced: false
  },
  inventor: {
    personalities: ["Thomas Edison", "Nikola Tesla", "Hedy Lamarr"],
    books: ["The Wright Brothers"],
    cinema: ["Hidden Figures"],
    anime: ["Dr. Stone"],
    games: ["Kerbal Space Program"],
    sourced: false
  },
  pathfinder: {
    personalities: ["Lewis and Clark", "Junko Tabei", "Amelia Earhart"],
    books: ["Wild"],
    cinema: ["Into the Wild"],
    anime: ["Made in Abyss"],
    games: ["The Long Dark"],
    sourced: false
  },
  warden: {
    personalities: ["Dian Fossey", "Aldo Leopold", "Jim Corbett"],
    books: ["A Sand County Almanac"],
    cinema: ["Gorillas in the Mist"],
    anime: ["Mushishi"],
    games: ["Firewatch"],
    sourced: false
  },
  scout: {
    personalities: ["Robert Baden-Powell", "Daniel Boone"],
    books: ["Deep Survival"],
    cinema: ["Hunt for the Wilderpeople"],
    anime: ["A Place Further Than the Universe"],
    games: ["Firewatch"],
    sourced: false
  },
  farmer: {
    personalities: ["Norman Borlaug", "Masanobu Fukuoka", "Wangari Maathai"],
    books: ["The One-Straw Revolution"],
    cinema: ["The Biggest Little Farm"],
    anime: ["Silver Spoon"],
    games: ["Stardew Valley"],
    sourced: false
  },
  ranger: {
    personalities: ["Jane Goodall", "Aldo Leopold", "John Muir"],
    books: ["A Sand County Almanac"],
    cinema: ["My Octopus Teacher"],
    anime: ["Nausicaä"],
    games: ["The Long Dark"],
    sourced: false
  },
  storyteller: {
    personalities: ["Hans Christian Andersen", "Chimamanda Ngozi Adichie", "Isao Takahata"],
    books: ["One Thousand and One Nights"],
    cinema: ["Big Fish"],
    anime: ["Mushishi"],
    games: ["What Remains of Edith Finch"],
    sourced: false
  },
  craftsman: {
    personalities: ["Jiro Ono", "George Nakashima", "Steve Jobs"],
    books: ["The Craftsman"],
    cinema: ["Jiro Dreams of Sushi"],
    anime: ["Barakamon"],
    games: ["Kerbal Space Program"],
    sourced: false
  },
};
