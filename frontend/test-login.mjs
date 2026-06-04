import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

(async () => {
    try {
        console.log('1. Configuring Axios...');
        const jar = new CookieJar();
        const client = wrapper(axios.create({ 
            jar, 
            baseURL: 'http://127.0.0.1:8000',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Referer': 'http://localhost:3000'
            },
            withCredentials: true
        }));

        console.log('2. Fetching /sanctum/csrf-cookie...');
        await client.get('/sanctum/csrf-cookie');
        console.log('   CSRF Cookie OK');

        console.log('3. Attempting POST /api/auth/login...');
        const loginRes = await client.post('/api/auth/login', { 
            email: 'admin@fk.unand.ac.id', 
            password: 'password' 
        });
        console.log('   Login Status:', loginRes.status);
        console.log('   Login Data:', loginRes.data);

        console.log('4. Attempting GET /api/auth/me...');
        const meRes = await client.get('/api/auth/me');
        console.log('   Me Status:', meRes.status);
        console.log('   Me Data:', meRes.data);
        
        console.log('\n✅ ALL CALLS SUCCEEDED!');
    } catch (e) {
        console.log('\n❌ ERROR CAUGHT:');
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Data:', e.response.data);
            console.log('Headers:', e.response.headers);
        } else {
            console.log('Message:', e.message);
        }
    }
})();
