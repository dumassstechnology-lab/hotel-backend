export const getDateRange = (checkIn, checkOut) => {
  const dates = [];
  let current = new Date(checkIn);

  while (current < new Date(checkOut)) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
