declare module "zodiac-signs" {
  interface ZodiacSign {
    name: string;
    symbol: string;
    dateRange: string;
  }

  interface Zodiac {
    getSignByDate(date: { day: number; month: number }): ZodiacSign;
  }

  function zodiac(language: string): Zodiac;

  export = zodiac;
}
