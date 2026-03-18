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
    new Set(dates.map((date) => extractMonthYear(date)).filter(Boolean))
  );

  return uniqueMonthYears.sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number);
    const [monthB, yearB] = b.split("/").map(Number);

    const valueA = yearA * 100 + monthA;
    const valueB = yearB * 100 + monthB;

    return valueB - valueA;
  });
}

export function isValidDate(date: string) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (!regex.test(date)) {
    return false;
  }

  const [dayString, monthString, yearString] = date.split("/");
  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  const lastDayOfMonth = new Date(year, month, 0).getDate();

  return day <= lastDayOfMonth;
}