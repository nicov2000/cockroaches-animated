export const arrayOfZeros = (size) => [...Array(size)].map((_) => 0);

export const delay = (time) =>
	new Promise((resolve) => setTimeout(resolve, time));
