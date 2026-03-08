import { ProxyAgent, setGlobalDispatcher } from 'undici';

if (process.env.NODE_ENV !== 'production') {
  process.env.HTTP_PROXY = 'http://127.0.0.1:7890';
  process.env.HTTPS_PROXY = 'http://127.0.0.1:7890';
  setGlobalDispatcher(new ProxyAgent('http://127.0.0.1:7890'));
  console.log('✓ Proxy enabled: http://127.0.0.1:7890');
}
