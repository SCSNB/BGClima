import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductDto, ProductService } from '../../services/product.service';
import { CompareService } from '../../services/compare.service';

interface CalcResult {
  btu: number;
  recommendedClass: number; // e.g. 9000, 12000, 18000, ...
}

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
  form!: FormGroup;
  result: CalcResult | null = null;
  // Радио опции
  purposes = [
    { label: 'Охлаждане и отопление в преходни сезони', value: 'seasonal' },
    { label: 'Охлаждане и основно отопление', value: 'primary' }
  ];

  // BTU filter mapping (dictionary where key is BTU value and value is ID)
  btuFilter: { [key: number]: number } = {
    7000: 1,
    9000: 2,
    10000: 3,
    12000: 4,
    13000: 5,
    14000: 6,
    16000: 7,
    18000: 8,
    20000: 9,
    22000: 10,
    24000: 11,
    30000: 12,
    36000: 13
  };

  // Карти продукти според препоръчителния BTU
  recommendedCards: Array<{
    id: number;
    image: string;
    title: string;
    priceBgn: number;
    priceEur: number;
    oldPriceBgn?: number | null;
    oldPriceEur?: number | null;
    brandText: string;
    badges: { text: string; bg: string; color: string }[];
    specs: { label: string; value: string; icon: string }[];
  }> = [];
  private byId: Record<number, ProductDto> = {};

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private compareService: CompareService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      length: [null, [Validators.required, Validators.min(1), Validators.max(15)]],
      width: [null, [Validators.required, Validators.min(1), Validators.max(15)]],
      height: [null, [Validators.required, Validators.min(2), Validators.max(4)]],
      purpose: ['seasonal', Validators.required],
      energyPrice: [0.22, [Validators.required, Validators.min(0.01)]],
      durationHours: [24, Validators.required]
    });

    // Възстанови предишно състояние, ако има запазено
    this.loadState();

    this.calculate();
    this.form.valueChanges.subscribe(() => {
      this.calculate();
      this.saveState();
    });
  }

  private calculate(): void {
    if (this.form.invalid) { this.result = null; return; }
    const { length, width, purpose } = this.form.value;

    // Изчисляваме площ и прилагаме фактор според предназначението
    const area = (length || 0) * (width || 0); // m2
    const purposeFactor = purpose === 'primary' ? 1.15 : 1.0; // основно отопление изисква ~15% повече
    const effArea = area * purposeFactor;

    // Норми (площ -> BTU клас), по-консервативна препоръка.
    // 9k: до 15/16 кв; 12k: до 24/26 кв; 14/16k: до 38 кв; 18k: до 40/45 кв; 24k: до 50/55 кв
    const ranges: { max: number; btuk: number }[] = [
      { max: 16, btuk: 9000 },
      { max: 26, btuk: 12000 },
      { max: 38, btuk: 14000 }, // 14k и 16k се считат еквивалентни
      { max: 45, btuk: 18000 },
      { max: 55, btuk: 24000 },
      { max: 70, btuk: 30000 },
      { max: Infinity, btuk: 36000 }
    ];

    let recommendedClass = 9000;
    for (const r of ranges) {
      if (effArea <= r.max) { recommendedClass = r.btuk; break; }
    }

    // За визуализация на „Необходим капацитет“ използваме директно BTU класа
    const btu = recommendedClass;

    this.result = { btu, recommendedClass };
    this.loadRecommended(recommendedClass);
    this.saveState();
  }

  private saveState(): void {
    try {
      const state = {
        form: this.form.getRawValue(),
        result: this.result
      };
      localStorage.setItem('calculator_state', JSON.stringify(state));
    } catch {}
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem('calculator_state');
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state?.form) {
        this.form.patchValue(state.form, { emitEvent: false });
      }
      if (state?.result) {
        this.result = state.result;
        if (this.result?.recommendedClass) {
          this.loadRecommended(this.result.recommendedClass);
        }
      }
    } catch {}
  }

  private loadRecommended(recommendedClass: number): void {
    // Get the ID(s) for the recommended class
    let ids = [this.btuFilter[recommendedClass]];
    
    // Special case: If recommended class is 14000, also include 16000
    if (recommendedClass === 14000 && this.btuFilter[16000]) {
      ids.push(this.btuFilter[16000]);
    }

    if (recommendedClass === 16000 && this.btuFilter[14000]) {
      ids.push(this.btuFilter[16000]);
    }
    
    this.productService.getProducts({ page: 1, pageSize: 1000, btuIds: ids }).subscribe({
      next: (response) => {

        this.byId = response.items.reduce((acc: Record<number, ProductDto>, p: ProductDto) => { 
          acc[p.id] = p; 
          return acc; 
        }, {} as Record<number, ProductDto>);
        this.recommendedCards = response.items.map((p: ProductDto) => this.mapToCard(p));
      },
      error: () => {
        this.recommendedCards = [];
      }
    });
  }

  private toEur(amountBgn: number): number {
    const rate = 1.95583;
    return Math.round((amountBgn / rate) * 100) / 100;
  }

  private formatNumber(n: number): string {
    try { return new Intl.NumberFormat('bg-BG').format(n); } catch { return String(n); }
  }

  // Форматиране на етикет за показване на BTU класа
  formatBtuDisplay(val: number): string {
    if (!val) return '';
    if (val === 14000) {
      return `${this.formatNumber(14000)} до ${this.formatNumber(16000)} BTU`;
    }
    return `${this.formatNumber(val)} BTU`;
  }

  private mapToCard(p: ProductDto) {
    const bgn = p.price ?? 0;
    const eur = this.toEur(bgn);
    const oldBgn = p.oldPrice ?? null;
    const oldEur = oldBgn != null ? this.toEur(oldBgn) : null;

    const getAttr = (key: string): string => {
      const normalizedKey = key.trim().toLowerCase();
      if (normalizedKey === 'btu') {
        if (p.btu?.value) {
          const btuMatch = p.btu.value.toString().match(/(\d+(?:\.\d+)?)/);
          if (btuMatch) return Math.round(parseFloat(btuMatch[1]) / 1000).toString();
          return p.btu.value.toString();
        }
        const btuAttr = (p.attributes || []).find(a => (a.attributeKey || '').toLowerCase().includes('btu'));
        if (btuAttr?.attributeValue) {
          const m = btuAttr.attributeValue.toString().match(/(\d+(?:\.\d+)?)/);
          if (m) return Math.round(parseFloat(m[1]) / 1000).toString();
          return btuAttr.attributeValue.toString();
        }
        return '';
      }
      const found = (p.attributes || []).find(a => (a.attributeKey || '').trim().toLowerCase() === normalizedKey);
      return (found?.attributeValue || '').toString();
    };

    const hasWifi = (p.attributes || []).some(a => {
      const key = (a.attributeKey || '').toLowerCase();
      const value = (a.attributeValue || '').toString().toLowerCase().trim();
      return (key.includes('wi-fi') || key.includes('wifi') || key.includes('wi fi')) && key.includes('модул') && (value === 'да' || value === 'da' || value === 'yes' || value === 'true');
    });

    const badges: { text: string; bg: string; color: string }[] = [];
    if (p.isNew) badges.push({ text: 'НОВО', bg: '#F54387', color: '#fff' });
    if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
    if (hasWifi) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

    return {
      id: p.id,
      image: p.imageUrl || 'assets/solar-panel-placeholder.jpg',
      title: p.name,
      priceBgn: bgn,
      priceEur: eur,
      oldPriceBgn: oldBgn,
      oldPriceEur: oldEur,
      brandText: p.brand?.name || '',
      badges,
      specs: [
        { label: 'Мощност', value: getAttr('BTU') || '', icon: 'bolt' },
        { label: 'Клас', value: p.energyClass?.class || getAttr('Клас') || 'A+', icon: 'eco' }
      ]
    };
  }

  // Compare actions
  isCompared(id: number): boolean {
    return this.compareService.isSelected(id);
  }
  onCompareClick(event: MouseEvent, id: number) {
    event.preventDefault();
    event.stopPropagation();
    const product = this.byId[id];
    if (!product) return;
    const res = this.compareService.toggle(product);
    if (!res.ok && res.reason) {
      this.snackBar.open(res.reason, 'OK', { duration: 2500 });
      return;
    }
    const msg = res.selected ? 'Добавено за сравнение' : 'Премахнато от сравнение';
    this.snackBar.open(msg, 'OK', { duration: 1200 });
  }
}
