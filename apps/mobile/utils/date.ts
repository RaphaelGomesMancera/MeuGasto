export function extractMonthYear(date: string) {
  const parts = date.split("/");

  if (parts.length !== 3) {
    return "";
  }

  const [, month, year] = parts;
  return `${month}/${year}`;
}

export function getAvailableMonthYears(dates: string[]) {
  const uniqueMonthYears = Array.from(
    new Set(
      dates
        .map((date) => extractMonthYear(date))
        .filter(Boolean)
    )
  );

  return uniqueMonthYears.sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number);
    const [monthB, yearB] = b.split("/").map(Number);

    const valueA = yearA * 100 + monthA;
    const valueB = yearB * 100 + monthB;

    return valueB - valueA;
  });
}