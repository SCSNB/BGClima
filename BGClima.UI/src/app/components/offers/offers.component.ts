import { Component } from '@angular/core';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent {
  offers = [
    {
      image: 'assets/product1.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH09KMCG/AOHN09KMCG',
      price: { current: '1499.00 лв.', old: '1629.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '9', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '2.50', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '2.80', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product2.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH07KMCG/AOHN07KMCG',
      price: { current: '1419.00 лв.', old: '1479.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '7', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '2.00', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '2.50', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product3.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH12KMCG/AOHN12KMCG',
      price: { current: '1729.00 лв.', old: '1749.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '12', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '3.40', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '4.00', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product4.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH14KMCG/AOHN14KMCG',
      price: { current: '2239.00 лв.', old: '2379.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '14', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '4.20', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '5.40', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product5.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH16KMCG/AOHN16KMCG',
      price: { current: '2599.00 лв.', old: '2699.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '16', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '5.00', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '6.00', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product6.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH18KMCG/AOHN18KMCG',
      price: { current: '2999.00 лв.', old: '3199.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '18', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '6.00', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '7.00', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product7.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH20KMCG/AOHN20KMCG',
      price: { current: '3399.00 лв.', old: '3599.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '20', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '7.00', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '8.00', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    },
    {
      image: 'assets/product8.png',
      badges: [
        { text: 'НОВО', bg: '#F54387', color: '#fff' },
        { text: 'WiFi Вграден модул', bg: '#3B82F6', color: '#fff' },
        { text: 'Йоно-дезодориращ филтър', bg: '#3B82F6', color: '#fff' }
      ],
      title: 'Инверторен климатик стенен General Fujitsu ASHH24KMCG/AOHN24KMCG',
      price: { current: '3999.00 лв.', old: '4299.00 лв.' },
      brand: { logo: 'assets/general_logo.svg', text: 'GENERAL Fujitsu General Limited' },
      specs: [
        { label: 'Мощност', value: '24', icon: 'assets/power.svg', color: '#A855F7' },
        { label: 'Клас', value: 'A++', icon: 'assets/leaf.svg', color: '#10B981' },
        { label: 'Охлаждане', value: '9.00', icon: 'assets/snowflake.svg', color: '#00BFFF' },
        { label: 'Отопление', value: '10.00', icon: 'assets/sun.svg', color: '#FDBA74' }
      ]
    }
  ];
}
