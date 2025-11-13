import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompareService } from '../../services/compare.service';
import { ProductDto } from '../../services/product.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {
  products: ProductDto[] = [];

  constructor(
    private compareService: CompareService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.products = this.compareService.getAll();
    if (this.products.length < 2) {
      this.snackBar.open('Моля, изберете поне 2 продукта за сравнение.', 'OK', { duration: 2000 });
      this.router.navigate(['/products/1']); // fallback към някоя категория
      return;
    }
    // също се абонираме за промени
    this.compareService.products$.subscribe(list => {
      this.products = list;
      if (list.length < 2) {
        this.router.navigate(['/products/1']);
      }
    });
  }

  remove(id: number) {
    this.compareService.remove(id);
  }

  clear() {
    this.compareService.clear();
  }

  // Извлича акценти от атрибути с ключ "акценти" (case-insensitive)
  getHighlights(p: ProductDto): string[] {
    const attrs = p.attributes || [];
    const items = attrs.filter(a => (a.attributeKey || '').trim().toLowerCase() === 'акценти');
    if (!items.length) return [];
    // Събиране на всички стойности, разделяне по нов ред, ;, | или ,
    const raw = items
      .map(i => i.attributeValue || '')
      .join('\n');
    const parts = raw
      .split(/\r?\n|;|\||,/)
      .map(s => s.trim())
      .filter(Boolean);
    // Премахване на дубликати, запазване на реда
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of parts) {
      if (!seen.has(t)) { seen.add(t); result.push(t); }
    }
    return result;
  }

  // ВЗЕМАНЕ НА АТРИБУТИ ПО КЛЮЧ
  private getAttrExact(p: ProductDto, key: string): string {
    const attrs = p.attributes || [];
    const found = attrs.find(a => (a.attributeKey || '').trim().toLowerCase() === key.trim().toLowerCase());
    return (found?.attributeValue || '').trim();
  }

  private getAttrAny(p: ProductDto, keys: string[]): string {
    for (const k of keys) {
      const v = this.getAttrExact(p, k);
      if (v) return v;
    }
    return '';
  }

  // Извлича максималната стойност от текст във формат "Мин./Ном./Макс".
  // Пример: "0.9/2.5/3.2 kW" -> "3.2 kW"
  private getMaxFromValue(v: string): string {
    if (!v) return '';
    // Нормализиране на разделителите и премахване на излишни интервали
    const parts = v.split('/')
      .map(s => s.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      return parts[parts.length - 1];
    }
    // Ако не е във вид с "/", връщаме оригинала
    return v.trim();
  }

  private getMaxFromAttr(p: ProductDto, key: string): string {
    const v = this.getAttrExact(p, key);
    const max = this.getMaxFromValue(v);
    return max || '';
  }

  // Стойности за редовете под "Описание"
  getBrandName(p: ProductDto): string {
    return p.brand?.name || this.getAttrAny(p, ['марка']) || '-';
  }

  getPower(p: ProductDto): string {
    return this.getAttrAny(p, ['мощност']) || '-';
  }

  getPowerBTU(p: ProductDto): string {
    return p.btu?.value || this.getAttrAny(p, ['мощност (btu)', 'мощност btu', 'btu']) || '-';
  }

  getClass(p: ProductDto): string {
    return p.energyClass?.class || this.getAttrAny(p, ['клас', 'енергиен клас']) || '-';
  }

  getArea(p: ProductDto): string {
    return this.getAttrAny(p, ['подходящ за помещения до']) || '-';
  }

  getCoolingCapacity(p: ProductDto): string {
    const v = this.getMaxFromAttr(p, 'отдавана мощност на охлаждане (мин./ном./макс)');
    return v || '-';
  }

  getHeatingCapacity(p: ProductDto): string {
    const v = this.getMaxFromAttr(p, 'отдавана мощност на отопление (мин./ном./макс)');
    return v || '-';
  }

  getConsumptionCooling(p: ProductDto): string {
    const v = this.getMaxFromAttr(p, 'консумирана мощност на охлаждане (мин./ном./макс)');
    return v || '-';
  }

  getConsumptionHeating(p: ProductDto): string {
    const v = this.getMaxFromAttr(p, 'консумирана мощност на отопление (мин./ном./макс)');
    return v || '-';
  }

  getModel(p: ProductDto): string {
    return p.name || '-';
  }
}
