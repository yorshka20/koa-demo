import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

import koaRouter from 'koa-router';

function Main() {
  return (
    <div>
      <p>hello world</p>
      <p style={{ fontSize: 20, color: 'red' }}>this line big</p>
    </div>
  );
}

export class View {
  static async render(ctx: koaRouter.RouterContext, next: any) {
    ctx.response.body = renderToStaticMarkup(<Main />);

    await next();
  }
}
