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
    { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1, weight: 1 },
    { text: 'Gen 2', region: 'Johto', fillStyle: 'darkorange', id: 2, weight: 1 },
    { text: 'Gen 3', region: 'Hoenn', fillStyle: 'green', id: 3, weight: 1 },
    { text: 'Gen 4', region: 'Sinnoh', fillStyle: 'darkcyan', id: 4, weight: 1 },
    { text: 'Gen 5', region: 'Unova', fillStyle: 'darkblue', id: 5, weight: 1 },
    { text: 'Gen 6', region: 'Kalos', fillStyle: 'purple', id: 6, weight: 1 },
    { text: 'Gen 7', region: 'Alola', fillStyle: 'orchid', id: 7, weight: 1 },
    { text: 'Gen 8', region: 'Galar', fillStyle: 'black', id: 8, weight: 1 },
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
