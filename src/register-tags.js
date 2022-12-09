import fs from "fs";

import { loadFromFile } from "./helper.js";

var topLevel = [
  "Action",
  "Adventure",
  "Casual",
  "Experimental",
  "Puzzle",
  "Racing",
  "RPG",
  "Simulation",
  "Sports",
  "Strategy",
  "Tabletop",
];

var genres = [
  "Action RPG",
  "Action RTS",
  "Action-Adventure",
  "Arcade",
  "Auto Battler",
  "Automobile Sim",
  "Base Building",
  "Baseball",
  "Basketball",
  "Battle Royale",
  "BMX",
  "Board Game",
  "Bowling",
  "Building",
  "Card Game",
  "Character Action Game",
  "Chess",
  "Clicker",
  "Cooking",
  "Cycling",
  "Diplomacy",
  "eSports",
  "Experimental",
  "Exploration",
  "Farming",
  "Farming Sim",
  "Fighting",
  "Football",
  "God Game",
  "Golf",
  "Hacking",
  "Hentai",
  "Hidden Object",
  "Hockey",
  "Idler",
  "Interactive Fiction",
  "Job Simulator",
  "Management",
  "Match 3",
  "Medical Sim",
  "Mini Golf",
  "Mining",
  "MMORPG",
  "MOBA",
  "Motocross",
  "Open World",
  "Outbreak Sim",
  "Party-Based RPG",
  "Pinball",
  "Platformer",
  "Point & Click",
  "Rhythm",
  "Roguelike",
  "RTS",
  "Sandbox",
  "Shooter",
  "Skateboarding",
  "Skating",
  "Skiing",
  "Snowboarding",
  "Soccer",
  "Space Sim",
  "Stealth",
  "Strategy RPG",
  "Survival",
  "Tennis",
  "Tile-Matching",
  "Tower Defense",
  "Trivia",
  "Turn-Based Strategy",
  "Visual Novel",
  "Walking Simulator",
  "Word Game",
  "Wrestling",
];

var subGenres = [
  "2D Fighter",
  "2D Platformer",
  "3D Fighter",
  "3D Platformer",
  "4X",
  "Action Roguelike",
  "Arena Shooter",
  "Beat 'em up",
  "Bullet Hell",
  "Card Battler",
  "Choose Your Own Adventure",
  "City Builder",
  "Collectathon",
  "Colony Sim",
  "Combat Racing",
  "Creature Collector",
  "Cricket",
  "CRPG",
  "Dating Sim",
  "Dungeon Crawler",
  "Education",
  "Flight",
  "FPS",
  "Grand Strategy",
  "Hack and Slash",
  "Heist",
  "Hero Shooter",
  "Horror",
  "Hobby Sim",
  "Immersive Sim",
  "Investigation",
  "JRPG",
  "Life Sim",
  "Looter Shooter",
  "Mahjong",
  "Metroidvania",
  "Musou",
  "Mystery Dungeon",
  "On-Rails Shooter",
  "Open World Survival Craft",
  "Political Sim",
  "Precision Platformer",
  "Programming",
  "Puzzle Platformer",
  "Real Time Tactics",
  "Roguelike Deckbuilder",
  "Roguelite",
  "Roguevania",
  "Rugby",
  "Runner",
  "Shoot 'Em Up",
  "Side Scroller",
  "Social Deduction",
  "Snooker",
  "Sokoban",
  "Solitaire",
  "Souls-like",
  "Spectacle fighter",
  "Spelling",
  "Survival Horror",
  "Tactical RPG",
  "Third-Person Shooter",
  "Time Management",
  "Top-Down Shooter",
  "Trading",
  "Trading Card Game",
  "Traditional Roguelike",
  "Turn-Based Tactics",
  "Twin Stick Shooter",
  "Typing",
  "Volleyball",
  "Wargame",
];

var visualsAndViewpoint = [
  "2.5D",
  "2D",
  "360 Video",
  "3D",
  "3D Vision",
  "Abstract",
  "Anime",
  "Cartoon",
  "Cartoony",
  "Cinematic",
  "Colorful",
  "Comic Book",
  "Cute",
  "First-Person",
  "FMV",
  "Hand-drawn",
  "Isometric",
  "Minimalist",
  "Noir",
  "Pixel Graphics",
  "Psychedelic",
  "Realistic",
  "Split Screen",
  "Stylized",
  "Text-Based",
  "Third Person",
  "Top-Down",
  "Voxel",
  "VR",
];

var themesAndMoods = [
  "1980s",
  "1990's",
  "Agriculture",
  "Aliens",
  "Alternate History",
  "America",
  "Atmospheric",
  "Assassin",
  "Bikes",
  "Capitalism",
  "Cats",
  "Cold War",
  "Comic Book",
  "Coding",
  "Conspiracy",
  "Crime",
  "Cyberpunk",
  "Dark",
  "Dark Fantasy",
  "Demons",
  "Destruction",
  "Detective",
  "Dinosaurs",
  "Diplomacy",
  "Dog",
  "Dragons",
  "Dynamic Narration",
  "Dystopian",
  "Economy",
  "Education",
  "Escape Room",
  "Faith",
  "Family Friendly",
  "Fantasy",
  "Foreign",
  "Futuristic",
  "Gambling",
  "Game Development",
  "Gothic",
  "Heist",
  "Historical",
  "Horses",
  "Illuminati",
  "Investigation",
  "Jet",
  "Lemmings",
  "LGBTQ+",
  "Logic",
  "Loot",
  "Lovecraftian",
  "Magic",
  "Management",
  "Mars",
  "Mechs",
  "Medieval",
  "Memes",
  "Military",
  "Modern",
  "Motorbike",
  "Mystery",
  "Mythology",
  "Nature",
  "Narrative",
  "Naval",
  "Ninja",
  "Offroad",
  "Old School",
  "Otome",
  "Parkour",
  "Philosophical",
  "Pirates",
  "Political",
  "Politics",
  "Pool",
  "Post-apocalyptic",
  "Programming",
  "Psychological Horror",
  "Retro",
  "Robots",
  "Romance",
  "Rome",
  "Satire",
  "Science",
  "Sci-fi",
  "Shop Keeper",
  "Sniper",
  "Snow",
  "Space",
  "Spaceships",
  "Stealth",
  "Steampunk",
  "Submarine",
  "Superhero",
  "Supernatural",
  "Surreal",
  "Survival",
  "Swordplay",
  "Tactical",
  "Tanks",
  "Thriller",
  "Time Travel",
  "Trains",
  "Transhumanism",
  "Transportation",
  "Underground",
  "Underwater",
  "Vampire",
  "War",
  "Werewolves",
  "Western",
  "World War I",
  "World War II",
  "Vikings",
  "Zombies",
];

var features = [
  "6DOF",
  "Archery",
  "Artificial Intelligence",
  "Asymmetric VR",
  "ATV",
  "Automation",
  "Base Building",
  "Boss Rush",
  "Boxing",
  "Building",
  "Bullet Time",
  "Character Customization",
  "Choices Matter",
  "Class-Based",
  "Combat",
  "Conversation",
  "Crafting",
  "Deckbuilding",
  "Driving",
  "Fishing",
  "Flight",
  "FMV",
  "Grid-Based Movement",
  "Gun Customization",
  "Hack and Slash",
  "Hacking",
  "Hex Grid",
  "Hunting",
  "Inventory Management",
  "Jump Scare",
  "Level Editor",
  "Linear",
  "Martial Arts",
  "Mining",
  "Moddable",
  "Multiple Endings",
  "Music-Based Procedural Generation",
  "Narration",
  "Naval Combat",
  "Nonlinear",
  "Open World",
  "Perma Death",
  "Physics",
  "Procedural Generation",
  "PvE",
  "PvP",
  "Quick-Time Events",
  "Resource Management",
  "Sailing",
  "Score Attack",
  "Stealth",
  "Story Rich",
  "Tabletop",
  "Team-Based",
  "Text-Based",
  "Time Manipulation",
  "Trading",
  "Turn-Based Combat",
  "Turn-Based Tactics",
  "Tutorial",
  "Vehicular Combat",
  "Female Protagonist",
  "Silent Protagonist",
  "Villain Protagonist",
  "Minigames",
  "Intentionally Awkward Controls",
];

var players = [
  "4 Player Local",
  "Asynchronous Multiplayer",
  "Co-op",
  "Co-op Campaign",
  "Local Co-Op",
  "Local Multiplayer",
  "Massively Multiplayer",
  "Multiplayer",
  "Online Co-Op",
  "Singleplayer",
  "Party Game",
  "Party"
];

var other = [
  "8-bit Music",
  "Based on a Novel",
  "Batman",
  "Documentary",
  "Drama",
  "Dungeons & Dragons",
  "Electronic",
  "Electronic Music",
  "Episodic",
  "Experience",
  "Feature Film",
  "Games Workshop",
  "Indie",
  "Instrumental Music",
  "Lara Croft",
  "LEGO",
  "Mod",
  "Movie",
  "Music",
  "Real-Time",
  "Real-Time with Pause",
  "Reboot",
  "Remake",
  "Rock Music",
  "Sequel",
  "Soundtrack",
  "Star Wars",
  "Time Attack",
  "Turn-Based",
  "Warhammer 40K",
];

var software = [
  "Animation & Modeling",
  "Audio Production",
  "Benchmark",
  "Design & Illustration",
  "GameMaker",
  "Gaming",
  "Photo Editing",
  "RPGMaker",
  "Software",
  "Software Training",
  "Utilities",
  "Video Production",
  "Web Publishing",
];

var assessment = [
  "Addictive",
  "Ambient",
  "Beautiful",
  "Classic",
  "Competitive",
  "Cult Classic",
  "Difficult",
  "Emotional",
  "Epic",
  "Fast-Paced",
  "Funny",
  "Great Soundtrack",
  "Immersive",
  "Lore-Rich",
  "Masterpiece",
  "Nostalgia",
  "Psychological",
  "Relaxing",
  "Replay Value",
  "Short",
  "Parody",
  "Unforgiving",
  "Comedy",
  "Dark Humor",
  "Dark Comedy",
  "Wholesome",
  "Cozy",
  "Philisophical",
  "Well-Written"
];

var ratings = [
  "Blood",
  "Gore",
  "Mature",
  "NSFW",
  "Nudity",
  "Sexual Content",
  "Violent",
];

var hardware = [
  "Controller",
  "Hardware",
  "Mouse only",
  "Steam Machine",
  "Touch-Friendly",
  "TrackIR",
  "Voice Control",
  "VR Only",
];

var fundings = ["Crowdfunded", "Early Access", "Free to Play", "Kickstarter"];

var tags = await loadFromFile("./data/tags.txt", true).catch((err) => {
  console.log(err);
  return [];
});

for (let i = 0; i < tags.length; ++i) {
  let tag = tags[i];
  let added = false;
  let type = [];

  if (topLevel.includes(tag.description)) {
    added = true;
    type.push(0);
  }
  if (genres.includes(tag.description)) {
    added = true;
    type.push(1);
  }
  if (subGenres.includes(tag.description)) {
    added = true;
    type.push(2);
  }
  if (visualsAndViewpoint.includes(tag.description)) {
    added = true;
    type.push(3);
  }
  if (themesAndMoods.includes(tag.description)) {
    added = true;
    type.push(4);
  }
  if (features.includes(tag.description)) {
    added = true;
    type.push(5);
  }
  if (players.includes(tag.description)) {
    added = true;
    type.push(6);
  }
  if (other.includes(tag.description)) {
    added = true;
    type.push(7);
  }
  if (software.includes(tag.description)) {
    added = true;
    type.push(8);
  }
  if (assessment.includes(tag.description)) {
    added = true;
    type.push(9);
  }
  if (ratings.includes(tag.description)) {
    added = true;
    type.push(10);
  }
  if (hardware.includes(tag.description)) {
    added = true;
    type.push(11);
  }
  if (fundings.includes(tag.description)) {
    added = true;
    type.push(12);
  }

  if (added) {
    tag.type = type;
    console.log(`${tag.description} - Passed`);
  } else {
    console.log(`${tag.description} - Failed`);
    break;
  }
}

fs.writeFile("./data/tags.txt", JSON.stringify(tags), (e) => {
  if (e) {
    console.log(e);
  }
});
