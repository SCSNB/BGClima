import { Component, OnInit } from '@angular/core';
import { ProductDto, ProductService } from '../../services/product.service';
import { CompareService } from '../../services/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  featured: Array<{
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

  // Оригинални продукти за бърз достъп по id (за CompareService.toggle)
  private byId: Record<number, ProductDto> = {};

  constructor(
    private productService: ProductService,
    private compareService: CompareService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      const items = products.filter(p => !!p.isFeatured);
      const top = items.slice(0, 8);
      // попълни карта по id за последваща работа с CompareService
      this.byId = top.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<number, ProductDto>);
      this.featured = top.map(p => this.mapToCard(p));
    });
  }

  private mapToCard(p: ProductDto) {
    const bgn = p.price ?? 0;
    const eur = this.toEur(bgn);
    const oldBgn = p.oldPrice ?? null;
    const oldEur = oldBgn != null ? this.toEur(oldBgn) : null;

    const getAttr = (key: string): string => {
      const normalizedKey = key.trim().toLowerCase();
      
      // Special handling for BTU to check btu.value first
      if (normalizedKey === 'btu') {
        // First check if we have btu value directly on the product
        if (p.btu?.value) {
          // Extract the numeric part from the BTU string (e.g., '9000 BTU' -> '9000')
          const btuMatch = p.btu.value.toString().match(/(\d+(\.\d+)?)/);
          if (btuMatch) {
            const btuValue = parseFloat(btuMatch[0]);
            // Always show as whole number (e.g., 9000 -> 9, 12000 -> 12)
            return Math.round(btuValue / 1000).toString();
          }
          return p.btu.value; // Return as is if we can't parse the number
        }
        
        // Fallback to attributes if btu is not set directly
        const btuAttr = (p.attributes || []).find(a => {
          const attrKey = (a.attributeKey || '').trim().toLowerCase();
          return attrKey === 'btu' || attrKey === 'btu/h' || attrKey === 'btu\/h' || attrKey.includes('btu');
        });
        
        if (btuAttr?.attributeValue) {
          const attrValue = btuAttr.attributeValue.toString();
          // Try to extract numeric value from the attribute (e.g., '9000 BTU' -> '9000')
          const btuMatch = attrValue.match(/(\d+(\.\d+)?)/);
          if (btuMatch) {
            const btuValue = parseFloat(btuMatch[0]);
            // Always show as whole number (e.g., 9000 -> 9, 12000 -> 12)
            return Math.round(btuValue / 1000).toString();
          }
          return attrValue; // Return as is if we can't parse the number
        }
        return '';
      }
      
      // Handle cooling and heating values with Min/Nom/Max format
      if (normalizedKey === 'охлаждане' || normalizedKey === 'отопление') {
        const attrKey = normalizedKey === 'охлаждане' 
          ? 'Отдавана мощност на охлаждане (Мин./Ном./Макс)' 
          : 'Отдавана мощност на отопление (Мин./Ном./Макс)';
        
        // Try to find the attribute with the full key first
        const found = (p.attributes || []).find(a => 
          (a.attributeKey || '').trim() === attrKey
        );
        
        if (found?.attributeValue) {
          const value = found.attributeValue.toString();
          // Try to extract max value from Min/Nom/Max format
          const matches = value.match(/(\d+[\.,]?\d*)/g);
          if (matches && matches.length >= 3) {
            const values = matches.map(v => parseFloat(v.replace(',', '.')));
            const max = Math.max(...values);
            // Format with comma as decimal separator and remove trailing .0 if any
            return max.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
          }
          return value; // Return original if parsing fails
        }
      }
      
      // Default attribute lookup for other keys
      const found = (p.attributes || []).find(a => (a.attributeKey || '').trim().toLowerCase() === normalizedKey);
      return (found?.attributeValue || '').toString();
    };

    // Check for Wi-Fi module with flexible matching
    const hasWifi = (p.attributes || []).some(a => {
      const key = (a.attributeKey || '').toLowerCase();
      const value = (a.attributeValue || '').toString().toLowerCase().trim();
      
      // Check if this is a Wi-Fi module attribute and the value is 'да' (case insensitive)
      return (key.includes('wi-fi') || key.includes('wifi') || key.includes('wi fi')) && 
             key.includes('модул') && 
             (value === 'да' || value === 'da' || value === 'yes' || value === 'true');
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
      specs: (() => {
        const btuStr = (getAttr('BTU') || '').toString();
        const btuThousands = parseInt(btuStr.replace(/\D+/g, ''), 10) || 0;
        return [
          { label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '', icon: 'bolt' },
          { label: 'Клас', value: p.energyClass?.class || getAttr('Клас') || 'A+', icon: 'eco' },
          { label: 'Охлаждане', value: getAttr('Охлаждане') || '', icon: 'ac_unit' },
          { label: 'Отопление', value: getAttr('Отопление') || '', icon: 'wb_sunny' }
        ];
      })()
    };
  }

  private toEur(amountBgn: number): number {
    const rate = 1.95583;
    return Math.round((amountBgn / rate) * 100) / 100;
  }

  // === Compare actions ===
  isCompared(id: number): boolean {
    return this.compareService.isSelected(id);
  }

  onCompareClick(event: MouseEvent, id: number) {
    // предотвратяване на навигацията от линка на картата
    event.preventDefault();
    event.stopPropagation();
    const product = this.byId[id];
    if (!product) {
      return;
    }
    const res = this.compareService.toggle(product);
    if (!res.ok && res.reason) {
      this.snackBar.open(res.reason, 'OK', { duration: 2500 });
      return;
    }
    const msg = res.selected ? 'Добавено за сравнение' : 'Премахнато от сравнение';
    this.snackBar.open(msg, 'OK', { duration: 1200 });
  }
}
