// utils/azul-fetch.js

export const fetchProducts = async () => {
  const response = await fetch('/api/azul-cam/fetch-products');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};
