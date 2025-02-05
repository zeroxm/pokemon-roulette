import { GymLeader } from "../../../interfaces/gym-leader";

export const rivalByGeneration: Record<number, GymLeader> = {
    1: {   name: 'Blue',
            sprite: "./Spr_B2W2_Blue.png",
            quotes: ["Let's check out our Pokémon! Come on, I'll take you on!"] },
    2: {   name: 'Silver',
            sprite: "./Spr_HGSS_Silver.png",
            quotes: [
                "I too have a good Pokémon. I'll show you what I mean!"
            ] },
    3: {   name: 'Wally',
            sprite: "./Spr_RS_Wally.png",
            quotes: [
                "Please see how much my training has accomplished!"
            ] },
    4: {   name: 'Barry',
            sprite: "./Spr_Pt_Barry.png",
            quotes: [
                "You aren't the only one who's getting tougher! I'll prove it to you! Let's go!"
            ] },
    5: {
            name: 'N',
            sprite: [
                './Spr_B2W2_N.png'
            ],
            quotes: [
                "Let me hear your Pokémon's voice!"
            ]
        },
    6: {
            name: 'Calem/Serena',
            sprite: [
                "./VSCalem_2.png",
                "./VSSerena_2.png"
            ],
            quotes: [
                "I'm a Pokémon Trainer, I want to see things that make Pokémon special.",
                "My Pokémon and I will show you what makes us special!"
            ]
        },
    7: {
            name: 'Gladion',
            sprite: "./VSGladion.png",
            quotes: [
                "Battle me. I won't take no for an answer.",
            ]
        },
    8: {
            name: 'Bede',
            sprite: "./VSBede.png",
            quotes: [
                "It's time to prove I'm a notch above the competition to everyone in the Galar region"
            ]
        },
}