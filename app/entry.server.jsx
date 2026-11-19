import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
) {
  let shellError;
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        responseStatusCode = 500;
        shellError = error;
        console.error(error);
      },
    },
  );

  if (isbot(request.headers.get('user-agent') || '')) {
    await body.allReady;
  }

  if (shellError) {
    responseHeaders.set('X-Remix-Error', 'yes');
  }

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
