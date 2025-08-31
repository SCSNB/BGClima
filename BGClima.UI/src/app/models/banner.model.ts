export enum BannerType {
  HeroSlider = 0,    // Главен слайдер
  MainLeft = 1,      // Основен ляв
  TopRight = 2,      // Дясно горе
  MiddleRight = 3,   // Дясно среда
  BottomRight = 4    // Дясно долу
}

export interface Banner {
  id: number;
  name: string;
  imageUrl: string | null;
  targetUrl?: string;
  displayOrder: number;
  isActive: boolean;
  type: BannerType;
}
