#!/usr/bin/env node

/**
 * OpenAI Connectivity Test
 * Simple test to verify OpenAI API key and client configuration work
 */

import { config } from 'dotenv';
import { createOpenAIClient, DEFAULT_MODEL } from '../src/config/openai.js';

config();

async function testOpenAIConnectivity() {
  console.log('🔍 Testing OpenAI connectivity...');
  
  try {
    const client = createOpenAIClient();
    console.log('✅ OpenAI client created successfully');
    
    // Simple test request to verify API key and connectivity
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'Hello, please respond with "Connection successful"' }],
      max_tokens: 10
    });
    
    const message = response.choices[0]?.message?.content?.trim();
    console.log('📡 API Response:', message);
    
    if (message) {
      console.log('✅ OpenAI connectivity test passed!');
      process.exit(0);
    } else {
      throw new Error('No response content received');
    }
    
  } catch (error) {
    console.error('❌ OpenAI connectivity test failed:');
    console.error('  ', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Next steps:');
      console.log('   1. Copy .env.example to .env');
      console.log('   2. Add your OpenAI API key to .env');
      console.log('   3. Run the test again');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testOpenAIConnectivity();
}