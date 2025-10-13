import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // depois aqui vai o endereço do back-end
});

export default api;
