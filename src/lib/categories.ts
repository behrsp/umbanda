export interface CategoryInfo {
  id: string;
  name: string;
  group: "Orixás" | "Guias e Entidades";
  saudacao: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "Oxalá", name: "Oxalá", group: "Orixás", saudacao: "Êpa Babá!" },
  { id: "Oxossi", name: "Oxossi", group: "Orixás", saudacao: "Okê Arô!" },
  { id: "Obaluaê", name: "Obaluaê", group: "Orixás", saudacao: "Atotô!" },
  { id: "Oxum", name: "Oxum", group: "Orixás", saudacao: "Ora Yê Yê Ô!" },
  { id: "Ogum", name: "Ogum", group: "Orixás", saudacao: "Ogunhê!" },
  { id: "Xangô", name: "Xangô", group: "Orixás", saudacao: "Kaô Kabecilê!" },
  { id: "Yemanjá", name: "Yemanjá", group: "Orixás", saudacao: "Odoyá!" },
  { id: "Nanã", name: "Nanã", group: "Orixás", saudacao: "Saluba Nanã!" },
  { id: "Yansã", name: "Yansã", group: "Orixás", saudacao: "Eparrey!" },
  { id: "Pretos Velhos", name: "Pretos Velhos", group: "Guias e Entidades", saudacao: "Adorei as Almas!" },
  { id: "Erês", name: "Erês", group: "Guias e Entidades", saudacao: "Oni Ibejada!" },
  { id: "Exús e PomboGiras", name: "Exús e PomboGiras", group: "Guias e Entidades", saudacao: "Laroyê! Mojubá!" },
  { id: "Malandros", name: "Malandros", group: "Guias e Entidades", saudacao: "Salve a Malandragem!" },
  { id: "Marinheiros", name: "Marinheiros", group: "Guias e Entidades", saudacao: "Salve a Marujada!" },
  { id: "Boiadeiros", name: "Boiadeiros", group: "Guias e Entidades", saudacao: "Xetruá!" },
  { id: "Baianos", name: "Baianos", group: "Guias e Entidades", saudacao: "É da Bahia!" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
