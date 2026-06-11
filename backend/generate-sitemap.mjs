import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { generateSitemap } from './src/utils/sitemapGenerator.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected');
    await generateSitemap();
    console.log('✅ Done - Google pinged!');
    process.exit(0);
}).catch(e => {
    console.error('❌', e.message);
    process.exit(1);
});
