import { Injectable } from '@angular/core';
import { GenerationItem } from '../../interfaces/generation-item';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerationService {

  constructor() {
  }

  private generations: GenerationItem[] = [
    { text: 'Gen 1', region: 'Kanto', fillStyle: '#b71c1c', id: 1, weight: 1 },
    { text: 'Gen 2', region: 'Johto', fillStyle: '#c65100', id: 2, weight: 1 },
    { text: 'Gen 3', region: 'Hoenn', fillStyle: '#8d6e00', id: 3, weight: 1 },
    { text: 'Gen 4', region: 'Sinnoh', fillStyle: '#2e7d32', id: 4, weight: 1 },
    { text: 'Gen 5', region: 'Unova', fillStyle: '#006064', id: 5, weight: 1 },
    { text: 'Gen 6', region: 'Kalos', fillStyle: '#0d47a1', id: 6, weight: 1 },
    { text: 'Gen 7', region: 'Alola', fillStyle: '#283593', id: 7, weight: 1 },
    { text: 'Gen 8', region: 'Galar', fillStyle: '#6a1b9a', id: 8, weight: 1 },
    { text: 'Gen 9', region: 'Paldea', fillStyle: '#880e4f', id: 9, weight: 1 },
  ];

  private generation = new BehaviorSubject<GenerationItem>(this.generations[0]);

  getGenerationList(): GenerationItem[] {
    return this.generations;
  }

  setGeneration(index: number): void {
    this.generation.next(this.generations[index]);
  }

  getGeneration(): Observable<GenerationItem> {
    return this.generation.asObservable();
  }

  getCurrentGeneration(): GenerationItem {
    return this.generation.getValue();
  }
}
