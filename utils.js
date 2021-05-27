export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export const generateRandomID = () => {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9)
}

export const generateRandomHP = (maxHealth) => {
  return maxHealth > 5 ? getRandomInt(5, maxHealth) : alert(`Health must be greater than 5`)
}

export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}