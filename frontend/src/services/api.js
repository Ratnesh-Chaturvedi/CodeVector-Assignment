import axios from 'axios';


const apiClient = axios.create({
 baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});



export const fetchProducts = async ({ cursor, snapshotTime, category, limit = 20 } = {}) => {
 
  const params = {};
  
  if (cursor) params.cursor = cursor;
  if (snapshotTime) params.snapshotTime = snapshotTime;
  if (category) params.category = category;
  if (limit) params.limit = limit;

  const response = await apiClient.get('/products', { params });
  return response.data;
};

export default apiClient;
