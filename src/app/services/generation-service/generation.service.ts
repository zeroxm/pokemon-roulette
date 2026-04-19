import { Injectable } from '@angular/core';
import { GenerationItem } from '../../interfaces/generation-item';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerationService {

  private readonly STORAGE_KEY = 'pokemon-roulette-generation';

  private generations: GenerationItem[] = [
    { text: 'Gen 1', region: 'Kanto', fillStyle: 'darkred', id: 1, weight: 1 },
    { text: 'Gen 2', region: 'Johto', fillStyle: 'darkorange', id: 2, weight: 1 },
    { text: 'Gen 3', region: 'Hoenn', fillStyle: 'goldenrod', id: 3, weight: 1 },
    { text: 'Gen 4', region: 'Sinnoh', fillStyle: 'darkgreen', id: 4, weight: 1 },
    { text: 'Gen 5', region: 'Unova', fillStyle: 'darkcyan', id: 5, weight: 1 },
    { text: 'Gen 6', region: 'Kalos', fillStyle: 'darkblue', id: 6, weight: 1 },
    { text: 'Gen 7', region: 'Alola', fillStyle: 'indigo', id: 7, weight: 1 },
    { text: 'Gen 8', region: 'Galar', fillStyle: 'purple', id: 8, weight: 1 },
    { text: 'Gen 9', region: 'Paldea', fillStyle: 'darkviolet', id: 9, weight: 1 },
  ];

  private generation: BehaviorSubject<GenerationItem>;

  constructor() {
    const savedId = this.getSavedGenerationId();
    const index = savedId !== null ? this.generations.findIndex(g => g.id === savedId) : -1;
    const initial = index !== -1 ? this.generations[index] : this.generations[0];
    this.generation = new BehaviorSubject<GenerationItem>(initial);
  }

  getGenerationList(): GenerationItem[] {
    return this.generations;
  }

  setGeneration(index: number): void {
    const gen = this.generations[index];
    this.generation.next(gen);
    localStorage.setItem(this.STORAGE_KEY, String(gen.id));
  }

  clearSavedGeneration(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getSavedGenerationId(): number | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === null) return null;
    const id = parseInt(saved, 10);
    return isNaN(id) ? null : id;
  }

  getGeneration(): Observable<GenerationItem> {
    return this.generation.asObservable();
  }

  getCurrentGeneration(): GenerationItem {
    return this.generation.getValue();
  }
}
