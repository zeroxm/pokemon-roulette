import { GymLeader } from "../../../../interfaces/gym-leader";

export const championByGeneration: Record<number, GymLeader[]> = {
    1: [
        {
            name: 'champion.blue.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/FireRed_LeafGreen_Blue.png",
            quotes: [
                "champion.blue.quote1",
                "champion.blue.quote2",
                "champion.blue.quote3"
            ]
        }
    ],
    2: [
        {
            name: 'champion.lance.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Masters_Lance_Dragonite_artwork.png",
            quotes: [
                "champion.lance.quote1",
                "champion.lance.quote2"
            ]
        }
    ],
    3: [
        {
            name: 'champion.steven.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Omega_Ruby_Alpha_Sapphire_Steven.png",
            quotes: [
                "champion.steven.quote1",
                "champion.steven.quote2"
            ]
        }
    ],
    4: [
        {
            name: 'champion.cynthia.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Diamond_Pearl_Cynthia.png",
            quotes: [
                "champion.cynthia.quote1",
                "champion.cynthia.quote2"
            ]
        }
    ],
    5: [
        {
            name: 'champion.iris.name',
            sprite:'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Black_White_Alder.png',
            quotes: [
                "champion.alder.quote1"
            ]
        }
    ],
    6: [
        {
            name: 'champion.diantha.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/XY_Diantha.png",
            quotes: [
                "champion.diantha.quote1"
            ]
        }
    ],
    7: [
        {
            name: 'champion.kukui-hau.name',
            sprite: [
                "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Sun_Moon_Professor_Kukui.png",
                "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/USUM_Hau.png"
            ],
            quotes: [
                "champion.kukui-hau.quote1",
                "champion.kukui-hau.quote2"
            ]
        }
    ],
    8: [
        {
            name: 'champion.leon.name',
            sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/Sword_Shield_Leon.png",
            quotes: [
                "champion.leon.quote1",
                "champion.leon.quote2"
            ]
        }
    ]
}