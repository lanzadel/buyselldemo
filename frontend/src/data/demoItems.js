export function createDemoItems() {
  return [
    { id: 'demo-book-1', sellerLogin: 'alice', title: 'Livre', minPrice: 1500, buyerLogin: null },
    { id: 'demo-book-2', sellerLogin: 'claire', title: 'Livre', minPrice: 1000, buyerLogin: null },
    { id: 'demo-book-3', sellerLogin: 'david', title: 'Livre', minPrice: 2000, buyerLogin: null },
    { id: 'demo-bike', sellerLogin: 'bob', title: 'Vélo', minPrice: 8500, buyerLogin: null },
    { id: 'demo-lamp', sellerLogin: 'claire', title: 'Lampe', minPrice: 2500, buyerLogin: null },
    { id: 'demo-chair', sellerLogin: 'david', title: 'Chaise', minPrice: 3000, buyerLogin: null },
    { id: 'demo-headphones', sellerLogin: 'emma', title: 'Casque audio', minPrice: 4500, buyerLogin: null },
    { id: 'demo-plant', sellerLogin: 'bob', title: 'Plante', minPrice: 0, buyerLogin: null },
    { id: 'demo-camera', sellerLogin: 'emma', title: 'Appareil photo', minPrice: 12000, buyerLogin: 'claire' },
  ];
}
