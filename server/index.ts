import { runConversation } from './chat';

Bun.serve({
  port: 3000,
  routes: {
    '/api/chat': {
      POST: async (req) => {
        try {
          const { message } = (await req.json()) as { message: string };

          if (!message) {
            return new Response(
              JSON.stringify({ error: 'Message is required' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }

          console.log('📨 User message:', message);

          const response = await runConversation(message);

          return new Response(JSON.stringify({ response }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error: any) {
          console.error('❌ Error:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});

console.log('🚀 Server running on http://localhost:3000');
