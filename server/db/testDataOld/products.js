const products = [
  {
    guid: 'fd99387c-33d9-c78a-ba29-0286576ddce5',
    name: 'FREKVENS',
    category: 'Bar furniture',
    price: '265',
    description: 'Bar table, in/outdoor, 51x51 cm',
    designer: 'Nicholai Wiig Hanse',
  },
  {
    guid: '56d916ec-e6b5-0e62-9330-0248c6792316',
    name: 'NORDVIKEN',
    category: 'Bar furniture',
    price: '995',
    description: 'Bar table, 140x80 cm',
    designer: 'Francis Cayouett',
  },
  {
    guid: 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea',
    name: 'NORDVIKEN / NORDVIKEN',
    category: 'Bar furniture',
    price: '2095',
    description: 'Bar table and 4 bar stools',
    designer: 'Francis Cayouett',
  },
  {
    guid: '467e51d7-1659-d2e4-12cb-c64a0d19ecb4',
    name: 'STIG',
    category: 'Bar furniture',
    price: '69',
    description: 'Bar stool with backrest, 74 cm',
    designer: 'Henrik Preut',
  },
  {
    guid: '655b86b4-3d2a-1bfd-387f-77b7f77ca6c1',
    name: 'NORBERG',
    category: 'Bar furniture',
    price: '225',
    description: 'Wall-mounted drop-leaf table, 74x60 cm',
    designer: 'Marcus Arvone',
  },
  {
    guid: '085ffadd-146b-fcfd-91e5-ca4e50e034c9',
    name: 'INGOLF',
    category: 'Bar furniture',
    price: '345',
    description: 'Bar stool with backrest, 63 cm',
    designer: 'Carina Beng',
  },
  {
    guid: 'b34cfdde-5b2b-6ecc-b205-b292f3778a1f',
    name: 'FRANKLIN',
    category: 'Bar furniture',
    price: '129',
    description: 'Bar stool with backrest, foldable, 63 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '02e90226-87d1-3c2c-922d-43682e6b6a80',
    name: 'DALFRED',
    category: 'Bar furniture',
    price: '195',
    description: 'Bar stool, 63-74 cm',
    designer: 'Sarah Fage',
  },
  {
    guid: '71f8811f-fe2d-0608-24e4-aafe3c7c3d14',
    name: 'FRANKLIN',
    category: 'Bar furniture',
    price: '129',
    description: 'Bar stool with backrest, foldable, 63 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '003cfb2f-6e16-c274-fc0e-29c252101a96',
    name: 'EKEDALEN / EKEDALEN',
    category: 'Bar furniture',
    price: '2176',
    description: 'Bar table and 4 bar stools',
    designer: 'EhlÃ©n Johansso',
  },
  {
    guid: 'a78f0737-89cc-0f8a-9a0d-e8c6e273eab1',
    name: 'BRIMNES',
    category: 'Beds',
    price: '795',
    description: 'Bed frame w storage and headboard, 140x200 cm',
    designer: 'K Hagberg/M Hagberg/IKEA of Swede',
  },
  {
    guid: '1442e20e-80ea-aaea-6c88-2006fb5aab51',
    name: 'NEIDEN',
    category: 'Beds',
    price: '99',
    description: 'Bed frame, 90x200 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: '89f5aff1-e712-49f5-5e15-cff7c7645586',
    name: 'LEIRVIK',
    category: 'Beds',
    price: '1195',
    description: 'Bed frame, 180x200 cm',
    designer: 'IKEA of Sweden/Carina Beng',
  },
  {
    guid: '51148054-1df2-9f84-4d39-e4a81cf67b54',
    name: 'NEIDEN',
    category: 'Beds',
    price: '199',
    description: 'Bed frame, 140x200 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: 'a2d45cb9-d09d-ba7a-96f6-56c1a34060e9',
    name: 'HEMNES',
    category: 'Beds',
    price: '675',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/Carina Beng',
  },
  {
    guid: 'f72475e8-f0e0-f5c8-54c6-0d9d186c7192',
    name: 'SLATTUM',
    category: 'Beds',
    price: '595',
    description: 'Upholstered bed frame, 140x200 cm',
    designer: 'David Wah',
  },
  {
    guid: '2f37aa0c-f1ef-f848-9a93-5be24fabb39a',
    name: 'NEIDEN',
    category: 'Beds',
    price: '199',
    description: 'Bed frame, 90x200 cm',
    designer: 'Jon Karlsson/IKEA of Swede',
  },
  {
    guid: 'fa5de624-bd79-ad74-4724-929e6b7157fc',
    name: 'SAGSTUA',
    category: 'Beds',
    price: '545',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/Paulin Machad',
  },
  {
    guid: '96c56ab6-e5ff-b0b1-03d9-a36b5f92fe7a',
    name: 'BRIMNES',
    category: 'Beds',
    price: '575',
    description: 'Bed frame with storage, 90x200 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '534e5402-e20c-0ef2-6cbf-149c70d9ed40',
    name: 'ASKVOLL',
    category: 'Beds',
    price: '445',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/K Hagberg/M Hagber',
  },
  {
    guid: '98f75cab-7289-50e3-0121-b1daba2395b8',
    name: 'BRIMNES',
    category: 'Beds',
    price: '795',
    description: 'Bed frame w storage and headboard, 140x200 cm',
    designer: 'K Hagberg/M Hagberg/IKEA of Swede',
  },
  {
    guid: '4efd05fa-24d6-0142-722f-b12a15eec8d9',
    name: 'NEIDEN',
    category: 'Beds',
    price: '99',
    description: 'Bed frame, 90x200 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: '662fe320-734a-dcc7-5909-1c83ce35e59a',
    name: 'LEIRVIK',
    category: 'Beds',
    price: '1195',
    description: 'Bed frame, 180x200 cm',
    designer: 'IKEA of Sweden/Carina Beng',
  },
  {
    guid: 'aeaaab1a-ee7b-11fb-a76d-3d450a3061fc',
    name: 'NEIDEN',
    category: 'Beds',
    price: '199',
    description: 'Bed frame, 140x200 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: '3dd3234b-a165-6c97-e7ce-6ebb2b8858f6',
    name: 'HEMNES',
    category: 'Beds',
    price: '675',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/Carina Beng',
  },
  {
    guid: '55b3a22e-bbdf-96d8-4f18-ab26263fd836',
    name: 'SLATTUM',
    category: 'Beds',
    price: '595',
    description: 'Upholstered bed frame, 140x200 cm',
    designer: 'David Wah',
  },
  {
    guid: '2a0a0f79-d58c-c17f-2d0a-9674bacfface',
    name: 'NEIDEN',
    category: 'Beds',
    price: '199',
    description: 'Bed frame, 90x200 cm',
    designer: 'Jon Karlsson/IKEA of Swede',
  },
  {
    guid: '448fa9ea-c3b9-bc75-0d24-0948b18b6a54',
    name: 'SAGSTUA',
    category: 'Beds',
    price: '545',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/Paulin Machad',
  },
  {
    guid: '8578cafd-d7af-95da-927a-8c5af2179671',
    name: 'BRIMNES',
    category: 'Beds',
    price: '575',
    description: 'Bed frame with storage, 90x200 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '9c076b30-5ecc-3c5b-2293-4f78cdbeaf21',
    name: 'ASKVOLL',
    category: 'Beds',
    price: '445',
    description: 'Bed frame, 140x200 cm',
    designer: 'IKEA of Sweden/K Hagberg/M Hagber',
  },
  {
    guid: 'ac74c906-571e-85e3-cd0b-c1c6ca444318',
    name: 'GLASSVIK',
    category: 'Cabinets & cupboards',
    price: '175',
    description: 'Glass door, 60x38 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'b1b51428-6873-1892-950a-2e56a731c55c',
    name: 'KALLAX',
    category: 'Cabinets & cupboards',
    price: '250',
    description: 'Shelving unit, 77x147 cm',
    designer: 'Tord Bjarklun',
  },
  {
    guid: 'b9e23847-3fd8-6bab-c21a-396003e55b88',
    name: 'EKET',
    category: 'Cabinets & cupboards',
    price: '311',
    description: 'Cabinet combination with legs, 70x35x80 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: '1bb49345-a2ad-1764-3dc6-3219262c42bf',
    name: 'IVAR',
    category: 'Cabinets & cupboards',
    price: '295',
    description: 'Cabinet, 80x30x83 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '624d3419-49a8-123b-de7c-3ef019ab7784',
    name: 'LOMMARP',
    category: 'Cabinets & cupboards',
    price: '1116',
    description: 'Cabinet with glass doors, 86x199 cm',
    designer: 'Francis Cayouett',
  },
  {
    guid: '260045d5-fe59-b6db-cc6c-01118c38e2a1',
    name: 'DETOLF',
    category: 'Cabinets & cupboards',
    price: '295',
    description: 'Glass-door cabinet, 43x163 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '4fdcd87f-fb9f-16dd-4542-ed525e525fec',
    name: 'KALLAX',
    category: 'Cabinets & cupboards',
    price: '500',
    description: 'Shelving unit with 4 inserts, 77x147 cm',
    designer: 'Tord Bjarklun',
  },
  {
    guid: '1b8063e6-5053-72c0-73be-e8361549f26e',
    name: 'BILLY / OXBERG',
    category: 'Cabinets & cupboards',
    price: '315',
    description: 'Bookcase with doors, 80x30x106 cm',
    designer: 'Gillis Lundgre',
  },
  {
    guid: '36795daa-975d-4ee5-be92-f3d29f44ea51',
    name: 'SYVDE',
    category: 'Cabinets & cupboards',
    price: '595',
    description: 'Cabinet with glass doors, 100x123 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '697320cd-1ddf-5a95-db5f-1eed588d1485',
    name: 'EKET',
    category: 'Cabinets & cupboards',
    price: '377',
    description: 'Cabinet combination with feet, 70x25x107 cm',
    designer: 'Jon Karlsson/IKEA of Swede',
  },
  {
    guid: 'fa79198c-d471-018d-1498-deba88a184ef',
    name: 'INGOLF',
    category: 'Chairs',
    price: '195',
    description: 'Chair',
    designer: 'Carina Beng',
  },
  {
    guid: '9bd54fe9-d85b-19dd-c130-ba09a056c437',
    name: 'KARLJAN',
    category: 'Chairs',
    price: '125',
    description: 'Chair',
    designer: 'Francis Cayouett',
  },
  {
    guid: 'e4213165-fdcd-9298-0114-76abdd7a75a5',
    name: 'BLECKBERGET',
    category: 'Chairs',
    price: '250',
    description: 'Swivel chair',
    designer: 'Francis Cayouett',
  },
  {
    guid: '6769c815-2918-25ef-f841-72bea3874047',
    name: 'REMSTA',
    category: 'Chairs',
    price: '795',
    description: 'Armchair',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'a69c4057-b654-170e-c86f-a086886633dd',
    name: 'STOCKSUND',
    category: 'Chairs',
    price: '995',
    description: 'Bench',
    designer: 'Nike Karlsso',
  },
  {
    guid: 'ae5a7a1a-ad74-e20d-83ca-df938c684b11',
    name: 'INGOLF',
    category: 'Chairs',
    price: '175',
    description: 'Stool',
    designer: 'Carina Beng',
  },
  {
    guid: '75dd7891-8fbf-c8b1-d2ff-58a532a7dce7',
    name: 'FLINTAN',
    category: 'Chairs',
    price: '245',
    description: 'Office chair',
    designer: 'Henrik Preut',
  },
  {
    guid: 'f017451a-59c7-81b2-cdc0-87aaeed41d98',
    name: 'IKEA PS GULLHOLMEN',
    category: 'Chairs',
    price: '295',
    description: 'Rocking-chair',
    designer: 'Maria Vink',
  },
  {
    guid: 'd0b90cb1-b127-2127-2ec3-76762d0df2f6',
    name: 'MARKUS',
    category: 'Chairs',
    price: '795',
    description: 'Office chair',
    designer: 'Henrik Preut',
  },
  {
    guid: 'c8dab26b-6a08-4906-e295-f336e57236ef',
    name: 'BEKVAM',
    category: 'Chairs',
    price: '59',
    description: 'Step stool, 50 cm',
    designer: 'Nike Karlsso',
  },
  {
    guid: '34d8f0f3-1652-f249-d950-f2cda79f9ec3',
    name: 'JONAXEL',
    category: 'Chests of drawers & drawer units',
    price: '135',
    description: 'Frame with mesh baskets, 25x51x70 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '783cb406-038d-1125-a791-7242f7ee157c',
    name: 'BRYGGJA',
    category: 'Chests of drawers & drawer units',
    price: '1295',
    description: 'Chest of 9 drawers, 118x92 cm',
    designer: 'Ola Wihlbor',
  },
  {
    guid: '71000181-574d-df9e-ae13-9a0f18c74d49',
    name: 'HELMER',
    category: 'Chests of drawers & drawer units',
    price: '175',
    description: 'Drawer unit on castors, 28x69 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'b7f71334-9585-f357-1c0e-74887816e8b7',
    name: 'PLATSA',
    category: 'Chests of drawers & drawer units',
    price: '443',
    description: 'Chest of 2 drawers, 60x42x91 cm',
    designer: 'IKEA of Sweden/Ola Wihlbor',
  },
  {
    guid: 'ff3df96d-446b-48c6-5976-21c3bed56ab0',
    name: 'LENNART',
    category: 'Chests of drawers & drawer units',
    price: '49',
    description: 'Drawer unit',
    designer: 'Jon Karlsso',
  },
  {
    guid: 'd5172b57-f80f-c7e0-7a7b-6be8e4ac18f0',
    name: 'MALM',
    category: 'Chests of drawers & drawer units',
    price: '555',
    description: 'Chest of 6 drawers, 160x78 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '90858ffa-a85f-292c-fc30-0e0ff690428d',
    name: 'RAST',
    category: 'Chests of drawers & drawer units',
    price: '139',
    description: 'Chest of 3 drawers, 62x70 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'c876e746-2451-c0ac-9a6d-040dd371793e',
    name: 'SONGESAND',
    category: 'Chests of drawers & drawer units',
    price: '695',
    description: 'Chest of 6 drawers, 161x81 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '3590f6b0-d806-376b-4f6e-c145d5fbae4e',
    name: 'MALM',
    category: 'Chests of drawers & drawer units',
    price: '295',
    description: 'Chest of 3 drawers, 80x78 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'bb405725-f3fa-f5db-215f-1068893f6daf',
    name: 'KOPPANG',
    category: 'Chests of drawers & drawer units',
    price: '395',
    description: 'Chest of 3 drawers, 90x83 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '84152b58-8b87-31a0-5580-fd894be80e41',
    name: 'FREKVENS',
    category: 'Tables & desks',
    price: '101.5',
    description: 'Side table, 66x32 cm',
    designer: 'Jon Karlsso',
  },
  {
    guid: 'a451fbc8-e82a-4af7-cb9e-d4bee9e12415',
    name: 'STOCKHOLM',
    category: 'Tables & desks',
    price: '995',
    description: 'Coffee table, 180x59 cm',
    designer: 'Ola Wihlbor',
  },
  {
    guid: '056c5537-d7da-be46-b917-02a9d8605081',
    name: 'ALEX',
    category: 'Tables & desks',
    price: '200',
    description: 'Add-on unit, 120x10 cm',
    designer: 'Johanna Asshof',
  },
  {
    guid: 'da5ba7f4-1a2d-99aa-7838-e04e0f27f829',
    name: 'LINNMON / ALEX',
    category: 'Tables & desks',
    price: '550',
    description: 'Table, 150x75 cm',
    designer: 'IKEA of Sweden/Johanna Asshof',
  },
  {
    guid: '67f88f13-de43-7a28-5571-175b773f243c',
    name: 'MELLTORP / ADDE',
    category: 'Tables & desks',
    price: '359',
    description: 'Table and 4 chairs, 125 cm',
    designer: 'Marcus Arvonen/Lisa Norinde',
  },
  {
    guid: 'cf2ea24b-cb2b-7388-9118-d51044cd7db6',
    name: 'HEMNES',
    category: 'Tables & desks',
    price: '595',
    description: 'Dressing table with mirror, 100x50 cm',
    designer: 'Carina Beng',
  },
  {
    guid: 'e1ed5665-38f3-10de-dd20-4fd6aa8118f5',
    name: 'LINNMON / ADILS',
    category: 'Tables & desks',
    price: '300',
    description: 'Table, 200x60 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'e3c1e74c-23e1-dbf9-30dc-b9e6d1b4277f',
    name: 'ALEX',
    category: 'Tables & desks',
    price: '795',
    description: 'Desk, 131x60 cm',
    designer: 'Johanna Asshof',
  },
  {
    guid: 'ef930011-8ad8-b1eb-38a3-3a70cf8036cd',
    name: 'BURVIK',
    category: 'Tables & desks',
    price: '129',
    description: 'Side table, 38 cm',
    designer: 'Mikael Axelsso',
  },
  {
    guid: 'e0f850c7-2688-9bc3-18d1-d66ff5c141e2',
    name: 'LIATORP',
    category: 'Tables & desks',
    price: '445',
    description: 'Console table, 133x37 cm',
    designer: 'Carina Beng',
  },
  {
    guid: '67fa35cc-8825-3082-604a-0491f39dcda1',
    name: 'PAX / FORSAND/VIKEDAL',
    category: 'Wardrobes',
    price: '1195',
    description: 'Wardrobe combination, 150x60x201 cm',
    designer: 'IKEA of Sweden/EhlÃ©n Johansso',
  },
  {
    guid: '02f81586-659e-cfc6-3aaf-01194c0fc9d3',
    name: 'PLATSA',
    category: 'Wardrobes',
    price: '1259',
    description: 'Wardrobe with 2 doors+3 drawers, 160x42x181 cm',
    designer: 'Ola Wihlborg/IKEA of Swede',
  },
  {
    guid: 'ddd5629b-d202-ccbd-b66c-d1330162722b',
    name: 'PLATSA',
    category: 'Wardrobes',
    price: '892',
    description: 'Wardrobe with 3 doors, 140x42x161 cm',
    designer: 'IKEA of Sweden/Ola Wihlbor',
  },
  {
    guid: 'b0d68d70-819b-6a86-f05b-803c66500754',
    name: 'KLEPPSTAD',
    category: 'Wardrobes',
    price: '449',
    description: 'Wardrobe with 3 doors, 117x176 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '9af15c25-efb7-b314-6b67-3abdaf00949d',
    name: 'BRIMNES',
    category: 'Wardrobes',
    price: '645',
    description: 'Wardrobe with 3 doors, 117x190 cm',
    designer: 'K Hagberg/M Hagber',
  },
  {
    guid: '36916091-6f73-3a2c-ef19-5a2903e812b3',
    name: 'KLEPPSTAD',
    category: 'Wardrobes',
    price: '349',
    description: 'Wardrobe with 2 doors, 79x176 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: '0167d319-823d-faf3-78b8-cff389a91f77',
    name: 'PLATSA',
    category: 'Wardrobes',
    price: '2740',
    description: 'Wardrobe with 7 doors+3 drawers, 240x57x221 cm',
    designer: 'IKEA of Swede',
  },
  {
    guid: 'b4ba2748-8f0e-3053-c0dc-ba84ffc27e2f',
    name: 'VUKU',
    category: 'Wardrobes',
    price: '49',
    description: 'Wardrobe, 74x51x149 cm',
    designer: 'J Karlsson/W Chon',
  },
  {
    guid: '42ee418f-4aee-91d7-40e9-866b5e6d45f8',
    name: 'PAX',
    category: 'Wardrobes',
    price: '1510',
    description: 'Wardrobe, 150x60x201 cm',
    designer: 'Ehlaon Johansson/IKEA of Swede',
  },
  {
    guid: '6af52c3e-6c75-93c4-4e25-f57d7c474f26',
    name: 'BRIMNES',
    category: 'Wardrobes',
    price: '475',
    description: 'Wardrobe with 2 doors, 78x190 cm',
    designer: 'K Hagberg/M Hagber',
  }
];

const productCount = products.length;

module.exports = { products, productCount };
