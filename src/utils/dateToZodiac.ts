// @ts-ignore
import zodiacSigns from "zodiac-signs";

const zodiac = zodiacSigns("en");

export const dateToZodiac = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-based
  const sign = zodiac.getSignByDate({ day, month });

  return sign ? sign.name : "Unknown";
};
