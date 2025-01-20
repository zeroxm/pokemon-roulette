import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TrainerSpriteService {

  constructor() { }

  trainerSpriteData: { [generation: number]: { [gender: string]: string } } = {
    1: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    2: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    3: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    4: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    5: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    6: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    7: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' },
    8: {male: 'https://archives.bulbagarden.net/media/upload/c/ca/Spr_FRLG_Red.png',
        female: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_FRLG_Leaf.png' }
  }

  getTrainerSprite(generation: number, gender: string): string {
    return this.trainerSpriteData[generation][gender];
  }
}
