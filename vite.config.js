import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/api':`http://127.0.0.1:${process.env.PLANET_API_PORT||8787}`}}});
