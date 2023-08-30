import React from 'react';
import { renderToString } from 'react-dom/server';

import koaRouter from 'koa-router';

function Main() {
  return (
    <html>
      <body>hello world</body>
    </html>
  );
}

export class View {
  static render(ctx: koaRouter.RouterContext) {
    ctx.response.body = renderToString(<Main />);
  }
}
