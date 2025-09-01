import { GymLeader } from "../../../../interfaces/gym-leader";

export const championByGeneration: Record<number, GymLeader[]> = {
    1: [
        {
            name: 'Blue',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/FireRed_LeafGreen_Blue.png",
            quotes: [
                "My teams can beat any Pokémon type.",
                "And now… I am the Pokémon League Champion!",
                "I'll tell you. I am the most powerful Trainer in the world!"
            ]
        }
    ],
    2: [
        {
            name: 'Lance',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Masters_Lance_Dragonite_artwork.png",
            quotes: [
                "As the most powerful Trainer and as the Pokémon League Champion…",
                "I, Lance the dragon master, accept your challenge!"
            ]
        }
    ],
    3: [
        {
            name: 'Steven',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Omega_Ruby_Alpha_Sapphire_Steven.png",
            quotes: [
                "Traveling this rich land of Hoenn… Has it awoken something inside you?",
                "I want you to come at me with all that you've learned."
            ]
        }
    ],
    4: [
        {
            name: 'Cynthia',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Diamond_Pearl_Cynthia.png",
            quotes: [
                "I'm so glad that you're the one who's challenging me today!",
                "I will accept your challenge with everything I've got!"
            ]
        }
    ],
    5: [
        {
            name: 'Alder',
            sprite:'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Black_White_Alder.png',
            quotes: [
                "I've really been looking forward to deciding who's the strongest Pokémon Trainer in the Unova region! Kiai!"
            ]
        }
    ],
    6: [
        {
            name: 'Diantha',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/XY_Diantha.png",
            quotes: [
                "I can't wait to see what you and your Pokémon are capable of now that I know exactly what it is you've done already!"
            ]
        }
    ],
    7: [
        {
            name: 'Professor Kukui/Hau',
            sprite: [
                "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Sun_Moon_Professor_Kukui.png",
                "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/USUM_Hau.png"
            ],
            quotes: [
                "I don't really wanna be the Champion of the Pokémon League I made myself, but there's nothing wrong with wanting to take on the biggest and baddest Trainer there is, right?",
                "I really wanna have a serious battle against you! I really want to be able to win against you!"
            ]
        }
    ],
    8: [
        {
            name: 'Leon',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Sword_Shield_Leon.png",
            quotes: [
                "The time has come for you to battle it out until only the greatest challenger remains!",
                "So, on behalf of the chairman, allow me to say... let the Finals matches begin!"
            ]
        }
    ]
}